/**
 * AI Center Store - Admin Portal Controller
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
    return new Intl.NumberFormat('vi-VN').format(n || 0) + 'đ';
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  let currentTab = 'overview';
  let productFilterCat = 'all';
  let productSearchTerm = '';
  let orderFilterStatus = 'all';
  let editingProductId = null;

  // Show Toast
  function showToast(msg) {
    const toast = $('#adminToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // Live Clock in Topbar
  function startClock() {
    const clock = $('#topbarClock');
    if (!clock) return;
    function update() {
      const now = new Date();
      clock.textContent = now.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    update();
    setInterval(update, 60000);
  }

  // Tab Navigation Switcher
  function switchTab(tabId) {
    currentTab = tabId;
    $$('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
    });
    $$('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabId}`);
    });

    const pageTitles = {
      overview: 'Bảng Điều Khiển Tổng Quan',
      products: 'Quản Lý Sản Phẩm AI & Apps',
      orders: 'Quản Lý Đơn Hàng & Doanh Thu',
      users: 'Quản Lý Tài Khoản Khách Hàng',
      settings: 'Cài Đặt Cửa Hàng'
    };
    $('#pageTitle').textContent = pageTitles[tabId] || 'Quản Trị';

    if (tabId === 'overview') renderOverview();
    if (tabId === 'products') renderProductsTable();
    if (tabId === 'orders') renderOrdersTable();
    if (tabId === 'users') renderUsersTable();
    if (tabId === 'settings') renderSettings();
  }

  function formatOrderTitle(o) {
    if (!o) return 'Sản phẩm AI';
    if (o.title && !o.title.startsWith('app-') && !o.title.includes('-')) return o.title;
    const p = DB.getProductById(o.id || o.productId);
    if (p && p.title) return p.title;
    if (o.title) {
      return o.title
        .replace(/^app-/, 'App ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    }
    return 'Sản phẩm AI';
  }

  // 1. OVERVIEW TAB
  function renderOverview() {
    const kpi = DB.getKPIs();
    $('#kpiRevenue').textContent = vnd(kpi.totalRevenue);
    $('#kpiOrders').textContent = kpi.totalOrders;
    $('#kpiProducts').textContent = kpi.activeProducts;
    $('#kpiUsers').textContent = kpi.totalUsers;

    // Update badges in sidebar
    $('#badgeProductCount').textContent = kpi.activeProducts;
    $('#badgeOrderCount').textContent = kpi.totalOrders;
    $('#badgeUserCount').textContent = kpi.totalUsers;

    // Render Recent 5 Orders
    const orders = DB.getOrders().slice(0, 5);
    const tbody = $('#recentOrdersBody');
    if (tbody) {
      if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-caption);padding:24px">Chưa có đơn hàng nào</td></tr>`;
      } else {
        tbody.innerHTML = orders.map(o => `
          <tr>
            <td><code style="font-size:12px;color:var(--text-main);font-weight:700">${esc(o.code)}</code></td>
            <td><div class="table-text-cell" title="${esc(formatOrderTitle(o))}">${esc(formatOrderTitle(o))}</div></td>
            <td><b style="color:var(--mint);white-space:nowrap">${vnd(o.amount)}</b></td>
            <td><span style="white-space:nowrap;font-size:12.5px;color:var(--text-caption)">${esc(o.date)}</span></td>
            <td>
              <span class="status-pill ${o.status === 'paid' ? 'status-active' : (o.status === 'cancelled' ? 'status-locked' : 'status-pending')}">
                ${o.status === 'paid' ? '✓ Đã thanh toán' : (o.status === 'cancelled' ? '✕ Đã hủy' : '⏳ Chờ thanh toán')}
              </span>
            </td>
          </tr>
        `).join('');
      }
    }

    // Top Selling Products in Overview
    const topProducts = DB.getProducts().slice().sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 4);
    const topBody = $('#topProductsBody');
    if (topBody) {
      topBody.innerHTML = topProducts.map(p => `
        <div class="top-product-item">
          <div class="top-product-left">
            <img src="${generatePosterSVG(p)}" class="top-product-thumb" alt="${esc(p.title)}">
            <div style="min-width:0">
              <p class="top-product-title" title="${esc(p.title)}">${esc(p.title)}</p>
              <p class="top-product-meta">${esc(p.categoryName || p.category)}</p>
            </div>
          </div>
          <div class="top-product-right">
            <p style="font-weight:700;color:var(--mint);font-size:13.5px">${vnd(p.price)}</p>
            <p style="font-size:11.5px;color:var(--text-caption)">${p.sold || 0} đã bán</p>
          </div>
        </div>
      `).join('');
    }
  }

  // 2. PRODUCTS TAB
  function renderProductsTable() {
    let products = DB.getProducts();

    // Category Filter
    if (productFilterCat !== 'all') {
      products = products.filter(p => p.category === productFilterCat);
    }

    // Search Filter
    if (productSearchTerm.trim()) {
      const q = productSearchTerm.toLowerCase().trim();
      products = products.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.subtitle || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }

    const tbody = $('#productsTableBody');
    if (!tbody) return;

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-caption)">Không tìm thấy sản phẩm nào</td></tr>`;
      return;
    }

    const catLabels = { flow: 'Google Flow AI', chatbot: 'Chatbot AI', prompt: 'Mẫu Prompt' };

    tbody.innerHTML = products.map(p => {
      const posterSrc = generatePosterSVG(p);
      const isActive = p.active !== false;

      return `
        <tr>
          <td>
            <div class="product-cell">
              <img src="${posterSrc}" class="product-thumb-mini" alt="${esc(p.title)}">
              <div>
                <p class="product-name-txt">${esc(p.title)} ${p.version ? `<span style="font-size:10px;padding:1px 6px;border-radius:100px;border:1px solid var(--admin-border);color:var(--cyan)">${esc(p.version)}</span>` : ''}</p>
                <p class="product-sub-txt">${esc(p.subtitle || '')}</p>
              </div>
            </div>
          </td>
          <td>
            <span style="font-size:12px;font-weight:700;padding:3px 9px;border-radius:8px;background:rgba(255,255,255,0.05);color:var(--cyan)">
              ${catLabels[p.category] || p.category}
            </span>
          </td>
          <td>
            <b style="color:var(--mint)">${vnd(p.price)}</b>
            ${p.gia_trial > 0 ? `<p style="font-size:11px;color:var(--text-caption)">Thử: ${vnd(p.gia_trial)}</p>` : ''}
          </td>
          <td>
            <b style="color:var(--mint);font-size:14px">${p.sold || 0}</b>
            <span style="font-size:11px;color:var(--text-caption);display:block;margin-top:2px">
              Ảo: ${p.sold_fake !== undefined ? p.sold_fake : (p.sold || 0)} · Thật: ${p.sold_real || 0}
            </span>
          </td>
          <td>
            <span class="status-pill ${isActive ? 'status-active' : 'status-hidden'}">
              ${isActive ? '● Đang bán' : '○ Tạm ẩn'}
            </span>
          </td>
          <td>
            <div class="action-btn-group">
              <button class="btn-icon" title="Chỉnh sửa" onclick="window.AdminApp.openEditProductModal('${p.id}')">✏️</button>
              <button class="btn-icon" title="${isActive ? 'Tạm ẩn' : 'Hiện bán'}" onclick="window.AdminApp.toggleProduct('${p.id}')">${isActive ? '👁️' : '🔒'}</button>
              <a class="btn-icon" title="Xem trên cửa hàng" href="index.html#san-pham?id=${encodeURIComponent(p.id)}&pdata=${encodeURIComponent(JSON.stringify(p))}" target="_blank">🔗</a>
              <button class="btn-icon delete" title="Xóa sản phẩm" onclick="window.AdminApp.deleteProduct('${p.id}')">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 3. ORDERS TAB
  function renderOrdersTable() {
    let orders = DB.getOrders();

    if (orderFilterStatus !== 'all') {
      orders = orders.filter(o => o.status === orderFilterStatus);
    }

    const tbody = $('#ordersTableBody');
    if (!tbody) return;

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-caption)">Không có đơn hàng nào</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><code style="font-size:12px;color:var(--text-main);font-weight:700">${esc(o.code)}</code></td>
        <td><div class="table-text-cell" title="${esc(formatOrderTitle(o))}">${esc(formatOrderTitle(o))}</div></td>
        <td><b style="color:var(--mint);white-space:nowrap">${vnd(o.amount)}</b></td>
        <td><span style="white-space:nowrap;font-size:12.5px;color:var(--text-caption)">${esc(o.date)}</span></td>
        <td>
          <span class="status-pill ${o.status === 'paid' ? 'status-active' : (o.status === 'cancelled' ? 'status-locked' : 'status-pending')}">
            ${o.status === 'paid' ? '✓ Đã thanh toán' : (o.status === 'cancelled' ? '✕ Đã hủy' : '⏳ Chờ thanh toán')}
          </span>
        </td>
        <td>
          <select class="admin-select" style="font-size:12px;padding:5px 10px;border-radius:8px" onchange="window.AdminApp.changeOrderStatus('${o.code}', this.value)">
            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>⏳ Chờ thanh toán</option>
            <option value="paid" ${o.status === 'paid' ? 'selected' : ''}>✓ Đã thanh toán</option>
            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>✕ Đã hủy</option>
          </select>
        </td>
      </tr>
    `).join('');
  }

  // 4. USERS TAB
  function renderUsersTable() {
    const users = DB.getUsers();
    const tbody = $('#usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = users.map(u => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:34px;height:34px;border-radius:50%;background:rgba(34,197,94,0.15);color:var(--mint);display:flex;align-items:center;justify-content:center;font-weight:700">
              ${u.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <b>${esc(u.email)}</b>
              <p style="font-size:11.5px;color:var(--cyan)">${u.role === 'admin' ? '👑 Quản trị viên' : 'Khách hàng'}</p>
            </div>
          </div>
        </td>
        <td>${esc(u.phone || 'Chưa cập nhật')}</td>
        <td>${esc(u.createdAt)}</td>
        <td><b>${u.totalOrders || 0}</b></td>
        <td><b style="color:var(--mint)">${vnd(u.totalSpent || 0)}</b></td>
        <td>
          <span class="status-pill ${u.status === 'active' ? 'status-active' : 'status-locked'}">
            ${u.status === 'active' ? '● Hoạt động' : '🔒 Đã khóa'}
          </span>
        </td>
        <td>
          ${u.role !== 'admin' ? `
            <button class="btn-icon" title="${u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}" onclick="window.AdminApp.toggleUserLock('${u.email}')">
              ${u.status === 'active' ? '🔒' : '🔓'}
            </button>
          ` : '<span style="color:var(--text-caption);font-size:11px">Hệ thống</span>'}
        </td>
      </tr>
    `).join('');
  }

  // MODAL HANDLERS & THUMBNAIL MANAGEMENT
  // Nén ảnh tải từ máy tính để giảm dung lượng LocalStorage & tải siêu nhanh
  function compressImageFile(file, maxWidth = 640, quality = 0.85) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('Chưa chọn tập tin'));
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawResult = e.target.result;
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let w = img.width;
            let h = img.height;
            if (w > maxWidth) {
              h = Math.round((h * maxWidth) / w);
              w = maxWidth;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const mimeType = (file.type && file.type.includes('png')) ? 'image/png' : 'image/jpeg';
            const dataUrl = canvas.toDataURL(mimeType, quality);
            resolve(dataUrl);
          } catch (canvasErr) {
            resolve(rawResult);
          }
        };
        img.onerror = () => resolve(rawResult);
        img.src = rawResult;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  // Cập nhật khung xem trước Thumbnail tức thời
  function updateThumbnailPreview(imgUrl, fallbackProduct = null) {
    const previewImg = $('#p_thumb_preview');
    const placeholder = $('#p_thumb_placeholder');
    if (!previewImg || !placeholder) return;

    const url = (imgUrl && typeof imgUrl === 'string') ? imgUrl.trim() : '';
    if (url) {
      previewImg.src = url;
      previewImg.style.display = 'block';
      placeholder.style.display = 'none';
      previewImg.onerror = () => {
        previewImg.style.display = 'none';
        placeholder.style.display = 'flex';
      };
    } else {
      if (typeof generatePosterSVG === 'function') {
        const title = $('#p_title') ? $('#p_title').value.trim() : '';
        const cat = $('#p_category') ? $('#p_category').value : 'flow';
        const dummy = fallbackProduct || {
          title: title || 'Sản phẩm mới',
          subtitle: $('#p_subtitle') ? $('#p_subtitle').value.trim() : '',
          category: cat,
          categoryName: cat === 'chatbot' ? 'Chatbot AI' : (cat === 'prompt' ? 'Mẫu Prompt' : 'Google Flow AI')
        };
        const svgSrc = generatePosterSVG(dummy);
        if (svgSrc) {
          previewImg.src = svgSrc;
          previewImg.style.display = 'block';
          placeholder.style.display = 'none';
          return;
        }
      }
      previewImg.style.display = 'none';
      placeholder.style.display = 'flex';
    }
  }

  function openAddProductModal() {
    editingProductId = null;
    $('#productModalTitle').innerHTML = '<span>🚀</span> <span>Thêm sản phẩm mới</span>';
    const submitBtn = $('#btnSubmitProduct');
    if (submitBtn) {
      submitBtn.innerHTML = '<span>🚀</span> <span>Đăng sản phẩm ngay</span>';
    }
    $('#productForm').reset();
    $('#p_id').value = '';
    $('#p_image').value = '';
    if ($('#p_image_file')) $('#p_image_file').value = '';
    $('#p_version').value = 'v1.0';
    $('#p_format').value = '9:16';
    $('#p_category').value = 'flow';
    $('#p_price').value = '99000';
    $('#p_trial').value = '9000';
    $('#p_original').value = '150000';
    if ($('#p_sold_fake')) $('#p_sold_fake').value = '0';
    if ($('#p_sold_real')) $('#p_sold_real').value = '0';
    $('#p_active').checked = true;
    $('#p_premium').checked = true;
    $('#p_new').checked = true;

    if ($('#p_download_url')) $('#p_download_url').value = '';
    if ($('#p_secret_content')) $('#p_secret_content').value = '';

    updateThumbnailPreview('');
    $('#productModal').classList.add('open');
  }

  function openEditProductModal(id) {
    const product = DB.getProductById(id);
    if (!product) return;

    editingProductId = id;
    $('#productModalTitle').innerHTML = '<span>✏️</span> <span>Chỉnh sửa sản phẩm</span>';
    const submitBtn = $('#btnSubmitProduct');
    if (submitBtn) {
      submitBtn.innerHTML = '<span>✓</span> <span>Cập nhật sản phẩm</span>';
    }
    $('#p_id').value = product.id;
    $('#p_title').value = product.title || '';
    $('#p_version').value = product.version || 'v1.0';
    $('#p_category').value = product.category || 'flow';
    $('#p_format').value = product.format || '9:16';
    $('#p_price').value = product.price || 99000;
    $('#p_trial').value = product.gia_trial || 0;
    $('#p_original').value = product.original_price || 0;

    const realSold = DB.getProductRealSold(id);
    const fakeSold = (product.sold_fake !== undefined) ? product.sold_fake : (product.sold || 0);
    if ($('#p_sold_fake')) $('#p_sold_fake').value = fakeSold;
    if ($('#p_sold_real')) $('#p_sold_real').value = realSold;

    $('#p_video').value = product.demo_video_id || '';
    $('#p_subtitle').value = product.subtitle || '';
    $('#p_desc').value = product.description || '';
    if ($('#p_download_url')) $('#p_download_url').value = product.download_url || product.downloadUrl || '';
    if ($('#p_secret_content')) $('#p_secret_content').value = product.secret_content || product.secretContent || '';
    $('#p_active').checked = product.active !== false;
    $('#p_premium').checked = product.isPremium !== false;
    $('#p_new').checked = product.isNew === true;

    const imgVal = product.image || (product.posterTheme && product.posterTheme.image) || '';
    $('#p_image').value = imgVal;
    if ($('#p_image_file')) $('#p_image_file').value = '';
    updateThumbnailPreview(imgVal, product);

    $('#productModal').classList.add('open');
  }

  function closeProductModal() {
    $('#productModal').classList.remove('open');
  }

  // Save product from form
  function saveProductForm(e) {
    e.preventDefault();

    const categoryNames = { flow: 'Google Flow AI', chatbot: 'Chatbot AI', prompt: 'Mẫu Prompt' };
    const cat = $('#p_category').value;
    const imgUrl = $('#p_image') ? $('#p_image').value.trim() : '';

    const soldFake = Math.max(0, parseInt($('#p_sold_fake')?.value, 10) || 0);
    const soldReal = editingProductId ? DB.getProductRealSold(editingProductId) : 0;

    const productData = {
      title: $('#p_title').value.trim(),
      version: $('#p_version').value.trim(),
      category: cat,
      categoryName: categoryNames[cat] || 'Google Flow AI',
      format: $('#p_format').value,
      image: imgUrl,
      price: Number($('#p_price').value) || 0,
      original_price: Number($('#p_original').value) || 0,
      gia_trial: Number($('#p_trial').value) || 0,
      sold_fake: soldFake,
      sold_real: soldReal,
      sold: soldFake + soldReal,
      demo_video_id: (typeof extractYouTubeId === 'function' ? extractYouTubeId($('#p_video').value) : $('#p_video').value.trim()) || 'aoG_YF3C_bM',
      subtitle: $('#p_subtitle').value.trim(),
      description: $('#p_desc').value.trim(),
      download_url: $('#p_download_url') ? $('#p_download_url').value.trim() : '',
      secret_content: $('#p_secret_content') ? $('#p_secret_content').value.trim() : '',
      active: $('#p_active').checked,
      isPremium: $('#p_premium').checked,
      isNew: $('#p_new').checked
    };

    if (editingProductId) {
      const existing = DB.getProductById(editingProductId);
      productData.posterTheme = {
        ...(existing && existing.posterTheme ? existing.posterTheme : {}),
        image: imgUrl
      };
      DB.updateProduct(editingProductId, productData);
      showToast('✓ Đã cập nhật sản phẩm thành công!');
    } else {
      const slug = productData.title
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      productData.id = slug || ('app-' + Date.now());
      productData.posterTheme = {
        bgGradient: cat === 'chatbot' ? 'from-orange-950-to-amber-950' : (cat === 'prompt' ? 'from-amber-950-to-yellow-950' : 'from-amber-950-to-stone-950'),
        color: cat === 'chatbot' ? '#EA580C' : '#D97706',
        badge: cat === 'chatbot' ? 'Chatbot AI' : (cat === 'prompt' ? 'Prompt AI' : 'Veo3 AI'),
        image: imgUrl
      };
      DB.addProduct(productData);
      showToast('🚀 Đã đăng sản phẩm mới! Bấm 🔗 để xem trên cửa hàng →');
    }

    closeProductModal();
    renderProductsTable();
    renderOverview();
  }

  // Settings & Author & Payment Management
  function renderSettings() {
    const author = DB.getAuthor();
    if (author) {
      if ($('#author_name')) $('#author_name').value = author.name || '';
      if ($('#author_title')) $('#author_title').value = author.title || '';
      if ($('#author_phone')) $('#author_phone').value = author.phone || '';
      if ($('#author_zalo')) $('#author_zalo').value = author.zalo || '';
      if ($('#author_facebook')) $('#author_facebook').value = author.facebook_url || '';
      if ($('#author_youtube')) $('#author_youtube').value = author.youtube_url || '';
      if ($('#author_tiktok')) $('#author_tiktok').value = author.tiktok_url || '';
      if ($('#author_bio')) $('#author_bio').value = author.bio || '';
    }

    // Payment & SePay configuration
    const settings = (typeof DB !== 'undefined' && DB.getSettings) ? DB.getSettings() : {};
    const payment = settings.payment || {
      bankName: 'MBBank',
      bankAccount: '0996358358',
      accountName: 'NGUYEN XUAN LINH',
      qrPrefix: 'SEVQR',
      sepayApiKey: ''
    };

    if ($('#cfg_bank_name')) $('#cfg_bank_name').value = payment.bankName || 'MBBank';
    if ($('#cfg_bank_acc')) $('#cfg_bank_acc').value = payment.bankAccount || '0996358358';
    if ($('#cfg_acc_name')) $('#cfg_acc_name').value = payment.accountName || 'NGUYEN XUAN LINH';
    if ($('#cfg_qr_prefix')) $('#cfg_qr_prefix').value = payment.qrPrefix || 'SEVQR';
    if ($('#cfg_sepay_key')) $('#cfg_sepay_key').value = payment.sepayApiKey || '';

    // Webhook URL display
    const webhookEl = $('#cfg_webhook_url');
    if (webhookEl) {
      const origin = window.location.origin;
      const cleanOrigin = origin.startsWith('file:') ? 'https://ai-center-store-omega.vercel.app' : origin;
      webhookEl.textContent = cleanOrigin + '/api/sepay-webhook';
    }
  }

  function saveAuthorForm(e) {
    if (e && e.preventDefault) e.preventDefault();
    const current = DB.getAuthor() || {};
    const updated = {
      ...current,
      name: $('#author_name')?.value.trim() || 'Xuân Linh',
      title: $('#author_title')?.value.trim() || 'Admin & Sáng lập viên',
      phone: $('#author_phone')?.value.trim() || '0996 358 358',
      zalo: $('#author_zalo')?.value.trim() || '0996358358',
      facebook_url: $('#author_facebook')?.value.trim() || 'https://www.facebook.com',
      youtube_url: $('#author_youtube')?.value.trim() || 'https://www.youtube.com',
      tiktok_url: $('#author_tiktok')?.value.trim() || 'https://www.tiktok.com',
      bio: $('#author_bio')?.value.trim() || ''
    };
    DB.saveAuthor(updated);
    showToast('💾 Đã lưu thông tin Tác giả và đồng bộ Cloud!');
  }

  function savePaymentConfigForm(e) {
    if (e && e.preventDefault) e.preventDefault();
    const settings = (typeof DB !== 'undefined' && DB.getSettings) ? DB.getSettings() : {};
    const payment = {
      bankName: $('#cfg_bank_name')?.value || 'MBBank',
      bankAccount: $('#cfg_bank_acc')?.value.trim() || '0996358358',
      accountName: $('#cfg_acc_name')?.value.trim().toUpperCase() || 'NGUYEN XUAN LINH',
      qrPrefix: $('#cfg_qr_prefix')?.value.trim().toUpperCase() || 'SEVQR',
      sepayApiKey: $('#cfg_sepay_key')?.value.trim() || ''
    };
    settings.payment = payment;
    DB.saveSettings(settings);
    if (window.SupabaseDB && window.SupabaseDB.saveSettings) {
      window.SupabaseDB.saveSettings(settings).catch(() => {});
    }
    showToast('💾 Đã lưu cấu hình Ngân hàng & SePay Webhook!');
  }

  // Global methods bound to window.AdminApp for inline event handlers
  window.AdminApp = {
    switchTab,
    openAddProductModal,
    openEditProductModal,
    toggleProduct(id) {
      const active = DB.toggleProductActive(id);
      showToast(active ? '✓ Sản phẩm đã được hiển thị trên cửa hàng' : '○ Sản phẩm đã tạm ẩn khỏi cửa hàng');
      renderProductsTable();
      renderOverview();
    },
    deleteProduct(id) {
      if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
        DB.deleteProduct(id);
        showToast('🗑️ Đã xóa sản phẩm khỏi hệ thống');
        renderProductsTable();
        renderOverview();
      }
    },
    changeOrderStatus(code, status) {
      DB.updateOrderStatus(code, status);
      showToast(`✓ Đã cập nhật trạng thái đơn ${code}`);
      renderOrdersTable();
      renderOverview();
    },
    toggleUserLock(email) {
      const status = DB.toggleUserLock(email);
      showToast(status === 'locked' ? `🔒 Đã khóa tài khoản ${email}` : `🔓 Đã mở khóa tài khoản ${email}`);
      renderUsersTable();
    }
  };

  // Setup Event Listeners
  function setupEventListeners() {
    // Navigation items
    $$('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.getAttribute('data-tab');
        if (tab) switchTab(tab);
      });
    });

    // Quick add button in topbar
    $('#btnQuickAdd')?.addEventListener('click', openAddProductModal);
    $('#btnAddProduct')?.addEventListener('click', openAddProductModal);

    // Modal close
    $('#modalCloseBtn')?.addEventListener('click', closeProductModal);
    $('#btnCancelProduct')?.addEventListener('click', closeProductModal);
    $('#productModal')?.addEventListener('click', (e) => {
      if (e.target === $('#productModal')) closeProductModal();
    });

    // Product form submit
    $('#productForm')?.addEventListener('submit', saveProductForm);

    // Thumbnail input URL change / paste
    $('#p_image')?.addEventListener('input', (e) => {
      updateThumbnailPreview(e.target.value);
    });

    // Click button "Tải ảnh từ máy tính" -> kích hoạt file input
    $('#btnUploadThumb')?.addEventListener('click', (e) => {
      e.preventDefault();
      const fileInput = $('#p_image_file');
      if (fileInput) {
        fileInput.value = '';
        fileInput.click();
      }
    });

    // Upload thumbnail file from local machine with auto canvas compression
    $('#p_image_file')?.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        showToast('⏳ Đang xử lý & nén ảnh...');
        const compressedBase64 = await compressImageFile(file, 640, 0.85);
        if ($('#p_image')) {
          $('#p_image').value = compressedBase64;
        }
        updateThumbnailPreview(compressedBase64);
        showToast('✓ Đã nạp ảnh thành công! Bấm "Cập nhật sản phẩm" để lưu lại.');
      } catch (err) {
        console.error('Lỗi tải ảnh:', err);
        try {
          const reader = new FileReader();
          reader.onload = (re) => {
            const raw = re.target.result;
            if ($('#p_image')) $('#p_image').value = raw;
            updateThumbnailPreview(raw);
            showToast('✓ Đã nạp ảnh thành công! Bấm "Cập nhật sản phẩm" để lưu lại.');
          };
          reader.readAsDataURL(file);
        } catch (readErr) {
          showToast('⚠️ Không thể tải ảnh: ' + (err.message || 'Lỗi không xác định'));
        }
      }
    });

    // Clear custom thumbnail to revert to SVG poster
    $('#btnClearThumb')?.addEventListener('click', () => {
      if ($('#p_image')) $('#p_image').value = '';
      if ($('#p_image_file')) $('#p_image_file').value = '';
      updateThumbnailPreview('');
      showToast('🔄 Đã chuyển về chế độ Poster SVG tự động');
    });

    // Dynamic poster preview update when title or category changes if no custom image
    $('#p_title')?.addEventListener('input', () => {
      if (!$('#p_image')?.value.trim()) {
        updateThumbnailPreview('');
      }
    });
    $('#p_category')?.addEventListener('change', () => {
      if (!$('#p_image')?.value.trim()) {
        updateThumbnailPreview('');
      }
    });

    // Author form submit
    $('#authorForm')?.addEventListener('submit', saveAuthorForm);

    // Payment & SePay config submit
    $('#paymentConfigForm')?.addEventListener('submit', savePaymentConfigForm);

    // Copy Webhook URL button
    $('#btnCopyWebhookUrl')?.addEventListener('click', () => {
      const url = $('#cfg_webhook_url')?.textContent || '';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          showToast('✓ Đã sao chép Webhook URL!');
        }).catch(() => {
          showToast('URL: ' + url);
        });
      } else {
        showToast('URL: ' + url);
      }
    });

    // Auto extract clean YouTube ID from paste or input
    $('#p_video')?.addEventListener('input', () => {
      const val = $('#p_video').value.trim();
      if (typeof extractYouTubeId === 'function' && (val.includes('<iframe') || val.includes('youtube') || val.includes('youtu.be'))) {
        const extracted = extractYouTubeId(val);
        if (extracted && extracted !== val) {
          $('#p_video').value = extracted;
          showToast('✓ Đã tự động lọc mã YouTube ID: ' + extracted);
        }
      }
    });

    // Search and filter in products tab
    $('#productSearch')?.addEventListener('input', (e) => {
      productSearchTerm = e.target.value;
      renderProductsTable();
    });
    $('#productCategoryFilter')?.addEventListener('change', (e) => {
      productFilterCat = e.target.value;
      renderProductsTable();
    });

    // Order status filter
    $('#orderStatusFilter')?.addEventListener('change', (e) => {
      orderFilterStatus = e.target.value;
      renderOrdersTable();
    });

    // Reset factory data button
    $('#btnResetData')?.addEventListener('click', () => {
      if (confirm('Khôi phục toàn bộ sản phẩm và đơn hàng về dữ liệu gốc ban đầu?')) {
        DB.resetData();
        showToast('🔄 Đã khôi phục dữ liệu gốc!');
        renderOverview();
        renderProductsTable();
        renderOrdersTable();
        renderUsersTable();
        renderSettings();
      }
    });

    // Mobile menu toggle
    $('#mobileMenuBtn')?.addEventListener('click', () => {
      $('.admin-sidebar')?.classList.toggle('open');
    });

    // Listen for storage changes across tabs (e.g. user ordered something in store tab)
    window.addEventListener('storage', (e) => {
      if (e.key === 'aic_orders_v3' || e.key === 'aic_products_v3' || e.key === 'aic_author_v3' || e.key === 'aic_db_timestamp') {
        DB.load();
        if (currentTab === 'overview') renderOverview();
        else if (currentTab === 'products') renderProductsTable();
        else if (currentTab === 'orders') renderOrdersTable();
        else if (currentTab === 'users') renderUsersTable();
        else if (currentTab === 'settings') renderSettings();
      }
    });

    // Listen for custom in-tab DB changes
    window.addEventListener('aic_db_changed', () => {
      if (currentTab === 'overview') renderOverview();
      else if (currentTab === 'products') renderProductsTable();
      else if (currentTab === 'orders') renderOrdersTable();
      else if (currentTab === 'users') renderUsersTable();
      else if (currentTab === 'settings') renderSettings();
    });

    // Handle sync requests from store page (critical for file:// mode)
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'AIC_REQUEST_SYNC') {
        try {
          event.source.postMessage({
            type: 'AIC_SYNC_DATA',
            products: DB.getProducts(),
            orders: DB.getOrders()
          }, '*');
        } catch (e) {}
      }
    });
  }

  // Kiểm tra quyền Admin từ Supabase (Tách biệt hoàn toàn cổng Admin)
  async function checkAdminAccess() {
    const gate = document.getElementById('adminLoginGate');
    const errBox = document.getElementById('adminLoginError');

    // Nút đăng nhập Google trên cổng Admin
    const btnLogin = document.getElementById('btnAdminGoogleLogin');
    if (btnLogin && !btnLogin.dataset.bound) {
      btnLogin.dataset.bound = 'true';
      btnLogin.addEventListener('click', async () => {
        if (window.SupabaseAuth) {
          try {
            await window.SupabaseAuth.loginWithGoogle();
          } catch(e) {
            console.error('[Admin Login]', e);
          }
        }
      });
    }

    // Nút đăng xuất Quản trị
    const btnLogout = document.getElementById('btnAdminLogout');
    if (btnLogout && !btnLogout.dataset.bound) {
      btnLogout.dataset.bound = 'true';
      btnLogout.addEventListener('click', async () => {
        if (window.SupabaseAuth) {
          await window.SupabaseAuth.logout();
        } else {
          localStorage.removeItem('aic_demo_logged_in');
          window.location.reload();
        }
      });
    }

    if (window.SupabaseAuth && window.SupabaseAuth.isConfigured()) {
      const user = await window.SupabaseAuth.getCurrentUser();
      if (!user) {
        if (gate) gate.style.display = 'flex';
        return false;
      }
      const isAdmin = user.role === 'admin' || user.email === (window.SupabaseAuth.adminEmail || 'ganhteam321@gmail.com');
      if (!isAdmin) {
        if (gate) {
          gate.style.display = 'flex';
          if (errBox) {
            errBox.style.display = 'block';
            errBox.innerHTML = `⛔ <b>Từ chối truy cập:</b> Tài khoản <b>${user.email}</b> không có quyền Quản trị.<br><a href="#" id="linkSwitchAdmin" style="color:#60a5fa;text-decoration:underline;display:inline-block;margin-top:6px">Đăng xuất để đổi tài khoản khác</a>`;
            const switchLink = document.getElementById('linkSwitchAdmin');
            if (switchLink) {
              switchLink.addEventListener('click', async (e) => {
                e.preventDefault();
                await window.SupabaseAuth.logout();
              });
            }
          }
        }
        return false;
      }

      // Đã xác thực thành công là Admin
      if (gate) gate.style.display = 'none';
      const nameEl = document.querySelector('.user-info .name');
      const roleEl = document.querySelector('.user-info .role');
      if (nameEl) nameEl.textContent = user.fullName || 'Admin Manager';
      if (roleEl) roleEl.textContent = user.email;
    } else {
      if (gate) gate.style.display = 'none';
    }
    return true;
  }

  // Init
  document.addEventListener('DOMContentLoaded', async () => {
    await checkAdminAccess();
    DB.init();
    startClock();
    setupEventListeners();
    switchTab('overview');

    if (window.location.protocol === 'file:') {
      const bar = $('#adminFileModeBar');
      if (bar) bar.style.display = 'flex';
    }
  });
})();
