/**
 * AI Center Store - Single Page Application Core Controller
 */

(function () {
  'use strict';

  // Utilities
  function $(selector) {
    return document.querySelector(selector);
  }
  function $$(selector) {
    return document.querySelectorAll(selector);
  }
  function vnd(n) {
    return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  let currentCategory = 'all';
  let searchQuery = '';

  // Render Product Card
  function renderCard(p) {
    const hasDiscount = p.original_price && p.original_price > p.price;
    const discountPct = hasDiscount ? Math.round((1 - p.price / p.original_price) * 100) : 0;
    const posterSrc = generatePosterSVG(p);

    const priceDisplay = p.gia_trial > 0
      ? `<span class="gia-nhan">Chỉ từ</span> <span class="gia-moi">${vnd(p.gia_trial)}</span>`
      : `${hasDiscount ? `<span class="giam">-${discountPct}%</span><span class="gia-cu">${vnd(p.original_price)}</span>` : ''}
         <span class="gia-moi">${p.price > 0 ? vnd(p.price) : 'Miễn phí'}</span>`;

    return `
      <a class="sp" href="#san-pham?id=${encodeURIComponent(p.id)}">
        <div class="sp-anh">
          <img src="${posterSrc}" alt="${esc(p.title)}" loading="lazy">
          <span class="sp-anh-tag">Veo3 AI · 9:16</span>
        </div>
        <div class="sp-than">
          <div class="nhan-hang">
            ${p.isPremium ? '<span class="nhan nhan-premium">★ Premium</span>' : '<span class="nhan nhan-free">Miễn phí</span>'}
            ${p.isNew ? '<span class="nhan nhan-moi">Mới</span>' : ''}
            ${p.format ? `<span class="nhan nhan-loai">${esc(p.format)}</span>` : ''}
          </div>
          <p class="sp-ten">
            ${esc(p.title)}
            ${p.version ? `<span class="ver">${esc(p.version)}</span>` : ''}
          </p>
          ${p.subtitle ? `<p class="sp-mota">${esc(p.subtitle)}</p>` : ''}
          ${p.sold > 0 ? `<p class="sp-ban"><span class="sp-ban-dot"></span>${p.sold} đã bán</p>` : ''}
          <div class="sp-gia">
            <div class="sp-gia-trai">${priceDisplay}</div>
            <span class="sp-cta-pill">Chi tiết ➔</span>
          </div>
        </div>
      </a>
    `;
  }

  // Render Home Shelves
  function renderHomeCatalog() {
    const container = $('#cacKe');
    if (!container) return;

    let items = (typeof DB !== 'undefined') ? DB.getActiveProducts() : STORE_DATA.products;

    // Filter by Category
    if (currentCategory !== 'all') {
      items = items.filter(p => p.category === currentCategory);
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.subtitle || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty">
          <svg class="ic" style="width:48px;height:48px;color:var(--caption);margin:0 auto 14px"><use href="#i-search"/></svg>
          <h3 style="margin-bottom:8px">Không tìm thấy sản phẩm phù hợp</h3>
          <p class="caption">Hãy thử tìm với từ khóa khác như "so sánh", "koc", "review"...</p>
          <button class="btn btn-secondary btn-sm" id="btnResetSearch" style="margin-top:16px">Xem tất cả sản phẩm</button>
        </div>
      `;
      $('#btnResetSearch')?.addEventListener('click', () => {
        $('#timOng').value = '';
        searchQuery = '';
        currentCategory = 'all';
        renderHomeCatalog();
      });
      return;
    }

    const groups = [
      { id: 'flow', title: 'App Google Flow (Veo3)' },
      { id: 'chatbot', title: 'Chatbot AI' },
      { id: 'prompt', title: 'Mẫu Prompt' }
    ];

    let html = '';
    const renderedIds = new Set();
    groups.forEach(g => {
      const sp = items.filter(p => p.category === g.id);
      if (sp.length > 0) {
        sp.forEach(p => renderedIds.add(p.id));
        html += `
          <div class="ke">
            <div class="ke-dau">
              <i></i>
              <h2>${g.title}</h2>
              <span class="ke-dem">${sp.length} sản phẩm</span>
              <span class="ke-line"></span>
            </div>
            <div class="luoi-sp">
              ${sp.map(renderCard).join('')}
            </div>
          </div>
        `;
      }
    });

    // Render other categories created in Admin
    const otherItems = items.filter(p => !renderedIds.has(p.id));
    if (otherItems.length > 0) {
      html += `
        <div class="ke">
          <div class="ke-dau">
            <i></i>
            <h2>Sản phẩm & Tiện ích khác</h2>
            <span class="ke-dem">${otherItems.length} sản phẩm</span>
            <span class="ke-line"></span>
          </div>
          <div class="luoi-sp">
            ${otherItems.map(renderCard).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  // Render Courses
  function renderCourses() {
    const grid = $('#khoaLuoi');
    if (!grid) return;
    grid.innerHTML = STORE_DATA.courses.map(c => `
      <a class="khoa-o" href="${c.url}" target="_blank" rel="noopener">
        <span class="khoa-ic"><svg class="ic"><use href="#i-${c.icon}"/></svg></span>
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.desc)}</p>
        <span class="khoa-di">Vào học →</span>
      </a>
    `).join('');
  }

  // Render Ecosystem
  function renderEcosystem() {
    const grid = $('#hstGrid');
    if (!grid) return;
    grid.innerHTML = STORE_DATA.ecosystem.map(e => `
      <a class="hst-card" href="${e.url}" ${e.current ? '' : 'target="_blank" rel="noopener"'}>
        ${e.current ? '<span class="hst-here">Bạn đang ở đây</span>' : ''}
        <span class="hst-ic">${e.icon}</span>
        <span class="hst-name">${esc(e.name)}</span>
        <span class="hst-desc">${esc(e.desc)}</span>
        <span class="hst-dom">${e.url === '#' ? 'hocvalamai.net' : e.url.replace('https://', '')} →</span>
      </a>
    `).join('');
  }

  // Render Product Detail Page
  function renderDetailPage(productId) {
    let product = ((typeof DB !== 'undefined') ? DB.getProductById(productId) : null) || STORE_DATA.products.find(p => p.id === productId);

    // If not found in local storage, try syncing immediately from window.opener (Admin window)
    if (!product && window.opener) {
      try {
        if (window.opener.DB && typeof window.opener.DB.getProductById === 'function') {
          const parentProduct = window.opener.DB.getProductById(productId);
          if (parentProduct) {
            DB.updateOrAddProduct(parentProduct);
            product = parentProduct;
          }
        }
      } catch (e) {}
    }

    if (!product) {
      $('#noiDung').hidden = true;
      $('#loi').hidden = false;
      const fileTip = $('#loiFileTip');
      if (fileTip) fileTip.hidden = (window.location.protocol !== 'file:');
      return;
    }

    $('#loi').hidden = true;
    $('#noiDung').hidden = false;

    // Breadcrumbs
    $('#vet').textContent = product.title;
    document.title = `${product.title} | AI Center Store`;

    // Title & Badges
    $('#ten').innerHTML = `${esc(product.title)} ${product.version ? `<span class="ver">${esc(product.version)}</span>` : ''}`;
    $('#tomTat').textContent = product.subtitle || '';
    $('#moTaDai').innerHTML = esc(product.description).replace(/\n/g, '<br>');

    // Tag list
    $('#nhanHang').innerHTML = `
      ${product.isPremium ? '<span class="nhan nhan-premium">★ Premium</span>' : '<span class="nhan nhan-free">Miễn phí</span>'}
      ${product.isNew ? '<span class="nhan nhan-moi">Mới</span>' : ''}
      <span class="nhan nhan-loai">${esc(product.categoryName)}</span>
      <span class="nhan nhan-loai">${esc(product.format)}</span>
    `;

    // Pricing Block
    const hasDiscount = product.original_price && product.original_price > product.price;
    const discountPct = hasDiscount ? Math.round((1 - product.price / product.original_price) * 100) : 0;

    if (product.gia_trial > 0) {
      $('#giaHang').innerHTML = `
        <span style="font-size:14px;color:var(--caption);margin-right:6px">Chỉ từ</span>
        <span class="gia-moi">${vnd(product.gia_trial)}</span>
        <span style="font-size:13px;color:var(--caption);width:100%;display:block;margin-top:2px">
          Dùng thử 60 phút · Vĩnh viễn ${vnd(product.price)}
        </span>
      `;
    } else {
      $('#giaHang').innerHTML = `
        ${hasDiscount ? `<span class="giam">-${discountPct}%</span><span class="gia-cu">${vnd(product.original_price)}</span>` : ''}
        <span class="gia-moi">${vnd(product.price)}</span>
      `;
    }

    if (product.sold > 0) {
      $('#daBan').textContent = `${product.sold} đã bán`;
      $('#daBan').hidden = false;
    } else {
      $('#daBan').hidden = true;
    }

    // Urgency indicators
    $('#badgeSold').textContent = `🔥 ${product.sold || 57} người đã mua`;
    $('#badgeUrgency').textContent = `⚡ Chỉ còn ${product.remainingSlots || 143} suất ưu đãi`;

    // CTA Buttons
    const btnBuy = $('#nutMua');
    btnBuy.textContent = `Mua vĩnh viễn — ${vnd(product.price)}`;
    btnBuy.onclick = (e) => {
      e.preventDefault();
      openCheckoutModal(product, 'vinhvien');
    };

    const btnTrial = $('#nutTrial');
    if (product.gia_trial > 0) {
      btnTrial.textContent = `⏱️ Dùng thử 60 phút — ${vnd(product.gia_trial)}`;
      btnTrial.hidden = false;
      $('#trialNote').hidden = false;
      btnTrial.onclick = (e) => {
        e.preventDefault();
        openCheckoutModal(product, 'trial');
      };
    } else {
      btnTrial.hidden = true;
      $('#trialNote').hidden = true;
    }

    // Video Player or Poster Media
    const mediaBox = $('#mediaHop');
    const rawVideoId = product.demo_video_id;
    const videoId = (typeof extractYouTubeId === 'function' ? extractYouTubeId(rawVideoId) : rawVideoId) || 'aoG_YF3C_bM';
    const isFileProtocol = window.location.protocol === 'file:';

    if (videoId && (product.format === '9:16' || product.format === '16:9' || product.format === 'video')) {
      const is916 = product.format === '9:16';
      mediaBox.innerHTML = `
        <div class="video-wrapper">
          <div class="ct-video ${is916 ? 'v916' : 'v169'}">
            <iframe 
              src="https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1" 
              title="${esc(product.title)}" 
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen>
            </iframe>
          </div>
          <div class="video-toolbar">
            <a class="btn-yt-direct" href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              <span>Mở xem trực tiếp trên YouTube ↗</span>
            </a>

            ${isFileProtocol ? `
            <div class="file-mode-tip">
              <div class="tip-title">⚡ Lưu ý khi mở trực tiếp file HTML (file://)</div>
              <div class="tip-desc">Trình duyệt không gửi tiêu đề Referer khiến YouTube báo <b>Lỗi 153</b> trên khung video.</div>
              <div style="margin-top:6px;font-size:12px">
                👉 <b>Giải pháp 1:</b> Bấm nút màu đỏ ở trên để xem trực tiếp video.<br>
                👉 <b>Giải pháp 2 (Chuẩn nhất):</b> Nhấp đúp vào file <code>start_server.bat</code> trong thư mục dự án để chạy web server nội bộ (xem video nhúng 100% không lỗi).
              </div>
            </div>
            ` : ''}
          </div>
        </div>
      `;
    } else {
      mediaBox.innerHTML = `
        <div class="ct-anh" style="padding:20px;text-align:center">
          <img src="${generatePosterSVG(product)}" alt="${esc(product.title)}" style="max-height:450px;margin:0 auto;border-radius:14px">
        </div>
      `;
    }

    // Related Products (4 products)
    const allActive = (typeof DB !== 'undefined') ? DB.getActiveProducts() : STORE_DATA.products;
    const related = allActive.filter(p => p.id !== product.id).slice(0, 4);
    const relatedGrid = $('#khacLuoi');
    if (relatedGrid) {
      relatedGrid.innerHTML = related.map(renderCard).join('');
    }
  }

  // =========================================
  // ACCOUNT & AUTH CONTROLLER
  // =========================================
  let isLoggedIn = true; // Default logged in as ganhteam321@gmail.com matching screenshot
  let authMode = 'dangnhap'; // 'dangnhap' | 'dangky' | 'quen'

  function renderAccountView() {
    const user = STORE_DATA.currentUser;
    const khuAuth = $('#khuAuth');
    const khuTK = $('#khuTK');

    if (!isLoggedIn) {
      khuTK.hidden = true;
      khuAuth.hidden = false;
      renderAuthForm();
      document.title = 'Đăng nhập | AI Center Store';
      return;
    }

    khuAuth.hidden = true;
    khuTK.hidden = false;
    document.title = 'Tài khoản của tôi | AI Center Store';

    // User Profile Header
    $('#tkEmail').textContent = user.email;
    const avatarEl = $('#userAvatar');
    if (avatarEl) {
      if (user.avatarUrl) {
        avatarEl.innerHTML = `<img src="${user.avatarUrl}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
      } else {
        avatarEl.textContent = (user.name || user.email).charAt(0).toUpperCase();
      }
    }

    // Role check for admin button
    const adminLink = document.querySelector('.user-header-card a[href="admin.html"]');
    if (adminLink) {
      adminLink.style.display = (user.role === 'admin' || user.email === 'ganhteam321@gmail.com') ? 'inline-flex' : 'none';
    }

    // Statistics
    const allOrders = (window.DB && window.DB.getOrders) ? window.DB.getOrders() : (user.orders || []);
    const orders = (user.role === 'admin' || user.email === 'ganhteam321@gmail.com')
      ? allOrders
      : allOrders.filter(o => !o.customerEmail || o.customerEmail.toLowerCase() === user.email.toLowerCase());

    const paidOrders = orders.filter(o => o.status === 'paid');
    const totalSpent = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    $('#tkTongDon').textContent = orders.length;
    $('#tkTongTien').textContent = vnd(totalSpent);
    $('#tkGanNhat').textContent = orders.length > 0 ? orders[0].date : (user.lastTransaction || 'Chưa có');

    // Phone Alert
    if (user.phone) {
      const sdtInput = $('#bs_sdt');
      if (sdtInput) sdtInput.value = user.phone;
      $('#boSungSdt').hidden = true;
    } else {
      $('#boSungSdt').hidden = false;
    }

    // Orders History
    const dsDon = $('#dsDon');
    if (dsDon) {
      if (!orders || orders.length === 0) {
        dsDon.innerHTML = '<p class="caption" style="text-align:center;padding:24px">Chưa có đơn hàng nào.</p>';
      } else {
        dsDon.innerHTML = orders.map(o => {
          const p = (window.DB && window.DB.getProductById) ? window.DB.getProductById(o.id || o.productId) : null;
          const poster = (p && window.generatePosterSVG) ? window.generatePosterSVG(p) : ((window.generatePosterSVG) ? window.generatePosterSVG({ title: o.title, id: o.id }) : '');
          const title = (p && p.title) ? p.title : (o.title ? o.title.replace(/^app-/, 'App ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Sản phẩm AI');
          const isPaid = o.status === 'paid';
          const targetUrl = o.accessUrl || (p ? `#san-pham?id=${p.id}` : '#');

          return `
            <div class="don">
              <div class="don-left">
                <img src="${poster}" class="don-thumb" alt="${esc(title)}">
                <div style="min-width:0">
                  <p class="t">
                    <span style="font-weight:700">${esc(title)}</span>
                    <span class="badge ${isPaid ? 'badge-paid' : 'badge-pend'}">${isPaid ? '✓ Đã thanh toán' : '⏳ Chờ thanh toán'}</span>
                  </p>
                  <p class="m">
                    <code style="font-size:12px;color:var(--heading)">${esc(o.code)}</code> · <span>${esc(o.date)}</span> · <b style="color:var(--mint)">${vnd(o.amount)}</b>
                  </p>
                </div>
              </div>
              <div>
                ${isPaid ? `
                  <a class="btn btn-secondary btn-sm" href="${targetUrl}" style="border-color:var(--mint);color:var(--mint);font-weight:700;white-space:nowrap">
                    Nhận sản phẩm ➔
                  </a>
                ` : `
                  <a class="btn btn-primary btn-sm" href="#san-pham?id=${o.id}" style="font-size:12.5px;white-space:nowrap">
                    Thanh toán ngay
                  </a>
                `}
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  function renderAuthForm() {
    const title = $('#authTieuDe');
    const sub = $('#authPhu');
    const btn = $('#authNut');
    const switchTxt = $('#authDoi');
    const passField = $('#oMatKhau');
    const passInput = $('#a_mk');

    if (authMode === 'dangky') {
      title.textContent = 'Đăng ký';
      sub.textContent = 'Tạo tài khoản để mua và quản lý sản phẩm.';
      btn.textContent = 'Đăng ký';
      passField.hidden = false;
      passInput.required = true;
      switchTxt.innerHTML = 'Đã có tài khoản? <a id="linkDangNhap">Đăng nhập</a>';
    } else if (authMode === 'quen') {
      title.textContent = 'Quên mật khẩu';
      sub.textContent = 'Nhập email — chúng tôi sẽ gửi link đặt lại mật khẩu.';
      btn.textContent = 'Gửi email khôi phục';
      passField.hidden = true;
      passInput.required = false;
      switchTxt.innerHTML = '<a id="linkDangNhap">← Quay lại đăng nhập</a>';
    } else {
      title.textContent = 'Đăng nhập';
      sub.textContent = 'Chào mừng trở lại! Đăng nhập để tiếp tục.';
      btn.textContent = 'Đăng nhập';
      passField.hidden = false;
      passInput.required = true;
      switchTxt.innerHTML = 'Chưa có tài khoản? <a id="linkDangKy">Đăng ký ngay</a>';
    }
  }

  // Router handler
  function handleRoute() {
    const hash = window.location.hash || '';
    const homeView = $('#view-home');
    const detailView = $('#view-detail');
    const accountView = $('#view-account');

    if (hash.startsWith('#san-pham')) {
      homeView.hidden = true;
      detailView.hidden = false;
      accountView.hidden = true;

      const rawQuery = hash.replace('#san-pham', '').replace(/^\?/, '');
      const params = new URLSearchParams(rawQuery);

      // Auto unpack & save product payload if passed from Admin (file:// direct sync)
      const pdata = params.get('pdata');
      if (pdata) {
        try {
          const parsed = JSON.parse(decodeURIComponent(pdata));
          if (parsed && parsed.id && typeof DB !== 'undefined') {
            DB.updateOrAddProduct(parsed);
          }
        } catch (e) {
          console.warn('Error parsing pdata:', e);
        }
      }

      const productId = params.get('id') || 'app-2d-so-sanh-ca-the-gioi';
      renderDetailPage(productId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (hash.startsWith('#tai-khoan') || hash.startsWith('#dang-nhap')) {
      homeView.hidden = true;
      detailView.hidden = true;
      accountView.hidden = false;

      if (hash.startsWith('#dang-nhap')) {
        isLoggedIn = false;
      }
      renderAccountView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      homeView.hidden = false;
      detailView.hidden = true;
      accountView.hidden = true;

      document.title = 'AI Center Store — Kho App & Chatbot Tạo Video AI';
      renderHomeCatalog();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Checkout Modal Simulator
  let currentCheckoutProduct = null;
  let currentCheckoutTier = 'vinhvien';
  let currentCheckoutOrderId = '';
  let currentCheckoutAmount = 0;

  function openCheckoutModal(product, tier) {
    const modal = $('#checkoutModal');
    const isTrial = tier === 'trial';
    const amount = isTrial ? product.gia_trial : product.price;
    const tierName = isTrial ? 'Gói dùng thử 60 phút' : 'Bản quyền vĩnh viễn';

    currentCheckoutProduct = product;
    currentCheckoutTier = tier;
    currentCheckoutAmount = amount;
    currentCheckoutOrderId = 'AIC-' + Math.floor(100000 + Math.random() * 900000);

    $('#modalProductName').textContent = product.title;
    $('#modalProductTier').textContent = tierName;
    $('#modalAmount').textContent = vnd(amount);
    $('#modalOrderId').textContent = currentCheckoutOrderId;

    modal.classList.add('mo');
  }

  function closeCheckoutModal() {
    $('#checkoutModal').classList.remove('mo');
  }

  // Live Buyer Toast Simulation
  let buyerIndex = 0;
  function showNextBuyerToast() {
    const toast = $('#muaToast');
    if (!toast) return;

    const buyer = STORE_DATA.recentBuyers[buyerIndex];
    buyerIndex = (buyerIndex + 1) % STORE_DATA.recentBuyers.length;

    $('#mtTen').textContent = buyer.name;
    $('#mtSp').textContent = buyer.item;
    toast.classList.add('hien');

    setTimeout(() => {
      toast.classList.remove('hien');
    }, 4500);
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Nav San Pham click -> always go to index / home view
    $('#navSanPham')?.addEventListener('click', (e) => {
      if (window.location.hash) {
        e.preventDefault();
        window.location.hash = '';
        currentCategory = 'all';
        searchQuery = '';
        if ($('#timOng')) $('#timOng').value = '';
        handleRoute();
      }
    });

    // Search form
    $('#timForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      searchQuery = $('#timOng').value;
      renderHomeCatalog();
      document.getElementById('san-pham')?.scrollIntoView({ behavior: 'smooth' });
    });

    $('#timOng')?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderHomeCatalog();
    });

    // Raycast / Spotlight Keyboard Shortcut (Ctrl+K, Cmd+K, or /)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = $('#timOng');
        if (searchInput) {
          if (window.location.hash) {
            window.location.hash = '';
          }
          searchInput.focus();
          searchInput.select();
          searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });

    // Category button filters
    $$('.dmuc-o').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = btn.getAttribute('data-loc');
        if (cat) {
          e.preventDefault();
          currentCategory = (currentCategory === cat) ? 'all' : cat;
          renderHomeCatalog();
          document.getElementById('san-pham')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Modal Close
    $('#modalClose')?.addEventListener('click', closeCheckoutModal);
    $('#checkoutModal')?.addEventListener('click', (e) => {
      if (e.target === $('#checkoutModal')) closeCheckoutModal();
    });
    $('#mtDong')?.addEventListener('click', () => {
      $('#muaToast').classList.remove('hien');
    });

    // Simulate Pay Complete
    $('#btnConfirmPay')?.addEventListener('click', () => {
      const btn = $('#btnConfirmPay');
      btn.textContent = 'Đang kiểm tra chuyển khoản...';
      btn.disabled = true;

      setTimeout(async () => {
        if (currentCheckoutProduct && typeof DB !== 'undefined') {
          const user = STORE_DATA.currentUser || {};
          const order = {
            id: currentCheckoutProduct.id,
            productId: currentCheckoutProduct.id,
            title: currentCheckoutProduct.title,
            code: currentCheckoutOrderId || ('AIC-' + Math.floor(100000 + Math.random() * 900000)),
            amount: currentCheckoutAmount || currentCheckoutProduct.price,
            date: new Date().toLocaleDateString('vi-VN'),
            status: 'paid',
            statusText: 'Đã thanh toán',
            customerName: user.name || (user.email ? user.email.split('@')[0] : 'Khách hàng'),
            customerEmail: user.email || 'ganhteam321@gmail.com',
            userId: user.id || null,
            tier: currentCheckoutTier,
            accessUrl: `#san-pham?id=${encodeURIComponent(currentCheckoutProduct.id)}`
          };
          DB.addOrder(order);
        }

        alert('🎉 Thanh toán thành công! Hệ thống đã kích hoạt bản quyền và thêm vào lịch sử đơn hàng của bạn.');
        closeCheckoutModal();
        btn.textContent = 'Tôi đã chuyển khoản xong';
        btn.disabled = false;

        // If on account page, refresh orders
        if (window.location.hash.startsWith('#tai-khoan')) {
          renderAccountView();
        }
      }, 1200);
    });

    // Auth Form Interactions
    document.addEventListener('click', (e) => {
      if (e.target.id === 'linkDangKy') {
        authMode = 'dangky';
        renderAuthForm();
      } else if (e.target.id === 'linkDangNhap') {
        authMode = 'dangnhap';
        renderAuthForm();
      } else if (e.target.id === 'linkQuen') {
        e.preventDefault();
        authMode = 'quen';
        renderAuthForm();
      }
    });

    // Google Login button (Google OAuth 2.0 via Supabase)
    $('#nutGoogle')?.addEventListener('click', async () => {
      if (window.SupabaseAuth) {
        try {
          await window.SupabaseAuth.loginWithGoogle();
        } catch (err) {
          console.error('[Google Login] Lỗi:', err);
        }
      } else {
        isLoggedIn = true;
        renderAccountView();
      }
    });

    // Auth Form Submit
    $('#authForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = $('#a_email').value.trim() || 'ganhteam321@gmail.com';
      const pass = $('#a_mk')?.value || '123456';

      if (authMode === 'quen') {
        alert(`Đã gửi email khôi phục tới ${email}. Vui lòng kiểm tra hòm thư!`);
        authMode = 'dangnhap';
        renderAuthForm();
        return;
      }

      if (window.SupabaseAuth && window.SupabaseAuth.isConfigured()) {
        try {
          if (authMode === 'dangky') {
            await window.SupabaseAuth.signUp(email, pass);
            alert('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
          } else {
            await window.SupabaseAuth.loginWithPassword(email, pass);
          }
          const user = await window.SupabaseAuth.getCurrentUser();
          if (user) {
            STORE_DATA.currentUser = { ...STORE_DATA.currentUser, ...user };
            isLoggedIn = true;
          }
        } catch (err) {
          alert('Đăng nhập không thành công: ' + (err.message || 'Sai thông tin'));
          return;
        }
      } else {
        STORE_DATA.currentUser.email = email;
        isLoggedIn = true;
      }
      renderAccountView();
    });

    // Logout Button
    $('#nutThoat')?.addEventListener('click', async () => {
      if (window.SupabaseAuth) {
        await window.SupabaseAuth.logout();
      } else {
        isLoggedIn = false;
        authMode = 'dangnhap';
        renderAccountView();
      }
    });

    // Save Phone Button
    $('#bsNut')?.addEventListener('click', async () => {
      const sdt = $('#bs_sdt').value.trim();
      if (!sdt || sdt.length < 9) {
        alert('Vui lòng nhập số điện thoại hợp lệ (từ 10 số)');
        return;
      }
      if (window.SupabaseDB && STORE_DATA.currentUser && STORE_DATA.currentUser.id) {
        await window.SupabaseDB.updatePhone(STORE_DATA.currentUser.id, sdt);
      }
      STORE_DATA.currentUser.phone = sdt;
      $('#boSungSdt').hidden = true;
      alert('✓ Đã cập nhật số điện thoại thành công!');
    });

    // Change Password Form
    $('#doiMKForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const p1 = $('#bm1').value;
      if (!p1 || p1.length < 6) {
        alert('Mật khẩu mới phải từ 6 ký tự trở lên.');
        return;
      }
      alert('Đã đổi mật khẩu thành công!');
      $('#bm1').value = '';
    });

    // Hash change routing
    window.addEventListener('hashchange', handleRoute);

    // Live sync with Admin window if opened from Admin (critical for file:// mode)
    syncWithAdminOpener();

    // Listen for storage changes across tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'aic_products_v3' || e.key === 'aic_orders_v3' || e.key === 'aic_db_timestamp') {
        if (typeof DB !== 'undefined') DB.load();
        handleRoute();
      }
    });

    // Listen for custom in-tab DB changes
    window.addEventListener('aic_db_changed', () => {
      handleRoute();
    });

    // Listen for sync response from Admin window
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'AIC_SYNC_DATA') {
        if (Array.isArray(event.data.products) && typeof DB !== 'undefined') {
          DB.syncProducts(event.data.products);
          renderHomeCatalog();
          handleRoute();
        }
      }
    });
  }

  function syncWithAdminOpener() {
    try {
      if (window.opener && window.opener.DB && typeof window.opener.DB.getProducts === 'function') {
        const adminProducts = window.opener.DB.getProducts();
        if (Array.isArray(adminProducts) && adminProducts.length > 0 && typeof DB !== 'undefined') {
          DB.syncProducts(adminProducts);
          return true;
        }
      }
    } catch (e) {}

    if (window.opener) {
      try {
        window.opener.postMessage({ type: 'AIC_REQUEST_SYNC' }, '*');
      } catch (e) {}
    }
    return false;
  }

  // Initialization
  async function init() {
    syncWithAdminOpener();
    renderCourses();
    renderEcosystem();
    setupEventListeners();

    // Khởi tạo trạng thái đăng nhập từ Supabase
    if (window.SupabaseAuth) {
      try {
        const user = await window.SupabaseAuth.getCurrentUser();
        if (user) {
          isLoggedIn = true;
          STORE_DATA.currentUser = {
            ...STORE_DATA.currentUser,
            id: user.id,
            email: user.email,
            name: user.fullName,
            avatarUrl: user.avatarUrl,
            phone: user.phone || '',
            role: user.role
          };
          const navBtn = document.querySelector('.nav-btn');
          if (navBtn) {
            navBtn.textContent = '👤 ' + (user.fullName || user.email.split('@')[0]);
          }
        }
      } catch (e) {
        console.warn('[Supabase] Không thể đọc phiên đăng nhập:', e);
      }

      window.SupabaseAuth.onAuthStateChange(async (event, user) => {
        if (user) {
          isLoggedIn = true;
          STORE_DATA.currentUser = {
            ...STORE_DATA.currentUser,
            id: user.id,
            email: user.email,
            name: user.fullName,
            avatarUrl: user.avatarUrl,
            phone: user.phone || '',
            role: user.role
          };
        }
        if (window.location.hash.startsWith('#tai-khoan')) {
          renderAccountView();
        }
      });
    }

    handleRoute();

    // Start buyer toast loop every 12s
    setTimeout(showNextBuyerToast, 3000);
    setInterval(showNextBuyerToast, 12000);
  }

  document.addEventListener('DOMContentLoaded', init);
})();

