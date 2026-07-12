/* POST /api/food-photo  { image: "data:image/jpeg;base64,...", lang }
   写真から料理を認識してカロリー推定（スタンダード/横断の特典・サーバ側で強制）。
   画像はクライアントで512pxに縮小済み前提。コスト制御：max_tokens小・画像1枚のみ。 */
"use strict";
const { verifyUser, json, readRawBody } = require("./_lib.js");

function createHandler(deps){
  const verify = deps.verifyUser || verifyUser;
  return async function handler(req, res){
    if(req.method !== "POST"){ return json(res, 405, {error:"method not allowed"}); }
    try{
      const user = await verify(req, deps.fetch);
      if(!user){ return json(res, 401, {error:"unauthorized"}); }
      let body = req.body;
      if(!body || typeof body !== "object"){
        try{ body = JSON.parse((await readRawBody(req)).toString("utf8") || "{}"); }catch(e){ body = {}; }
      }
      const img = String(body.image||"");
      const m = img.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
      if(!m || m[2].length > 800000){ return json(res, 400, {error:"bad image"}); }  // 縮小済み前提（~600KB上限）

      const f = deps.fetch || fetch;
      // プラン検証（api/food.js と同一ポリシー）
      const sr = await f(process.env.SUPABASE_URL + "/rest/v1/subscriptions?user_id=eq." + user.id + "&select=plan,status", {
        headers: { "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY, "Authorization": "Bearer " + process.env.SUPABASE_SERVICE_ROLE_KEY }
      });
      const subs = await sr.json();
      const sub = subs && subs[0];
      const entitled = sub && (sub.plan === "standard" || sub.plan === "cross") &&
                       (sub.status === "active" || sub.status === "trialing");
      if(!entitled){ return json(res, 402, {error:"upgrade required"}); }

      if(!process.env.ANTHROPIC_API_KEY){ return json(res, 503, {error:"estimation not configured"}); }
      const lang = String(body.lang||"日本語").slice(0,30);
      const ar = await f("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 400,
          messages: [{ role:"user", content: [
            { type:"image", source:{ type:"base64", media_type:"image/"+m[1], data:m[2] } },
            { type:"text", text:
              'Identify the food(s) in this photo and estimate calories. Respond ONLY with JSON: '+
              '{"items":[{"name":"<dish name in '+lang+'>","kcal":<integer>}],"total":<integer>} '+
              '(1-4 items, realistic portions as shown). If no food is visible, return {"items":[],"total":0}.' }
          ]}]
        })
      });
      if(!ar.ok){ return json(res, 502, {error:"analysis failed"}); }
      const aj = await ar.json();
      let items = [], total = 0;
      try{
        const txt = (aj.content && aj.content[0] && aj.content[0].text || "").replace(/```json|```/g,"").trim();
        const parsed = JSON.parse(txt);
        items = (parsed.items||[]).slice(0,4)
          .map(p => ({ name: String(p.name||"").slice(0,40), kcal: Math.max(0, Math.min(5000, Math.round(+p.kcal||0))) }))
          .filter(p => p.name && p.kcal > 0);
        total = items.reduce((s,p)=>s+p.kcal, 0);
      }catch(e){ items = []; total = 0; }
      return json(res, 200, { items: items, total: total });
    }catch(e){
      console.error("[food-photo]", e.message);
      return json(res, 500, {error:"photo analysis failed"});
    }
  };
}
module.exports = createHandler({});
module.exports.createHandler = createHandler;
