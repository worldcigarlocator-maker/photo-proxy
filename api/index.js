export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get('ref');
    const w = searchParams.get('w') || '800';

    if (!ref) {
      return new Response('Missing ref', { status: 400 });
    }

    const key = process.env.GOOGLE_SERVER_KEY;
    if (!key) {
      return new Response('Missing GOOGLE_SERVER_KEY', { status: 500 });
    }

    const googleUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${encodeURIComponent(
      w
    )}&photo_reference=${encodeURIComponent(ref)}&key=${encodeURIComponent(key)}`;

    const resp = await fetch(googleUrl, { redirect: 'follow' });
    if (!resp.ok) {
      return new Response(`Google API error ${resp.status}`, { status: 502 });
    }

    // Streama tillbaka datan direkt med CORS + cache (24h)
    return new Response(resp.body, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400',
        'Content-Type': resp.headers.get('content-type') || 'image/jpeg',
      },
    });
  } catch (err) {
    console.error('Proxy error', err);
    return new Response('Proxy error', { status: 500 });
  }
}
