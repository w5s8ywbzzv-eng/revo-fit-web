/* =========================================================
   revo fit — 課金API 共通処理（Vercel Serverless / Node）
   セキュリティ方針（ROADMAP 9章）：
   - 金額・プランは必ずサーバ側で決定（クライアントの金額は信用しない）
   - Supabase の JWT を検証して本人を特定
   - Webhook は署名検証
   - 秘密鍵は環境変数のみ（フロントに出さない）
   ========================================================= */
"use strict";

/* プラン→Stripe Price ID（環境変数で注入。金額の真実はStripe側のPrice） */
const PRICE_MAP = () => ({
  "basic:month":    process.env.PRICE_BASIC_MONTH,      // ¥580/月
  "basic:year":     process.env.PRICE_BASIC_YEAR,       // ¥5,800/年（月額×10）
  "standard:month": process.env.PRICE_STANDARD_MONTH,   // ¥1,200/月
  "standard:year":  process.env.PRICE_STANDARD_YEAR,    // ¥12,000/年
  "cross:month":    process.env.PRICE_CROSS_MONTH,      // ¥1,960/月
  "cross:year":     process.env.PRICE_CROSS_YEAR        // ¥19,600/年
});

/* Supabase アクセストークン（JWT）から本人を確認 */
async function verifyUser(req, fetchImpl){
  const f = fetchImpl || fetch;
  const auth = req.headers["authorization"] || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if(!token) return null;
  const r = await f(process.env.SUPABASE_URL + "/auth/v1/user", {
    headers: { "apikey": process.env.SUPABASE_ANON_KEY, "Authorization": "Bearer " + token }
  });
  if(!r.ok) return null;
  const u = await r.json();
  return u && u.id ? u : null;
}

/* service_role で Supabase REST に upsert（RLSをバイパスする唯一の場所） */
async function upsertRow(table, row, onConflict, fetchImpl){
  const f = fetchImpl || fetch;
  const r = await f(process.env.SUPABASE_URL + "/rest/v1/" + table + "?on_conflict=" + onConflict, {
    method: "POST",
    headers: {
      "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": "Bearer " + process.env.SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
      "Prefer": "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify(row)
  });
  if(!r.ok){ throw new Error("supabase upsert failed: " + r.status + " " + (await r.text())); }
}

function json(res, code, obj){
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(obj));
}

function readRawBody(req){
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

module.exports = { PRICE_MAP, verifyUser, upsertRow, json, readRawBody };
