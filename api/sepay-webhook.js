/**
 * AI Center Store - SePay Webhook Serverless Endpoint
 * Vercel Serverless Function & Node.js Compatible
 * 
 * URL nhận webhook trên Vercel:
 * POST https://<domain>/api/sepay-webhook
 */

const crypto = require('crypto');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tmowmprowizdrbamhivx.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_RZ6GSjK8d87kMGNXsrAmlA_n99Jx_J1';
const SEPAY_API_KEY = process.env.SEPAY_API_KEY || ''; // Đặt trong Vercel Environment Variables nếu cấu hình API Key
const SEPAY_WEBHOOK_SECRET = process.env.SEPAY_WEBHOOK_SECRET || process.env.SEPAY_SECRET_KEY || ''; // Đặt nếu cấu hình HMAC-SHA256

module.exports = async (req, res) => {
  // 1. Cấu hình CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-SePay-Signature, X-SePay-Timestamp');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Use POST for SePay Webhook.' });
  }

  try {
    // 2. Xác thực Webhook (Hỗ trợ cả HMAC-SHA256, API Key hoặc Không xác thực theo chuẩn SePay)
    if (SEPAY_WEBHOOK_SECRET) {
      const signatureHeader = req.headers['x-sepay-signature'] || '';
      const timestampHeader = req.headers['x-sepay-timestamp'] || '';
      
      if (!signatureHeader || !timestampHeader) {
        console.warn('[SePay Webhook] Thiếu header chữ ký X-SePay-Signature hoặc X-SePay-Timestamp.');
        return res.status(401).json({ success: false, message: 'Missing signature headers' });
      }

      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const expectedData = `${timestampHeader}.${rawBody}`;
      const expectedSig = 'sha256=' + crypto.createHmac('sha256', SEPAY_WEBHOOK_SECRET).update(expectedData).digest('hex');

      const isValid = (signatureHeader.length === expectedSig.length) && 
        crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expectedSig));

      if (!isValid) {
        console.warn('[SePay Webhook] Chữ ký HMAC-SHA256 không hợp lệ.');
        return res.status(401).json({ success: false, message: 'Invalid HMAC signature' });
      }
    } else if (SEPAY_API_KEY) {
      const authHeader = req.headers['authorization'] || '';
      const token = authHeader.replace(/^Apikey\s+/i, '').replace(/^Bearer\s+/i, '').trim();
      if (token !== SEPAY_API_KEY) {
        console.warn('[SePay Webhook] Xác thực token thất bại.');
        return res.status(401).json({ success: false, message: 'Unauthorized API Token' });
      }
    }

    // 3. Đọc dữ liệu biến động từ SePay (Theo chuẩn cấu trúc Payload SePay)
    const body = req.body || {};
    const transferType = String(body.transferType || 'in').toLowerCase();
    const content = String(body.content || body.description || '');
    const transferAmount = Number(body.transferAmount || body.amount || 0);
    const referenceCode = String(body.referenceCode || body.id || '');
    const gateway = String(body.gateway || 'Bank');

    console.info(`[SePay Webhook] Nhận biến động: ${transferAmount}đ - Nội dung: "${content}" - Ref: ${referenceCode}`);

    // Bỏ qua giao dịch tiền ra (out) và trả về HTTP 200 + success: true để SePay dừng gửi lại
    if (transferType === 'out') {
      console.info('[SePay Webhook] Bỏ qua giao dịch tiền ra (transferType: out):', referenceCode);
      return res.status(200).json({ success: true, message: 'Outgoing transaction ignored.' });
    }

    // 4. Bóc tách danh sách mã đơn hàng tiềm năng (hỗ trợ DH8244, DH8244JN, SEVQR...)
    const candidateCodes = new Set();
    if (body.code) {
      candidateCodes.add(String(body.code).trim().toUpperCase());
    }

    const match = content.match(/(?:SEVQR|AIC)\s*([A-Za-z0-9_-]+)/i);
    if (match && match[1]) {
      const c = match[1].toUpperCase();
      candidateCodes.add(c);
      const mDh = c.match(/^(DH[0-9]+)/i);
      if (mDh) candidateCodes.add(mDh[1].toUpperCase());
    }

    const directMatches = content.match(/DH[0-9]{4,8}[A-Za-z0-9]*/gi) || [];
    for (const dm of directMatches) {
      const c = dm.toUpperCase();
      candidateCodes.add(c);
      const mDh = c.match(/^(DH[0-9]+)/i);
      if (mDh) candidateCodes.add(mDh[1].toUpperCase());
    }

    const candidateList = Array.from(candidateCodes);
    if (candidateList.length === 0) {
      console.info('[SePay Webhook] Không tìm thấy mã đơn hàng trong nội dung CK (hoặc test ping từ SePay):', content);
      // BẮT BUỘC trả HTTP 200 + {"success": true} để SePay ghi nhận thành công và hiển thị nút "Gửi thử" XANH
      return res.status(200).json({
        success: true,
        message: 'Webhook received. No matching order code found in transfer content.'
      });
    }

    console.info(`[SePay Webhook] Các mã đơn tiềm năng:`, candidateList);

    // 5. Ưu tiên gọi PostgreSQL RPC "confirm_sepay_order" (SECURITY DEFINER chạy bỏ qua RLS an toàn)
    for (const codeToCheck of candidateList) {
      try {
        const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/confirm_sepay_order`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            p_code: codeToCheck,
            p_amount: transferAmount,
            p_gateway: gateway,
            p_ref: referenceCode
          })
        });

        if (rpcRes.ok) {
          const rpcData = await rpcRes.json();
          if (rpcData && rpcData.success) {
            console.info(`[SePay Webhook] RPC confirm_sepay_order xử lý thành công:`, rpcData);
            return res.status(200).json(rpcData);
          }
          if (rpcData && rpcData.is_underpaid) {
            console.warn(`[SePay Webhook] RPC phát hiện chuyển thiếu tiền:`, rpcData);
            return res.status(200).json(rpcData);
          }
        }
      } catch (rpcErr) {
        console.warn('[SePay Webhook] Thử RPC không thành công, dùng REST fallback:', rpcErr.message);
      }
    }

    // 6. Fallback sang truy vấn REST trực tiếp bảng orders
    const queryUrl = `${SUPABASE_URL}/rest/v1/orders?code=in.(${candidateList.map(encodeURIComponent).join(',')})&select=*`;
    const getRes = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!getRes.ok) {
      const errTxt = await getRes.text();
      console.error('[SePay Webhook] Lỗi truy vấn Supabase:', errTxt);
      return res.status(500).json({ success: false, error: 'Database query failed' });
    }

    const orders = await getRes.json();
    if (!orders || orders.length === 0) {
      console.warn(`[SePay Webhook] Không tìm thấy đơn hàng mã ${candidateList.join(', ')} trong Database.`);
      return res.status(200).json({ success: true, message: `Orders not found: ${candidateList.join(', ')}. Acknowledged.` });
    }

    const order = orders[0];
    const orderCode = order.code;

    // 6. Chống lặp (Idempotency): Nếu đơn hàng đã thanh toán trước đó
    if (order.status === 'paid' || order.status === 'completed') {
      console.info(`[SePay Webhook] Đơn hàng ${orderCode} đã hoàn tất trước đó.`);
      return res.status(200).json({ success: true, message: 'Order already completed', orderCode });
    }

    // 7. Kiểm tra số tiền chuyển
    const requiredAmount = Number(order.amount || 0);
    if (transferAmount > 0 && requiredAmount > 0 && transferAmount < requiredAmount) {
      console.warn(`[SePay Webhook] Chuyển thiếu tiền cho đơn ${orderCode}: nhận ${transferAmount}đ, cần ${requiredAmount}đ.`);
      // Cập nhật trạng thái chuyển thiếu
      await fetch(`${SUPABASE_URL}/rest/v1/orders?code=eq.${encodeURIComponent(orderCode)}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          status_text: `Chuyển thiếu (${transferAmount}/${requiredAmount}đ)`
        })
      });

      return res.status(200).json({
        success: true,
        is_underpaid: true,
        message: 'Partial payment received. Waiting for remaining balance.',
        received: transferAmount,
        required: requiredAmount
      });
    }

    // 8. Đọc thông tin sản phẩm để lấy download_url và secret_content nếu có
    let accessUrl = order.access_url;
    let unlockedContent = order.unlocked_content || '';

    if (order.product_id) {
      try {
        const prodRes = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(order.product_id)}&select=*`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        });
        if (prodRes.ok) {
          const prods = await prodRes.json();
          if (prods && prods.length > 0) {
            const p = prods[0];
            if (!accessUrl || accessUrl.startsWith('#')) {
              accessUrl = p.download_url || p.downloadUrl || `#san-pham?id=${p.id}`;
            }
            if (!unlockedContent) {
              unlockedContent = p.secret_content || p.secretContent || '';
            }

            // Tăng số lượt bán của sản phẩm
            const newSold = (Number(p.sold) || 0) + 1;
            const newRemaining = Math.max(0, (Number(p.remaining_slots) || 100) - 1);
            await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(order.product_id)}`, {
              method: 'PATCH',
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                sold: newSold,
                remaining_slots: newRemaining,
                updated_at: new Date().toISOString()
              })
            }).catch(() => {});
          }
        }
      } catch (prodErr) {
        console.warn('[SePay Webhook] Không thể cập nhật lượt bán sản phẩm:', prodErr);
      }
    }

    // 9. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG SANG 'paid' (Áp dụng cả khi chuyển đúng hoặc chuyển thừa tiền)
    const isOverpaid = (transferAmount > requiredAmount && requiredAmount > 0);
    const overpaidDiff = isOverpaid ? (transferAmount - requiredAmount) : 0;
    const statusText = isOverpaid 
      ? `Đã thanh toán (Chuyển thừa ${new Intl.NumberFormat('vi-VN').format(overpaidDiff)}đ)` 
      : 'Đã thanh toán';

    const updatePayload = {
      status: 'paid',
      status_text: statusText,
      access_url: accessUrl,
      unlocked_content: unlockedContent,
      payment_gateway: gateway,
      transaction_id: referenceCode,
      transfer_content: content,
      paid_at: new Date().toISOString()
    };

    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?code=eq.${encodeURIComponent(orderCode)}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(updatePayload)
    });

    if (!updateRes.ok) {
      const upErr = await updateRes.text();
      console.error('[SePay Webhook] Lỗi cập nhật đơn hàng:', upErr);
      return res.status(500).json({ success: false, error: 'Failed to update order status' });
    }

    if (isOverpaid) {
      console.info(`[SePay Webhook] 💰 Đơn hàng ${orderCode} được chuyển thừa tiền (${transferAmount}đ > ${requiredAmount}đ) -> Đã mở khóa đơn hàng thành công.`);
    } else {
      console.info(`[SePay Webhook] 🎉 ĐÃ MỞ KHÓA THÀNH CÔNG ĐƠN HÀNG ${orderCode}!`);
    }

    // 10. Cập nhật chi tiêu của khách hàng (nếu có customer_email)
    if (order.customer_email) {
      try {
        const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(order.customer_email)}&select=*`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        });
        if (profRes.ok) {
          const profs = await profRes.json();
          if (profs && profs.length > 0) {
            const curSpent = Number(profs[0].total_spent || 0);
            const curOrders = Number(profs[0].total_orders || 0);
            await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(order.customer_email)}`, {
              method: 'PATCH',
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                total_spent: curSpent + (transferAmount || requiredAmount),
                total_orders: curOrders + 1,
                updated_at: new Date().toISOString()
              })
            }).catch(() => {});
          }
        }
      } catch (profErr) {
        console.warn('[SePay Webhook] Không thể cập nhật stats khách hàng:', profErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Order paid and unlocked successfully',
      orderCode: orderCode,
      gateway: gateway,
      amount: transferAmount || requiredAmount
    });

  } catch (error) {
    console.error('[SePay Webhook] Exception:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
};
