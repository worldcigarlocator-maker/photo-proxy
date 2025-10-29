import fetch from "node-fetch";

export default async function handler(req, res) {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const ref = searchParams.get("ref");
  const w = searchParams.get("w") || "800";

  if (!ref) {
    return res.status(400).json({ error: "Missing photo reference (?ref=...)" });
  }

  const GOOGLE_SERVER_KEY = process.env.GOOGLE_SERVER_KEY;
  if (!GOOGLE_SERVER_KEY) {
    return res.status(500).json({ error: "Missing Google Server Key in environment" });
  }

  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${w}&photo_reference=${ref}&key=${GOOGLE_SERVER_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    return res.status(response.status).json({ error: "Failed to fetch image" });
  }

  res.setHeader("Cache-Control", "public, max-age=86400"); // cache 24h
  res.setHeader("Content-Type", response.headers.get("content-type"));
  response.body.pipe(res);
}
