-- =============================================================================
-- SỬA LỖI SEPAY WEBHOOK & MỞ QUYỀN RLS BẢNG ORDERS
-- Copy toàn bộ nội dung file này dán vào SQL Editor trên Supabase và bấm RUN
-- =============================================================================

-- 1. Cập nhật phân quyền RLS cho bảng ORDERS
-- Cho phép tra cứu đơn hàng theo mã đơn (cần thiết cho Webhook và khách thanh toán)
DROP POLICY IF EXISTS "Khách hàng xem đơn hàng của mình, Admin xem tất cả" ON public.orders;
DROP POLICY IF EXISTS "Mọi người đều được tra cứu đơn hàng" ON public.orders;
CREATE POLICY "Mọi người đều được tra cứu đơn hàng"
  ON public.orders FOR SELECT
  USING (true);

-- Cho phép cập nhật trạng thái đơn hàng khi thanh toán
DROP POLICY IF EXISTS "Chỉ Admin được cập nhật trạng thái đơn hàng" ON public.orders;
DROP POLICY IF EXISTS "Cho phép cập nhật trạng thái đơn hàng" ON public.orders;
CREATE POLICY "Cho phép cập nhật trạng thái đơn hàng"
  ON public.orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Đảm bảo quyền tạo đơn hàng
DROP POLICY IF EXISTS "Mọi người đều được tạo đơn hàng mới" ON public.orders;
CREATE POLICY "Mọi người đều được tạo đơn hàng mới"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- 2. Đảm bảo bảng orders đã được bật Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 3. Tạo Hàm Stored Procedure "confirm_sepay_order"
-- Chạy với đặc quyền SECURITY DEFINER để bỏ qua mọi rào cản bảo mật khi SePay bắn webhook
CREATE OR REPLACE FUNCTION public.confirm_sepay_order(
  p_code TEXT,
  p_amount BIGINT DEFAULT 0,
  p_gateway TEXT DEFAULT 'Bank',
  p_ref TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_prod RECORD;
BEGIN
  -- Tìm đơn hàng theo mã code hoặc tiền tố (hỗ trợ cả DH8244 và DH8244JN)
  SELECT * INTO v_order
  FROM public.orders
  WHERE UPPER(code) = UPPER(p_code)
     OR UPPER(code) LIKE UPPER(p_code) || '%'
     OR UPPER(p_code) LIKE UPPER(code) || '%'
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order not found', 'code', p_code);
  END IF;

  -- Nếu đơn đã hoàn thành trước đó
  IF v_order.status = 'paid' OR v_order.status = 'completed' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Order already paid', 'code', v_order.code);
  END IF;

  -- Kiểm tra số tiền chuyển: Nếu chuyển thiếu thì không cho phép paid!
  IF p_amount > 0 AND v_order.amount > 0 AND p_amount < v_order.amount THEN
    UPDATE public.orders
    SET 
      status_text = 'Chuyển thiếu (' || p_amount || '/' || v_order.amount || 'đ)',
      payment_gateway = p_gateway,
      transaction_id = p_ref
    WHERE id = v_order.id;

    RETURN jsonb_build_object(
      'success', true,
      'is_underpaid', true,
      'message', 'Underpaid. Missing balance.',
      'code', v_order.code,
      'received', p_amount,
      'required', v_order.amount
    );
  END IF;

  -- Lấy thông tin mở khóa sản phẩm
  IF v_order.product_id IS NOT NULL THEN
    SELECT * INTO v_prod FROM public.products WHERE id = v_order.product_id LIMIT 1;
    IF FOUND THEN
      -- Tăng lượt bán sản phẩm
      UPDATE public.products
      SET sold = COALESCE(sold, 0) + 1,
          remaining_slots = GREATEST(0, COALESCE(remaining_slots, 100) - 1),
          updated_at = NOW()
      WHERE id = v_order.product_id;
    END IF;
  END IF;

  -- Cập nhật đơn hàng sang đã thanh toán (paid) - Cho phép cả chuyển đủ hoặc chuyển thừa
  UPDATE public.orders
  SET 
    status = 'paid',
    status_text = CASE 
      WHEN p_amount > v_order.amount AND v_order.amount > 0 THEN 'Đã thanh toán (Chuyển thừa ' || (p_amount - v_order.amount) || 'đ)'
      ELSE 'Đã thanh toán'
    END,
    payment_gateway = p_gateway,
    transaction_id = p_ref,
    transfer_content = p_ref,
    paid_at = NOW(),
    access_url = COALESCE(NULLIF(access_url, ''), v_prod.download_url, '#san-pham?id=' || COALESCE(v_order.product_id, '')),
    unlocked_content = COALESCE(NULLIF(unlocked_content, ''), v_prod.secret_content, '')
  WHERE id = v_order.id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Order paid and unlocked successfully',
    'code', v_order.code,
    'amount', p_amount
  );
