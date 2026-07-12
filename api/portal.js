/* POST /api/portal — Stripe カスタマーポータル（解約・支払い方法・領収書）
   誠実な課金表示（解約導線を隠さない）＝READMEの設計思想 */
"use strict";
const { verifyUser, json } = require("./_lib.js");

function createHandler(deps){
  const verify = deps.verifyUser || verifyUser;
  return async function handler(req, res){
    if(req.method !== "POST"){ return json(res, 405, {error:"method not allowed"}); }
    const stripe = deps.stripe;
    try{
      const user = await verify(req, deps.fetch);
      if(!user){ return json(res, 401, {error:"unauthorized"}); }
      // subscriptions から customer id を引く
      const f = deps.fetch || fetch;
      const r = await f(process.env.SUPABASE_URL + "/rest/v1/subscriptions?user_id=eq." + user.id + "&select=stripe_customer_id", {
        headers: { "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY, "Authorization": "Bearer " + process.env.SUPABASE_SERVICE_ROLE_KEY }
      });
      const rows = await r.json();
      const cust = rows && rows[0] && rows[0].stripe_customer_id;
      if(!cust){ return json(res, 404, {error:"no subscription"}); }
      const origin = (req.headers["origin"] || process.env.APP_URL || "").replace(/\/$/,"");
      const session = await stripe.billingPortal.sessions.create({
        customer: cust,
        return_url: origin + "/screens/billing.html"
      });
      return json(res, 200, { url: session.url });
    }catch(e){
      console.error("[portal]", e.message);
      return json(res, 500, {error:"portal failed"});
    }
  };
}

module.exports = createHandler({ get stripe(){ return require("stripe")(process.env.STRIPE_SECRET_KEY); } });
module.exports.createHandler = createHandler;
