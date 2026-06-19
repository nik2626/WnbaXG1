export const config = { runtime: 'nodejs18.x' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const target = req.query.url;
  if (!target || !target.includes('stats.wnba.com')) {
    return res.status(400).send('bad request');
  }

  const https = await import('https');
  const { request } = await import('undici');

  try {
    const { statusCode, body } = await request(target, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Host': 'stats.wnba.com',
        'Origin': 'https://stats.wnba.com',
        'Referer': 'https://stats.wnba.com/',
        'Sec-Ch-Ua': '"Google Chrome";v="125"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'x-nba-stats-origin': 'stats',
        'x-nba-stats-token': 'true',
      },
      dispatcher: new https.Agent({ keepAlive: true }),
    });

    const chunks = [];
    for await (const chunk of body) chunks.push(chunk);
    const text = Buffer.concat(chunks).toString();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=900');
    return res.status(statusCode).send(text);
  } catch (e) {
    return res.status(500).send('proxy error: ' + e.message);
  }
}
