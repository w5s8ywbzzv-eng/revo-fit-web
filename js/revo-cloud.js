/* =========================================================
   revo fit — Supabase 接続層（クラウド同期アダプタ）
   - js/config.js にキー未設定なら【完全に何もしない】＝ローカル版のまま
   - キー設定後：認証（メールOTP / Google / Apple）＋ profile / daily_log /
     daily_score の同期が有効になる
   - 画面側のコードは一切変更不要（REVO.* をラップするだけ）
   - オフライン時は localStorage のキューに積み、復帰後に再送
   ⚠ 実プロジェクトでの動作検証はキー取得後に必ず行うこと（README参照）
   ========================================================= */
(function(){
  "use strict";
  var cfg = window.REVO_CONFIG || {};
  if(!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return;   // ← 未設定なら完全no-op
  if(!window.REVO) return;

  var QKEY = "revo.cloudQueue";
  var sb = null;                 // supabase client（CDN読込後にセット）
  var uid = null;                // ログイン中の user id
  var LS = window.localStorage;

  function jget(k,d){ try{ var v=LS.getItem(k); return v==null?d:JSON.parse(v); }catch(e){ return d; } }
  function jset(k,v){ try{ LS.setItem(k, JSON.stringify(v)); }catch(e){} }

  /* ---------- 再送キュー（t: profile|log、d: 日付） ---------- */
  function enqueue(op){
    var q = jget(QKEY, []);
    q = q.filter(function(o){ return !(o.t===op.t && o.d===op.d); }); // 同一対象は最新のみ
    q.push(op);
    jset(QKEY, q);
    flush();
  }

  /* ---------- REVO API をラップ（ページ読込と同期的に） ---------- */
  var _saveProfile = window.REVO.saveProfile;
  window.REVO.saveProfile = function(patch){
    var p = _saveProfile(patch);
    enqueue({t:"profile"});
    return p;
  };
  var _saveLog = window.REVO.saveLog;
  window.REVO.saveLog = function(dateKey, log){
    var sc = _saveLog(dateKey, log);
    enqueue({t:"log", d:dateKey});
    return sc;
  };
  var _addPost = window.REVO.addPost;
  window.REVO.addPost = function(p){
    var saved = _addPost(p);
    enqueue({t:"post", d:saved.id});
    return saved;
  };
  var _cheerPost = window.REVO.cheerPost;
  window.REVO.cheerPost = function(id){
    var r = _cheerPost(id);
    if(r && sb && uid && String(id).indexOf("local-")!==0){
      sb.from("cheers").insert({post_id:id, user_id:uid}).then(function(){},function(){});
    }
    return r;
  };
  var _setAuth = window.REVO.setAuth;
  window.REVO.setAuth = function(a){
    _setAuth(a);
    if(!a) { if(sb) sb.auth.signOut(); return; }
    if(!sb) return;
    var redirect = location.origin + location.pathname.replace(/screens\/[^\/]*$/, "") .replace(/index\.html$/,"") + "index.html";
    try{
      if(a.provider === "email" && a.email){
        sb.auth.signInWithOtp({ email:a.email, options:{ emailRedirectTo: redirect } });
      } else if(a.provider === "google" || a.provider === "apple"){
        sb.auth.signInWithOAuth({ provider:a.provider, options:{ redirectTo: redirect } });
      }
    }catch(e){}
  };

  /* ---------- 行マッピング ---------- */
  function profileRow(){
    var p = window.REVO.profile() || {};
    var row = { user_id: uid };
    ["lang","country","nickname","level","goals","height_cm","weight_kg","goal_weight_kg",
     "body_fat","body_muscle","display_name","username","title","bio","links","visibility",
     "theme_color","theme_mode","bg_theme","onboarded"].forEach(function(k){
      if(p[k] !== undefined) row[k] = (p[k]===""? null : p[k]);
    });
    if(p.avatar_url && p.avatar_url.indexOf("data:") !== 0) row.avatar_url = p.avatar_url;
    row.updated_at = p.updated_at || new Date().toISOString();
    return row;
  }
  function logRow(dateKey){
    var lg = window.REVO.getLog(dateKey);
    if(!lg) return null;
    var f = lg.food||{}, pfc = f.pfc||{}, nut = f.nut||{}, c = lg.condition||{};
    return {
      user_id: uid, log_date: dateKey,
      body_weight: lg.body.weight, body_fat: lg.body.fat, body_muscle: lg.body.muscle,
      sleep_hours: lg.sleep.minutes!=null ? Math.round(lg.sleep.minutes/60*100)/100 : null,
      sleep_quality: lg.sleep.quality,
      move_total_min: (lg.move&&lg.move.totalMin)||0,
      water_total_ml: window.REVO.waterTotal(lg.water),
      diet_style: f.dietSel||0,
      protein_g: pfc.p, fat_g: pfc.f, carb_g: pfc.c,
      sugar_g: nut.sugar, fiber_g: nut.fiber, salt_g: nut.salt,
      cond_mood: c.mood, cond_bowel: c.bowel,
      payload: lg,                                    // 完全復元用（明細含む）
      updated_at: lg._savedAt || new Date().toISOString()
    };
  }
  function scoreRow(dateKey){
    var sc = window.REVO.computeScore(window.REVO.getLog(dateKey), window.REVO.profile());
    return { user_id: uid, log_date: dateKey,
      sleep_score: sc.sleep, food_score: sc.food, move_score: sc.move,
      recover_score: sc.recover, total_score: sc.total,
      updated_at: new Date().toISOString() };
  }

  /* ---------- 送信 ---------- */
  var flushing = false;
  function flush(){
    if(!sb || !uid || flushing) return;
    var q = jget(QKEY, []);
    if(!q.length) return;
    flushing = true;
    var op = q[0];
    var done = function(ok){
      if(ok){ q.shift(); jset(QKEY, q); }
      flushing = false;
      if(ok && q.length) flush();
    };
    try{
      if(op.t === "profile"){
        sb.from("profile").upsert(profileRow(), { onConflict:"user_id" })
          .then(function(r){ done(!r.error); if(r.error) console.warn("[revo-cloud]", r.error.message); })
          .then(null, function(){ done(false); });
      } else if(op.t === "log"){
        var lr = logRow(op.d);
        if(!lr){ done(true); return; }
        sb.from("daily_log").upsert(lr, { onConflict:"user_id,log_date" })
          .then(function(r){
            if(r.error){ console.warn("[revo-cloud]", r.error.message); done(false); return; }
            return sb.from("daily_score").upsert(scoreRow(op.d), { onConflict:"user_id,log_date" })
              .then(function(r2){ done(!r2.error); if(r2.error) console.warn("[revo-cloud]", r2.error.message); });
          })
          .then(null, function(){ done(false); });
      } else if(op.t === "post"){
        var arr = jget("revo.posts", []);
        var idx = -1;
        for(var i=0;i<arr.length;i++){ if(arr[i].id===op.d){ idx=i; break; } }
        if(idx<0){ done(true); return; }
        var lp = arr[idx];
        /* 写真：dataURL → Storage(posts) へ。失敗時はdataURLのまま（縮小済みなので許容） */
        var _photoJobs = (lp.photos||[]).map(function(ph, pi){
          if(typeof ph !== "string" || ph.indexOf("data:") !== 0) return Promise.resolve(ph);
          return fetch(ph).then(function(r){ return r.blob(); }).then(function(blob){
            var path = uid + "/" + op.d.replace(/[^a-zA-Z0-9-]/g,"") + "_" + pi + ".jpg";
            return sb.storage.from("posts").upload(path, blob, { upsert:true, contentType:"image/jpeg" })
              .then(function(r2){
                if(r2 && !r2.error){
                  var pub = sb.storage.from("posts").getPublicUrl(path);
                  if(pub && pub.data && pub.data.publicUrl) return pub.data.publicUrl;
                }
                return ph;
              });
          }).then(null, function(){ return ph; });
        });
        Promise.all(_photoJobs).then(function(photoUrls){
          lp.photos = photoUrls; arr[idx].photos = photoUrls; jset("revo.posts", arr);
        sb.from("posts").insert({
          user_id: uid, kind: lp.kind, title: lp.title||null, body: lp.body||null,
          tags: lp.tags||[], moods: lp.moods||[], photos: lp.photos||[],
          extra: lp.extra||{}, author_name: lp.author_name||null,
          created_at: lp.created_at
        }).select().single().then(function(r){
          if(r.error){ console.warn("[revo-cloud]", r.error.message); done(false); return; }
          arr[idx].id = r.data.id;   // サーバIDに差し替え（以後の応援等が紐づく）
          jset("revo.posts", arr);
          done(true);
        }).then(null, function(){ done(false); });
        }).then(null, function(){ done(false); });
      } else { done(true); }
    }catch(e){ flushing=false; }
  }

  /* ---------- 受信（ログイン時に90日分を取り込み） ---------- */
  function rowToLocal(row){
    if(row.payload && typeof row.payload === "object") return window.REVO.normalizeLog(row.payload);
    var lg = window.REVO.emptyLog();
    lg.body = { weight:row.body_weight, fat:row.body_fat, muscle:row.body_muscle };
    lg.sleep = { minutes: row.sleep_hours!=null ? Math.round(row.sleep_hours*60) : null, quality: row.sleep_quality };
    lg.move.totalMin = row.move_total_min||0;
    lg.food.dietSel = row.diet_style||0;
    lg.food.pfc = { p:row.protein_g, f:row.fat_g, c:row.carb_g };
    lg.food.nut = { sugar:row.sugar_g, fiber:row.fiber_g, salt:row.salt_g };
    lg.condition = { mood:row.cond_mood, bowel:row.cond_bowel };
    return lg;
  }
  var _token=null;
  function pullSubscription(){
    sb.from("subscriptions").select("*").eq("user_id", uid).maybeSingle().then(function(r){
      if(!r.error && r.data){
        jset("revo.sub", { plan:r.data.plan, cycle:r.data.cycle, status:r.data.status,
          cancel_at_period_end:r.data.cancel_at_period_end, current_period_end:r.data.current_period_end, at:Date.now() });
      }
    }).then(null, function(){});
  }
  function pullPosts(){
    sb.from("posts").select("*").order("created_at",{ascending:false}).limit(50).then(function(r){
      if(r.error || !r.data) return;
      var arr = jget("revo.posts", []);
      var local = arr.filter(function(p){ return String(p.id).indexOf("local-")===0; });  // 未送信分は残す
      var seen = {};
      var merged = local.concat(r.data.filter(function(row){
        if(seen[row.id]) return false; seen[row.id]=true; return true;
      }).map(function(row){
        return { id:row.id, user_id:row.user_id, kind:row.kind, title:row.title, body:row.body,
                 tags:row.tags||[], moods:row.moods||[], photos:row.photos||[], extra:row.extra||{},
                 author_name:row.author_name, cheer_count:row.cheer_count||0, created_at:row.created_at,
                 _mine: row.user_id===uid };
      }));
      jset("revo.posts", merged.slice(0,100));
    }).then(null, function(){});
  }
  function pullTipsIn(){
    sb.from("tips").select("*").eq("to_user", uid).order("created_at",{ascending:false}).limit(200).then(function(r){
      if(!r.error && r.data) jset("revo.tipsIn", r.data);
    }).then(null, function(){});
  }
  function pullFollowerCount(){
    sb.from("follows").select("created_at").eq("followee_id", uid).then(function(r){
      if(!r.error && r.data){
        var now=new Date(), m=now.getMonth(), y=now.getFullYear(), inMonth=0;
        r.data.forEach(function(x){ var d=new Date(x.created_at); if(d.getMonth()===m && d.getFullYear()===y) inMonth++; });
        jset("revo.followersIn", { total:r.data.length, month:inMonth });
      }
    }).then(null, function(){});
  }
  function pullAll(){
    pullSubscription();
    pullPosts();
    pullFollows();
    pullTipsIn();
    pullFollowerCount();
    // profile：新しい方を採用（サーバが新しければ取込、ローカルが新しければ送信）
    sb.from("profile").select("*").eq("user_id", uid).maybeSingle().then(function(r){
      if(r.error || !r.data){ enqueue({t:"profile"}); return; }
      var local = window.REVO.profile();
      var srvT = new Date(r.data.updated_at||0).getTime();
      var locT = new Date((local&&local.updated_at)||0).getTime();
      if(srvT > locT){
        var p = {}; for(var k in r.data){ if(r.data[k]!==null && k!=="user_id" && k!=="created_at") p[k]=r.data[k]; }
        _saveProfile(p);   // ラップ前の関数で保存（再送信しない）
      } else if(local){ enqueue({t:"profile"}); }
    }).then(null, function(){});
    // 直近90日の記録
    var since = (function(){ var d=new Date(); d.setDate(d.getDate()-90);
      return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2); })();
    sb.from("daily_log").select("*").eq("user_id", uid).gte("log_date", since).then(function(r){
      if(r.error || !r.data) return;
      var logs = jget("revo.logs", {}), scores = jget("revo.scores", {}), changed=false;
      r.data.forEach(function(row){
        var d = row.log_date;
        var srvT = new Date(row.updated_at||0).getTime();
        var locT = logs[d] && logs[d]._savedAt ? new Date(logs[d]._savedAt).getTime() : 0;
        if(srvT > locT){
          var lg = rowToLocal(row);
          lg._savedAt = row.updated_at;
          logs[d] = lg;
          scores[d] = window.REVO.computeScore(lg, window.REVO.profile());
          changed = true;
        } else if(locT > srvT){ enqueue({t:"log", d:d}); }
      });
      if(changed){
        jset("revo.logs", logs); jset("revo.scores", scores);
        // 初回同期時のみ再描画（ループ防止）
        if(!sessionStorage.getItem("revo.cloudSynced")){
          sessionStorage.setItem("revo.cloudSynced","1");
          location.reload();
        }
      }
    }).then(null, function(){});
  }

  /* ---------- アバター（dataURL → Storage。バケット未作成なら黙ってスキップ） ---------- */
  function syncAvatar(){
    var p = window.REVO.profile();
    if(!p || !p.avatar_url || p.avatar_url.indexOf("data:") !== 0) return;
    try{
      fetch(p.avatar_url).then(function(res){ return res.blob(); }).then(function(blob){
        return sb.storage.from("avatars").upload(uid + ".jpg", blob, { upsert:true, contentType:"image/jpeg" });
      }).then(function(r){
        if(r && !r.error){
          var pub = sb.storage.from("avatars").getPublicUrl(uid + ".jpg");
          if(pub && pub.data && pub.data.publicUrl){
            _saveProfile({ avatar_url: pub.data.publicUrl });
            enqueue({t:"profile"});
          }
        }
      }).then(null, function(){});
    }catch(e){}
  }

  /* ---------- 初期化：supabase-js v2（UMD）を CDN から読込 ---------- */
  function init(){
    sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    sb.auth.onAuthStateChange(function(_ev, session){
      uid = session && session.user ? session.user.id : null;
      _token = session ? session.access_token : null;
      if(uid){ pullAll(); syncAvatar(); flush(); }
    });
    sb.auth.getSession().then(function(r){
      var ses = r.data && r.data.session;
      uid = ses && ses.user ? ses.user.id : null;
      _token = ses ? ses.access_token : null;
      if(uid){ pullAll(); syncAvatar(); flush(); }
    }).then(null, function(){});
    window.addEventListener("online", flush);
  }
  var s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
  s.onload = init;
  s.onerror = function(){ console.warn("[revo-cloud] supabase-js の読込に失敗（オフライン?）。ローカル保存で継続します"); };
  document.head ? document.head.appendChild(s) : document.addEventListener("DOMContentLoaded", function(){ document.head.appendChild(s); });

  /* ---------- Stripe（Vercel /api 経由。金額はサーバ側決定） ---------- */
  function api(path, body){
    if(!_token) return Promise.reject(new Error("not signed in"));
    return fetch(path, {
      method:"POST",
      headers:{ "Content-Type":"application/json", "Authorization":"Bearer "+_token },
      body: JSON.stringify(body||{})
    }).then(function(r){ return r.json().then(function(j){ if(!r.ok) throw new Error(j.error||r.status); return j; }); });
  }
  function checkout(plan, cycle){
    return api("/api/checkout", { plan:plan, cycle:cycle, nonce:String(Date.now()) })
      .then(function(j){ if(j.url) location.href=j.url; return j; });
  }
  function portal(){
    return api("/api/portal", {}).then(function(j){ if(j.url) location.href=j.url; return j; });
  }
  function foodEstimate(name){
    return api("/api/food", { name:name });
  }
  function foodPhoto(dataUrl, lang){
    return api("/api/food-photo", { image:dataUrl, lang:lang });
  }
  function tip(postId, amount){
    return api("/api/tip", { post_id:postId, amount:amount, nonce:String(Date.now()) })
      .then(function(j){ if(j.url) location.href=j.url; return j; });
  }

  /* ---------- フォロー ---------- */
  var _following = {};   // followee_id -> true（ログイン時に取得）
  function pullFollows(){
    sb.from("follows").select("followee_id").eq("follower_id", uid).then(function(r){
      if(!r.error && r.data){ _following={}; r.data.forEach(function(x){ _following[x.followee_id]=true; }); }
    }).then(null, function(){});
  }
  function follow(userId){
    if(!sb || !uid || !userId || userId===uid) return Promise.resolve(false);
    if(_following[userId]){
      return sb.from("follows").delete().eq("follower_id",uid).eq("followee_id",userId)
        .then(function(){ delete _following[userId]; return false; });
    }
    return sb.from("follows").insert({follower_id:uid, followee_id:userId})
      .then(function(){ _following[userId]=true; return true; });
  }

  window.REVO_CLOUD = { enabled:true, flush:flush, queue:function(){ return jget(QKEY, []); },
    signedIn:function(){ return !!_token; }, checkout:checkout, portal:portal, tip:tip, foodEstimate:foodEstimate, foodPhoto:foodPhoto,
    follow:follow, isFollowing:function(id){ return !!_following[id]; } };
})();
