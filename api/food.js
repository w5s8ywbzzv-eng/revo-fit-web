/* POST /api/food  { name }  — 料理名からのカロリー推定（多言語対応）
   コスト制御：food_cache に永続キャッシュ（同じ料理名は世界で1回だけAIを呼ぶ）。
   ANTHROPIC_API_KEY 未設定時は 503（アプリ側はチップ非表示のまま）。 */
"use strict";
const { verifyUser, json, readRawBody, upsertRow } = require("./_lib.js");

function norm(s){ return String(s||"").toLowerCase().trim().replace(/\s+/g," ").slice(0,60); }

function createHandler(deps){
  const verify = deps.verifyUser || verifyUser;
  const upsert = deps.upsertRow || upsertRow;
  return async function handler(req, res){
    if(req.method !== "POST"){ return json(res, 405, {error:"method not allowed"}); }
    try{
      const user = await verify(req, deps.fetch);
      if(!user){ return json(res, 401, {error:"unauthorized"}); }
      let body = req.body;
      if(!body || typeof body !== "object"){
        try{ body = JSON.parse((await readRawBody(req)).toString("utf8") || "{}"); }catch(e){ body = {}; }
      }
      const name = norm(body.name);
      if(name.length < 2){ return json(res, 400, {error:"bad request"}); }

      const f = deps.fetch || fetch;
      // プラン検証：AI推定はスタンダード/横断の特典（コスト保護のためサーバ側で強制）
      const sr = await f(process.env.SUPABASE_URL + "/rest/v1/subscriptions?user_id=eq." + user.id + "&select=plan,status", {
        headers: { "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY, "Authorization": "Bearer " + process.env.SUPABASE_SERVICE_ROLE_KEY }
      });
      const subs = await sr.json();
      const sub = subs && subs[0];
      const entitled = sub && (sub.plan === "standard" || sub.plan === "cross") &&
                       (sub.status === "active" || sub.status === "trialing");
      if(!entitled){ return json(res, 402, {error:"upgrade required"}); }
      // 1) キャッシュ確認（全ユーザー共有）
      const cr = await f(process.env.SUPABASE_URL + "/rest/v1/food_cache?name_norm=eq." + encodeURIComponent(name) + "&select=portions", {
        headers: { "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY, "Authorization": "Bearer " + process.env.SUPABASE_SERVICE_ROLE_KEY }
      });
      const rows = await cr.json();
      if(rows && rows[0] && rows[0].portions){ return json(res, 200, { portions: rows[0].portions, cached:true }); }

      // 2) AI推定（未設定なら503）
      if(!process.env.ANTHROPIC_API_KEY){ return json(res, 503, {error:"estimation not configured"}); }
      const ar = await f("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 300,
          messages: [{ role:"user", content:
            'You are a nutrition estimator. For the dish "'+name+'" (any language), return ONLY JSON: '+
            '{"portions":[{"label":"<portion in same language as dish, include grams/size>","kcal":<integer>}]} '+
            'with 1-3 realistic portion options. If it is not food, return {"portions":[]}.' }]
        })
      });
      if(!ar.ok){ return json(res, 502, {error:"estimation failed"}); }
      const aj = await ar.json();
      let portions = [];
      try{
        const txt = (aj.content && aj.content[0] && aj.content[0].text || "").replace(/```json|```/g,"").trim();
        const parsed = JSON.parse(txt);
        portions = (parsed.portions||[]).slice(0,3)
          .map(p => ({ label: String(p.label||"").slice(0,40), kcal: Math.max(0, Math.min(5000, Math.round(+p.kcal||0))) }))
          .filter(p => p.label && p.kcal > 0);
      }catch(e){ portions = []; }

      // 3) キャッシュ保存（空でも保存＝無駄な再課金防止）
      await upsert("food_cache", { name_norm: name, portions: portions, created_at: new Date().toISOString() }, "name_norm", deps.fetch);
      return json(res, 200, { portions: portions, cached:false });
    }catch(e){
      console.error("[food]", e.message);
      return json(res, 500, {error:"food estimate failed"});
    }
  };
}
module.exports = createHandler({});
module.exports.createHandler = createHandler;
