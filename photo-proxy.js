export default async function handler(req, res) {
  const { ref, w = "800" } = req.query;
  const GOOGLE_SERVER_KEY = process.env.GOOGLE_SERVER_KEY;

  if (!ref || !GOOGLE_SERVER_KEY) {
    res.status(400).send("Missing ref or server key");
    return;
  }

  try {
    const googleUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${w}&photo_reference=${encodeURIComponent(ref)}&key=${GOOGLE_SERVER_KEY}`;
    const response = await fetch(googleUrl);

    if (!response.ok) {
      console.error("Google API error:", response.status, await response.text());
      res.status(502).send(`Google API error ${response.status}`);
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=86400"); // cache 24h
    res.setHeader("Content-Type", response.headers.get("content-type") || "image/jpeg");

    res.status(200).send(buffer);
  } catch (err) {
    console.error("Proxy fetch error:", err);
    res.status(500).send("Proxy error");
  }
}