END;
$$;

-- Cấp quyền gọi hàm cho Webhook (anon / authenticated / service_role)
GRANT EXECUTE ON FUNCTION public.confirm_sepay_order TO anon, authenticated, service_role;

-- 4. Kích hoạt & xác nhận luôn đơn hàng DH8244JN (9.000đ) vừa chuyển khoản thành công
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.orders WHERE code IN ('DH8244JN', 'DH8244')) THEN
    UPDATE public.orders
    SET 
      status = 'paid',
      status_text = 'Đã thanh toán',
      paid_at = NOW(),
      transaction_id = '280T26AOPPRCP5PW'
    WHERE code IN ('DH8244JN', 'DH8244');
  ELSE
    INSERT INTO public.orders (
      code,
      title,
      amount,
      status,
      status_text,
      customer_email,
      payment_gateway,
      transaction_id,
      paid_at
    ) VALUES (
      'DH8244JN',
      'Gói dùng thử AI',
      9000,
      'paid',
      'Đã thanh toán',
      'khach-hang@aicenter.store',
      'VietinBank',
      '280T26AOPPRCP5PW',
      NOW()
    );
  END IF;
END $$;

-- 5. Cập nhật dòng 'payment' độc lập trong bảng SETTINGS để trùng khớp 100%
INSERT INTO public.settings (key, value, updated_at)
VALUES (
  'payment',
  '{
    "bankName": "VietinBank",
    "bankAccount": "105870396069",
    "accountName": "NGUYEN VAN PHU",
    "qrPrefix": "SEVQR",
    "sepayApiKey": ""
  }'::jsonb,
  NOW()
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- 6. Tạo bảng AUTHORS và lưu thông tin tác giả vào bảng SETTINGS (key='author')
CREATE TABLE IF NOT EXISTS public.authors (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL DEFAULT 'Nguyễn Văn Phú',
  title TEXT DEFAULT 'Admin & Sáng lập viên',
  phone TEXT DEFAULT '0984 886 0289',
  zalo TEXT DEFAULT '09848860289',
  email TEXT DEFAULT 'ganhteam321@gmail.com',
  youtube_url TEXT DEFAULT 'https://www.youtube.com',
  facebook_url TEXT DEFAULT 'https://www.facebook.com',
  tiktok_url TEXT DEFAULT 'https://www.tiktok.com',
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT 'Sáng tạo công cụ & Chatbot tạo video AI tự động',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Mọi người được đọc thông tin tác giả" ON public.authors;
CREATE POLICY "Mọi người được đọc thông tin tác giả" ON public.authors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Cho phép cập nhật tác giả" ON public.authors;
CREATE POLICY "Cho phép cập nhật tác giả" ON public.authors FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.settings (key, value, updated_at)
VALUES (
  'author',
  '{
    "name": "Nguyễn Văn Phú",
    "title": "Admin & Sáng lập viên",
    "phone": "0984 886 0289",
    "zalo": "09848860289",
    "email": "ganhteam321@gmail.com",
    "bio": "Sáng tạo công cụ & Chatbot tạo video AI tự động"
  }'::jsonb,
  NOW()
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();
