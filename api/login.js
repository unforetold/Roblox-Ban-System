export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const SUPABASE_URL  = process.env.SUPABASE_URL;
  const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await loginRes.json();

  if (!loginRes.ok) return res.status(401).json({ error: data.error_description || "Login failed" });

  // Only return what the browser needs — access token + user email
  return res.status(200).json({
    access_token: data.access_token,
    email: data.user?.email
  });
}