export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const SUPABASE_URL    = process.env.SUPABASE_URL;
  const SUPABASE_ANON   = process.env.SUPABASE_ANON_KEY;
  const SUPABASE_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Grab the user's session token from the request header
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No auth token provided" });

  // Verify the token is a real valid Supabase session
  const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      "apikey": SUPABASE_ANON,
      "Authorization": authHeader
    }
  });

  if (!verifyRes.ok) return res.status(401).json({ error: "Invalid or expired session" });

  const { username, user_id, reason, category } = req.body;
  if (!username && !user_id) return res.status(400).json({ error: "username or user_id required" });

  // Use the service role key to actually write to the DB (never exposed to browser)
  const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/bans`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_SECRET,
      "Authorization": `Bearer ${SUPABASE_SECRET}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal"
    },
    body: JSON.stringify({
      username:   username  || "",
      user_id:    user_id   || "",
      reason:     reason    || "",
      category:   category  || "other",
      banned_at:  new Date().toISOString()
    })
  });

  if (!insertRes.ok) {
    const err = await insertRes.text();
    return res.status(insertRes.status).json({ error: err });
  }

  return res.status(200).json({ success: true });
}