/**
 * AI Center Store - Check Order Status Serverless Endpoint
 * Vercel Serverless Function & Node.js Compatible
 * 
 * URL kiểm tra:
 * GET https://<domain>/api/check-order?code=DH8899
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tmowmprowizdrbamhivx.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_RZ6GSjK8d87kMGNXsrAmlA_n99Jx_J1';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { code } = req.query || {};
  if (!code) {
    return res.status(400).json({ error: 'Missing order code parameter (?code=...)' });
  }

  try {
    const cleanCode = String(code).trim().toUpperCase();
    const prefixMatch = cleanCode.match(/^(DH[0-9]+)/i);
    const codes = [cleanCode];
    if (prefixMatch && prefixMatch[1] !== cleanCode) {
      codes.push(prefixMatch[1]);
    }

    const queryUrl = `${SUPABASE_URL}/rest/v1/orders?code=in.(${codes.map(encodeURIComponent).join(',')})&select=*`;
    const resp = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!resp.ok) {
      return res.status(500).json({ error: 'Database query failed' });
    }

    const orders = await resp.json();
    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: 'Order not found', code: cleanCode });
    }

    const order = orders[0];
    return res.status(200).json({
      code: order.code,
      status: order.status,
      statusText: order.status_text,
      amount: order.amount,
      title: order.title,
      accessUrl: order.access_url,
      unlockedContent: order.unlocked_content || '',
      date: order.created_at
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
