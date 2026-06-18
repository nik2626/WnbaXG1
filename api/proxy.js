export default async function handler(req, res) {
  const target = req.query.url;
  if (!target) return res.status(400).send('missing url');
  const allowed = ['stats.wnba.com'];
  try {
    const t = new URL(target);
    if (!allowed.some(d => t.hostname.endsWith(d))) return res.status(403).send('not allowed');
  } catch { return res.status(400).send('bad url'); }
  try {
    const r = await fetch(target, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://stats.wnba.com',
        'Referer': 'https://stats.wnba.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'x-nba-stats-origin': 'stats',
        'x-nba-stats-token': 'true',
      }
    });
    const body = await r.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=900');
    res.status(r.status).send(body);
  } catch(e) { res.status(500).send('proxy error: ' + e.message); }
}
