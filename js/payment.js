/**
 * AI Center Store - Automated VietQR & SePay Payment Module
 * Version: 1.0.0
 * 
 * Flow:
 * 1. Khách bấm Mua -> Tạo Order (Database status='pending') & hiển thị VietQR
 * 2. Nội dung chuyển khoản bắt buộc: SEVQR <MÃ_ĐƠN> (ví dụ SEVQR DH8899)
 * 3. Lắng nghe Realtime qua Supabase Realtime (WebSocket) + Smart Polling
 * 4. Nhận Webhook từ SePay -> Đổi status='paid' -> Mở khóa link tải & Prompt bí mật ngay lập tức
 */

(function () {
  'use strict';

  // Cấu hình thanh toán mặc định (đồng bộ từ tài khoản SePay chính xác)
  const DEFAULT_PAYMENT_CONFIG = {
    bankName: 'VietinBank', // VietinBank (không hiển thị mã ICB)
    bankAccount: '105870396069',
    accountName: 'NGUYEN VAN PHU',
    qrPrefix: 'SEVQR', // Bắt buộc cho SePay
    sepayApiKey: '', // Khóa bảo mật Webhook SePay (nếu cấu hình)
    qrTemplate: 'compact',
    orderTimeoutMinutes: 15
  };

  // Chuẩn hóa tên ngân hàng hiển thị thân thiện (loại bỏ hoàn toàn mã ICB, CTG...)
  const BANK_DISPLAY_NAMES = {
    'ICB': 'VietinBank',
    'CTG': 'VietinBank',
    'VIETINBANK': 'VietinBank',
    'MB': 'MBBank',
    'MBBANK': 'MBBank',
    'VCB': 'Vietcombank',
    'VIETCOMBANK': 'Vietcombank',
    'TCB': 'Techcombank',
    'TECHCOMBANK': 'Techcombank',
    'TPB': 'TPBank',
    'TPBANK': 'TPBank',
    'VPB': 'VPBank',
    'VPBANK': 'VPBank',
    'ACB': 'ACB',
    'BIDV': 'BIDV',
    'VIB': 'VIB'
  };

  function formatBankName(bank) {
    if (!bank) return 'VietinBank';
    const key = String(bank).trim().toUpperCase();
    return BANK_DISPLAY_NAMES[key] || bank;
  }

  // Trạng thái phiên thanh toán hiện tại
  let currentSession = {
    order: null,
    product: null,
    tier: 'vinhvien',
    amount: 0,
    orderCode: '',
    transferContent: '',
    realtimeChannel: null,
    pollingTimer: null,
    countdownTimer: null,
    remainingSeconds: 15 * 60,
    isCompleted: false
  };

  function $(id) {
    return document.getElementById(id);
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

  // Lấy thông tin cấu hình ngân hàng hiện tại (kết hợp từ DB nếu có)
  function getConfig() {
    let custom = {};
    try {
      if (typeof DB !== 'undefined' && DB.getSettings) {
        const s = DB.getSettings();
        if (s && s.payment) custom = s.payment;
      }
    } catch (e) {}

    const cfg = {
      ...DEFAULT_PAYMENT_CONFIG,
      ...custom
    };

    // Chuẩn hóa nếu cấu hình lưu mã cũ ICB / CTG
    if (!cfg.bankName || cfg.bankName === 'ICB' || cfg.bankName === 'CTG') {
      cfg.bankName = 'VietinBank';
    }
    return cfg;
  }

  // Sinh mã đơn hàng chuẩn format: DH + 6 chữ số (ví dụ: DH824491) - Chuẩn 100% cho hệ thống SePay nhận diện
  function generateOrderCode() {
    const num = Math.floor(100000 + Math.random() * 900000); // 6 chữ số ngẫu nhiên
    return 'DH' + num;
  }

  // Tạo URL ảnh VietQR chuẩn theo mã nhúng SePay tài khoản VietinBank
  function getVietQRUrl(bank, account, amount, content, accountName) {
    const rawBank = bank || 'VietinBank';
    const cleanBank = (rawBank.toUpperCase() === 'ICB' || rawBank.toUpperCase() === 'CTG') ? 'VietinBank' : rawBank;
    const cleanAcc = account || '105870396069';
    const holder = encodeURIComponent(accountName || 'NGUYEN VAN PHU');
    const encodedContent = encodeURIComponent(content || '');
    return `https://vietqr.app/img?bank=${encodeURIComponent(cleanBank)}&acc=${encodeURIComponent(cleanAcc)}&template=compact&amount=${amount}&des=${encodedContent}&showinfo=true&holder=${holder}`;
  }

  // Fallback sang SePay Gateway nếu cần
  function getVietQRFallbackUrl(bank, account, amount, content, accountName) {
    const rawBank = bank || 'VietinBank';
    const cleanBank = (rawBank.toUpperCase() === 'ICB' || rawBank.toUpperCase() === 'CTG') ? 'VietinBank' : rawBank;
    const cleanAcc = account || '105870396069';
    const encodedContent = encodeURIComponent(content || '');
    return `https://qr.sepay.vn/img?bank=${encodeURIComponent(cleanBank)}&acc=${encodeURIComponent(cleanAcc)}&template=compact&amount=${amount}&des=${encodedContent}`;
  }

  // Hiệu ứng Toast thông báo nhanh
  function showPaymentToast(msg, isSuccess) {
    let toast = $('paymentToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'paymentToast';
      toast.className = 'payment-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = isSuccess ? 'rgba(16, 185, 129, 0.95)' : 'rgba(30, 41, 59, 0.95)';
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Sao chép nội dung vào Clipboard
  async function copyToClipboard(text, successMsg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showPaymentToast(successMsg || '✓ Đã sao chép vào bộ nhớ tạm', true);
    } catch (e) {
      showPaymentToast('Sao chép: ' + text);
    }
  }

  // Khởi tạo Modal Thanh toán trong DOM nếu chưa có
  function injectModalHtml() {
    if ($('paymentModal')) return;

    const modalDiv = document.createElement('div');
    modalDiv.id = 'paymentModal';
    modalDiv.className = 'payment-modal-overlay';
    modalDiv.innerHTML = `
      <div class="payment-modal-box">
        <!-- Nút đóng -->
        <button class="payment-modal-close" id="pmCloseBtn" type="button" aria-label="Đóng">✕</button>

        <!-- Trạng thái 1: Đang chờ thanh toán (Pending) -->
        <div id="pmStatePending">
          <div class="pm-header">
            <span class="pm-badge-live">
              <span class="pm-pulse-dot"></span>
              CỔNG THANH TOÁN TỰ ĐỘNG 24/7
            </span>
            <h3 class="pm-title" id="pmProductTitle">Tên công cụ AI</h3>
            <p class="pm-sub" id="pmProductTier">Bản quyền trọn đời</p>
          </div>

          <!-- Đồng hồ đếm ngược -->
          <div class="pm-countdown-bar">
            <span>Đơn hàng hết hạn sau:</span>
            <strong id="pmTimerText">15:00</strong>
          </div>

          <!-- Khung chứa mã QR VietQR -->
          <div class="pm-qr-card">
            <div class="pm-qr-wrapper">
              <img id="pmQrImg" src="" alt="Mã VietQR Thanh Toán" class="pm-qr-image" />
              <div class="pm-qr-overlay-loading" id="pmQrLoading" style="display:none">
                <div class="pm-spinner"></div>
                <p>Đang tạo mã QR...</p>
              </div>
            </div>
            <p class="pm-qr-tip">
              <span>📱</span> Mở app ngân hàng bất kỳ để quét
            </p>
          </div>

          <!-- Bảng thông tin thanh toán & nút 1-click copy -->
          <div class="pm-info-table">
            <div class="pm-info-row">
              <span class="pm-info-label">Ngân hàng:</span>
              <span class="pm-info-value" id="pmBankName">VietinBank</span>
            </div>
            <div class="pm-info-row">
              <span class="pm-info-label">Số tài khoản:</span>
              <div class="pm-info-copy-group">
                <b class="pm-info-highlight" id="pmBankAccount">105870396069</b>
                <button type="button" class="pm-btn-copy" id="pmCopyAccBtn" title="Sao chép số tài khoản">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  <span>Chép</span>
                </button>
              </div>
            </div>
            <div class="pm-info-row">
              <span class="pm-info-label">Chủ tài khoản:</span>
              <span class="pm-info-value" id="pmAccountName">NGUYEN VAN PHU</span>
            </div>
            <div class="pm-info-row">
              <span class="pm-info-label">Số tiền:</span>
              <div class="pm-info-copy-group">
                <b class="pm-info-amount" id="pmAmount">99.000đ</b>
                <button type="button" class="pm-btn-copy" id="pmCopyAmountBtn" title="Sao chép số tiền">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  <span>Chép</span>
                </button>
              </div>
            </div>
            <div class="pm-info-row pm-row-highlight">
              <span class="pm-info-label">Nội dung CK:</span>
              <div class="pm-info-copy-group">
                <b class="pm-info-code" id="pmTransferContent">SEVQR DH8899</b>
                <button type="button" class="pm-btn-copy pm-btn-copy-main" id="pmCopyContentBtn" title="Sao chép nội dung chuyển khoản">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  <span>Sao chép</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Cảnh báo quan trọng -->
          <div class="pm-alert-box">
            <span class="pm-alert-icon">⚠️</span>
            <p>
              Vui lòng <b>giữ nguyên nội dung chuyển khoản</b> để SePay nhận diện và tự động mở khóa ngay trong 3 giây.
            </p>
          </div>

          <!-- Khối cảnh báo chuyển thiếu tiền (Ẩn mặc định, hiện khi phát hiện thiếu tiền) -->
          <div class="pm-underpaid-box hidden" id="pmUnderpaidBox">
            <span class="pm-underpaid-icon">⚠️</span>
            <div>
              <div class="pm-underpaid-title">Hệ thống phát hiện chuyển thiếu tiền!</div>
              <p class="pm-underpaid-desc" id="pmUnderpaidText">
                Bạn đã chuyển thiếu tiền. Vui lòng chuyển tiếp số tiền còn thiếu với cùng nội dung chuyển khoản để tự động mở khóa.
              </p>
            </div>
          </div>

          <!-- Nút kiểm tra thủ công -->
          <div class="pm-actions">
            <button class="pm-btn-check" id="pmBtnManualCheck" type="button">
              🔄 Tôi đã chuyển khoản (Kiểm tra ngay)
            </button>
          </div>
        </div>

        <!-- Trạng thái 2: Thanh toán thành công (Completed / Success) -->
        <div id="pmStateSuccess" style="display:none">
          <div class="pm-success-card">
            <div class="pm-success-icon-wrap">
              <div class="pm-success-icon">✓</div>
            </div>
            <h3 class="pm-success-title">Thanh Toán Thành Công! 🎉</h3>
            <p class="pm-success-desc">
              Hệ thống đã nhận được tiền và kích hoạt quyền sở hữu cho tài khoản của bạn.
            </p>

            <div class="pm-unlocked-box">
              <div class="pm-unlocked-header">
                <span class="pm-unlocked-tag">ĐÃ MỞ KHÓA BẢN QUYỀN</span>
                <span id="pmSuccessProductTitle" style="font-weight:700">Tên App AI</span>
              </div>

              <!-- Hộp chứa Prompt Bí Mật (Nếu sản phẩm có prompt) -->
              <div id="pmSecretPromptBlock" class="pm-secret-prompt-block" style="display:none">
                <div class="pm-secret-header">
                  <span>🔑 Câu lệnh Prompt / Hướng dẫn bí mật:</span>
                  <button type="button" class="pm-btn-copy-secret" id="pmCopySecretPromptBtn">
                    📋 Sao chép Prompt
                  </button>
                </div>
                <pre class="pm-secret-content" id="pmSecretPromptContent"></pre>
              </div>

              <!-- Nút tải Tool / File trực tiếp -->
              <div class="pm-download-actions">
                <a id="pmDownloadBtn" href="#" target="_blank" rel="noopener" class="pm-btn-download">
                  <span>📥 TẢI TOOL / SOURCE CODE VỀ MÁY</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </a>
              </div>
            </div>

            <div class="pm-success-footer-actions">
              <a class="pm-btn-link" href="#tai-khoan" id="pmGoAccountBtn">
                📦 Xem trong Lịch sử đơn hàng
              </a>
              <button class="pm-btn-close-final" id="pmBtnDone" type="button">
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(modalDiv);
    bindModalEvents();
  }

  // Gắn các sự kiện click, copy, close cho modal
  function bindModalEvents() {
    $('pmCloseBtn')?.addEventListener('click', closePaymentModal);
    $('pmBtnDone')?.addEventListener('click', closePaymentModal);

    $('paymentModal')?.addEventListener('click', (e) => {
      if (e.target === $('paymentModal')) {
        closePaymentModal();
      }
    });

    // Các nút copy
    $('pmCopyAccBtn')?.addEventListener('click', () => {
      const cfg = getConfig();
      copyToClipboard(cfg.bankAccount, '✓ Đã sao chép Số tài khoản');
    });

    $('pmCopyAmountBtn')?.addEventListener('click', () => {
      copyToClipboard(String(currentSession.amount), '✓ Đã sao chép Số tiền');
    });

    $('pmCopyContentBtn')?.addEventListener('click', () => {
      copyToClipboard(currentSession.transferContent, '✓ Đã sao chép Nội dung chuyển khoản chuẩn');
    });

    // Copy Prompt bí mật
    $('pmCopySecretPromptBtn')?.addEventListener('click', () => {
      const text = $('pmSecretPromptContent')?.textContent || '';
      copyToClipboard(text, '✓ Đã sao chép Prompt thành công!');
    });

    // Nút kiểm tra thủ công
    $('pmBtnManualCheck')?.addEventListener('click', async () => {
      const btn = $('pmBtnManualCheck');
      btn.textContent = '⏳ Đang kiểm tra...';
      btn.disabled = true;
      await checkOrderStatusOnce();
      setTimeout(() => {
        btn.textContent = '🔄 Tôi đã chuyển khoản (Kiểm tra ngay)';
        btn.disabled = false;
      }, 1500);
    });

    $('pmGoAccountBtn')?.addEventListener('click', () => {
      closePaymentModal();
      window.location.hash = '#tai-khoan';
      if (typeof handleRoute === 'function') handleRoute();
    });
  }

  const SESSION_STORAGE_KEY = 'aic_active_payment_session';

  // Lấy email và ID người dùng hiện tại (hỗ trợ Supabase Auth & LocalStorage)
  async function getCurrentUserEmailAndId() {
    if (window.SupabaseAuth && typeof window.SupabaseAuth.getCurrentUser === 'function') {
      try {
        const u = await window.SupabaseAuth.getCurrentUser();
        if (u && u.email) {
          return { email: u.email, id: u.id || null };
        }
      } catch (e) {}
    }
    const localUser = (typeof STORE_DATA !== 'undefined' && STORE_DATA.currentUser) ? STORE_DATA.currentUser : {};
    return {
      email: localUser.email || 'khach-hang@aicenter.store',
      id: localUser.id || null
    };
  }

  // Áp dụng phiên thanh toán vào giao diện Modal
  function applyPaymentSession(sessionData, product, remainingSeconds) {
    const isTrial = (sessionData.tier === 'trial');
    const defaultTierName = isTrial ? 'Gói dùng thử 60 phút' : 'Bản quyền vĩnh viễn trọn đời';

    // Ẩn trạng thái loading nếu có
    if ($('pmQrLoading')) $('pmQrLoading').style.display = 'none';

    // Cập nhật phiên hiện tại
    currentSession = {
      product: product,
      tier: sessionData.tier || 'vinhvien',
      amount: sessionData.amount,
      orderCode: sessionData.orderCode,
      transferContent: sessionData.transferContent,
      realtimeChannel: null,
      pollingTimer: null,
      countdownTimer: null,
      remainingSeconds: remainingSeconds,
      isCompleted: false,
      downloadUrl: null, // Bảo mật: Không lưu link tải trước khi xác thực paid!
      secretContent: null
    };

    // Điền dữ liệu lên Modal
    $('pmProductTitle').textContent = sessionData.productTitle || product.title;
    $('pmProductTier').textContent = sessionData.tierName || defaultTierName;
    $('pmBankName').textContent = formatBankName(sessionData.bankName);
    $('pmBankAccount').textContent = sessionData.bankAccount || '105870396069';
    $('pmAccountName').textContent = sessionData.accountName || 'NGUYEN VAN PHU';
    $('pmAmount').textContent = vnd(sessionData.amount);
    $('pmTransferContent').textContent = sessionData.transferContent;

    // Gắn link ảnh QR
    const qrImg = $('pmQrImg');
    if (qrImg) {
      const qrUrl = getVietQRUrl(sessionData.bankName, sessionData.bankAccount, sessionData.amount, sessionData.transferContent, sessionData.accountName);
      qrImg.src = qrUrl;
      qrImg.onerror = function () {
        this.src = getVietQRFallbackUrl(sessionData.bankName, sessionData.bankAccount, sessionData.amount, sessionData.transferContent, sessionData.accountName);
      };
    }

    // Hiển thị modal ở chế độ Pending
    $('pmStatePending').style.display = 'block';
    $('pmStateSuccess').style.display = 'none';
    $('paymentModal').classList.add('open');
    try {
      sessionStorage.setItem('aic_payment_modal_open', '1');
    } catch (e) {}

    // Khởi chạy đếm ngược và lắng nghe biến động
    startCountdown();
    startRealtimeListening(sessionData.orderCode);
  }

  // Bắt đầu quy trình thanh toán (Server-Side + 15-Minute Lock)
  async function startPayment(product, tier = 'vinhvien') {
    injectModalHtml();

    const cfg = getConfig();
    const isTrial = (tier === 'trial');
    const tierName = isTrial ? 'Gói dùng thử 60 phút' : 'Bản quyền vĩnh viễn trọn đời';

    // Ẩn cảnh báo chuyển thiếu tiền cũ (nếu có)
    const underpaidBox = $('pmUnderpaidBox');
    if (underpaidBox) underpaidBox.classList.add('hidden');

    // 1. KIỂM TRA PHIÊN THANH TOÁN 15 PHÚT TRONG LOCALSTORAGE
    const cachedRaw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (cachedRaw) {
      try {
        const cached = JSON.parse(cachedRaw);
        const now = Date.now();
        if (
          cached &&
          cached.productId === product.id &&
          cached.tier === tier &&
          cached.expiresAt > now + 10000 // còn ít nhất 10 giây
        ) {
          console.info('[Payment] Khôi phục phiên thanh toán 15 phút đang hoạt động:', cached.orderCode);
          const remainingSec = Math.floor((cached.expiresAt - now) / 1000);
          applyPaymentSession(cached, product, remainingSec);
          return;
        }
      } catch (e) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }

    // 2. CHƯA CÓ HOẶC HẾT HẠN -> GỌI SERVERLESS API POST /api/create-order
    const userInfo = await getCurrentUserEmailAndId();
    const userEmail = userInfo.email;
    const userId = userInfo.id;

    // Hiển thị modal với trạng thái đang tải
    $('pmProductTitle').textContent = product.title;
    $('pmProductTier').textContent = tierName;
    $('pmStatePending').style.display = 'block';
    $('pmStateSuccess').style.display = 'none';
    $('paymentModal').classList.add('open');
    if ($('pmQrLoading')) $('pmQrLoading').style.display = 'flex';

    let orderData = null;
    try {
      const resp = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          tier: tier,
          customerEmail: userEmail,
          userId: userId
        })
      });

      if (resp.ok) {
        const resJson = await resp.json();
        if (resJson && resJson.success) {
          orderData = resJson;
        }
      }
    } catch (err) {
      console.warn('[Payment] Không thể kết nối /api/create-order, dùng fallback:', err.message);
    }

    // Fallback nếu chạy môi trường không có serverless
    if (!orderData) {
      const fallbackAmount = isTrial ? (product.gia_trial || 9000) : (product.price || 99000);
      const fallbackCode = generateOrderCode();
      const fallbackContent = `${cfg.qrPrefix} ${fallbackCode}`;
      const timeoutSec = (cfg.orderTimeoutMinutes || 15) * 60;
      orderData = {
        orderCode: fallbackCode,
        amount: fallbackAmount,
        productTitle: product.title,
        tier: tier,
        transferContent: fallbackContent,
        bankName: cfg.bankName,
        bankAccount: cfg.bankAccount,
        accountName: cfg.accountName,
        qrUrl: getVietQRUrl(cfg.bankName, cfg.bankAccount, fallbackAmount, fallbackContent, cfg.accountName),
        expiresAt: Date.now() + timeoutSec * 1000,
        remainingSeconds: timeoutSec
      };
    }

    // Lưu phiên vào localStorage để F5 / đóng trình duyệt vẫn nhớ
    const sessionToSave = {
      productId: product.id,
      tier: tier,
      orderCode: orderData.orderCode,
      amount: orderData.amount,
      productTitle: orderData.productTitle,
      tierName: tierName,
      transferContent: orderData.transferContent,
      bankName: orderData.bankName,
      bankAccount: orderData.bankAccount,
      accountName: orderData.accountName,
      qrUrl: orderData.qrUrl,
      expiresAt: orderData.expiresAt,
      createdAt: Date.now()
    };
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionToSave));
    } catch (e) {}

    applyPaymentSession(sessionToSave, product, orderData.remainingSeconds || 900);
  }

  // Đếm ngược 15 phút
  function startCountdown() {
    clearInterval(currentSession.countdownTimer);
    updateTimerDisplay();

    currentSession.countdownTimer = setInterval(() => {
      currentSession.remainingSeconds--;
      if (currentSession.remainingSeconds <= 0) {
        clearInterval(currentSession.countdownTimer);
        handleOrderExpired();
      } else {
        updateTimerDisplay();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const mins = Math.floor(currentSession.remainingSeconds / 60);
    const secs = currentSession.remainingSeconds % 60;
    const str = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const el = $('pmTimerText');
    if (el) el.textContent = str;
  }

  function handleOrderExpired() {
    if (currentSession.isCompleted) return;
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem('aic_payment_modal_open');
    } catch (e) {}
    const el = $('pmTimerText');
    if (el) el.textContent = '00:00 (Hết hạn)';
    if ($('pmStatusText')) {
      $('pmStatusText').textContent = '⚠️ Đơn hàng đã hết thời gian chờ. Vui lòng đóng và thử lại.';
      $('pmStatusText').style.color = '#ef4444';
    }
    showPaymentToast('⚠️ Đơn hàng đã hết thời gian chờ. Vui lòng thử lại.', false);
  }

  // Lắng nghe Realtime kép (Supabase WebSocket + Polling)
  function startRealtimeListening(orderCode) {
    cleanupListeners();

    // 1. Supabase Realtime (WebSocket) - Siêu nhanh < 500ms
    if (window.supabase && typeof window.SupabaseAuth !== 'undefined') {
      try {
        const client = window.supabase.createClient(
          window.SupabaseAuth.getConfig().url,
          window.SupabaseAuth.getConfig().anonKey
        );

        if (client) {
          const channel = client
            .channel('order_realtime_' + orderCode)
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `code=eq.${orderCode}`
              },
              (payload) => {
                const updated = payload.new;
                if (updated) {
                  if (updated.status === 'paid' || updated.status === 'completed') {
                    const underpaidBox = $('pmUnderpaidBox');
                    if (underpaidBox) underpaidBox.classList.add('hidden');
                    onPaymentCompleted(updated);
                  } else if (updated.status_text && (updated.status_text.toLowerCase().includes('thiếu') || updated.status_text.toLowerCase().includes('underpaid'))) {
                    const underpaidBox = $('pmUnderpaidBox');
                    const underpaidText = $('pmUnderpaidText');
                    if (underpaidBox && underpaidText) {
                      underpaidText.textContent = updated.status_text;
                      underpaidBox.classList.remove('hidden');
                    }
                  }
                }
              }
            )
            .subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                console.info('[Payment Realtime] Đã kết nối kênh Realtime đơn hàng:', orderCode);
              }
            });

          currentSession.realtimeChannel = { client, channel };
        }
      } catch (e) {
        console.warn('[Payment Realtime] Lỗi khởi tạo Supabase WebSocket:', e);
      }
    }

    // 2. Smart Polling fallback (Kiểm tra mỗi 2.5s)
    currentSession.pollingTimer = setInterval(async () => {
      if (currentSession.isCompleted) {
        clearInterval(currentSession.pollingTimer);
        return;
      }
      await checkOrderStatusOnce();
    }, 2500);

    // 3. Lắng nghe thay đổi Storage cục bộ giữa các tab
    window.addEventListener('storage', handleStorageChange);
  }

  function handleStorageChange(e) {
    if (e.key === 'aic_orders_v3' && !currentSession.isCompleted) {
      checkOrderStatusOnce();
    }
  }

  // Kiểm tra trạng thái đơn hàng 1 lần
  async function checkOrderStatusOnce() {
    if (currentSession.isCompleted || !currentSession.orderCode) return;

    const code = currentSession.orderCode;

    // 1. Kiểm tra qua REST API serverless / local
    try {
      const resp = await fetch(`/api/check-order?code=${encodeURIComponent(code)}`, {
        cache: 'no-store'
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data) {
          if (data.isUnderpaid) {
            const underpaidBox = $('pmUnderpaidBox');
            const underpaidText = $('pmUnderpaidText');
            if (underpaidBox && underpaidText) {
              underpaidText.textContent = data.statusText || 'Hệ thống phát hiện bạn đã chuyển thiếu tiền. Vui lòng chuyển tiếp số tiền còn thiếu với cùng nội dung chuyển khoản để tự động mở khóa.';
              underpaidBox.classList.remove('hidden');
            }
          } else if (data.status === 'paid' || data.status === 'completed') {
            const underpaidBox = $('pmUnderpaidBox');
            if (underpaidBox) underpaidBox.classList.add('hidden');
            onPaymentCompleted(data.order || data);
            return;
          }
        }
      }
    } catch (apiErr) {
      // Có thể chạy ở môi trường file:// hoặc chưa bật serverless
    }

    // 2. Kiểm tra qua Supabase DB
    if (window.SupabaseDB && window.SupabaseDB.getOrders) {
      try {
        const orders = await window.SupabaseDB.getOrders();
        if (orders) {
          const target = orders.find(o => o.code === code);
          if (target) {
            if (target.status === 'paid' || target.status === 'completed') {
              const underpaidBox = $('pmUnderpaidBox');
              if (underpaidBox) underpaidBox.classList.add('hidden');
              onPaymentCompleted(target);
              return;
            } else if (target.status_text && (target.status_text.toLowerCase().includes('thiếu') || target.status_text.toLowerCase().includes('underpaid'))) {
              const underpaidBox = $('pmUnderpaidBox');
              const underpaidText = $('pmUnderpaidText');
              if (underpaidBox && underpaidText) {
                underpaidText.textContent = target.status_text;
                underpaidBox.classList.remove('hidden');
              }
            }
          }
        }
      } catch (e) {}
    }

    // 3. Kiểm tra qua Local Storage DB
    if (typeof DB !== 'undefined' && DB.getOrders) {
      const localOrders = DB.getOrders();
      const target = localOrders.find(o => o.code === code);
      if (target && (target.status === 'paid' || target.status === 'completed')) {
        onPaymentCompleted(target);
        return;
      }
    }
  }

  // Xử lý khi thanh toán THÀNH CÔNG
  function onPaymentCompleted(orderData) {
    if (currentSession.isCompleted) return;
    currentSession.isCompleted = true;
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem('aic_payment_modal_open');
    } catch (e) {}
    cleanupListeners();

    // 1. Cập nhật local DB
    if (typeof DB !== 'undefined' && DB.updateOrderStatus) {
      DB.updateOrderStatus(currentSession.orderCode, 'paid', currentSession.downloadUrl);
    }

    // 2. Hiệu ứng ăn mừng (Pháo hoa Confetti)
    triggerConfetti();

    // 3. Chuyển đổi giao diện sang Success
    $('pmStatePending').style.display = 'none';
    $('pmStateSuccess').style.display = 'block';

    const p = currentSession.product || {};
    $('pmSuccessProductTitle').textContent = p.title || 'Sản phẩm AI';

    // Xử lý link tải tool
    const dlBtn = $('pmDownloadBtn');
    if (dlBtn) {
      const finalUrl = (orderData && orderData.access_url) || currentSession.downloadUrl;
      dlBtn.href = finalUrl || '#';
      if (!finalUrl || finalUrl.startsWith('#')) {
        dlBtn.onclick = (e) => {
          e.preventDefault();
          closePaymentModal();
          window.location.hash = `#san-pham?id=${encodeURIComponent(p.id)}`;
          if (typeof handleRoute === 'function') handleRoute();
        };
      }
    }

    // Xử lý hộp Prompt bí mật
    const secretContent = (orderData && orderData.unlocked_content) || currentSession.secretContent;
    const promptBlock = $('pmSecretPromptBlock');
    const promptContentEl = $('pmSecretPromptContent');
    if (secretContent && secretContent.trim().length > 0) {
      promptBlock.style.display = 'block';
      promptContentEl.textContent = secretContent;
    } else {
      promptBlock.style.display = 'none';
    }

    // Phát âm thanh nhẹ nếu trình duyệt cho phép
    try {
      playSuccessSound();
    } catch (e) {}

    // Thông báo cho toàn trang cập nhật lại giỏ hàng / tài khoản
    window.dispatchEvent(new CustomEvent('aic_payment_success', { detail: { order: orderData } }));
  }

  // Dọn dẹp các timer & subscription
  function cleanupListeners() {
    clearInterval(currentSession.countdownTimer);
    clearInterval(currentSession.pollingTimer);

    if (currentSession.realtimeChannel && currentSession.realtimeChannel.client) {
      try {
        currentSession.realtimeChannel.client.removeChannel(currentSession.realtimeChannel.channel);
      } catch (e) {}
      currentSession.realtimeChannel = null;
    }

    window.removeEventListener('storage', handleStorageChange);
  }

  function closePaymentModal() {
    cleanupListeners();
    $('paymentModal')?.classList.remove('open');
    try {
      sessionStorage.removeItem('aic_payment_modal_open');
    } catch (e) {}
  }

  // Giả lập webhook xác nhận thanh toán (Dành cho Dev / Test)
  async function simulatePaymentSuccess() {
    const code = currentSession.orderCode;
    const amount = currentSession.amount;

    showPaymentToast('⚡ Đang mô phỏng SePay bắn Webhook...', false);

    // Gửi thử request tới /api/sepay-webhook
    try {
      await fetch('/api/sepay-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: getConfig().bankName,
          transferAmount: amount,
          content: `${getConfig().qrPrefix} ${code} Chuyen khoan thanh toan`,
          referenceCode: 'SIM_' + Date.now()
        })
      });
    } catch (e) {}

    // Fallback kích hoạt trực tiếp nếu API offline
    setTimeout(() => {
      onPaymentCompleted({
        code: code,
        status: 'paid',
        access_url: currentSession.downloadUrl,
        unlocked_content: currentSession.secretContent
      });
    }, 400);
  }

  // Hiệu ứng pháo hoa Confetti siêu nhẹ (Không cần thư viện ngoài)
  function triggerConfetti() {
    try {
      const count = 40;
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];
      const container = document.createElement('div');
      container.className = 'pm-confetti-container';
      document.body.appendChild(container);

      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'pm-confetti-particle';
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = '-10px';
        p.style.transform = `rotate(${Math.random() * 360}deg)`;
        p.style.animationDuration = (1.5 + Math.random() * 2) + 's';
        p.style.animationDelay = (Math.random() * 0.4) + 's';
        container.appendChild(p);
      }

      setTimeout(() => {
        container.remove();
      }, 4000);
    } catch (e) {}
  }

  // Âm thanh báo thành công nhẹ nhàng (Web Audio API)
  function playSuccessSound() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  // Tự động khôi phục phiên thanh toán khi tải lại trang (F5) nếu trước đó đang mở modal
  function initAutoResume() {
    try {
      if (sessionStorage.getItem('aic_payment_modal_open') === '1') {
        const cachedRaw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          const now = Date.now();
          if (cached && cached.expiresAt > now + 10000) {
            const remainingSec = Math.floor((cached.expiresAt - now) / 1000);
            injectModalHtml();
            let product = null;
            if (typeof STORE_DATA !== 'undefined' && STORE_DATA.products) {
              product = STORE_DATA.products.find(p => p.id === cached.productId);
            }
            if (!product) {
              product = { id: cached.productId, title: cached.productTitle, price: cached.amount };
            }
            console.info('[Payment] Tự động khôi phục phiên thanh toán sau F5:', cached.orderCode);
            applyPaymentSession(cached, product, remainingSec);
          }
        }
      }
    } catch (e) {
      console.warn('[Payment] Lỗi khôi phục phiên thanh toán:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoResume);
  } else {
    initAutoResume();
  }

  // Xuất ra phạm vi toàn cục
  window.PaymentModule = {
    startPayment,
    closePaymentModal,
    getConfig,
    simulatePaymentSuccess,
    initAutoResume
  };

})();
