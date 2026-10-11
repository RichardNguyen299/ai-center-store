/**
 * AI Center Store - Supabase Client & Authentication Controller
 * Hỗ trợ đồng bộ Realtime, Google OAuth 2.0 và lưu trữ Cloud Database
 */

(function () {
  'use strict';

  // Cấu hình Supabase (Người dùng có thể dán URL và Anon Key tại đây hoặc qua localStorage)
  const DEFAULT_CONFIG = {
    url: window.SUPABASE_URL || 'https://tmowmprowizdrbamhivx.supabase.co',
    anonKey: window.SUPABASE_ANON_KEY || 'sb_publishable_RZ6GSjK8d87kMGNXsrAmlA_n99Jx_J1',
    adminEmail: 'ganhteam321@gmail.com'
  };

  // Dọn dẹp cache URL và Key cũ trên trình duyệt để luôn trỏ về cấu hình chuẩn xác
  if (typeof localStorage !== 'undefined') {
    const cachedUrl = localStorage.getItem('aic_supabase_url');
    if (cachedUrl && cachedUrl !== 'https://tmowmprowizdrbamhivx.supabase.co') {
      localStorage.removeItem('aic_supabase_url');
    }
    const cachedKey = localStorage.getItem('aic_supabase_key');
    if (cachedKey && cachedKey !== DEFAULT_CONFIG.anonKey) {
      localStorage.removeItem('aic_supabase_key');
    }
  }

  let supabaseClient = null;

  // Kiểm tra xem đã có cấu hình Supabase hợp lệ chưa
  function isConfigured() {
    return Boolean(
      DEFAULT_CONFIG.url &&
      DEFAULT_CONFIG.anonKey &&
      DEFAULT_CONFIG.url.startsWith('https://') &&
      typeof window.supabase !== 'undefined'
    );
  }

  // Khởi tạo Supabase Client
  function getClient() {
    if (supabaseClient) return supabaseClient;
    if (isConfigured() && typeof window.supabase !== 'undefined') {
      try {
        supabaseClient = window.supabase.createClient(DEFAULT_CONFIG.url, DEFAULT_CONFIG.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
      } catch (e) {
        console.warn('[Supabase] Khởi tạo thất bại, chuyển về chế độ Local Storage:', e);
      }
    }
    return supabaseClient;
  }

  // Quản lý Authentication
  const SupabaseAuth = {
    isConfigured,
    adminEmail: DEFAULT_CONFIG.adminEmail,

    // Cập nhật cấu hình Supabase nhanh chóng
    setConfig(url, anonKey) {
      if (url) localStorage.setItem('aic_supabase_url', url.trim());
      if (anonKey) localStorage.setItem('aic_supabase_key', anonKey.trim());
      DEFAULT_CONFIG.url = url || DEFAULT_CONFIG.url;
      DEFAULT_CONFIG.anonKey = anonKey || DEFAULT_CONFIG.anonKey;
      supabaseClient = null;
      return getClient();
    },

    getConfig() {
      return { ...DEFAULT_CONFIG };
    },

    // Đăng nhập qua Google OAuth
    async loginWithGoogle() {
      const client = getClient();
      if (!client) {
        // Fallback: Chế độ demo khi chưa liên kết Supabase
        console.info('[Supabase] Đang ở chế độ Local Demo, tự động đăng nhập tài khoản quản trị.');
        localStorage.setItem('aic_demo_logged_in', 'true');
        localStorage.setItem('aic_demo_user_email', DEFAULT_CONFIG.adminEmail);
        window.location.reload();
        return { user: { email: DEFAULT_CONFIG.adminEmail } };
      }

      // Xác định URL callback sau khi Google xác thực xong
      const currentUrl = new URL(window.location.href);
      let redirectUrl = window.location.origin + window.location.pathname;
      if (!redirectUrl.endsWith('tai-khoan.html')) {
        redirectUrl = window.location.origin + '/tai-khoan.html';
      }

      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('[Supabase Auth] Lỗi đăng nhập Google:', error.message);
        alert('Đăng nhập Google thất bại: ' + error.message);
        throw error;
      }
      return data;
    },

    // Đăng nhập qua Email / Password
    async loginWithPassword(email, password) {
      const client = getClient();
      if (!client) {
        localStorage.setItem('aic_demo_logged_in', 'true');
        localStorage.setItem('aic_demo_user_email', email);
        return { user: { email } };
      }

      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      if (error) throw error;
      return data;
    },

    // Đăng ký qua Email / Password
    async signUp(email, password) {
      const client = getClient();
      if (!client) {
        localStorage.setItem('aic_demo_logged_in', 'true');
        localStorage.setItem('aic_demo_user_email', email);
        return { user: { email } };
      }

      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password: password
      });
      if (error) throw error;
      return data;
    },

    // Đăng xuất
    async logout() {
      const client = getClient();
      localStorage.removeItem('aic_demo_logged_in');
      localStorage.removeItem('aic_demo_user_email');
      if (client) {
        await client.auth.signOut();
      }
      window.location.href = 'tai-khoan.html';
    },

    // Lấy Session hiện tại
    async getSession() {
      const client = getClient();
      if (!client) {
        if (localStorage.getItem('aic_demo_logged_in') === 'true') {
          const email = localStorage.getItem('aic_demo_user_email') || DEFAULT_CONFIG.adminEmail;
          return {
            user: {
              id: 'demo-user-id',
              email: email,
              user_metadata: {
                full_name: email.split('@')[0],
                avatar_url: ''
              }
            }
          };
        }
        return null;
      }

      const { data: { session }, error } = await client.auth.getSession();
      if (error || !session) return null;
      return session;
    },

    // Lấy thông tin User hiện tại kèm profile
    async getCurrentUser() {
      const session = await this.getSession();
      if (!session || !session.user) return null;

      const user = session.user;
      const isAdmin = user.email === DEFAULT_CONFIG.adminEmail;

      let profile = {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
        phone: '',
        role: isAdmin ? 'admin' : 'customer',
        totalOrders: 0,
        totalSpent: 0
      };

      // Đọc profile từ database nếu Supabase online
      const client = getClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data && !error) {
            profile.phone = data.phone || '';
            profile.role = data.role || (isAdmin ? 'admin' : 'customer');
            profile.totalOrders = data.total_orders || 0;
            profile.totalSpent = data.total_spent || 0;
            if (data.full_name) profile.fullName = data.full_name;
            if (data.avatar_url) profile.avatarUrl = data.avatar_url;
          }
        } catch (e) {
          console.warn('[Supabase] Không thể đọc profile chi tiết:', e);
        }
      }

      return profile;
    },

    // Lắng nghe thay đổi trạng thái đăng nhập
    onAuthStateChange(callback) {
      const client = getClient();
      if (!client) return { unsubscribe: () => {} };

      const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
        const user = session ? await this.getCurrentUser() : null;
        callback(event, user);
      });
      return subscription;
    }
  };

  // Quản lý Cơ Sở Dữ Liệu Cloud
  const SupabaseDB = {
    // 1. PRODUCTS
    async getProducts() {
      const client = getClient();
      if (!client) return null;
      const { data, error } = await client
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.warn('[SupabaseDB] Lỗi đọc products:', error);
        return null;
      }
      return data.map(p => ({
        ...p,
        original_price: p.original_price,
        gia_trial: p.gia_trial,
        posterTheme: p.poster_theme || {},
        isPremium: p.is_premium,
        isNew: p.is_new
      }));
    },

    async upsertProduct(product) {
      const client = getClient();
      if (!client) return false;
      const dbRow = {
        id: product.id,
        title: product.title,
        version: product.version || 'v1.0',
        subtitle: product.subtitle || '',
        category: product.category || 'flow',
        category_name: product.categoryName || 'Google Flow AI',
        format: product.format || '9:16',
        price: product.price || 0,
        original_price: product.original_price || 0,
        gia_trial: product.gia_trial || 0,
        sold: product.sold || 0,
        remaining_slots: product.remainingSlots || 100,
        demo_video_id: product.demo_video_id || '',
        poster_theme: product.posterTheme || {},
        description: product.description || '',
        is_premium: product.isPremium !== false,
        is_new: Boolean(product.isNew),
        active: product.active !== false,
        updated_at: new Date().toISOString()
      };
      const { error } = await client.from('products').upsert(dbRow);
      if (error) {
        console.error('[SupabaseDB] Lỗi lưu product:', error);
        return false;
      }
      return true;
    },

    async deleteProduct(id) {
      const client = getClient();
      if (!client) return false;
      const { error } = await client.from('products').delete().eq('id', id);
      return !error;
    },

    // 2. ORDERS
    async getOrders(userEmail) {
      const client = getClient();
      if (!client) return null;
      let query = client.from('orders').select('*').order('created_at', { ascending: false });
      if (userEmail && userEmail !== DEFAULT_CONFIG.adminEmail) {
        query = query.eq('customer_email', userEmail);
      }
      const { data, error } = await query;
      if (error) {
        console.warn('[SupabaseDB] Lỗi đọc orders:', error);
        return null;
      }
      return data.map(o => ({
        id: o.id,
        code: o.code,
        title: o.title,
        slug: o.slug,
        amount: o.amount,
        status: o.status,
        statusText: o.status_text,
        customerEmail: o.customer_email,
        accessUrl: o.access_url,
        date: new Date(o.created_at).toLocaleDateString('vi-VN')
      }));
    },

    async createOrder(order) {
      const client = getClient();
      if (!client) return null;
      const row = {
        code: order.code || ('AIC' + Math.random().toString(36).substring(2, 8).toUpperCase()),
        product_id: order.productId || order.id || null,
        title: order.title,
        slug: order.slug || order.id || '',
        amount: order.amount || 0,
        status: order.status || 'pending',
        status_text: order.statusText || 'Chờ thanh toán',
        customer_email: order.customerEmail,
        user_id: order.userId || null,
        access_url: order.accessUrl || null
      };
      const { data, error } = await client.from('orders').insert(row).select().single();
      if (error) {
        console.error('[SupabaseDB] Lỗi tạo order:', error);
        return null;
      }
      return data;
    },

    async updateOrderStatus(code, status, statusText, accessUrl) {
      const client = getClient();
      if (!client) return false;
      const updateData = { status, status_text: statusText };
      if (accessUrl !== undefined) updateData.access_url = accessUrl;
      const { error } = await client.from('orders').update(updateData).eq('code', code);
      return !error;
    },

    // 3. USERS / PROFILES
    async getProfiles() {
      const client = getClient();
      if (!client) return null;
      const { data, error } = await client.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) return null;
      return data.map(p => ({
        email: p.email,
        phone: p.phone,
        role: p.role,
        status: 'active',
        createdAt: new Date(p.created_at).toLocaleDateString('vi-VN'),
        totalOrders: p.total_orders,
        totalSpent: p.total_spent
      }));
    },

    async updatePhone(userId, phone) {
      const client = getClient();
      if (!client) return false;
      const { error } = await client.from('profiles').update({ phone }).eq('id', userId);
      return !error;
    },

    // 4. SETTINGS
    async getSettings() {
      const client = getClient();
      if (!client) return null;
      const { data, error } = await client.from('settings').select('*').eq('key', 'general').single();
      if (error || !data) return null;
      return data.value;
    },

    async saveSettings(settings) {
      const client = getClient();
      if (!client) return false;
      const { error } = await client
        .from('settings')
        .upsert({ key: 'general', value: settings, updated_at: new Date().toISOString() });
      return !error;
    }
  };

  // Xuất ra phạm vi toàn cục (Global scope)
  window.SupabaseAuth = SupabaseAuth;
  window.SupabaseDB = SupabaseDB;
})();
