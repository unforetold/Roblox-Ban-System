export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const SUPABASE_URL    = process.env.SUPABASE_URL;
  const SUPABASE_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const { password } = req.body;
  if (!password || password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: "PUT",
    headers: {
      "apikey": SUPABASE_SECRET,
      "Authorization": authHeader,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password })
  });

  if (!updateRes.ok) {
    const err = await updateRes.json();
    return res.status(updateRes.status).json({ error: err.message || "Update failed" });
  }

  return res.status(200).json({ success: true });
}