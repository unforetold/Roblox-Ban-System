export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const SUPABASE_URL    = process.env.SUPABASE_URL;
  const SUPABASE_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const { user_id, username, reason, category, submitted_by } = req.body;
  if (!user_id && !username) return res.status(400).json({ error: "user_id or username required" });
  if (!reason)               return res.status(400).json({ error: "reason required" });

  const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/suggestions`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_SECRET,
      "Authorization": `Bearer ${SUPABASE_SECRET}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal"
    },
    body: JSON.stringify({
      user_id:      user_id      || "",
      username:     username     || "",
      reason:       reason       || "",
      category:     category     || "other",
      submitted_by: submitted_by || "anonymous",
      status:       "pending",
      created_at:   new Date().toISOString()
    })
  });

  if (!insertRes.ok) {
    const err = await insertRes.text();
    return res.status(insertRes.status).json({ error: err });
  }

  return res.status(200).json({ success: true });
}