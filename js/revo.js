/* =========================================================
   revo fit — 共有基盤（ローカル保存版）
   - localStorage を Supabase の代替として使用（後日 adapter 差し替え）
   - 言語・テーマ(明暗)・テーマカラー(5色)を全画面で共有
   - daily_log 保存 → daily_score 再計算（docs/02 の式）
   - デザインには一切手を触れない（値の注入と遷移のみ）
   ========================================================= */
(function(){
  "use strict";

  var LS = window.localStorage;
  var K = {
    lang: "revo.lang",
    dark: "revo.dark",
    color: "revo.color",
    profile: "revo.profile",
    logs: "revo.logs",        // { "YYYY-MM-DD": dailyLog }
    scores: "revo.scores",    // { "YYYY-MM-DD": dailyScore }
    auth: "revo.auth",
    sub: "revo.sub",          // 課金プラン（ローカル・プレビュー）
    posts: "revo.posts",      // SNS投稿（クラウド同期はrevo-cloud）
    bgTheme: "revo.bgTheme"   // 背景テーマ（null=通常 / 5色キー=パステル背景）
  };

  function get(k, dflt){
    try{ var v = LS.getItem(k); return v==null ? dflt : JSON.parse(v); }catch(e){ return dflt; }
  }
  function set(k, v){ try{ LS.setItem(k, JSON.stringify(v)); }catch(e){} }

  /* ---------- テーマカラー5色（docs/04 確定値） ---------- */
  var COLORS = [
    {k:"chill",     hex:"#5DCAA5", light:"#3FA986"},
    {k:"groove",    hex:"#E3C56A", light:"#B8912F"},   // 既定
    {k:"energetic", hex:"#E0605D", light:"#C6413E"},
    {k:"focus",     hex:"#6FA8DC", light:"#3E7CB8"},
    {k:"muse",      hex:"#A78BDB", light:"#8461C4"}
  ];
  function colorObj(){
    var k = get(K.color, "groove");
    for(var i=0;i<COLORS.length;i++){ if(COLORS[i].k===k) return COLORS[i]; }
    return COLORS[1];
  }
  function colorIndex(){
    var k = get(K.color, "groove");
    for(var i=0;i<COLORS.length;i++){ if(COLORS[i].k===k) return i; }
    return 1;
  }
  /* T オブジェクト内の金アクセントを選択色へ差し替える。
     既定(groove)のときは完全に無変換＝モックそのまま。 */
  var GOLD_MAP = { "#E3C56A": "hex", "#BA7517": "light", "#B8912F": "light", "#C9A24E": "light" };

  /* ---- 背景テーマ（パステル）：色計算ヘルパ ---- */
  function hex2rgb(h){
    h = h.replace("#","");
    if(h.length===3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }
  function rgb2hex(r,g,b){
    function c(v){ v=Math.max(0,Math.min(255,Math.round(v))); return ("0"+v.toString(16)).slice(-2); }
    return "#"+c(r)+c(g)+c(b);
  }
  function lightness(rgb){ return (Math.max(rgb[0],rgb[1],rgb[2])+Math.min(rgb[0],rgb[1],rgb[2]))/510; }
  function saturation(rgb){
    var mx=Math.max(rgb[0],rgb[1],rgb[2]), mn=Math.min(rgb[0],rgb[1],rgb[2]);
    if(mx===mn) return 0;
    var l=(mx+mn)/510;
    return (mx-mn)/255 / (1 - Math.abs(2*l-1) || 1);
  }
  function mix(rgbA, rgbB, k){
    return [rgbA[0]+(rgbB[0]-rgbA[0])*k, rgbA[1]+(rgbB[1]-rgbA[1])*k, rgbA[2]+(rgbB[2]-rgbA[2])*k];
  }
  /* ライト系ニュートラルを選択色のパステルに。
     ウォームグレーに混ぜるとくすむため、純白ベースで再構成（リゾート感のある澄んだ発色） */
  function pastelize(hexStr, accRgb){
    var rgb;
    try{ rgb = hex2rgb(hexStr); }catch(e){ return hexStr; }
    var L = lightness(rgb);
    var chroma = Math.max(rgb[0],rgb[1],rgb[2]) - Math.min(rgb[0],rgb[1],rgb[2]);
    if(L < 0.52 || chroma > 56) return hexStr;       // 暗い色・鮮やかな色（文字・差し色）は不変
    var k = Math.max(0.08, Math.min(0.45, (1 - L) * 1.15 + 0.08));  // 元の濃淡を色の濃さに変換
    var m = mix([255,255,255], accRgb, k);
    return rgb2hex(m[0], m[1], m[2]);
  }
  /* 背景テーマ用パレット（リゾート寄り・くすみなし） */
  var BG_COLORS = [
    {k:"mint",      hex:"#5DCAA5"},
    {k:"lavender",  hex:"#A78BDB"},
    {k:"sakura",    hex:"#FF9EC7"},
    {k:"coral",     hex:"#FF8B7B"},
    {k:"turquoise", hex:"#2FD0C8"},
    {k:"sky",       hex:"#5BBDF2"},
    {k:"sunshine",  hex:"#FFD166"}
  ];
  function bgTheme(){ return get(K.bgTheme, null); }
  function bgAccRgb(){
    var k2 = bgTheme();
    if(!k2) return null;
    for(var i=0;i<BG_COLORS.length;i++){ if(BG_COLORS[i].k===k2) return hex2rgb(BG_COLORS[i].hex); }
    for(var j=0;j<COLORS.length;j++){ if(COLORS[j].k===k2) return hex2rgb(COLORS[j].hex); }  // 旧キー互換
    return null;
  }

  function tint(T){
    var c = colorObj();
    var acc = (!get(K.dark, true)) ? bgAccRgb() : null;   // 背景テーマはライト基調のときのみ
    if(c.k === "groove" && !acc) return T;
    function walk(o){
      if(!o || typeof o !== "object") return;
      for(var key in o){
        if(typeof o[key] === "string"){
          var up = o[key].toUpperCase();
          if(c.k !== "groove" && GOLD_MAP[up]){ o[key] = c[GOLD_MAP[up]]; continue; }
          if(acc && /^#[0-9A-F]{6}$/.test(up)) o[key] = pastelize(up, acc);
        } else if(typeof o[key] === "object"){ walk(o[key]); }
      }
    }
    walk(T);
    return T;
  }

  /* ---------- 日付 ---------- */
  function todayKey(){
    var d = new Date();
    var m = ("0"+(d.getMonth()+1)).slice(-2), dd = ("0"+d.getDate()).slice(-2);
    return d.getFullYear()+"-"+m+"-"+dd;
  }
  function prevKey(dateKey){
    var d = new Date(dateKey+"T00:00:00");
    d.setDate(d.getDate()-1);
    var m = ("0"+(d.getMonth()+1)).slice(-2), dd = ("0"+d.getDate()).slice(-2);
    return d.getFullYear()+"-"+m+"-"+dd;
  }

  /* ---------- daily_log ---------- */
  function emptyLog(){
    return {
      body:      { weight:null, fat:null, muscle:null },
      sleep:     { minutes:null, quality:null },              // quality: 0..n(チップindex) / null
      move:      { part:null, exercises:[], totalMin:0 },     // ex: {part,name,kg,reps,sets}
      food:      { meals:[null,null,null,null],               // 朝昼夜間食 {name,kcal}
                   pfc:{p:null,f:null,c:null}, nut:{sugar:null,fiber:null,salt:null}, dietSel:0 },
      water:     { types:[0,0,0], supp:0, includeSupp:false, sel:1 },
      condition: { bowel:null, mood:null }
    };
  }
  /* どんな形のデータが来ても emptyLog の形に正規化（クラウド由来の不正データ対策） */
  function normalizeLog(lg){
    var e = emptyLog();
    if(!lg || typeof lg !== "object") return e;
    function mrg(dst, srcO){
      if(!srcO || typeof srcO !== "object") return dst;
      for(var k in dst){
        if(srcO[k] === undefined) continue;
        if(dst[k] && typeof dst[k] === "object" && !Array.isArray(dst[k])) dst[k] = mrg(dst[k], srcO[k]);
        else dst[k] = srcO[k];
      }
      return dst;
    }
    var out = mrg(e, lg);
    if(lg._savedAt) out._savedAt = lg._savedAt;
    if(!Array.isArray(out.move.exercises)) out.move.exercises = [];
    if(!Array.isArray(out.water.types) || out.water.types.length < 3) out.water.types = [0,0,0];
    if(!Array.isArray(out.food.meals) || out.food.meals.length !== 4){
      var ms = Array.isArray(out.food.meals) ? out.food.meals : [];
      out.food.meals = [ms[0]||null, ms[1]||null, ms[2]||null, ms[3]||null];
    }
    if(!out.food.pfc || typeof out.food.pfc !== "object") out.food.pfc = {p:null,f:null,c:null};
    if(!out.food.nut || typeof out.food.nut !== "object") out.food.nut = {sugar:null,fiber:null,salt:null};
    return out;
  }
  function getLog(dateKey){
    var logs = get(K.logs, {});
    return logs[dateKey] ? normalizeLog(logs[dateKey]) : null;
  }
  function saveLog(dateKey, log){
    var logs = get(K.logs, {});
    log._savedAt = new Date().toISOString();
    logs[dateKey] = log;
    set(K.logs, logs);
    var sc = computeScore(log, profile());
    var scores = get(K.scores, {});
    scores[dateKey] = sc;
    set(K.scores, scores);
    return sc;
  }

  /* ---------- スコア計算（docs/02_log_to_home_sync.md 初期版） ---------- */
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

  function waterTotal(w){
    if(!w) return 0;
    var t = 0;
    (w.types||[]).forEach(function(ml){ t += (+ml||0); });
    if(w.includeSupp) t += (+w.supp||0);
    return t;
  }
  function foodEaten(f){
    if(!f) return 0;
    var t = 0;
    (f.meals||[]).forEach(function(m){ if(m && m.kcal) t += (+m.kcal||0); });
    return t;
  }
  function mealsLogged(f){
    var n = 0;
    ((f&&f.meals)||[]).forEach(function(m){
      if(m && ((+m.kcal||0) > 0 || (m.name||"").trim())) n++;   // 名前だけでも記録として数える
    });
    return n;
  }
  function bmrOf(p){
    // 性別未取得のため簡易推定：体脂肪率があれば Katch-McArdle、なければ 22×体重
    if(!p || !p.weight_kg) return null;
    if(p.body_fat) return Math.round(370 + 21.6 * p.weight_kg * (1 - p.body_fat/100));
    return Math.round(22 * p.weight_kg);
  }
  function moveKcal(log){
    var min = (log && log.move && log.move.totalMin) || 0;
    return Math.round(min * 5);
  }

  function computeScore(log, prof){
    var s = { sleep:null, food:null, move:null, recover:null, total:null };
    if(!log) return s;

    // 睡眠：7.5h が満点、離れるほど減点
    if(log.sleep && log.sleep.minutes != null){
      var h = log.sleep.minutes / 60;
      var v = clamp(Math.round(100 - Math.abs(h - 7.5) * 12), 0, 100);
      if(log.sleep.quality != null){
        v = clamp(v + [8, 0, -8][Math.min(log.sleep.quality, 2)] , 0, 100);
      }
      s.sleep = v;
    }

    // 食事：kcal目標達成度 + PFC + 記録数（名前のみの記録でも加点対象）
    var eaten = foodEaten(log.food);
    var mealsN = mealsLogged(log.food);
    if(eaten > 0 || mealsN > 0){
      var bmr = bmrOf(prof), goalK = bmr ? bmr + moveKcal(log) : null;
      var kcalScore = 60;   // kcal未入力は中立
      if(goalK && eaten > 0){
        var ratio = eaten / goalK;
        kcalScore = clamp(Math.round(100 - Math.abs(1 - ratio) * 160), 0, 100);
      }
      var pfc = log.food.pfc || {};
      var hasPfc = (pfc.p != null || pfc.f != null || pfc.c != null);
      var pfcScore = null;
      if(hasPfc){
        var p = +pfc.p||0, f = +pfc.f||0, c = +pfc.c||0, tot = p*4 + f*9 + c*4;
        if(tot > 0){
          // 目標比 P30 / F25 / C45（エネルギー比）への近さ
          var dp = Math.abs(p*4/tot - 0.30), df = Math.abs(f*9/tot - 0.25), dc = Math.abs(c*4/tot - 0.45);
          pfcScore = clamp(Math.round(100 - (dp+df+dc) * 220), 0, 100);
        }
      }
      var mealsScore = Math.min(mealsLogged(log.food) / 3, 1) * 100;
      s.food = pfcScore != null
        ? Math.round(0.6*pfcScore + 0.3*kcalScore + 0.1*mealsScore)
        : Math.round(0.6*kcalScore + 0.4*mealsScore);
    }

    // 運動：実施で加点、時間・種目で上乗せ
    if(log.move && (log.move.totalMin > 0 || (log.move.exercises||[]).length > 0)){
      var exN = (log.move.exercises||[]).length;
      var min = log.move.totalMin || 0;
      s.move = clamp(Math.round(60 + Math.min(28, min/60*20) + Math.min(12, exN*4)), 0, 100);
    }

    // 回復：気分・お通じから
    var cnd = log.condition || {};
    if(cnd.mood != null || cnd.bowel != null){
      var base = 70;
      if(cnd.mood  != null) base += [12, 0, -12][Math.min(cnd.mood, 2)];
      if(cnd.bowel != null) base += [8, 3, -8, -8][Math.min(cnd.bowel, 3)];
      s.recover = clamp(base, 0, 100);
    }

    // 総合：加重平均（記録済み要素のみで暫定表示 = docs/02 §6）
    var W = { sleep:0.25, food:0.30, move:0.25, recover:0.20 };
    var sum = 0, wsum = 0;
    ["sleep","food","move","recover"].forEach(function(k2){
      if(s[k2] != null){ sum += W[k2]*s[k2]; wsum += W[k2]; }
    });
    if(wsum > 0) s.total = Math.round(sum / wsum);
    return s;
  }

  function todayScore(){
    var scores = get(K.scores, {});
    var sc = scores[todayKey()];
    if(!sc || sc.total == null) return null;
    return sc;
  }

  /* ---------- エンプティステート／動的コピー（ROADMAP 13章） ---------- */
  var EMPTY = {
    "日本語":{state:"きょうの記録は、まだこれから。",ttl:"最初の記録をつけてみましょう",sub:"睡眠でも食事でも、ひとつで大丈夫。記録すると、ここにあなたのスコアが灯ります。",lowTtl:"{f}を、少し整えましょう",lowSub:"きょうは{f}のスコアがいちばん低め。小さくひとつ、整えるだけで十分です。",good:"いい調子です。この流れを、あしたへ。"},
    "English":{state:"Today's log starts here.",ttl:"Make your first entry",sub:"Sleep or a meal — one is enough. Log it and your score lights up here.",lowTtl:"Give {f} a little care",lowSub:"{f} is your lowest score today. One small adjustment is plenty.",good:"Looking good. Carry this into tomorrow."},
    "简体中文":{state:"今天的记录，从这里开始。",ttl:"记下第一条记录吧",sub:"睡眠或饮食，一条就够。记录后，你的评分会在这里亮起。",lowTtl:"稍微照顾一下{f}",lowSub:"今天{f}的评分最低。小小调整一下就足够了。",good:"状态不错。把这份节奏带到明天。"},
    "繁體中文":{state:"今天的記錄，從這裡開始。",ttl:"記下第一條記錄吧",sub:"睡眠或飲食，一條就夠。記錄後，你的評分會在這裡亮起。",lowTtl:"稍微照顧一下{f}",lowSub:"今天{f}的評分最低。小小調整一下就足夠了。",good:"狀態不錯。把這份節奏帶到明天。"},
    "한국어":{state:"오늘의 기록은 여기서 시작해요.",ttl:"첫 기록을 남겨 보세요",sub:"수면이든 식사든 하나면 충분해요. 기록하면 여기에 점수가 켜져요.",lowTtl:"{f}을(를) 조금 돌봐 주세요",lowSub:"오늘은 {f} 점수가 가장 낮아요. 작은 조정 하나면 충분해요.",good:"좋은 흐름이에요. 내일로 이어가요."},
    "Français":{state:"Le journal d'aujourd'hui commence ici.",ttl:"Faites votre première entrée",sub:"Sommeil ou repas — un seul suffit. Enregistrez et votre score s'allume ici.",lowTtl:"Prenez soin de : {f}",lowSub:"{f} est votre score le plus bas aujourd'hui. Un petit ajustement suffit.",good:"Belle forme. Continuez demain."},
    "Español":{state:"El registro de hoy empieza aquí.",ttl:"Haz tu primer registro",sub:"Sueño o comida: con uno basta. Regístralo y tu puntuación se enciende aquí.",lowTtl:"Cuida un poco: {f}",lowSub:"{f} es tu puntuación más baja hoy. Un pequeño ajuste es suficiente.",good:"Buen ritmo. Llévalo a mañana."},
    "Deutsch":{state:"Das heutige Log beginnt hier.",ttl:"Mach deinen ersten Eintrag",sub:"Schlaf oder Essen — eins genügt. Trag es ein und dein Score leuchtet hier auf.",lowTtl:"Kümmere dich etwas um: {f}",lowSub:"{f} ist heute dein niedrigster Wert. Eine kleine Anpassung reicht.",good:"Läuft gut. Nimm das mit in morgen."},
    "Italiano":{state:"Il diario di oggi inizia qui.",ttl:"Fai la tua prima registrazione",sub:"Sonno o pasto: ne basta una. Registra e il tuo punteggio si accende qui.",lowTtl:"Prenditi cura di: {f}",lowSub:"Oggi {f} è il punteggio più basso. Basta un piccolo aggiustamento.",good:"Ottimo ritmo. Portalo a domani."},
    "Português":{state:"O registro de hoje começa aqui.",ttl:"Faça seu primeiro registro",sub:"Sono ou refeição — um já basta. Registre e sua pontuação acende aqui.",lowTtl:"Cuide um pouco de: {f}",lowSub:"{f} é sua pontuação mais baixa hoje. Um pequeno ajuste basta.",good:"Bom ritmo. Leve isso para amanhã."},
    "ภาษาไทย":{state:"บันทึกของวันนี้เริ่มที่นี่",ttl:"เริ่มบันทึกรายการแรกกันเถอะ",sub:"การนอนหรือมื้ออาหาร แค่หนึ่งอย่างก็พอ บันทึกแล้วคะแนนของคุณจะสว่างขึ้นที่นี่",lowTtl:"ดูแล{f}สักหน่อย",lowSub:"วันนี้คะแนน{f}ต่ำที่สุด ปรับเล็กน้อยก็เพียงพอ",good:"กำลังไปได้ดี พาไปต่อพรุ่งนี้เลย"},
    "हिन्दी":{state:"आज का रिकॉर्ड यहीं से शुरू होता है।",ttl:"पहला रिकॉर्ड दर्ज करें",sub:"नींद या भोजन — एक ही काफ़ी है। दर्ज करें और आपका स्कोर यहाँ जगमगाएगा।",lowTtl:"{f} का थोड़ा ध्यान रखें",lowSub:"आज {f} का स्कोर सबसे कम है। एक छोटा-सा सुधार काफ़ी है।",good:"अच्छी लय है। इसे कल तक ले जाएँ।"},
    "Tiếng Việt":{state:"Nhật ký hôm nay bắt đầu từ đây.",ttl:"Hãy ghi lại mục đầu tiên",sub:"Giấc ngủ hay bữa ăn — một mục là đủ. Ghi lại và điểm số của bạn sẽ sáng lên ở đây.",lowTtl:"Chăm chút một chút cho {f}",lowSub:"Hôm nay {f} có điểm thấp nhất. Một điều chỉnh nhỏ là đủ.",good:"Đang rất ổn. Mang nhịp này sang ngày mai."},
    "Bahasa Indonesia":{state:"Catatan hari ini dimulai di sini.",ttl:"Buat catatan pertamamu",sub:"Tidur atau makan — satu saja cukup. Catat, dan skormu menyala di sini.",lowTtl:"Rawat sedikit: {f}",lowSub:"Hari ini skor {f} paling rendah. Penyesuaian kecil sudah cukup.",good:"Iramanya bagus. Bawa ke esok hari."}
  };

  /* ---------- 分析用の集計（docs/02 §2：体重は7日移動平均でトレンド化） ---------- */
  function allLogs(){ return get(K.logs, {}); }
  function dateOf(k2){ return new Date(k2+"T00:00:00"); }
  function daysBetween(a,b){ return Math.round((dateOf(b)-dateOf(a))/86400000); }

  function stats(){
    var logs = allLogs();
    var keys = Object.keys(logs).sort();
    var today = todayKey();

    // 体重系列＋7日移動平均
    var weight = [];
    keys.forEach(function(k2){
      var w = logs[k2] && logs[k2].body && logs[k2].body.weight;
      if(w != null) weight.push({d:k2, w:+w});
    });
    var ma7 = weight.map(function(p,i){
      var s=0,n=0;
      for(var j=Math.max(0,i-6); j<=i; j++){ s+=weight[j].w; n++; }
      return {d:p.d, w:Math.round(s/n*10)/10};
    });

    // 週次総挙上量（直近12週・今日を含む週を末尾に）
    var weeklyVol = [];
    for(var wk=0; wk<12; wk++){ weeklyVol.push(0); }
    keys.forEach(function(k2){
      var mv = logs[k2] && logs[k2].move;
      if(!mv || !(mv.exercises||[]).length) return;
      var ago = daysBetween(k2, today);
      if(ago < 0 || ago > 83) return;
      var idx = 11 - Math.floor(ago/7);
      var v = 0;
      (mv.exercises||[]).forEach(function(ex){ v += (+ex.kg||0)*(+ex.reps||0)*(+ex.sets||0); });
      weeklyVol[idx] += v;
    });

    // 部位別ボリューム比（log の moveParts 準拠：0胸 1背中 2脚 3肩 4腕 5お腹）
    var partVol = [0,0,0,0,0,0];
    keys.forEach(function(k2){
      var mv = logs[k2] && logs[k2].move;
      (mv && mv.exercises || []).forEach(function(ex){
        var v = (+ex.kg||0)*(+ex.reps||0)*(+ex.sets||0);
        if(!v) v = 1; // 重量未入力でも実施は数える
        partVol[Math.min(ex.part||0,5)] += v;
      });
    });
    var pvMax = Math.max.apply(null, partVol);
    var partShare = partVol.map(function(v){ return pvMax>0 ? Math.round(v/pvMax*100) : 0; });

    // 自己ベスト（種目名ごとの最大重量・更新幅・日付）
    var best = {};
    keys.forEach(function(k2){
      var mv = logs[k2] && logs[k2].move;
      (mv && mv.exercises || []).forEach(function(ex){
        var nm=(ex.name||"").trim(); if(!nm || !(+ex.kg)) return;
        if(!best[nm] || +ex.kg > best[nm].w){
          best[nm] = {name:nm, w:+ex.kg, d:k2, up: best[nm] ? (+ex.kg - best[nm].w) : 0};
        }
      });
    });
    var prs = Object.keys(best).map(function(nm){ return best[nm]; })
      .sort(function(a,b){ return b.d < a.d ? -1 : 1; });

    // 連続記録日数（現在・最長）
    var cur2=0, bestStreak=0, run=0, prev=null;
    keys.forEach(function(k2){
      if(prev!=null && daysBetween(prev,k2)===1) run++; else run=1;
      if(run>bestStreak) bestStreak=run;
      prev=k2;
    });
    // 現在の連続：最終記録が今日または昨日なら継続中
    cur2 = (keys.length && daysBetween(keys[keys.length-1], today) <= 1) ? run : 0;

    // 時間帯メダル用（保存時刻から）
    var morning=0, night=0, weekend=0;
    keys.forEach(function(k2){
      var lg=logs[k2]; if(!lg || !lg._savedAt) return;
      var h=new Date(lg._savedAt).getHours();
      if(h<9) morning++;
      if(h>=21) night++;
      var dow=dateOf(k2).getDay();
      if((dow===0||dow===6) && lg.move && ((lg.move.exercises||[]).length||lg.move.totalMin>0)) weekend++;
    });

    return { days:keys, weight:weight, ma7:ma7, weeklyVol:weeklyVol, partShare:partShare,
             prs:prs, streak:cur2, bestStreak:bestStreak,
             morning:morning, night:night, weekend:weekend };
  }

  /* 分析系のエンプティステート（ROADMAP 13章 文言・要レビュー） */
  var EMPTY2 = {
    "日本語":{feed:"フォローすると、仲間の記録が届きます",grow:"記録がたまると、ここに推移が出ます",forecast:"記録を続けると、予測が表示されます",medal:"最初のメダルを目指しましょう"},
    "English":{feed:"Follow others and their logs arrive here",grow:"As your logs build up, trends appear here",forecast:"Keep logging and your forecast appears",medal:"Aim for your first medal"},
    "简体中文":{feed:"关注后，伙伴的记录会出现在这里",grow:"记录积累后，这里会显示趋势",forecast:"坚持记录，就会显示预测",medal:"以第一枚奖牌为目标吧"},
    "繁體中文":{feed:"追蹤後，夥伴的記錄會出現在這裡",grow:"記錄累積後，這裡會顯示趨勢",forecast:"持續記錄，就會顯示預測",medal:"以第一枚獎牌為目標吧"},
    "한국어":{feed:"팔로우하면 동료의 기록이 도착해요",grow:"기록이 쌓이면 여기에 추이가 나타나요",forecast:"기록을 이어가면 예측이 표시돼요",medal:"첫 메달을 목표로 해봐요"},
    "Français":{feed:"Suivez des membres et leurs journaux arrivent ici",grow:"Vos tendances apparaîtront ici avec vos journaux",forecast:"Continuez à enregistrer et la prévision apparaît",medal:"Visez votre première médaille"},
    "Español":{feed:"Sigue a otros y sus registros llegarán aquí",grow:"Con más registros, aquí aparecerán las tendencias",forecast:"Sigue registrando y aparecerá la previsión",medal:"Ve por tu primera medalla"},
    "Deutsch":{feed:"Folge anderen und ihre Einträge erscheinen hier",grow:"Mit mehr Einträgen erscheinen hier Trends",forecast:"Weiter eintragen — die Prognose erscheint",medal:"Auf zur ersten Medaille"},
    "Italiano":{feed:"Segui gli altri e i loro diari arrivano qui",grow:"Con più registrazioni, qui appaiono le tendenze",forecast:"Continua a registrare e apparirà la previsione",medal:"Punta alla prima medaglia"},
    "Português":{feed:"Siga outras pessoas e os registros chegam aqui",grow:"Com mais registros, as tendências aparecem aqui",forecast:"Continue registrando e a previsão aparece",medal:"Busque sua primeira medalha"},
    "ภาษาไทย":{feed:"กดติดตาม แล้วบันทึกของเพื่อนจะมาถึงที่นี่",grow:"เมื่อบันทึกสะสมมากขึ้น แนวโน้มจะแสดงที่นี่",forecast:"บันทึกต่อไป แล้วการคาดการณ์จะแสดงขึ้น",medal:"ตั้งเป้าเหรียญแรกกันเถอะ"},
    "हिन्दी":{feed:"फ़ॉलो करें, साथियों के रिकॉर्ड यहाँ आएँगे",grow:"रिकॉर्ड बढ़ने पर यहाँ रुझान दिखेंगे",forecast:"रिकॉर्ड जारी रखें, पूर्वानुमान दिखेगा",medal:"पहले मेडल का लक्ष्य रखें"},
    "Tiếng Việt":{feed:"Theo dõi mọi người và nhật ký của họ sẽ đến đây",grow:"Khi nhật ký tích lũy, xu hướng sẽ hiện ở đây",forecast:"Tiếp tục ghi lại, dự báo sẽ hiển thị",medal:"Hướng tới huy chương đầu tiên nhé"},
    "Bahasa Indonesia":{feed:"Ikuti yang lain, catatan mereka muncul di sini",grow:"Saat catatan bertambah, tren muncul di sini",forecast:"Terus catat, prakiraan akan muncul",medal:"Kejar medali pertamamu"}
  };


  /* ---------- 具体アドバイス生成（オーナー指示 2026-07-12：抽象的→実数値つきに） ---------- */
  var ADVICE = {"日本語": {"foodProt": "たんぱく質があと{n}g。鶏むね肉{m}gか、卵{e}個ぶんです", "foodKcalUnder": "きょうはあと{n}kcal食べてOK。抜きすぎは逆効果です", "foodKcalOver": "目標より約{n}kcalオーバー。夜は軽めがおすすめです", "foodMeals": "きょうの記録は{n}食ぶん。あと1食記録すると精度が上がります", "sleepShort": "睡眠は{h}時間{m}分。今夜は{d}分早くお布団へ", "sleepLong": "睡眠は{h}時間{m}分。寝すぎも疲れのもと。7時間半が目安です", "moveNone": "運動の記録がまだ。15分の早歩きだけでもスコアが上がります", "recoverLow": "回復が低め。寝る30分前にスマホを置いてみましょう"}, "English": {"foodProt": "About {n}g more protein — {m}g of chicken breast or {e} eggs", "foodKcalUnder": "You can still eat about {n} kcal today. Undereating backfires", "foodKcalOver": "About {n} kcal over target. Go light tonight", "foodMeals": "{n} meal(s) logged today. One more makes this more accurate", "sleepShort": "You slept {h}h {m}m. Head to bed {d} min earlier tonight", "sleepLong": "You slept {h}h {m}m. Oversleeping tires you too — aim for 7.5h", "moveNone": "No exercise logged yet. Even a 15-min brisk walk lifts your score", "recoverLow": "Recovery is low. Put the phone down 30 min before bed"}, "简体中文": {"foodProt": "蛋白质还差约{n}g——约鸡胸肉{m}g或{e}个鸡蛋", "foodKcalUnder": "今天还可以吃约{n}kcal。吃太少反而不利", "foodKcalOver": "比目标多了约{n}kcal。晚上清淡一点", "foodMeals": "今天记录了{n}餐。再记一餐会更准确", "sleepShort": "睡了{h}小时{m}分。今晚早{d}分钟上床吧", "sleepLong": "睡了{h}小时{m}分。睡太多也会累，以7.5小时为宜", "moveNone": "还没有运动记录。快走15分钟也能提分", "recoverLow": "恢复偏低。睡前30分钟放下手机试试"}, "繁體中文": {"foodProt": "蛋白質還差約{n}g——約雞胸肉{m}g或{e}顆蛋", "foodKcalUnder": "今天還可以吃約{n}kcal。吃太少反而不利", "foodKcalOver": "比目標多了約{n}kcal。晚上清淡一點", "foodMeals": "今天記錄了{n}餐。再記一餐會更準確", "sleepShort": "睡了{h}小時{m}分。今晚早{d}分鐘上床吧", "sleepLong": "睡了{h}小時{m}分。睡太多也會累，以7.5小時為宜", "moveNone": "還沒有運動記錄。快走15分鐘也能提升分數", "recoverLow": "恢復偏低。睡前30分鐘放下手機試試"}, "한국어": {"foodProt": "단백질이 약 {n}g 부족해요 — 닭가슴살 {m}g 또는 달걀 {e}개예요", "foodKcalUnder": "오늘 약 {n}kcal 더 먹어도 괜찮아요. 너무 굶으면 역효과예요", "foodKcalOver": "목표보다 약 {n}kcal 초과예요. 저녁은 가볍게", "foodMeals": "오늘 기록은 {n}끼예요. 한 끼 더 기록하면 더 정확해져요", "sleepShort": "수면 {h}시간 {m}분. 오늘 밤은 {d}분 일찍 잠자리에", "sleepLong": "수면 {h}시간 {m}분. 너무 자도 피곤해요. 7시간 반이 기준", "moveNone": "아직 운동 기록이 없어요. 15분 빠른 걷기로도 점수가 올라요", "recoverLow": "회복이 낮아요. 자기 30분 전 휴대폰을 내려놓아 보세요"}, "Français": {"foodProt": "Encore ~{n}g de protéines — {m}g de blanc de poulet ou {e} œufs", "foodKcalUnder": "Vous pouvez encore manger ~{n} kcal aujourd'hui. Trop restreindre est contre-productif", "foodKcalOver": "~{n} kcal au-dessus de l'objectif. Dîner léger ce soir", "foodMeals": "{n} repas enregistré(s) aujourd'hui. Un de plus affine le calcul", "sleepShort": "Sommeil : {h}h{m}. Couchez-vous {d} min plus tôt ce soir", "sleepLong": "Sommeil : {h}h{m}. Trop dormir fatigue aussi — visez 7h30", "moveNone": "Pas encore de sport enregistré. 15 min de marche rapide suffisent", "recoverLow": "Récupération basse. Posez le téléphone 30 min avant le coucher"}, "Español": {"foodProt": "Faltan ~{n}g de proteína: {m}g de pechuga de pollo o {e} huevos", "foodKcalUnder": "Aún puedes comer ~{n} kcal hoy. Comer de menos es contraproducente", "foodKcalOver": "~{n} kcal por encima del objetivo. Cena ligera esta noche", "foodMeals": "{n} comida(s) registrada(s) hoy. Una más mejora la precisión", "sleepShort": "Dormiste {h}h {m}m. Acuéstate {d} min antes esta noche", "sleepLong": "Dormiste {h}h {m}m. Dormir de más también cansa: apunta a 7,5h", "moveNone": "Sin ejercicio registrado aún. 15 min de caminata rápida suben tu puntuación", "recoverLow": "Recuperación baja. Deja el móvil 30 min antes de dormir"}, "Deutsch": {"foodProt": "Noch ~{n}g Protein — {m}g Hähnchenbrust oder {e} Eier", "foodKcalUnder": "Heute sind noch ~{n} kcal drin. Zu wenig essen wirkt kontraproduktiv", "foodKcalOver": "~{n} kcal über dem Ziel. Heute Abend leicht essen", "foodMeals": "Heute {n} Mahlzeit(en) erfasst. Eine mehr macht es genauer", "sleepShort": "Schlaf: {h}h {m}m. Geh heute {d} Min früher ins Bett", "sleepLong": "Schlaf: {h}h {m}m. Zu viel Schlaf ermüdet auch — 7,5h sind ideal", "moveNone": "Noch kein Training erfasst. Schon 15 Min zügiges Gehen hebt den Score", "recoverLow": "Erholung niedrig. Leg das Handy 30 Min vor dem Schlafen weg"}, "Italiano": {"foodProt": "Mancano ~{n}g di proteine: {m}g di petto di pollo o {e} uova", "foodKcalUnder": "Puoi mangiare ancora ~{n} kcal oggi. Mangiare troppo poco è controproducente", "foodKcalOver": "~{n} kcal oltre l'obiettivo. Stasera vai leggero", "foodMeals": "{n} pasto/i registrati oggi. Uno in più aumenta la precisione", "sleepShort": "Hai dormito {h}h {m}m. Vai a letto {d} min prima stasera", "sleepLong": "Hai dormito {h}h {m}m. Dormire troppo stanca: punta a 7,5h", "moveNone": "Nessun allenamento registrato. Bastano 15 min di camminata veloce", "recoverLow": "Recupero basso. Posa il telefono 30 min prima di dormire"}, "Português": {"foodProt": "Faltam ~{n}g de proteína: {m}g de peito de frango ou {e} ovos", "foodKcalUnder": "Ainda dá para comer ~{n} kcal hoje. Comer de menos atrapalha", "foodKcalOver": "~{n} kcal acima da meta. Jante leve hoje", "foodMeals": "{n} refeição(ões) registrada(s) hoje. Mais uma melhora a precisão", "sleepShort": "Você dormiu {h}h {m}m. Vá para a cama {d} min mais cedo hoje", "sleepLong": "Você dormiu {h}h {m}m. Dormir demais também cansa: mire 7,5h", "moveNone": "Nenhum exercício registrado. 15 min de caminhada rápida já ajudam", "recoverLow": "Recuperação baixa. Largue o celular 30 min antes de dormir"}, "ภาษาไทย": {"foodProt": "โปรตีนยังขาดอีก ~{n} ก. — อกไก่ {m} ก. หรือไข่ {e} ฟอง", "foodKcalUnder": "วันนี้ยังกินได้อีก ~{n} kcal กินน้อยเกินไปจะย้อนแย่", "foodKcalOver": "เกินเป้าราว {n} kcal มื้อเย็นเบาๆ นะ", "foodMeals": "วันนี้บันทึก {n} มื้อ เพิ่มอีกมื้อจะแม่นยำขึ้น", "sleepShort": "นอน {h} ชม. {m} นาที คืนนี้เข้านอนเร็วขึ้น {d} นาที", "sleepLong": "นอน {h} ชม. {m} นาที นอนมากไปก็เพลีย เป้าคือ 7.5 ชม.", "moveNone": "ยังไม่มีบันทึกออกกำลัง เดินเร็ว 15 นาทีก็เพิ่มคะแนนได้", "recoverLow": "การฟื้นตัวต่ำ ลองวางมือถือ 30 นาทีก่อนนอน"}, "हिन्दी": {"foodProt": "अभी ~{n}g प्रोटीन कम है — {m}g चिकन ब्रेस्ट या {e} अंडे", "foodKcalUnder": "आज ~{n} kcal और खा सकते हैं। बहुत कम खाना उल्टा पड़ता है", "foodKcalOver": "लक्ष्य से ~{n} kcal ज़्यादा। रात का खाना हल्का रखें", "foodMeals": "आज {n} भोजन दर्ज हुए। एक और दर्ज करें तो सटीकता बढ़ेगी", "sleepShort": "नींद {h} घं {m} मि। आज {d} मिनट पहले सो जाएँ", "sleepLong": "नींद {h} घं {m} मि। ज़्यादा सोना भी थकाता है — 7.5 घंटे लक्ष्य रखें", "moveNone": "अभी कसरत दर्ज नहीं। 15 मिनट तेज़ चाल से भी स्कोर बढ़ेगा", "recoverLow": "रिकवरी कम है। सोने से 30 मिनट पहले फोन रख दें"}, "Tiếng Việt": {"foodProt": "Còn thiếu ~{n}g đạm — {m}g ức gà hoặc {e} quả trứng", "foodKcalUnder": "Hôm nay còn ăn được ~{n} kcal. Ăn quá ít sẽ phản tác dụng", "foodKcalOver": "Vượt mục tiêu ~{n} kcal. Tối nay ăn nhẹ nhé", "foodMeals": "Hôm nay đã ghi {n} bữa. Thêm một bữa sẽ chính xác hơn", "sleepShort": "Ngủ {h}g {m}p. Tối nay đi ngủ sớm hơn {d} phút", "sleepLong": "Ngủ {h}g {m}p. Ngủ nhiều quá cũng mệt — 7,5 giờ là chuẩn", "moveNone": "Chưa ghi vận động. Đi bộ nhanh 15 phút cũng nâng điểm", "recoverLow": "Phục hồi thấp. Đặt điện thoại xuống 30 phút trước khi ngủ"}, "Bahasa Indonesia": {"foodProt": "Kurang ~{n}g protein — {m}g dada ayam atau {e} telur", "foodKcalUnder": "Hari ini masih bisa makan ~{n} kcal. Terlalu sedikit justru buruk", "foodKcalOver": "Sekitar {n} kcal di atas target. Makan malam ringan saja", "foodMeals": "{n} makan tercatat hari ini. Satu lagi membuat lebih akurat", "sleepShort": "Tidur {h}j {m}m. Malam ini tidur {d} menit lebih awal", "sleepLong": "Tidur {h}j {m}m. Kebanyakan tidur juga melelahkan — target 7,5 jam", "moveNone": "Belum ada catatan olahraga. Jalan cepat 15 menit pun menaikkan skor", "recoverLow": "Pemulihan rendah. Letakkan ponsel 30 menit sebelum tidur"}};
  function fmtAdvice(tpl, vars){
    return String(tpl).replace(/\{(\w+)\}/g, function(_,k2){ return vars[k2]!=null ? vars[k2] : ""; });
  }
  function advice(lang){
    var sc = todayScore(); if(!sc) return null;
    var lg = getLog(todayKey()); if(!lg) return null;
    var A = ADVICE[lang] || ADVICE["English"];
    var keys = ["sleep","food","move","recover"], low=null, lv=101;
    keys.forEach(function(k2){ if(sc[k2]!=null && sc[k2]<lv){ lv=sc[k2]; low=k2; } });
    if(low==null || lv>=75) return { factor:null, score:sc.total, text:null };
    var out = { factor:low, score:lv, text:"" };
    var prof = profile()||{};
    if(low==="food"){
      var pfc = lg.food.pfc||{}, eaten = foodEaten(lg.food);
      var w = +prof.weight_kg || 60;
      var targetP = Math.round(w*1.5/5)*5;
      if(pfc.p!=null && pfc.p < targetP){
        var gap = targetP - pfc.p;
        out.text = fmtAdvice(A.foodProt, { n:gap, m:Math.max(30, Math.round(gap/22*100/10)*10), e:Math.min(6, Math.max(1, Math.round(gap/6.2))) });
        return out;
      }
      var bmr = bmrOf(prof), goal = bmr ? bmr + moveKcal(lg) : null;
      if(goal && eaten > 0){
        var diff = goal - eaten;
        if(diff > 150){ out.text = fmtAdvice(A.foodKcalUnder, { n:Math.round(diff/10)*10 }); return out; }
        if(diff < -150){ out.text = fmtAdvice(A.foodKcalOver, { n:Math.round(-diff/10)*10 }); return out; }
      }
      out.text = fmtAdvice(A.foodMeals, { n:mealsLogged(lg.food) });
      return out;
    }
    if(low==="sleep"){
      var min = lg.sleep.minutes||0, h = Math.floor(min/60), m2 = min%60;
      if(min > 560){ out.text = fmtAdvice(A.sleepLong, { h:h, m:m2 }); }
      else { var d2 = Math.max(10, Math.min(90, Math.round((450-min)/10)*10)); out.text = fmtAdvice(A.sleepShort, { h:h, m:m2, d:d2 }); }
      return out;
    }
    if(low==="move"){ out.text = A.moveNone; return out; }
    out.text = A.recoverLow; return out;
  }

  /* ---------- SNS投稿（training/recipe） ---------- */
  function posts(){ return get(K.posts, []); }
  function addPost(p){
    var arr = get(K.posts, []);
    p.id = p.id || ("local-"+Date.now()+"-"+Math.random().toString(36).slice(2,7));
    p.created_at = p.created_at || new Date().toISOString();
    p.cheer_count = p.cheer_count || 0;
    arr.unshift(p);
    set(K.posts, arr.slice(0,100));
    return p;
  }
  function cheerPost(id){
    var arr = get(K.posts, []);
    for(var i=0;i<arr.length;i++){
      if(arr[i].id===id && !arr[i]._cheered){ arr[i].cheer_count=(arr[i].cheer_count||0)+1; arr[i]._cheered=true; set(K.posts, arr); return arr[i]; }
    }
    return null;
  }

  /* ---------- プロフィール ---------- */
  function profile(){ return get(K.profile, null); }
  function saveProfile(patch){
    var p = get(K.profile, {}) || {};
    for(var k2 in patch){ p[k2] = patch[k2]; }
    p.updated_at = new Date().toISOString();
    set(K.profile, p);
    return p;
  }

  /* ---------- ナビゲーション ---------- */
  function go(page){ window.location.href = page + ".html"; }

  /* ---------- ロゴイントロはログイン前（splash）のみ。アプリ内画面では常に非表示（オーナー指示 2026-07-12） ---------- */
  try{
    var st = document.createElement("style");
    st.textContent = ".revoIntro{display:none!important;animation:none!important;}";
    (document.head || document.documentElement).appendChild(st);
  }catch(e){}

  /* ---------- モバイル時のオーバースクロール背景をテーマに同期 ---------- */
  function syncBodyBg(){
    if(!document.body) return;
    if(get(K.dark, true)){ document.body.style.background = "#16140F"; return; }
    var acc = bgAccRgb();
    document.body.style.background = acc ? pastelize("#F1EFEA", acc) : "#F1EFEA";
  }
  if(document.readyState !== "loading") syncBodyBg();
  else document.addEventListener("DOMContentLoaded", syncBodyBg);

  /* ---------- BGM：ページを跨いで継続再生 ----------
     状態は localStorage（revo.bgm）。BGM画面の #audio がある画面では
     そちらが再生を担うため、このグローバルプレイヤーは待機する。
     ブラウザの自動再生制限で再開できない場合は、最初のタップで再開する。 */
  var BGMK = "revo.bgm";
  var _bgmAudio = null;
  function bgmBase(){
    return location.pathname.replace(/screens\/[^\/]*$/, "").replace(/index\.html$/, "");
  }
  function bgmSaveFrom(a, playing){
    set(BGMK, { playing:playing, t:(a && a.currentTime)||0, vol:(a ? a.volume : 1), track:"City_Pulse", at:Date.now() });
  }
  function bgmInit(){
    if(document.getElementById("audio")) return;          // BGM画面は自前のプレイヤーに任せる
    var st = get(BGMK, null);
    if(!st || !st.playing) return;
    var a = new Audio(bgmBase() + "assets/audio/City_Pulse.mp3");
    a.loop = true;
    a.volume = (st.vol != null ? st.vol : 1);
    try{ a.currentTime = st.t || 0; }catch(e){}
    _bgmAudio = a;
    var kick = function(){
      a.play().then(function(){
        document.removeEventListener("pointerdown", kick);
        document.removeEventListener("keydown", kick);
      }).catch(function(){});
    };
    a.play().catch(function(){
      // 自動再生がブロックされたら、最初の操作で再開
      document.addEventListener("pointerdown", kick);
      document.addEventListener("keydown", kick);
    });
    setInterval(function(){ if(_bgmAudio && !_bgmAudio.paused) bgmSaveFrom(_bgmAudio, true); }, 2000);
    window.addEventListener("pagehide", function(){ if(_bgmAudio) bgmSaveFrom(_bgmAudio, !_bgmAudio.paused); });
  }
  /* ♪ボタン：言語ボタンの左に配置（各画面のボタン様式を複製して馴染ませる）。
     タップでBGMのオン/オフ。再生中はテーマカラーで点灯。オーナー承認済みの追加UI（2026-07-09）。 */
  function bgmEnsurePlayer(t0, v0){
    if(_bgmAudio) return _bgmAudio;
    var a = new Audio(bgmBase() + "assets/audio/City_Pulse.mp3");
    a.loop = true; a.volume = v0;
    try{ a.currentTime = t0; }catch(e){}
    _bgmAudio = a;
    setInterval(function(){ if(_bgmAudio && !_bgmAudio.paused) bgmSaveFrom(_bgmAudio, true); }, 2000);
    window.addEventListener("pagehide", function(){ if(_bgmAudio) bgmSaveFrom(_bgmAudio, !_bgmAudio.paused); });
    return a;
  }
  function bgmButton(){
    var anchor = document.getElementById("langBtn") || document.getElementById("themeBtn");
    if(!anchor || !anchor.parentNode || document.getElementById("bgmTgl")) return;
    var b = anchor.cloneNode(false);
    b.id = "bgmTgl";
    b.setAttribute("aria-label", "BGM");
    var aIc = anchor.querySelector("i");
    var icColor = (aIc && aIc.style.color) || "#8A7E68";
    var icSize = (aIc && aIc.style.fontSize) || "15px";
    b.innerHTML = '<i class="ti ti-music" style="font-size:'+icSize+'; color:'+icColor+';"></i>';
    anchor.parentNode.insertBefore(b, anchor);
    function offColor(){
      var i0 = anchor.querySelector("i");
      return (i0 && i0.style.color) || icColor;
    }
    function paint(){
      var st = get(BGMK, null), on = !!(st && st.playing);
      var c = colorObj(), dark = get(K.dark, true);
      var i2 = b.querySelector("i");
      if(i2) i2.style.color = on ? (dark ? c.hex : c.light) : offColor();
    }
    b.onclick = function(e){
      e.stopPropagation();
      var st = get(BGMK, null);
      var pageAudio = document.getElementById("audio");
      if(pageAudio && pageAudio.tagName !== "AUDIO"){ pageAudio = document.querySelector("audio"); }
      if(st && st.playing){
        if(_bgmAudio) _bgmAudio.pause();
        if(pageAudio && pageAudio.pause) pageAudio.pause();
        var tNow = _bgmAudio ? _bgmAudio.currentTime : (pageAudio ? pageAudio.currentTime : (st.t||0));
        set(BGMK, { playing:false, t:tNow||0, vol:(st.vol!=null?st.vol:1), track:"City_Pulse", at:Date.now() });
      } else {
        var t0 = st ? (st.t||0) : 0, v0 = (st && st.vol!=null) ? st.vol : 1;
        set(BGMK, { playing:true, t:t0, vol:v0, track:"City_Pulse", at:Date.now() });
        if(pageAudio && pageAudio.play){
          try{ pageAudio.currentTime=t0; }catch(e2){}
          if(pageAudio.volume!=null) pageAudio.volume=v0;
          pageAudio.play().then(null, function(){});
        } else {
          bgmEnsurePlayer(t0, v0).play().then(null, function(){});
        }
      }
      paint();
    };
    /* テーマ切替への追従：アンカーボタンのstyle変更をコピー */
    try{
      new MutationObserver(function(){
        b.setAttribute("style", anchor.getAttribute("style")||"");
        paint();
      }).observe(anchor, { attributes:true, attributeFilter:["style"] });
    }catch(e){}
    paint();
  }
  /* パレットボタン：テーマカラー5色を全画面ヘッダーから変更（オーナー承認済み・2026-07-09） */
  function paletteButton(){
    var anchor = document.getElementById("langBtn") || document.getElementById("themeBtn");
    if(!anchor || !anchor.parentNode || document.getElementById("palTgl")) return;
    var b = anchor.cloneNode(false);
    b.id = "palTgl";
    b.setAttribute("aria-label", "Theme color");
    var aIc = anchor.querySelector("i");
    var icColor = (aIc && aIc.style.color) || "#8A7E68";
    var icSize = (aIc && aIc.style.fontSize) || "15px";
    b.innerHTML = '<i class="ti ti-palette" style="font-size:'+icSize+'; color:'+icColor+';"></i>';
    anchor.parentNode.insertBefore(b, anchor);
    var pop = null;
    function closePop(){ if(pop){ pop.remove(); pop=null; } }
    function openPop(){
      closePop();
      var dark = get(K.dark, true);
      /* 仮選択（✓を押すまで適用しない） */
      var pend = { color:get(K.color,"groove"), dark:dark, bg:get(K.bgTheme,null) };
      pop = document.createElement("div");
      pop.style.cssText = "position:absolute; top:54px; right:18px; background:"+(dark?"#1F1C16":"#FFFFFF")+
        "; border:0.5px solid "+(dark?"#3A352A":"#E8E0CE")+"; border-radius:14px; padding:12px;"+
        " box-shadow:0 18px 40px -12px rgba(0,0,0,0.7); z-index:60;";
      function swatch(hexBg, on, dk, cb){
        var sw = document.createElement("button");
        sw.style.cssText = "width:30px; height:30px; border-radius:50%; cursor:pointer; padding:0; background:"+hexBg+
          "; position:relative; transition:all .15s; border:0.5px solid "+(dark?"#3A352A":"#E0DACE")+";"+
          (on ? " box-shadow:0 0 0 2px "+(dark?"#16140F":"#FAF8F3")+",0 0 0 4px "+hexBg+";" : "");
        if(on) sw.innerHTML = '<i class="ti ti-check" style="font-size:14px; color:'+(dk?"#8A7E68":"#FFFFFF")+'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);"></i>';
        sw.onclick = function(e){ e.stopPropagation(); cb(); paint(); };
        return sw;
      }
      function paint(){
        pop.innerHTML = "";
        /* 上段：アクセント5色 */
        var r1 = document.createElement("div"); r1.style.cssText="display:flex; gap:9px;";
        COLORS.forEach(function(c){
          r1.appendChild(swatch(dark?c.hex:c.light, pend.color===c.k, false, function(){ pend.color=c.k; }));
        });
        pop.appendChild(r1);
        var hr = document.createElement("div");
        hr.style.cssText = "height:0.5px; background:"+(dark?"#3A352A":"#EAE5DA")+"; margin:10px 0;";
        pop.appendChild(hr);
        /* 中段：背景（ブラック / ライト / リゾートパステル） */
        var r2 = document.createElement("div"); r2.style.cssText="display:flex; gap:9px;";
        r2.appendChild(swatch("#16140F", pend.dark && !pend.bg, false, function(){ pend.dark=true; pend.bg=null; }));
        r2.appendChild(swatch("#FAF8F3", !pend.dark && !pend.bg, true, function(){ pend.dark=false; pend.bg=null; }));
        BG_COLORS.slice(0,3).forEach(function(c){
          var pastel = rgb2hex.apply(null, mix([255,255,255], hex2rgb(c.hex), 0.32));
          r2.appendChild(swatch(pastel, !pend.dark && pend.bg===c.k, true, function(){ pend.dark=false; pend.bg=c.k; }));
        });
        pop.appendChild(r2);
        var r3 = document.createElement("div"); r3.style.cssText="display:flex; gap:9px; margin:9px 0 0;";
        BG_COLORS.slice(3).forEach(function(c){
          var pastel = rgb2hex.apply(null, mix([255,255,255], hex2rgb(c.hex), 0.32));
          r3.appendChild(swatch(pastel, !pend.dark && pend.bg===c.k, true, function(){ pend.dark=false; pend.bg=c.k; }));
        });
        pop.appendChild(r3);
        /* 確定ボタン（カラーと背景を選び終えてから適用） */
        var acc = COLORS.filter(function(c){return c.k===pend.color;})[0] || COLORS[1];
        var go = document.createElement("button");
        go.style.cssText = "width:100%; margin:12px 0 0; background:"+(dark?acc.hex:acc.light)+
          "; border:none; color:"+(dark?"#16140F":"#FFFFFF")+"; font-weight:600; padding:10px; border-radius:11px; cursor:pointer;";
        go.innerHTML = '<i class="ti ti-check" style="font-size:17px; vertical-align:-3px;"></i>';
        go.onclick = function(e){
          e.stopPropagation();
          set(K.color, pend.color); set(K.dark, pend.dark); set(K.bgTheme, pend.bg);
          var p = profile();
          if(p) saveProfile({ theme_color:pend.color, theme_mode:(pend.dark?"dark":"light"), bg_theme:pend.bg });
          location.reload();
        };
        pop.appendChild(go);
      }
      paint();
      pop.onclick = function(e){ e.stopPropagation(); };
      var host = b.closest ? (b.closest("#screen") || document.body) : document.body;
      host.appendChild(pop);
      setTimeout(function(){ document.addEventListener("click", closePop, { once:true }); }, 0);
    }
    b.onclick = function(e){ e.stopPropagation(); if(pop) closePop(); else openPop(); };
    try{
      new MutationObserver(function(){ b.setAttribute("style", anchor.getAttribute("style")||""); })
        .observe(anchor, { attributes:true, attributeFilter:["style"] });
    }catch(e){}
  }
  /* ---------- 全画面共通の下部タブ（ホーム/記録/SNS/分析/メニュー）オーナー承認 2026-07-12 ----------
     home の9タブを5タブに整理し、全画面の下部に常時表示。どこからでもワンタップで移動できる。
     ログイン前の画面（splash/welcome/login/signup/オンボーディング系）には出さない。 */
  var NAV_LBL = {
    "日本語":["ホーム","記録","SNS","分析","メニュー"],
    "English":["Home","Log","SNS","Insights","Menu"],
    "简体中文":["首页","记录","SNS","分析","菜单"],
    "繁體中文":["首頁","記錄","SNS","分析","選單"],
    "한국어":["홈","기록","SNS","분석","메뉴"],
    "Français":["Accueil","Journal","SNS","Analyse","Menu"],
    "Español":["Inicio","Registro","SNS","Análisis","Menú"],
    "Deutsch":["Start","Log","SNS","Analyse","Menü"],
    "Italiano":["Home","Diario","SNS","Analisi","Menu"],
    "Português":["Início","Registro","SNS","Análise","Menu"],
    "ภาษาไทย":["หน้าแรก","บันทึก","SNS","วิเคราะห์","เมนู"],
    "हिन्दी":["होम","रिकॉर्ड","SNS","विश्लेषण","मेनू"],
    "Tiếng Việt":["Trang chủ","Ghi","SNS","Phân tích","Menu"],
    "Bahasa Indonesia":["Beranda","Catat","SNS","Analisis","Menu"]
  };
  function tabBar(){
    var file = (location.pathname.split("/").pop()||"").replace(/\.html$/,"");
    var SKIP = {"splash":1,"welcome":1,"login":1,"signup":1,"onboarding":1,"goal_setup":1,"notif_permission":1,"pwa_install":1,"index":1,"selftest":1,"":1};
    if(SKIP[file]) return;
    var screen = document.getElementById("screen");
    if(!screen || document.getElementById("revoTabs")) return;
    var TABS = [["home","ti-home-2"],["log","ti-pencil-plus"],["feed","ti-users"],["analysis","ti-chart-line"],["navigator","ti-layout-grid"]];
    var pad = document.createElement("div");
    pad.id = "revoTabsPad";
    pad.style.cssText = "height:calc(64px + env(safe-area-inset-bottom,0px));";
    screen.appendChild(pad);
    var bar = document.createElement("div");
    bar.id = "revoTabs";
    document.body.appendChild(bar);
    function paint(){
      var dark = get(K.dark, true), lang = get(K.lang, "日本語");
      var lbl = NAV_LBL[lang] || NAV_LBL["English"];
      var c = colorObj(), acc = dark ? c.hex : c.light;
      var accRgb2 = (!dark) ? bgAccRgb() : null;
      var bg = dark ? "#16140F" : (accRgb2 ? pastelize("#FFFFFF", accRgb2) : "#FFFFFF");
      var bd = dark ? "#2A2620" : (accRgb2 ? pastelize("#F0EAE0", accRgb2) : "#F0EAE0");
      var off = dark ? "#6E6555" : "#B7A98F";
      bar.style.cssText = "position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:100%; max-width:380px; z-index:34;"+
        " display:flex; align-items:center; justify-content:space-around;"+
        " padding:9px 8px calc(10px + env(safe-area-inset-bottom,0px)); border-top:0.5px solid "+bd+"; background:"+bg+"; transition:all 0.35s;";
      bar.innerHTML = "";
      TABS.forEach(function(tb, i){
        var on = (file === tb[0]);
        var cell = document.createElement("div");
        cell.style.cssText = "display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer; min-width:52px;";
        cell.innerHTML = '<i class="ti '+tb[1]+'" style="font-size:21px; color:'+(on?acc:off)+';" aria-hidden="true"></i>'+
          '<span style="font-size:9px; color:'+(on?acc:off)+';">'+lbl[i]+'</span>';
        cell.onclick = function(){ if(!on) go(tb[0]); };
        bar.appendChild(cell);
      });
    }
    paint();
    /* 言語・明暗切替（ヘッダーのボタン操作）に追従して再描画 */
    document.addEventListener("click", function(){ setTimeout(paint, 90); });
  }
  function bgmBoot(){ bgmInit(); bgmButton(); paletteButton(); tabBar(); }
  if(document.readyState !== "loading") bgmBoot();
  else document.addEventListener("DOMContentLoaded", bgmBoot);

  /* ---------- PWA ---------- */
  var deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function(e){
    e.preventDefault();
    deferredPrompt = e;
  });
  if("serviceWorker" in navigator){
    window.addEventListener("load", function(){
      var base = location.pathname.replace(/screens\/[^\/]*$/, "").replace(/index\.html$/, "");
      navigator.serviceWorker.register(base + "sw.js").catch(function(){});
    });
  }

  /* ---------- 公開API ---------- */
  window.REVO = {
    COLORS: COLORS,
    EMPTY: EMPTY,
    EMPTY2: EMPTY2,
    allLogs: allLogs,
    stats: stats,
    advice: advice,
    lang: function(){ return get(K.lang, "日本語"); },
    setLang: function(l){ set(K.lang, l); },
    dark: function(){ return get(K.dark, true); },
    setDark: function(d){ set(K.dark, !!d); syncBodyBg(); },
    color: function(){ return get(K.color, "groove"); },
    setColor: function(k2){ set(K.color, k2); },
    colorIndex: colorIndex,
    colorObj: colorObj,
    tint: tint,
    profile: profile,
    saveProfile: saveProfile,
    onboarded: function(){ var p = profile(); return !!(p && p.onboarded); },
    auth: function(){ return get(K.auth, null); },
    setAuth: function(a){ set(K.auth, a); },
    sub: function(){ return get(K.sub, null); },
    setSub: function(s2){ set(K.sub, s2); },
    posts: posts,
    addPost: addPost,
    cheerPost: cheerPost,
    todayKey: todayKey,
    prevKey: prevKey,
    emptyLog: emptyLog,
    normalizeLog: normalizeLog,
    getLog: getLog,
    saveLog: saveLog,
    computeScore: computeScore,
    todayScore: todayScore,
    waterTotal: waterTotal,
    foodEaten: foodEaten,
    bmrOf: bmrOf,
    moveKcal: moveKcal,
    go: go,
    installPrompt: function(){
      if(deferredPrompt){ deferredPrompt.prompt(); var p2 = deferredPrompt; deferredPrompt = null; return p2.userChoice; }
      return null;
    },
    bgTheme: bgTheme,
    setBgTheme: function(k2){ set(K.bgTheme, k2); },
    bgmState: function(){ return get(BGMK, null); },
    bgmStop: function(){ if(_bgmAudio){ _bgmAudio.pause(); } set(BGMK, {playing:false, t:0, vol:1, track:"City_Pulse", at:Date.now()}); },
    reset: function(){ Object.keys(K).forEach(function(k2){ LS.removeItem(K[k2]); }); LS.removeItem(BGMK); }
  };
})();
