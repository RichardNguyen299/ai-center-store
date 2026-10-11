-- =============================================================================
-- AI CENTER STORE - SUPABASE DATABASE SCHEMA
-- Hệ thống cơ sở dữ liệu PostgreSQL cho AI Center Store (Vercel + Supabase)
-- =============================================================================

-- 1. BẬT TIỆN ÍCH MỞ RỘNG
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 2. BẢNG PROFILES (HỒ SƠ NGƯỜI DÙNG)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  total_orders INT DEFAULT 0,
  total_spent BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. BẢNG PRODUCTS (DANH MỤC SẢN PHẨM & APP AI)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  version TEXT DEFAULT 'v1.0',
  subtitle TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('flow', 'chatbot', 'prompt')),
  category_name TEXT NOT NULL,
  format TEXT DEFAULT '9:16',
  price BIGINT NOT NULL DEFAULT 0,
  original_price BIGINT DEFAULT 0,
  gia_trial BIGINT DEFAULT 0,
  sold INT DEFAULT 0,
  remaining_slots INT DEFAULT 100,
  demo_video_id TEXT DEFAULT '',
  poster_theme JSONB DEFAULT '{}'::jsonb,
  description TEXT DEFAULT '',
  is_premium BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. BẢNG ORDERS (QUẢN LÝ ĐƠN HÀNG)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,          -- Mã đơn: e.g. AISRQJ7PXG
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT,
  amount BIGINT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  status_text TEXT DEFAULT 'Chờ thanh toán',
  customer_email TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  access_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. BẢNG SETTINGS (CẤU HÌNH CỬA HÀNG)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5B. BẢNG AUTHORS (THÔNG TIN TÁC GIẢ & MẠNG XÃ HỘI)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.authors (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL DEFAULT 'Xuân Linh',
  title TEXT DEFAULT 'Admin & Sáng lập viên',
  phone TEXT DEFAULT '0996 358 358',
  zalo TEXT DEFAULT '0996358358',
  email TEXT DEFAULT 'ganhteam321@gmail.com',
  youtube_url TEXT DEFAULT 'https://www.youtube.com',
  facebook_url TEXT DEFAULT 'https://www.facebook.com',
  tiktok_url TEXT DEFAULT 'https://www.tiktok.com',
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT 'Sáng tạo công cụ & Chatbot tạo video AI tự động',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. TỰ ĐỘNG TẠO PROFILE KHI ĐĂNG NHẬP GOOGLE LẦN ĐẦU (TRIGGER)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT := 'customer';
BEGIN
  -- Tự động cấp quyền admin cho gmail quản trị chính
  IF NEW.email = 'ganhteam321@gmail.com' THEN
    v_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    v_role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = CASE WHEN profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
    avatar_url = CASE WHEN profiles.avatar_url = '' THEN EXCLUDED.avatar_url ELSE profiles.avatar_url END,
    role = CASE WHEN EXCLUDED.email = 'ganhteam321@gmail.com' THEN 'admin' ELSE profiles.role END,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 7. CẬP NHẬT TỔNG ĐƠN HÀNG VÀ DOANH THU CỦA USER KHI CÓ ĐƠN HÀNG MỚI
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_user_order_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_email IS NOT NULL THEN
    UPDATE public.profiles
    SET
      total_orders = (SELECT COUNT(*) FROM public.orders WHERE customer_email = NEW.customer_email),
      total_spent = (SELECT COALESCE(SUM(amount), 0) FROM public.orders WHERE customer_email = NEW.customer_email AND status = 'paid'),
      updated_at = NOW()
    WHERE email = NEW.customer_email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_changed ON public.orders;
CREATE TRIGGER on_order_changed
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_user_order_stats();

-- =============================================================================
-- 8. PHÂN QUYỀN BẢO MẬT (ROW LEVEL SECURITY - RLS)
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Hàm kiểm tra người dùng hiện tại có phải là Admin không
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'email' = 'ganhteam321@gmail.com' OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Chính sách cho PROFILES
CREATE POLICY "Cho phép xem profile của bản thân hoặc là admin"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin() OR auth.jwt() ->> 'email' = email);

CREATE POLICY "Cho phép tự cập nhật profile cá nhân (phone, name)"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admin có toàn quyền profile"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- Chính sách cho PRODUCTS
CREATE POLICY "Mọi người đều được xem sản phẩm đang bán"
  ON public.products FOR SELECT
  USING (active = true OR public.is_admin());

