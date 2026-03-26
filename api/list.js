export default async function handler(req, res) {
  const SUPABASE_URL  = process.env.SUPABASE_URL;
  const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON) {
    return res.status(500).json({ error: "Missing Supabase environment variables" });
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bans?select=user_id,username,reason,category,banned_at&order=banned_at.desc`,
      {
        headers: {
          "apikey": SUPABASE_ANON,
          "Authorization": `Bearer ${SUPABASE_ANON}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();

    // Allow Roblox and browsers to access this endpoint
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    // Cache for 60 seconds so repeated hits don't hammer Supabase
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}