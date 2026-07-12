/* POST /api/tip  { post_id, amount }  — 応援（投げ銭）の単発決済
   金額はサーバ側の許可リストのみ（クライアント任意額は不可）。 */
"use strict";
const { verifyUser, json, readRawBody } = require("./_lib.js");

const MIN = 50, MAX = 100000;   // 円（自由金額の上下限。プリセット: 100/300/500/1000）

function createHandler(deps){
  const verify = deps.verifyUser || verifyUser;
  return async function handler(req, res){
    if(req.method !== "POST"){ return json(res, 405, {error:"method not allowed"}); }
    const stripe = deps.stripe;
    try{
      const user = await verify(req, deps.fetch);
      if(!user){ return json(res, 401, {error:"unauthorized"}); }
      let body = req.body;
      if(!body || typeof body !== "object"){
        try{ body = JSON.parse((await readRawBody(req)).toString("utf8") || "{}"); }catch(e){ body = {}; }
      }
      const amount = Math.round(Number(body.amount));
      if(!Number.isFinite(amount) || amount < MIN || amount > MAX || !body.post_id){
        return json(res, 400, {error:"bad request"});   // 範囲外・非数値は拒否
      }

      // 投稿の作者を取得（受取人記録用）
      const f = deps.fetch || fetch;
      const pr = await f(process.env.SUPABASE_URL + "/rest/v1/posts?id=eq." + encodeURIComponent(body.post_id) + "&select=user_id", {
        headers: { "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY, "Authorization": "Bearer " + process.env.SUPABASE_SERVICE_ROLE_KEY }
      });
      const rows = await pr.json();
      const toUser = rows && rows[0] && rows[0].user_id;
      if(!toUser){ return json(res, 404, {error:"post not found"}); }

      const origin = (req.headers["origin"] || process.env.APP_URL || "").replace(/\/$/,"");
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price_data: { currency:"jpy", unit_amount: amount,
          product_data: { name: "revo cheer" } }, quantity: 1 }],
        client_reference_id: user.id,
        metadata: { kind:"tip", post_id: body.post_id, from_user: user.id, to_user: toUser, amount: String(amount) },
        payment_intent_data: { metadata: { kind:"tip", post_id: body.post_id, from_user: user.id, to_user: toUser } },
        success_url: origin + "/screens/feed.html?tip=success",
        cancel_url:  origin + "/screens/feed.html?tip=cancel"
      }, { idempotencyKey: "tip_" + user.id + "_" + body.post_id + "_" + (body.nonce||"") });

      return json(res, 200, { url: session.url });
    }catch(e){
      console.error("[tip]", e.message);
      return json(res, 500, {error:"tip failed"});
    }
  };
}
module.exports = createHandler({ get stripe(){ return require("stripe")(process.env.STRIPE_SECRET_KEY); } });
module.exports.createHandler = createHandler;
