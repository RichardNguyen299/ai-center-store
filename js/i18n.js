/**
 * AI Center Store - Centralized Internationalization (I18N) Module
 * Single Source of Truth for Bilingual Support (Tiếng Việt & English)
 */
(function (global) {
  'use strict';

  // Master Bilingual Dictionary
  const DICT = {
    vi: {
      // Branding & Metadata
      site_title: 'AI Center Store — Kho App & Chatbot Tạo Video AI',
      brand_sub: 'App & Chatbot tạo video AI',
      nav_products: 'Sản phẩm',
      nav_account: 'Tài khoản',

      // Hero Section
      hero_badge: 'AI Center Store · Hệ Thống Tự Động Hóa Video Veo 3',
      hero_h1: 'Kho App & Chatbot <span class="mint gradient-text">tạo video AI</span>',
      hero_lead: 'Sản xuất video thương mại triệu view trong vài phút với Google Flow & Chatbot tạo prompt — Mua 1 lần, sở hữu vĩnh viễn, nhận link tự động sau 30 giây.',
      search_placeholder: 'Tìm kiếm app Flow, chatbot kịch bản, mẫu video TikTok...',
      search_btn: 'Tìm kiếm',

      // Bento Grid Categories
      bento_flow_tag: '⚡ Veo3 Engine',
      bento_flow_title: 'Google Flow & Apps',
      bento_flow_desc: 'App tự động tạo video 9:16 bán hàng, KOC review, so sánh sản phẩm — nạp ảnh là xuất video hoàn chỉnh.',
      bento_flow_cta: 'Xem các App Flow',
      bento_bot_tag: '🤖 Trợ Lý Kịch Bản',
      bento_bot_title: 'Chatbot AI & Prompts',
      bento_bot_desc: 'Trợ lý AI viết kịch bản phân cảnh, tạo prompt ảnh và video theo từng nhịp — không cần biết viết câu lệnh.',
      bento_bot_cta: 'Xem các Chatbot',

      // Trust & Metrics Strip
      trust_1: 'Mở link tải tự động <b>24/7</b>',
      trust_2: 'Hơn <b>1.200+</b> Creator tin dùng',
      trust_3: 'Cập nhật phiên bản mới <b>Trọn đời</b>',
      trust_4: 'Hỗ trợ kỹ thuật 1:1 qua <b>Zalo</b>',

      // Product Shelves
      shelf_flow: 'App Google Flow (Veo3)',
      shelf_chatbot: 'Chatbot AI & Prompts',
      shelf_prompt: 'Mẫu Prompt Video',
      shelf_other: 'Sản phẩm & Tiện ích khác',
      shelf_products_count: 'sản phẩm',
      empty_title: 'Không tìm thấy sản phẩm phù hợp',
      empty_hint: 'Hãy thử tìm với từ khóa khác như "so sánh", "koc", "review"...',
      empty_btn_reset: 'Xem tất cả sản phẩm',

      // Product Card Elements
      card_detail: 'Chi tiết ➔',
      card_sold: 'đã bán',
      card_premium: '★ Premium',
      card_new: 'Mới',
      card_from: 'Chỉ từ',
      card_free: 'Miễn phí',

      // Why Choose Us Section
      why_eyebrow: 'GIÁ TRỊ VƯỢT TRỘI',
      why_title: 'Vì sao 1.200+ Creator chọn AI Center Store?',
      why_1_title: 'Nhận link ngay sau thanh toán',
      why_1_desc: 'Hệ thống xác nhận chuyển khoản tự động và mở link sản phẩm cho bạn trong chưa đầy một phút, bất kể ngày đêm.',
      why_2_title: 'Cập nhật miễn phí trọn đời',
      why_2_desc: 'Sản phẩm được cập nhật tính năng và prompt mới liên tục. Bạn vào lại bằng mã đơn đã mua mà không phải trả thêm phí.',
      why_3_title: 'Hỗ trợ trực tiếp 1:1 qua Zalo',
      why_3_desc: 'Gặp vướng mắc khi cài đặt hoặc chạy app? Nhắn ngay Zalo hotline 0996 358 358 để được chuyên viên kỹ thuật hỗ trợ tận tình.',

      // Ecosystem Section
      eco_eyebrow: 'HỆ SINH THÁI AI CENTER',
      eco_title: 'Khám phá toàn bộ nền tảng của chúng tôi',
      eco_here: 'Bạn đang ở đây',

      // Product Detail Page
      detail_breadcrumb_home: 'Cửa hàng',
      detail_intro: 'Giới thiệu sản phẩm',
      detail_buy_now: 'Mua ngay — nhận link tự động',
      detail_trial: 'Dùng thử 60 phút',
      detail_trial_note: 'Gói dùng thử dùng được <b>60 phút</b>. Có thể nâng cấp lên vĩnh viễn sau, chỉ trả phần chênh lệch.',
      detail_member_title: '🎁 <b>Ưu đãi thành viên</b> — cộng dồn <b>theo tầng</b>:',
      detail_member_desc: '<b>Khách cũ −15%</b> từ sản phẩm thứ 2 · <b>Đánh giá −10%</b> cho đơn kế tiếp.',
      detail_member_badge: 'Khách cũ −15%',
      detail_member_tip: 'Cộng dồn theo tầng ≈ giảm 15% trên giá sau voucher. Bạn không cần nhập mã.',
      detail_back: 'Quay về danh sách sản phẩm',
      detail_err_title: 'Không tìm thấy sản phẩm',
      detail_err_desc: 'Sản phẩm có thể đã ngừng bán hoặc đường dẫn không đúng.',
      detail_p1: 'Thanh toán chuyển khoản, hệ thống mở link tự động',
      detail_p2: 'Có mã voucher? Nhập ở bước thanh toán để được giảm ngay',
      detail_p3: 'Cập nhật phiên bản mới miễn phí — vào lại bằng mã đơn',
      detail_p4: 'Hỗ trợ cài đặt qua Zalo: 0996 358 358',

      // Account & Auth (tai-khoan.html)
      auth_login_title: 'Đăng nhập',
      auth_login_sub: 'Chào mừng trở lại! Đăng nhập để tiếp tục.',
      auth_register_title: 'Đăng ký tài khoản',
      auth_register_sub: 'Tạo tài khoản mới để quản lý đơn hàng & mã kích hoạt.',
      auth_btn_google: 'Tiếp tục với Google',
      auth_or: 'HOẶC',
      auth_label_email: 'Email hoặc Số điện thoại',
      auth_ph_email: 'email@vidu.com hoặc 0912345678',
      auth_help_email: 'Có thể đăng ký/đăng nhập bằng số điện thoại hoặc email.',
      auth_label_pw: 'Mật khẩu',
      auth_forgot_pw: 'Quên mật khẩu?',
      auth_btn_submit_login: 'Đăng nhập',
      auth_btn_submit_reg: 'Đăng ký',
      auth_switch_to_reg: 'Chưa có tài khoản? ',
      auth_link_reg: 'Đăng ký ngay',
      auth_switch_to_login: 'Đã có tài khoản? ',
      auth_link_login: 'Đăng nhập ngay',

      acc_my_account: 'Tài khoản của tôi',
      acc_verified: '✓ Đã xác thực',
      acc_logout: 'Đăng xuất',
      acc_add_phone_title: '📱 Bổ sung số điện thoại',
      acc_add_phone_desc: 'Tài khoản của bạn chưa có số điện thoại. Vui lòng bổ sung để nhận hỗ trợ và mã kích hoạt.',
      acc_save_phone: 'Lưu số điện thoại',
      acc_stat_orders: 'Tổng đơn hàng',
      acc_stat_spent: 'Tổng chi tiêu',
      acc_stat_latest: 'Giao dịch gần nhất',
      acc_member_plan: 'Gói thành viên',
      acc_member_plan_desc: 'Bạn chưa có gói thành viên. Nâng cấp để truy cập toàn bộ kho ứng dụng AI không giới hạn.',
      acc_member_cta: 'Khám phá sản phẩm ➔',
      acc_security: 'Bảo mật & Đổi mật khẩu',
      acc_new_pw: 'Mật khẩu mới',
      acc_new_pw_ph: 'Nhập ít nhất 6 ký tự...',
      acc_btn_update_pw: 'Cập nhật mật khẩu',
      acc_history_title: 'Lịch sử mua hàng',
      acc_history_sync: 'Dữ liệu đồng bộ thời gian thực',

      // Floating Zalo
      zalo_float: 'Tư vấn Zalo',

      // Footer
      footer_search_title: 'Tìm kiếm',
      footer_search_placeholder: 'Tìm nội dung',
      footer_search_hint: 'Tìm nhanh app AI, kịch bản, chatbot video',
      footer_cat_title: 'Danh mục',
      cat_flow: 'Google Flow AI (App Veo3)',
      cat_chatbot: 'Chatbot AI & Prompts',
      cat_prompt: 'Mẫu Prompt Video',
      cat_all: 'Tất cả sản phẩm',
      footer_about_title: 'Giới thiệu',
      footer_admin_role: 'Admin: ',
      footer_fb: 'Facebook cá nhân',
      footer_yt: 'Kênh Youtube',
      footer_tiktok: 'Kênh TikTok',
      footer_hotline_prefix: 'Hotline / Zalo: ',
      footer_copyright: 'Copyright 2026 — AI Center Store. All rights reserved.',
      btn_back_to_top: 'Lên đầu trang'
    },
    en: {
      // Branding & Metadata
      site_title: 'AI Center Store — AI Video Apps & Chatbots Hub',
      brand_sub: 'AI Video Apps & Chatbots',
      nav_products: 'Products',
      nav_account: 'Account',

      // Hero Section
      hero_badge: 'AI Center Store · Veo 3 Video Automation System',
      hero_h1: 'AI Video Apps & Chatbots <span class="mint gradient-text">Store</span>',
      hero_lead: 'Produce million-view commercial videos in minutes with Google Flow & prompt chatbots — Pay once, lifetime ownership, instant download in 30 seconds.',
      search_placeholder: 'Search Flow apps, script chatbots, TikTok video templates...',
      search_btn: 'Search',

      // Bento Grid Categories
      bento_flow_tag: '⚡ Veo3 Engine',
      bento_flow_title: 'Google Flow & Apps',
      bento_flow_desc: 'Automated video apps for 9:16 sales, KOC reviews, product comparisons — feed images to get complete videos.',
      bento_flow_cta: 'Explore Flow Apps',
      bento_bot_tag: '🤖 Script Assistant',
      bento_bot_title: 'AI Chatbots & Prompts',
      bento_bot_desc: 'AI assistant for multi-scene scripts, scene-by-scene prompts — no prompt engineering skills required.',
      bento_bot_cta: 'Explore Chatbots',

      // Trust & Metrics Strip
      trust_1: 'Instant automated link <b>24/7</b>',
      trust_2: 'Over <b>1,200+</b> Creators onboard',
      trust_3: 'Free new version updates <b>Lifetime</b>',
      trust_4: '1-on-1 technical support via <b>Zalo</b>',

      // Product Shelves
      shelf_flow: 'Google Flow AI (Veo3 Apps)',
      shelf_chatbot: 'AI Chatbots & Prompts',
      shelf_prompt: 'Video Prompt Templates',
      shelf_other: 'Other Tools & Products',
      shelf_products_count: 'products',
      empty_title: 'No matching products found',
      empty_hint: 'Try searching with keywords like "comparison", "koc", "review"...',
      empty_btn_reset: 'View all products',

      // Product Card Elements
      card_detail: 'Details ➔',
      card_sold: 'sold',
      card_premium: '★ Premium',
      card_new: 'New',
      card_from: 'From',
      card_free: 'Free',

      // Why Choose Us Section
      why_eyebrow: 'WHY CHOOSE US',
      why_title: 'Why 1,200+ Creators Trust AI Center Store?',
      why_1_title: 'Instant Download After Payment',
      why_1_desc: 'Automated transfer verification unlocks your product link in less than one minute, day or night.',
      why_2_title: 'Free Lifetime Updates',
      why_2_desc: 'Products are continuously updated with new features and prompts. Re-access anytime using your order code.',
      why_3_title: '1-on-1 Direct Support via Zalo',
      why_3_desc: 'Need help installing or running apps? Reach out to our hotline on Zalo 0996 358 358 for dedicated assistance.',

      // Ecosystem Section
      eco_eyebrow: 'AI CENTER ECOSYSTEM',
      eco_title: 'Explore All Platforms in Our Ecosystem',
      eco_here: 'You are here',

      // Product Detail Page
      detail_breadcrumb_home: 'Store',
      detail_intro: 'Product Overview',
      detail_buy_now: 'Buy Now — Instant Link',
      detail_trial: 'Try 60-min Trial',
      detail_trial_note: 'Trial package valid for <b>60 minutes</b>. Upgrade to lifetime later by paying only the difference.',
      detail_member_title: '🎁 <b>Member Benefits</b> — Tiered Discounts:',
      detail_member_desc: '<b>Returning customer −15%</b> from 2nd product · <b>Review −10%</b> for next order.',
      detail_member_badge: 'Returning −15%',
      detail_member_tip: 'Tiered discount ≈ 15% off after voucher. Automatically applied without code.',
      detail_back: 'Back to products list',
      detail_err_title: 'Product Not Found',
      detail_err_desc: 'This product might be discontinued or the link is invalid.',
      detail_p1: 'Bank transfer payment, automatic link release 24/7',
      detail_p2: 'Have a voucher? Enter at checkout for instant discount',
      detail_p3: 'Free lifetime updates — re-access using order ID',
      detail_p4: 'Technical setup support via Zalo: 0996 358 358',

      // Account & Auth (tai-khoan.html)
      auth_login_title: 'Sign In',
      auth_login_sub: 'Welcome back! Sign in to continue.',
      auth_register_title: 'Create Account',
      auth_register_sub: 'Create a new account to manage orders and license keys.',
      auth_btn_google: 'Continue with Google',
      auth_or: 'OR',
      auth_label_email: 'Email or Phone Number',
      auth_ph_email: 'email@example.com or 0912345678',
      auth_help_email: 'Sign up or log in using phone number or email.',
      auth_label_pw: 'Password',
      auth_forgot_pw: 'Forgot password?',
      auth_btn_submit_login: 'Sign In',
      auth_btn_submit_reg: 'Sign Up',
      auth_switch_to_reg: "Don't have an account? ",
      auth_link_reg: 'Register now',
      auth_switch_to_login: 'Already have an account? ',
      auth_link_login: 'Sign in now',

      acc_my_account: 'My Account',
      acc_verified: '✓ Verified',
      acc_logout: 'Log Out',
      acc_add_phone_title: '📱 Add Phone Number',
      acc_add_phone_desc: 'Your account does not have a phone number yet. Please add one to receive activation codes.',
      acc_save_phone: 'Save Phone Number',
      acc_stat_orders: 'Total Orders',
      acc_stat_spent: 'Total Spent',
      acc_stat_latest: 'Latest Transaction',
      acc_member_plan: 'Membership Plan',
      acc_member_plan_desc: 'You do not have a membership plan yet. Upgrade to access unlimited AI apps.',
      acc_member_cta: 'Explore Products ➔',
      acc_security: 'Security & Change Password',
      acc_new_pw: 'New Password',
      acc_new_pw_ph: 'Enter at least 6 characters...',
      acc_btn_update_pw: 'Update Password',
      acc_history_title: 'Order History',
      acc_history_sync: 'Real-time synchronized data',

      // Floating Zalo
      zalo_float: 'Zalo Support',

      // Footer
      footer_search_title: 'Search',
      footer_search_placeholder: 'Search store...',
      footer_search_hint: 'Quickly find AI apps, scripts, video chatbots',
      footer_cat_title: 'Categories',
      cat_flow: 'Google Flow AI (Veo3 Apps)',
      cat_chatbot: 'AI Chatbots & Prompts',
      cat_prompt: 'Video Prompt Templates',
      cat_all: 'All Products',
      footer_about_title: 'About',
      footer_admin_role: 'Admin: ',
      footer_fb: 'Personal Facebook',
      footer_yt: 'YouTube Channel',
      footer_tiktok: 'TikTok Channel',
      footer_hotline_prefix: 'Hotline / Zalo: ',
      footer_copyright: 'Copyright 2026 — AI Center Store. All rights reserved.',
      btn_back_to_top: 'Back to top'
    }
  };

  // State
  let currentLang = 'vi';
  const listeners = [];

  // Determine initial language
  function determineInitialLang() {
    try {
      const stored = localStorage.getItem('aic_lang');
      if (stored === 'vi' || stored === 'en') return stored;
    } catch (e) {}
    return 'vi'; // Default to Vietnamese
  }

  currentLang = determineInitialLang();

  // Translation helper
  function t(key, fallback = '') {
    const langDict = DICT[currentLang] || DICT.vi;
    if (langDict && langDict[key] !== undefined) return langDict[key];
    if (DICT.vi && DICT.vi[key] !== undefined) return DICT.vi[key];
    return fallback || key;
  }

  // Apply translations to a DOM root (default document)
  function applyTranslations(root = document) {
    if (!root) return;
    const langDict = DICT[currentLang] || DICT.vi;

    // 1. Text elements: data-i18n
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if (k && langDict[k] !== undefined) {
        el.textContent = langDict[k];
      }
    });

    // 2. HTML elements: data-i18n-html
    root.querySelectorAll('[data-i18n-html]').forEach(el => {
      const k = el.getAttribute('data-i18n-html');
      if (k && langDict[k] !== undefined) {
        el.innerHTML = langDict[k];
      }
    });

    // 3. Placeholders: data-i18n-placeholder
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const k = el.getAttribute('data-i18n-placeholder');
      if (k && langDict[k] !== undefined) {
        el.setAttribute('placeholder', langDict[k]);
      }
    });

    // 4. Titles / Aria-labels: data-i18n-title
    root.querySelectorAll('[data-i18n-title]').forEach(el => {
      const k = el.getAttribute('data-i18n-title');
      if (k && langDict[k] !== undefined) {
        el.setAttribute('title', langDict[k]);
        el.setAttribute('aria-label', langDict[k]);
      }
    });

    // 5. Update language dropdown flags and labels
    const flagEl = root.querySelector('#currentLangFlag');
    const codeEl = root.querySelector('#currentLangCode');
    if (flagEl) flagEl.textContent = currentLang === 'en' ? '🇬🇧' : '🇻🇳';
    if (codeEl) codeEl.textContent = currentLang.toUpperCase();

    root.querySelectorAll('.lang-option-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
    });

    // 6. Update document title
    if (DICT[currentLang] && DICT[currentLang].site_title && root === document) {
      document.title = DICT[currentLang].site_title;
    }
  }

  // Set language and trigger listeners
  function setLanguage(lang) {
    if (lang !== 'vi' && lang !== 'en') lang = 'vi';
    currentLang = lang;
    try {
      localStorage.setItem('aic_lang', lang);
    } catch (e) {}

    applyTranslations(document);

    // Trigger registered callback listeners
    listeners.forEach(fn => {
      try {
        fn(currentLang);
      } catch (err) {
        console.error('[I18N listener error]:', err);
      }
    });

    // Dispatch global custom event
    window.dispatchEvent(new CustomEvent('aic_language_changed', { detail: { lang: currentLang } }));
  }

  // Subscribe to language changes
  function onLanguageChange(fn) {
    if (typeof fn === 'function') {
      listeners.push(fn);
    }
  }

  // Bind dropdown UI
  function bindLangPicker() {
    const langBtn = document.getElementById('btnLangToggle');
    const langBox = document.getElementById('langDropdownBox');

    if (langBtn && !langBtn.dataset.i18nBound) {
      langBtn.dataset.i18nBound = 'true';
      langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = langBox ? langBox.classList.toggle('show') : false;
        langBtn.classList.toggle('open', isOpen);
      });

      document.addEventListener('click', (e) => {
        if (langBox && !e.target.closest('#langPickerWrapper')) {
          langBox.classList.remove('show');
          langBtn.classList.remove('open');
        }
      });
    }

    document.querySelectorAll('.lang-option-item').forEach(item => {
      if (!item.dataset.i18nBound) {
        item.dataset.i18nBound = 'true';
        item.addEventListener('click', () => {
          const lang = item.getAttribute('data-lang') || 'vi';
          setLanguage(lang);
          if (langBox) langBox.classList.remove('show');
          if (langBtn) langBtn.classList.remove('open');
        });
      }
    });
  }

  // Auto initialize on DOM ready
  function init() {
    applyTranslations(document);
    bindLangPicker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose Global I18N Object
  global.I18N = {
    DICT,
    t,
    getLang: () => currentLang,
    setLang: setLanguage,
    apply: applyTranslations,
    onLangChange: onLanguageChange,
    bindLangPicker,
    init
  };

})(typeof window !== 'undefined' ? window : this);