CREATE POLICY "Admin có quyền thêm/sửa/xoá sản phẩm"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Chính sách cho ORDERS
CREATE POLICY "Khách hàng xem đơn hàng của mình, Admin xem tất cả"
  ON public.orders FOR SELECT
  USING (
    customer_email = auth.jwt() ->> 'email' OR
    user_id = auth.uid() OR
    public.is_admin()
  );

CREATE POLICY "Mọi người đều được tạo đơn hàng mới"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Chỉ Admin được cập nhật trạng thái đơn hàng"
  ON public.orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Chính sách cho SETTINGS
CREATE POLICY "Mọi người được đọc cấu hình cửa hàng"
  ON public.settings FOR SELECT
  USING (true);

CREATE POLICY "Chỉ Admin được sửa cấu hình cửa hàng"
  ON public.settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Chính sách cho AUTHORS (Tác Giả)
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mọi người được đọc thông tin tác giả"
  ON public.authors FOR SELECT
  USING (true);

CREATE POLICY "Chỉ Admin được sửa thông tin tác giả"
  ON public.authors FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================================
-- 9. DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- =============================================================================

-- Cài đặt mặc định
INSERT INTO public.settings (key, value)
VALUES (
  'general',
  '{
    "storeName": "AI Center Store — Kho App & Chatbot Tạo Video AI",
    "hotline": "0996 358 358",
    "supportZalo": "0996358358",
    "storageMode": "supabase_cloud"
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Thông tin tác giả mặc định
INSERT INTO public.authors (id, name, title, phone, zalo, email, youtube_url, facebook_url, tiktok_url, bio)
VALUES (
  'default',
  'Xuân Linh',
  'Admin & Sáng lập viên',
  '0996 358 358',
  '0996358358',
  'ganhteam321@gmail.com',
  'https://www.youtube.com',
  'https://www.facebook.com',
  'https://www.tiktok.com',
  'Sáng tạo công cụ & Chatbot tạo video AI tự động'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  youtube_url = EXCLUDED.youtube_url,
  facebook_url = EXCLUDED.facebook_url,
  tiktok_url = EXCLUDED.tiktok_url,
  updated_at = NOW();

-- Danh sách sản phẩm khởi tạo
INSERT INTO public.products (
  id, title, version, subtitle, category, category_name, format, price, original_price,
  gia_trial, sold, remaining_slots, demo_video_id, poster_theme, description, is_premium, is_new, active
) VALUES
(
  'app-2d-so-sanh-ca-the-gioi',
  'App 2D So Sánh Cả Thế Giới',
  'v1.0',
  'App dùng để so sánh 2 sản phẩm nào đó bất kỳ',
  'flow',
  'Google Flow AI',
  '9:16',
  99000,
  150000,
  9000,
  57,
  143,
  'aoG_YF3C_bM',
  '{"badge":"APP SO SÁNH","highlight":"CẢ THẾ GIỚI","tagline":"So sánh mọi thứ bằng video 2D Veo3","color":"#D97706","bgGradient":"linear-gradient(180deg, #241D17 0%, #17130F 60%, #0E0B09 100%)"}'::jsonb,
  'Tạo video người mẫu 2D giải thích so sánh là công cụ giúp bạn tạo nhanh các video dạng 2D phân tích, so sánh và giải thích nội dung bằng AI. Chỉ cần nhập chủ đề so sánh, chọn ảnh người dẫn chuyện và thêm mô tả hình ảnh cho các đối tượng cần so sánh.

Bạn có thể tùy chỉnh hình ảnh minh họa theo ý muốn, ví dụ như so sánh Veo 3 Omni Flash và SeaDance 2.0, PC gaming và MacBook, hai sản phẩm công nghệ, hai phương pháp làm việc hoặc hai lựa chọn bất kỳ. AI sẽ tự động tạo hình ảnh cho các object cần so sánh, xây dựng nội dung, tạo video và lồng tiếng.

Chỉ với vài bước đơn giản, bạn có thể tạo ra video người que giải thích so sánh chuyên nghiệp mà không cần biết vẽ, không cần dựng hoạt hình và không cần tự viết kịch bản từ đầu.

Mua 1 lần dùng vĩnh viễn.',
  true,
  true,
  true
),
(
  'giang',
  'App AI Video Giang',
  'v1.0',
  'Ứng dụng tạo video AI tự động chuyên nghiệp',
  'flow',
  'Google Flow AI',
  '9:16',
  99000,
  150000,
  9000,
  1,
  99,
  'aoG_YF3C_bM',
  '{"badge":"AI GIANG","highlight":"APP AI VIDEO","tagline":"Tạo video AI chuyên nghiệp nhanh chóng","color":"#F59E0B","bgGradient":"linear-gradient(180deg, #241D17 0%, #17130F 60%, #0E0B09 100%)"}'::jsonb,
  'Ứng dụng hỗ trợ sáng tạo nội dung và tạo video AI tự động chất lượng cao. Tích hợp sẵn mẫu video 9:16, kịch bản thu hút và tối ưu hiển thị trên các nền tảng mạng xã hội.',
  true,
  true,
  true
),
(
  'app-koc-ban-long-den',
  'App KOC Bán Lồng Đèn',
  'v1.0',
  'Bán lồng đèn như thật',
  'flow',
  'Google Flow AI',
  '9:16',
  99000,
  160000,
  9000,
  28,
  172,
  'dQw4w9WgXcQ',
  '{"badge":"APP KOC","highlight":"BÁN LỒNG ĐÈN","tagline":"Ứng dụng KOC thông minh - Tự động bán hàng bứt phá","color":"#D97706","bgGradient":"linear-gradient(180deg, #241D17 0%, #17130F 60%, #0E0B09 100%)"}'::jsonb,
  'Ứng dụng KOC thông minh giúp bạn tự động hóa toàn bộ quy trình quay video bán lồng đèn và các sản phẩm mùa lễ hội bằng công nghệ Veo 3.

Tự động ghép người mẫu KOC vào khung cảnh ấm cúng, tương tác trực tiếp với sản phẩm, lên giọng nói thu hút người mua và tạo chuyển đổi bán hàng thần tốc.',
  true,
  true,
  true
),
(
  'app-koc-review-nha-hang',
  'App KOC Review Nhà Hàng, Quán Ăn, Quán Cafe,...',
  'v1.0',
  'Review mọi nơi ăn uống từ nhà hàng, quán nhậu, quán ăn,...',
  'flow',
  'Google Flow AI',
  '9:16',
  99000,
  180000,
  9000,
  42,
  158,
  '7B_sC2P0r5k',
  '{"badge":"APP REVIEW","highlight":"QUÁN ĂN & CAFE","tagline":"Tạo kịch bản + Tạo ảnh 9:16 + Tạo video review tự động","color":"#F59E0B","bgGradient":"linear-gradient(180deg, #241D17 0%, #17130F 60%, #0E0B09 100%)"}'::jsonb,
  'Giải pháp hàng đầu cho các nhà sáng tạo nội dung ẩm thực, KOC review đồ ăn. Ứng dụng tự động dựng bối cảnh bàn tiệc thịnh soạn, biểu cảm nếm thử chân thực và lời bình luận kích thích vị giác người xem.',
  true,
  true,
  true
),
(
  'app-thoi-trang-tttm',
  'App Thời Trang Bối Cảnh Trung Tâm Thương Mại',
  'v1.0',
  'Thời Trang Bối Cảnh Trung Tâm Thương Mại',
  'flow',
  'Google Flow AI',
  '9:16',
  89000,
  140000,
  8951,
  19,
  181,
  'dQw4w9WgXcQ',
  '{"badge":"APP THỜI TRANG","highlight":"TRUNG TÂM THƯƠNG MẠI","tagline":"Nhận diện bối cảnh - Khóa trang phục - Tự động dựng cảnh Veo3","color":"#D97706","bgGradient":"linear-gradient(180deg, #241D17 0%, #17130F 60%, #0E0B09 100%)"}'::jsonb,
  'Tạo video lookbook thời trang đẳng cấp trong không gian trung tâm thương mại sang trọng. Khóa chuẩn form dáng trang phục và cho người mẫu sải bước tự tin như sàn runway.',
  true,
  true,
  true
),
(
  'chatbot-gpt-kich-ban-kinh-te',
  'Chatbot GPT Mẫu Làm Video Stickman Kinh Tế - Chính Trị',
  'v2.0',
  'Kinh Tế · Chính Trị Bán Sách Tự Động',
  'chatbot',
  'Chatbot AI',
  'Chatbot',
  99000,
  190000,
  19000,
  85,
  115,
  '7B_sC2P0r5k',
  '{"badge":"CHATBOT GPT","highlight":"KINH TẾ & CHÍNH TRỊ","tagline":"Mẫu làm video Stickman bán sách viral triệu view","color":"#EA580C","bgGradient":"linear-gradient(180deg, #241712 0%, #170E0A 60%, #0E0705 100%)"}'::jsonb,
  'Bộ prompt và cấu hình Chatbot chuyên sâu để sinh kịch bản video hoạt hình người que (Stickman) giải thích các chủ đề kinh tế, tài chính, chính trị và tóm tắt sách cực kỳ lôi cuốn.',
  true,
  false,
  true
),
(
  'app-nguoi-que-hai-huoc',
  'Chatbot & App Người Que Hài Hước Bán Hàng',
  'v1.0',
  'Cà khịa hài hước bán hàng video AI cực bén',
  'chatbot',
  'Chatbot AI',
  '9:16',
  79000,
  130000,
  9000,
  34,
  166,
  'dQw4w9WgXcQ',
  '{"badge":"CHATBOT & APP","highlight":"NGƯỜI QUE HÀI HƯỚC","tagline":"Cà khịa hài hước - Bán hàng video AI - Tự động tạo ảnh & video","color":"#EA580C","bgGradient":"linear-gradient(180deg, #241712 0%, #170E0A 60%, #0E0705 100%)"}'::jsonb,
  'Công cụ đắc lực để làm các video giải trí lồng ghép bán hàng tự nhiên, không gây phản cảm. Tự động đề xuất các miếng hài hước, tạo hình nhân vật que vui nhộn.',
  true,
  true,
  true
),
(
  'app-ban-hang-nhieu-khung-canh',
  'App Bán Hàng Nhiều Khung Cảnh Veo 3',
  'v1.0',
  'App bán hàng đa góc quay & phối cảnh điện ảnh',
  'flow',
  'Google Flow AI',
  '9:16',
  99000,
  150000,
  9000,
  61,
  139,
  '7B_sC2P0r5k',
  '{"badge":"SIÊU APP","highlight":"BÁN HÀNG NHIỀU KHUNG CẢNH","tagline":"Đa góc quay, chuyển cảnh mượt mà chuẩn phim điện ảnh","color":"#D97706","bgGradient":"linear-gradient(180deg, #241D17 0%, #17130F 60%, #0E0B09 100%)"}'::jsonb,
  'Tạo chuỗi video quảng cáo sản phẩm với 4-6 góc máy chuyển cảnh mượt mà trong cùng một bối cảnh nhất quán. Tối ưu trải nghiệm thị giác cho khách hàng tiềm năng.',
  true,
  false,
  true
),
(
  'chatbot-prompt-veo3',
  'Chatbot Viết Prompt Video AI Veo 3 Chuẩn Từng Cảnh',
  'v1.2',
  'Trợ lý AI viết prompt điện ảnh theo từng phân cảnh',
  'prompt',
  'Mẫu Prompt',
  'Chatbot',
  69000,
  120000,
  15000,
  47,
  153,
  'dQw4w9WgXcQ',
  '{"badge":"PROMPT MASTER","highlight":"VEO 3 ĐIỆN ẢNH","tagline":"Tạo prompt phân cảnh chi tiết, chuyển động camera điện ảnh","color":"#D97706","bgGradient":"linear-gradient(180deg, #241D17 0%, #17130F 60%, #0E0B09 100%)"}'::jsonb,
  'Được huấn luyện trên hơn 10.000 prompt video chất lượng cao của Hollywood. Tự động phân tích kịch bản và sinh câu lệnh prompt tiếng Anh chuẩn ngữ nghĩa cho Veo 3, Runway Gen 3, Luma Dream Machine.',
  true,
  false,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  gia_trial = EXCLUDED.gia_trial,
  sold = EXCLUDED.sold,
  remaining_slots = EXCLUDED.remaining_slots,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Đơn hàng mẫu ban đầu
INSERT INTO public.orders (code, product_id, title, slug, amount, status, status_text, customer_email, access_url)
VALUES
(
  'AISRQJ7PXG',
  'app-2d-so-sanh-ca-the-gioi',
  'App 2D So Sánh Cả Thế Giới',
  'app-2d-so-sanh-ca-the-gioi',
  9000,
  'pending',
  'Chờ thanh toán',
  'ganhteam321@gmail.com',
  NULL
),
(
  'AISTC5LTF7',
  'app-koc-ban-long-den',
  'App KOC Bán Lồng Đèn',
  'app-koc-ban-long-den',
  9000,
  'pending',
  'Chờ thanh toán',
  'ganhteam321@gmail.com',
  NULL
),
(
  'AISGP38W74',
  'app-koc-review-nha-hang',
  'App KOC Review Nhà Hàng Quán Ăn Cafe',
  'app-koc-review-nha-hang',
  9000,
  'paid',
  'Đã thanh toán',
  'ganhteam321@gmail.com',
  'index.html#san-pham?id=app-koc-review-nha-hang'
)
ON CONFLICT (code) DO NOTHING;
