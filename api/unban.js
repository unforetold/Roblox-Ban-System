export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const SUPABASE_URL    = process.env.SUPABASE_URL;
  const SUPABASE_ANON   = process.env.SUPABASE_ANON_KEY;
  const SUPABASE_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Verify session
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No auth token provided" });

  const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      "apikey": SUPABASE_ANON,
      "Authorization": authHeader
    }
  });

  if (!verifyRes.ok) return res.status(401).json({ error: "Invalid or expired session" });

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Ban ID required" });

  // Delete using service role key
  const deleteRes = await fetch(`${SUPABASE_URL}/rest/v1/bans?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      "apikey": SUPABASE_SECRET,
      "Authorization": `Bearer ${SUPABASE_SECRET}`,
      "Content-Type": "application/json"
    }
  });

  if (!deleteRes.ok) {
    const err = await deleteRes.text();
    return res.status(deleteRes.status).json({ error: err });
  }

  return res.status(200).json({ success: true });
}