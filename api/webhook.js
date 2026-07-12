/* POST /api/webhook — Stripe Webhook（署名検証必須）
   checkout.session.completed / customer.subscription.updated|deleted
   → Supabase subscriptions テーブルへ upsert（service_role） */
"use strict";
const { upsertRow, json, readRawBody } = require("./_lib.js");

function createHandler(deps){
  const upsert = deps.upsertRow || upsertRow;
  return async function handler(req, res){
    if(req.method !== "POST"){ return json(res, 405, {error:"method not allowed"}); }
    const stripe = deps.stripe;
    let event;
    try{
      const raw = deps.rawBody ? deps.rawBody(req) : await readRawBody(req);
      const sig = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);  // 署名検証
    }catch(e){
      console.error("[webhook] signature verification failed:", e.message);
      return json(res, 400, {error:"invalid signature"});
    }
    try{
      if(event.type === "checkout.session.completed"){
        const s = event.data.object;
        if(s.metadata && s.metadata.kind === "tip"){
          await upsert("tips", {
            id: s.id,                                     // セッションIDで冪等
            post_id: s.metadata.post_id,
            from_user: s.metadata.from_user,
            to_user: s.metadata.to_user,
            amount: parseInt(s.metadata.amount, 10) || 0,
            currency: "jpy",
            created_at: new Date().toISOString()
          }, "id", deps.fetch);
          return json(res, 200, {received:true});
        }
        const uid = s.client_reference_id || (s.metadata && s.metadata.user_id);
        if(uid){
          await upsert("subscriptions", {
            user_id: uid,
            plan: (s.metadata && s.metadata.plan) || null,
            cycle: (s.metadata && s.metadata.cycle) || null,
            status: "active",
            stripe_customer_id: s.customer || null,
            stripe_subscription_id: s.subscription || null,
            updated_at: new Date().toISOString()
          }, "user_id", deps.fetch);
        }
      } else if(event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted"){
        const sub = event.data.object;
        const uid = sub.metadata && sub.metadata.user_id;
        if(uid){
          await upsert("subscriptions", {
            user_id: uid,
            plan: (sub.metadata && sub.metadata.plan) || null,
            cycle: (sub.metadata && sub.metadata.cycle) || null,
            status: event.type.endsWith("deleted") ? "canceled" : sub.status,
            cancel_at_period_end: !!sub.cancel_at_period_end,
            current_period_end: sub.current_period_end ? new Date(sub.current_period_end*1000).toISOString() : null,
            stripe_customer_id: sub.customer || null,
            stripe_subscription_id: sub.id,
            updated_at: new Date().toISOString()
          }, "user_id", deps.fetch);
        }
      }
      return json(res, 200, {received:true});
    }catch(e){
      console.error("[webhook]", e.message);
      return json(res, 500, {error:"webhook processing failed"});   // Stripeが自動リトライ
    }
  };
}

module.exports = createHandler({ get stripe(){ return require("stripe")(process.env.STRIPE_SECRET_KEY); } });
module.exports.createHandler = createHandler;
module.exports.config = { api: { bodyParser: false } };   // 署名検証には raw body が必要
