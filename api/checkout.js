/* POST /api/checkout  { plan: "basic"|"standard"|"cross", cycle: "month"|"year" }
   認証必須（Supabase JWT）。金額はサーバ側の Price ID で決定。 */
"use strict";
const { PRICE_MAP, verifyUser, json, readRawBody } = require("./_lib.js");

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
      const key = String(body.plan||"") + ":" + String(body.cycle||"month");
      const price = PRICE_MAP()[key];
      if(!price){ return json(res, 400, {error:"unknown plan"}); }   // クライアントの金額指定は受けない

      const origin = (req.headers["origin"] || process.env.APP_URL || "").replace(/\/$/,"");
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: price, quantity: 1 }],
        client_reference_id: user.id,
        customer_email: user.email || undefined,
        subscription_data: { metadata: { user_id: user.id, plan: body.plan, cycle: body.cycle } },
        metadata: { user_id: user.id, plan: body.plan, cycle: body.cycle },
        success_url: origin + "/screens/score_total.html?checkout=success",
        cancel_url:  origin + "/screens/plans.html?checkout=cancel",
        allow_promotion_codes: true
      }, { idempotencyKey: "co_" + user.id + "_" + key + "_" + (body.nonce||"") });  // 二重課金防止

      return json(res, 200, { url: session.url });
    }catch(e){
      console.error("[checkout]", e.message);
      return json(res, 500, {error:"checkout failed"});
    }
  };
}

module.exports = createHandler({ get stripe(){ return require("stripe")(process.env.STRIPE_SECRET_KEY); } });
module.exports.createHandler = createHandler;
