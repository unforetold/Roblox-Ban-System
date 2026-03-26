export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const SUPABASE_URL    = process.env.SUPABASE_URL;
  const SUPABASE_ANON   = process.env.SUPABASE_ANON_KEY;
  const SUPABASE_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Verify session for all methods
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No auth token" });

  const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { "apikey": SUPABASE_ANON, "Authorization": authHeader }
  });
  if (!verifyRes.ok) return res.status(401).json({ error: "Invalid session" });

  // GET — list all pending suggestions
  if (req.method === "GET") {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/suggestions?order=created_at.desc`,
      {
        headers: {
          "apikey": SUPABASE_SECRET,
          "Authorization": `Bearer ${SUPABASE_SECRET}`
        }
      }
    );
    const data = await r.json();
    return res.status(200).json(data);
  }

  // DELETE — dismiss a suggestion
  if (req.method === "DELETE") {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "id required" });
    const r = await fetch(`${SUPABASE_URL}/rest/v1/suggestions?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        "apikey": SUPABASE_SECRET,
        "Authorization": `Bearer ${SUPABASE_SECRET}`
      }
    });
    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}