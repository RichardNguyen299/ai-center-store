# 🚀 Hướng Dẫn Triển Khai AI Center Store Lên Vercel & Supabase

Tài liệu này hướng dẫn bạn từng bước từ A đến Z để:
1. Tạo **Database PostgreSQL** nhẹ trên **Supabase** (hoàn toàn miễn phí).
2. Kích hoạt **Đăng nhập bằng Google** (Google OAuth 2.0) cho khách hàng & quản trị viên.
3. Deploy website lên **Vercel** để phục vụ lượng truy cập (hỗ trợ thoải mái dưới 5.000 - 50.000 lượt/tháng).

---

## BƯỚC 1: TẠO DATABASE TRÊN SUPABASE (3 phút)

1. Truy cập **[https://supabase.com](https://supabase.com)** -> Bấm **Start your project** (Đăng nhập bằng tài khoản GitHub hoặc Google).
2. Bấm **New Project**:
   - **Name**: `ai-center-store`
   - **Database Password**: Nhập mật khẩu mạnh bất kỳ (lưu lại nếu cần).
   - **Region**: Chọn `Singapore` (để tốc độ tải từ Việt Nam nhanh nhất).
   - **Pricing Plan**: Chọn **Free** (Miễn phí 100%).
   - Bấm **Create new project** và đợi khoảng 1-2 phút để hệ thống khởi tạo.

3. Khởi tạo cấu trúc bảng dữ liệu:
   - Trong thanh menu bên trái, chọn biểu tượng **SQL Editor** (hình `>_`).
   - Mở file [`data/schema.sql`](data/schema.sql) trong thư mục dự án này, copy toàn bộ nội dung.
   - Dán vào ô nhập SQL trong Supabase và bấm nút xanh **Run** (chạy).
   - ✅ Toàn bộ các bảng: `profiles` (người dùng), `products` (sản phẩm), `orders` (đơn hàng), `settings` và cơ chế phân quyền bảo mật RLS sẽ được tạo tự động cùng 9 sản phẩm mẫu.

4. Lấy thông tin kết nối API:
   - Trong menu bên trái, bấm vào biểu tượng bánh răng **Project Settings** -> chọn **API**.
   - Copy 2 thông tin sau:
     - **Project URL** (dạng `https://xxxxxxxxxxxx.supabase.co`)
     - **anon public key** (chuỗi ký tự dài bắt đầu bằng `eyJhb...`)

---

## BƯỚC 2: KÍCH HOẠT ĐĂNG NHẬP GOOGLE (4 phút)

### 2.1. Lấy Callback URL từ Supabase:
- Trong Supabase Dashboard, vào **Authentication** -> **Providers** -> Chọn **Google**.
- Copy dòng **Callback URL (for OAuth)**:
  `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`

### 2.2. Tạo OAuth Credentials trên Google Cloud Console:
1. Truy cập **[https://console.cloud.google.com](https://console.cloud.google.com)**.
2. Tạo một Project mới (đặt tên: `AI Center Store`).
3. Vào **APIs & Services** -> **OAuth consent screen** (Màn hình đồng ý OAuth):
   - Chọn **External** -> Bấm **Create**.
   - Nhập **App name**: `AI Center Store`.
   - **User support email**: Chọn email của bạn (`ganhteam321@gmail.com`).
   - **Developer contact information**: Nhập email của bạn.
   - Bấm **Save and continue** qua các bước tiếp theo đến khi hoàn tất.
4. Vào **APIs & Services** -> **Credentials**:
   - Bấm **+ CREATE CREDENTIALS** -> Chọn **OAuth client ID**.
   - **Application type**: Chọn `Web application`.
   - **Name**: `AI Center Store Web`.
   - **Authorized JavaScript origins**:
     - `http://localhost:8080` (để test máy tính)
     - `https://<ten-du-an>.vercel.app` (domain Vercel của bạn)
   - **Authorized redirect URIs**:
     - Dán đường dẫn **Callback URL** bạn đã copy từ Supabase ở bước 2.1.
   - Bấm **CREATE**.
   - Copy **Client ID** và **Client Secret**.

### 2.3. Dán Client ID & Secret vào Supabase:
- Quay lại trang **Supabase -> Authentication -> Providers -> Google**:
  - Dán **Client ID** và **Client Secret**.
  - Bật công tắc **Enable Google provider**.
  - Bấm **Save**.

---

## BƯỚC 3: ĐIỀN THÔNG TIN VÀO SOURCE CODE

Mở file [`js/supabase.js`](js/supabase.js) và dán thông tin của bạn vào dòng 12-13:

```javascript
  const DEFAULT_CONFIG = {
    // Dán URL và Anon Key từ Supabase Bước 1 tại đây:
    url: 'https://xxxxxxxxxxxx.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    adminEmail: 'ganhteam321@gmail.com'
  };
```

*(Lưu ý: Khóa `anonKey` là public key an toàn phía client, được bảo vệ bởi Row Level Security nên có thể đặt trực tiếp trong frontend).*

---

## BƯỚC 4: DEPLOY LÊN VERCEL (2 phút)

### Cách 1: Deploy qua GitHub (Khuyên dùng - tự động cập nhật khi sửa code)
1. Tạo một Repository mới trên GitHub (Private hoặc Public).
2. Đẩy toàn bộ thư mục `ai-center-store` lên GitHub:
   ```bash
   git init
   git add .
   git commit -m "Deploy AI Center Store"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan>/<ten-repo>.git
   git push -u origin main
   ```
3. Truy cập **[https://vercel.com](https://vercel.com)** -> Đăng nhập bằng GitHub.
4. Bấm **Add New...** -> **Project** -> Chọn repository vừa tạo.
5. Vercel sẽ tự động nhận diện cấu hình file [`vercel.json`](vercel.json). Bấm nút **Deploy**.
6. Sau khoảng 20-30 giây, website của bạn sẽ online tại địa chỉ:
   `https://ai-center-store.vercel.app` 🎉

---

## BƯỚC 5: CẬP NHẬT TÊN MIỀN VERCEL VÀO SUPABASE & GOOGLE

Tên miền Vercel chính thức của bạn: **`https://ai-center-store-omega.vercel.app`**

1. **Trong Supabase**:
   - Vào **Authentication** -> **URL Configuration**.
   - **Site URL**: Điền `https://ai-center-store-omega.vercel.app`
   - **Redirect URLs**: Đảm bảo có các dòng:
     - `https://ai-center-store-omega.vercel.app/**`
     - `http://localhost:8080/**`
     - `http://localhost:8081/**`
   - Bấm **Save**.

2. **Trong Google Cloud Console**:
   - Vào **Credentials** -> Bấm vào tên OAuth Client `AI Center Store Web`.
   - Thêm `https://ai-center-store-omega.vercel.app` vào **Authorized JavaScript origins**.
   - Bấm **Save**.

---

## 👑 TÀI KHOẢN QUẢN TRỊ VIÊN (ADMIN)

- Gmail quản trị chính được cấp quyền Admin: **`ganhteam321@gmail.com`**.
- Khi đăng nhập bằng tài khoản Google này:
  - Hệ thống tự động nhận diện quyền `admin`.
  - Trên trang cá nhân sẽ xuất hiện nút **⚙️ Trang Quản Trị**.
  - Bạn có thể truy cập `https://<ten-mien>/admin.html` để thêm bớt sản phẩm, duyệt đơn hàng và xem báo cáo doanh thu.
  - Các tài khoản Gmail khác khi đăng nhập sẽ chỉ có quyền khách hàng (xem các sản phẩm đang mở bán và đơn hàng của riêng mình).
