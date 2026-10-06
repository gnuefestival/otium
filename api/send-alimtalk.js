const crypto = require('crypto');

function createAuthHeader(apiKey, apiSecret) {
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString('hex');
  const signature = crypto.createHmac('sha256', apiSecret).update(date + salt).digest('hex');
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').end(JSON.stringify(body));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  if (!apiKey || !apiSecret) {
    return json(res, 503, { ok: false, error: 'SOLAPI environment variables are not configured.' });
  }

  try {
    const body = req.body && typeof req.body === 'object'
      ? req.body
      : JSON.parse(req.body || '{}');

    const to = String(body.to || '').replace(/[^0-9]/g, '');
    const from = String(body.from || '').replace(/[^0-9]/g, '');
    const pfId = String(body.pfId || '').trim();
    const templateId = String(body.templateId || '').trim();
    const text = String(body.text || '').trim();
    const variables = body.variables && typeof body.variables === 'object' ? body.variables : {};

    if (!/^01[0-9]{8,9}$/.test(to)) return json(res, 400, { ok: false, error: 'Invalid recipient phone number.' });
    if (!from || !pfId || !templateId) return json(res, 400, { ok: false, error: 'Missing from, pfId, or templateId.' });
    if (text.length > 1000) return json(res, 400, { ok: false, error: 'AlimTalk text exceeds 1000 Korean characters.' });

    const upstream = await fetch('https://api.solapi.com/messages/v4/send-many', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': createAuthHeader(apiKey, apiSecret)
      },
      body: JSON.stringify({
        messages: [{
          to,
          from,
          text,
          kakaoOptions: {
            pfId,
            templateId,
            variables
          }
        }]
      })
    });

    const raw = await upstream.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = { raw }; }

    return json(res, upstream.status, {
      ok: upstream.ok,
      data
    });
  } catch (error) {
    console.error('SOLAPI proxy error:', error);
    return json(res, 500, { ok: false, error: 'Unexpected server error.' });
  }
};
