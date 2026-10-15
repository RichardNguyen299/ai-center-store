/**
 * AI Center Store - Serverless Order Creation & Payment Session Controller
 * Vercel Serverless Function & Node.js Compatible
 * 
 * URL: POST https://<domain>/api/create-order
 * 
 * Features:
 * 1. Server-Side Price Enforcement: Bỏ qua giá từ client, đọc giá chuẩn từ Database.
 * 2. 15-Minute Idempotent Session Lock: Tái sử dụng đơn pending của cùng User/Product trong 15 phút.
 * 3. Rate-Limiting: Chống spam DDoS / bot tạo đơn hàng loạt.
 * 4. Content Masking: KHÔNG trả link tải/prompt bí mật ở bước tạo đơn.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tmowmprowizdrbamhivx.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_RZ6GSjK8d87kMGNXsrAmlA_n99Jx_J1';

// Cấu hình ngân hàng mặc định
const DEFAULT_PAYMENT_CONFIG = {
  bankName: 'MBBank',
  bankAccount: '0996358358',
  accountName: 'NGUYEN XUAN LINH',
  qrPrefix: 'SEVQR',
  timeoutMinutes: 15
};

// Bộ nhớ đệm Rate Limiting in-memory (tối đa 15 req/phút/IP)
const rateLimitMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxReq = 15;

  let record = rateLimitMap.get(ip);
  if (!record || now - record.startTime > windowMs) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return false;
  }

  record.count++;
  if (record.count > maxReq) {
    return true;
  }
  return false;
}

// Fallback danh mục sản phẩm chuẩn máy chủ khi Supabase chập chờn
const FALLBACK_PRODUCTS = {
  'flow-veo3-basic': { title: 'Veo 3 Pro Video Creator', price: 99000, gia_trial: 9000 },
  'flow-veo3-ecommerce': { title: 'App Làm Video Bán Hàng 9:16', price: 149000, gia_trial: 19000 },
  'flow-veo3-story': { title: 'App Tạo Video Kể Chuyện AI', price: 129000, gia_trial: 15000 },
  'bot-script-master': { title: 'Chatbot Viết Kịch Bản Triệu View', price: 89000, gia_trial: 9000 },
  'bot-prompt-director': { title: 'Chatbot Đạo Diễn Prompt Veo3', price: 99000, gia_trial: 9000 },
  'bot-sales-copy': { title: 'Chatbot Bán Hàng Đa Kênh', price: 79000, gia_trial: 9000 },
  'prompt-luxury-commercial': { title: '100+ Prompt Video Thương Mại', price: 69000, gia_trial: 9000 },
  'prompt-cinematic-trailer': { title: 'Kho Prompt Điện Ảnh Bom Tấn', price: 89000, gia_trial: 9000 },
  'prompt-tiktok-viral': { title: 'Top 50 Kịch Bản & Prompt Viral', price: 59000, gia_trial: 9000 }
};

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Use POST.' });
  }

  // 1. Kiểm tra Rate Limiting chống spam tạo đơn
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Quá nhiều yêu cầu tạo đơn trong thời gian ngắn. Vui lòng chờ 1 phút trước khi thử lại.'
    });
  }

  try {
    const body = req.body || {};
    const productId = String(body.productId || '').trim();
    const tier = String(body.tier || 'vinhvien').trim();
    const customerEmail = String(body.customerEmail || 'khach-hang@aicenter.store').trim().toLowerCase();
    const userId = body.userId || null;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin sản phẩm (productId).' });
    }

    // 2. Lấy cấu hình tài khoản ngân hàng nhận tiền từ settings
    let bankConfig = { ...DEFAULT_PAYMENT_CONFIG };
    try {
      const cfgResp = await fetch(`${SUPABASE_URL}/rest/v1/settings?key=eq.payment&select=value`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (cfgResp.ok) {
        const cfgData = await cfgResp.json();
        if (cfgData && cfgData[0] && cfgData[0].value) {
          bankConfig = { ...bankConfig, ...cfgData[0].value };
        }
      }
    } catch (cfgErr) {
      // Fallback mặc định
    }

    // 3. Lấy giá chuẩn của sản phẩm từ Database Server (Chống Price Tampering)
    let productTitle = 'Công cụ AI';
    let officialAmount = 99000;

    try {
      const pResp = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(productId)}&select=id,title,price,gia_trial`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (pResp.ok) {
        const pList = await pResp.json();
        if (pList && pList[0]) {
          const p = pList[0];
          productTitle = p.title || productTitle;
          const isTrial = (tier === 'trial');
          officialAmount = isTrial ? (Number(p.gia_trial) || 9000) : (Number(p.price) || 99000);
        } else if (FALLBACK_PRODUCTS[productId]) {
          const fb = FALLBACK_PRODUCTS[productId];
          productTitle = fb.title;
          officialAmount = (tier === 'trial') ? fb.gia_trial : fb.price;
        }
      }
    } catch (pErr) {
      if (FALLBACK_PRODUCTS[productId]) {
        const fb = FALLBACK_PRODUCTS[productId];
        productTitle = fb.title;
        officialAmount = (tier === 'trial') ? fb.gia_trial : fb.price;
      }
    }

    // 4. KIỂM TRA TÁI SỬ DỤNG ĐƠN HÀNG TRONG 15 PHÚT (15-Minute Session Lock)
    const timeoutSec = (bankConfig.timeoutMinutes || 15) * 60;
    const fifteenMinsAgo = new Date(Date.now() - timeoutSec * 1000).toISOString();

    try {
      const existingQuery = `${SUPABASE_URL}/rest/v1/orders?customer_email=eq.${encodeURIComponent(customerEmail)}&product_id=eq.${encodeURIComponent(productId)}&status=eq.pending&created_at=gte.${encodeURIComponent(fifteenMinsAgo)}&select=*&order=created_at.desc&limit=1`;
      
      const exResp = await fetch(existingQuery, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (exResp.ok) {
        const exOrders = await exResp.json();
        if (exOrders && exOrders.length > 0) {
          const existingOrder = exOrders[0];
          const ageMs = Date.now() - new Date(existingOrder.created_at).getTime();
          const ageSec = Math.floor(ageMs / 1000);
          const remainingSeconds = Math.max(10, timeoutSec - ageSec);
          const expiresAt = Date.now() + remainingSeconds * 1000;

          const orderCode = existingOrder.code;
          const transferContent = existingOrder.transfer_content || `${bankConfig.qrPrefix} ${orderCode}`;
          const qrUrl = `https://qr.sepay.vn/img?bank=${encodeURIComponent(bankConfig.bankName)}&acc=${encodeURIComponent(bankConfig.bankAccount)}&template=compact&amount=${existingOrder.amount}&des=${encodeURIComponent(transferContent)}`;

          return res.status(200).json({
            success: true,
            isReused: true,
            orderCode: orderCode,
            amount: existingOrder.amount,
            productTitle: existingOrder.title || productTitle,
            tier: existingOrder.tier || tier,
            transferContent: transferContent,
            bankName: bankConfig.bankName,
            bankAccount: bankConfig.bankAccount,
            accountName: bankConfig.accountName,
            qrUrl: qrUrl,
            expiresAt: expiresAt,
            remainingSeconds: remainingSeconds
          });
        }
      }
    } catch (exErr) {
      console.warn('[CreateOrder] Lỗi kiểm tra đơn cũ:', exErr.message);
    }

    // 5. NẾU CHƯA CÓ ĐƠN HỢP LỆ TRONG 15 PHÚT -> SINH MÃ ĐƠN HÀNG MỚI
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const orderCode = 'DH' + randomNum;
    const transferContent = `${bankConfig.qrPrefix} ${orderCode}`;

    const newOrderRow = {
      code: orderCode,
      product_id: productId,
      title: productTitle,
      slug: productId,
      amount: officialAmount,
      status: 'pending',
      status_text: 'Chờ thanh toán',
      customer_email: customerEmail,
      user_id: userId,
      payment_gateway: bankConfig.bankName,
      transfer_content: transferContent
      // Lưu ý: access_url và unlocked_content KHÔNG được cấp ở đây (bảo mật 100%)
    };

    const insertResp = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(newOrderRow)
    });

    if (!insertResp.ok) {
      const errTxt = await insertResp.text();
      console.error('[CreateOrder] Lỗi tạo đơn trên Supabase:', errTxt);
    }

    const qrUrl = `https://qr.sepay.vn/img?bank=${encodeURIComponent(bankConfig.bankName)}&acc=${encodeURIComponent(bankConfig.bankAccount)}&template=compact&amount=${officialAmount}&des=${encodeURIComponent(transferContent)}`;
    const expiresAt = Date.now() + timeoutSec * 1000;

    return res.status(200).json({
      success: true,
      isReused: false,
      orderCode: orderCode,
      amount: officialAmount,
      productTitle: productTitle,
      tier: tier,
      transferContent: transferContent,
      bankName: bankConfig.bankName,
      bankAccount: bankConfig.bankAccount,
      accountName: bankConfig.accountName,
      qrUrl: qrUrl,
      expiresAt: expiresAt,
      remainingSeconds: timeoutSec
    });

  } catch (err) {
    console.error('[CreateOrder] Lỗi không xử lý được:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error: ' + err.message });
  }
};
