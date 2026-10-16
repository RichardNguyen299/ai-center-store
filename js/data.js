/**
 * AI Center Store - Product & Site Dataset
 */

const STORE_DATA = {
  products: [
    {
      id: "app-2d-so-sanh-ca-the-gioi",
      title: "App 2D So Sánh Cả Thế Giới",
      version: "v1.0",
      subtitle: "App dùng để so sánh 2 sản phẩm nào đó bất kỳ",
      category: "flow",
      categoryName: "Google Flow AI",
      format: "9:16",
      isPremium: true,
      isNew: true,
      price: 99000,
      original_price: 150000,
      gia_trial: 9000,
      sold: 57,
      remainingSlots: 143,
      demo_video_id: "aoG_YF3C_bM", // User specified YouTube embed video
      posterTheme: {
        badge: "APP SO SÁNH",
        highlight: "CẢ THẾ GIỚI",
        tagline: "So sánh mọi thứ bằng video 2D Veo3",
        color: "#D97706",
        bgGradient: "linear-gradient(180deg, #241D17 0%, #17130F 60%, #0E0B09 100%)"
      },
      description: `Tạo video người mẫu 2D giải thích so sánh là công cụ giúp bạn tạo nhanh các video dạng 2D phân tích, so sánh và giải thích nội dung bằng AI. Chỉ cần nhập chủ đề so sánh, chọn ảnh người dẫn chuyện và thêm mô tả hình ảnh cho các đối tượng cần so sánh.

Bạn có thể tùy chỉnh hình ảnh minh họa theo ý muốn, ví dụ như so sánh Veo 3 Omni Flash và SeaDance 2.0, PC gaming và MacBook, hai sản phẩm công nghệ, hai phương pháp làm việc hoặc hai lựa chọn bất kỳ. AI sẽ tự động tạo hình ảnh cho các object cần so sánh, xây dựng nội dung, tạo video và lồng tiếng.

Chỉ với vài bước đơn giản, bạn có thể tạo ra video người que giải thích so sánh chuyên nghiệp mà không cần biết vẽ, không cần dựng hoạt hình và không cần tự viết kịch bản từ đầu.

Mua 1 lần dùng vĩnh viễn.`
    },
    {
      id: "giang",
      title: "App AI Video Giang",
      version: "v1.0",
      subtitle: "Ứng dụng tạo video AI tự động chuyên nghiệp",
      category: "flow",
      categoryName: "Google Flow AI",
      format: "9:16",
      isPremium: true,
      isNew: true,
      price: 99000,
      original_price: 150000,
      gia_trial: 9000,
      sold: 1,
      remainingSlots: 99,
      demo_video_id: "aoG_YF3C_bM",
      posterTheme: {
        badge: "AI GIANG",
        highlight: "APP AI VIDEO",
        tagline: "Tạo video AI chuyên nghiệp nhanh chóng",
        color: "#F59E0B",
        bgGradient: "linear-gradient(180deg, #241D17 0%, #17130F 60%, #0E0B09 100%)"
      },
      description: `Ứng dụng hỗ trợ sáng tạo nội dung và tạo video AI tự động chất lượng cao. Tích hợp sẵn mẫu video 9:16, kịch bản thu hút và tối ưu hiển thị trên các nền tảng mạng xã hội.`
    },
    {
      id: "app-koc-ban-long-den",
      title: "App KOC Bán Lồng Đèn",
      version: "v1.0",
      subtitle: "Bán lồng đèn như thật",
      category: "flow",
      categoryName: "Google Flow AI",
      format: "9:16",
      isPremium: true,
      isNew: true,
      price: 99000,
      original_price: 160000,
      gia_trial: 9000,
      sold: 28,
      remainingSlots: 172,
      demo_video_id: "dQw4w9WgXcQ",
      posterTheme: {
        badge: "APP KOC",
        highlight: "BÁN LỒNG ĐÈN",
        tagline: "Ứng dụng KOC thông minh - Tự động bán hàng bứt phá",
        color: "#D97706",
        bgGradient: "linear-gradient(180deg, #241D17 0%, #17130F 60%, #0E0B09 100%)"
      },
      description: `Ứng dụng KOC thông minh giúp bạn tự động hóa toàn bộ quy trình quay video bán lồng đèn và các sản phẩm mùa lễ hội bằng công nghệ Veo 3.

Tự động ghép người mẫu KOC vào khung cảnh ấm cúng, tương tác trực tiếp với sản phẩm, lên giọng nói thu hút người mua và tạo chuyển đổi bán hàng thần tốc.`
    },
    {
      id: "app-koc-review-nha-hang",
      title: "App KOC Review Nhà Hàng, Quán Ăn, Quán Cafe,...",
      version: "v1.0",
      subtitle: "Review mọi nơi ăn uống từ nhà hàng, quán nhậu, quán ăn,...",
      category: "flow",
      categoryName: "Google Flow AI",
      format: "9:16",
      isPremium: true,
      isNew: true,
      price: 99000,
      original_price: 180000,
      gia_trial: 9000,
      sold: 42,
      remainingSlots: 158,
      demo_video_id: "7B_sC2P0r5k",
      posterTheme: {
        badge: "APP REVIEW",
        highlight: "QUÁN ĂN & CAFE",
        tagline: "Tạo kịch bản + Tạo ảnh 9:16 + Tạo video review tự động",
        color: "#F59E0B",
        bgGradient: "linear-gradient(180deg, #241D17 0%, #17130F 60%, #0E0B09 100%)"
      },
      description: `Giải pháp hàng đầu cho các nhà sáng tạo nội dung ẩm thực, KOC review đồ ăn. Ứng dụng tự động dựng bối cảnh bàn tiệc thịnh soạn, biểu cảm nếm thử chân thực và lời bình luận kích thích vị giác người xem.`
    },
    {
      id: "app-thoi-trang-tttm",
      title: "App Thời Trang Bối Cảnh Trung Tâm Thương Mại",
      version: "v1.0",
      subtitle: "Thời Trang Bối Cảnh Trung Tâm Thương Mại",
      category: "flow",
      categoryName: "Google Flow AI",
      format: "9:16",
      isPremium: true,
      isNew: true,
      price: 89000,
      original_price: 140000,
      gia_trial: 8951,
      sold: 19,
      remainingSlots: 181,
      demo_video_id: "dQw4w9WgXcQ",
      posterTheme: {
        badge: "APP THỜI TRANG",
        highlight: "TRUNG TÂM THƯƠNG MẠI",
        tagline: "Nhận diện bối cảnh - Khóa trang phục - Tự động dựng cảnh Veo3",
        color: "#D97706",
        bgGradient: "linear-gradient(180deg, #241D17 0%, #17130F 60%, #0E0B09 100%)"
      },
      description: `Tạo video lookbook thời trang đẳng cấp trong không gian trung tâm thương mại sang trọng. Khóa chuẩn form dáng trang phục và cho người mẫu sải bước tự tin như sàn runway.`
    },
    {
      id: "chatbot-gpt-kich-ban-kinh-te",
      title: "Chatbot GPT Mẫu Làm Video Stickman Kinh Tế - Chính Trị",
      version: "v2.0",
      subtitle: "Kinh Tế · Chính Trị Bán Sách Tự Động",
      category: "chatbot",
      categoryName: "Chatbot AI",
      format: "Chatbot",
      isPremium: true,
      isNew: false,
      price: 99000,
      original_price: 190000,
      gia_trial: 19000,
      sold: 85,
      remainingSlots: 115,
      demo_video_id: "7B_sC2P0r5k",
      posterTheme: {
        badge: "CHATBOT GPT",
        highlight: "KINH TẾ & CHÍNH TRỊ",
        tagline: "Mẫu làm video Stickman bán sách viral triệu view",
        color: "#EA580C",
        bgGradient: "linear-gradient(180deg, #241712 0%, #170E0A 60%, #0E0705 100%)"
      },
      description: `Bộ prompt và cấu hình Chatbot chuyên sâu để sinh kịch bản video hoạt hình người que (Stickman) giải thích các chủ đề kinh tế, tài chính, chính trị và tóm tắt sách cực kỳ lôi cuốn.`
    },
    {
      id: "app-nguoi-que-hai-huoc",
      title: "Chatbot & App Người Que Hài Hước Bán Hàng",
      version: "v1.0",
      subtitle: "Cà khịa hài hước bán hàng video AI cực bén",
      category: "chatbot",
      categoryName: "Chatbot AI",
      format: "9:16",
      isPremium: true,
      isNew: true,
      price: 79000,
      original_price: 130000,
      gia_trial: 9000,
      sold: 34,
      remainingSlots: 166,
      demo_video_id: "dQw4w9WgXcQ",
      posterTheme: {
        badge: "CHATBOT & APP",
        highlight: "NGƯỜI QUE HÀI HƯỚC",
        tagline: "Cà khịa hài hước - Bán hàng video AI - Tự động tạo ảnh & video",
        color: "#EA580C",
        bgGradient: "linear-gradient(180deg, #241712 0%, #170E0A 60%, #0E0705 100%)"
      },
      description: `Công cụ đắc lực để làm các video giải trí lồng ghép bán hàng tự nhiên, không gây phản cảm. Tự động đề xuất các miếng hài hước, tạo hình nhân vật que vui nhộn.`
    },
    {
      id: "app-ban-hang-nhieu-khung-canh",
      title: "App Bán Hàng Nhiều Khung Cảnh Veo 3",
      version: "v1.0",
      subtitle: "App bán hàng đa góc quay & phối cảnh điện ảnh",
      category: "flow",
      categoryName: "Google Flow AI",
      format: "9:16",
      isPremium: true,
      isNew: false,
      price: 99000,
      original_price: 150000,
      gia_trial: 9000,
      sold: 61,
      remainingSlots: 139,
      demo_video_id: "7B_sC2P0r5k",
      posterTheme: {
        badge: "SIÊU APP",
        highlight: "BÁN HÀNG NHIỀU KHUNG CẢNH",
        tagline: "Đa góc quay, chuyển cảnh mượt mà chuẩn phim điện ảnh",
        color: "#D97706",
        bgGradient: "linear-gradient(180deg, #241D17 0%, #17130F 60%, #0E0B09 100%)"
      },
      description: `Tạo chuỗi video quảng cáo sản phẩm với 4-6 góc máy chuyển cảnh mượt mà trong cùng một bối cảnh nhất quán. Tối ưu trải nghiệm thị giác cho khách hàng tiềm năng.`
    },
    {
      id: "chatbot-prompt-veo3",
      title: "Chatbot Viết Prompt Video AI Veo 3 Chuẩn Từng Cảnh",
      version: "v1.2",
      subtitle: "Trợ lý AI viết prompt điện ảnh theo từng phân cảnh",
      category: "prompt",
      categoryName: "Mẫu Prompt",
      format: "Chatbot",
      isPremium: true,
      isNew: false,
      price: 69000,
      original_price: 120000,
      gia_trial: 15000,
      sold: 47,
      remainingSlots: 153,
      demo_video_id: "dQw4w9WgXcQ",
      posterTheme: {
        badge: "PROMPT MASTER",
        highlight: "VEO 3 ĐIỆN ẢNH",
        tagline: "Tạo prompt phân cảnh chi tiết, chuyển động camera điện ảnh",
        color: "#D97706",
        bgGradient: "linear-gradient(180deg, #241D17 0%, #17130F 60%, #0E0B09 100%)"
      },
      description: `Được huấn luyện trên hơn 10.000 prompt video chất lượng cao của Hollywood. Tự động phân tích kịch bản và sinh câu lệnh prompt tiếng Anh chuẩn ngữ nghĩa cho Veo 3, Runway Gen 3, Luma Dream Machine.`
    }
  ],

  courses: [
    {
      id: "course-aff-ai",
      title: "Làm Video AI Đa Nền Tảng",
      desc: "Xây dựng kênh video AI triệu view trên TikTok, YouTube Shorts và Reels.",
      url: "https://videoai.hocvalamai.net",
      icon: "spark"
    },
    {
      id: "course-auto-edit",
      title: "Công Cụ AI Edit Video Tự Động",
      desc: "Dựng & edit video tự động bằng AI: cắt ghép, phụ đề, xuất bản nhanh.",
      url: "https://autoedit.hocvalamai.net",
      icon: "flow"
    },
    {
      id: "course-video-ai",
      title: "Tạo Video Chuyên Nghiệp + Kiếm Tiền",
      desc: "Sản xuất video AI chuyên nghiệp và cách biến kỹ năng đó thành thu nhập.",
      url: "https://videoai.hocvalamai.net",
      icon: "bot"
    },
    {
      id: "course-viet-app-flow",
      title: "Học Viết App Trên Flow",
      desc: "Tự tay dựng các app tạo video trên Google Flow theo ý mình.",
      url: "https://vietapp.hocvalamai.net",
      icon: "doc"
    }
  ],

  ecosystem: [
    {
      name: "Cửa hàng App & Chatbot",
      name_en: "AI Apps & Chatbot Store",
      desc: "App, chatbot & mẫu prompt tạo video AI",
      desc_en: "AI video generation apps, chatbots & prompt templates",
      url: "#",
      current: true,
      color: "#22C55E",
      icon: "🛒"
    },
    {
      name: "Video AI Đa Nền Tảng",
      name_en: "Multi-Platform AI Video",
      desc: "Sản xuất video AI đa nền tảng viral",
      desc_en: "Produce viral multi-platform AI videos",
      url: "https://videoai.hocvalamai.net",
      current: false,
      color: "#34D399",
      icon: "🌐"
    },
    {
      name: "Công Cụ AI Edit Video",
      name_en: "AI Video Editing Tool",
      desc: "Dựng & edit video tự động bằng AI",
      desc_en: "Automated video cutting & editing with AI",
      url: "https://autoedit.hocvalamai.net",
      current: false,
      color: "#2DD4BF",
      icon: "🎬"
    },
    {
      name: "Tạo Video Chuyên Nghiệp",
      name_en: "Professional AI Video",
      desc: "Sản xuất video AI + cách kiếm tiền",
      desc_en: "AI video production + monetization mastery",
      url: "https://videoai.hocvalamai.net",
      current: false,
      color: "#22D3EE",
      icon: "🎥"
    },
    {
      name: "Học Viết App Trên Flow",
      name_en: "Build Apps on Flow",
      desc: "Tự tay dựng app tạo video trên Flow",
      desc_en: "Build custom video generation apps on Flow",
      url: "https://vietapp.hocvalamai.net",
      current: false,
      color: "#FBBF24",
      icon: "🧩"
    },
    {
      name: "Skill Claude Master",
      name_en: "Claude Master Skill",
      desc: "Học tạo Skill cho Claude từ số 0",
      desc_en: "Learn building Claude Skills from scratch",
      url: "https://skillclaude.hocvalamai.net",
      current: false,
      color: "#A78BFA",
      icon: "🧠"
    },
    {
      name: "Làm Video Bằng AI Agent",
      name_en: "Videos with AI Agents",
      desc: "AI Agent làm video triệu view & bán hàng",
      desc_en: "AI Agents producing million-view viral videos",
      url: "https://videoagent.hocvalamai.net",
      current: false,
      color: "#EC4899",
      icon: "🎞️"
    }
  ],

  recentBuyers: [
    { name: "Nguyễn V.", item: "App 2D So Sánh Cả Thế Giới", time: "2 phút trước" },
    { name: "Trần Minh T.", item: "App KOC Bán Lồng Đèn", time: "5 phút trước" },
    { name: "Lê Hoàng K.", item: "Chatbot GPT Làm Video Stickman", time: "8 phút trước" },
    { name: "Phạm Thu H.", item: "App KOC Review Nhà Hàng, Quán Cafe", time: "12 phút trước" },
    { name: "Đặng Quang M.", item: "App Thời Trang Bối Cảnh TTTM", time: "16 phút trước" },
    { name: "Vũ Hải N.", item: "App Bán Hàng Nhiều Khung Cảnh Veo 3", time: "20 phút trước" }
  ],

  // Demo user data matching screenshot
  currentUser: {
    email: "ganhteam321@gmail.com",
    phone: "",
    totalOrders: 3,
    totalSpent: 9000,
    lastTransaction: "8/9/2026",
    memberPlan: null, // "Bạn chưa có gói thành viên"
    orders: [
      {
        id: "app-food-pro-ban-hang-nhu-that",
        title: "App Food Pro Bán Hàng Như Thật",
        slug: "app-food-pro-ban-hang-nhu-that",
        code: "AISRQJ7PXG",
        date: "8/9/2026",
        amount: 9000,
        status: "pending",
        statusText: "Chờ thanh toán",
        accessUrl: null
      },
      {
        id: "app-koc-ban-long-den",
        title: "App KOC Bán Lồng Đèn",
        slug: "app-koc-ban-long-den",
        code: "AISTC5LTF7",
        date: "5/9/2026",
        amount: 9000,
        status: "pending",
        statusText: "Chờ thanh toán",
        accessUrl: null
      },
      {
        id: "app-koc-review-nha-hang",
        title: "App KOC Review Nhà Hàng Quán Ăn Cafe",
        slug: "app-koc-review-nha-hang-quan-an-quan-cafe",
        code: "AISGP38W74",
        date: "5/9/2026",
        amount: 9000,
        status: "paid",
        statusText: "Đã thanh toán",
        accessUrl: "index.html#san-pham?id=app-koc-review-nha-hang"
      }
    ]
  }
};


// Function to generate dynamic SVG poster if no image file exists
function generatePosterSVG(p) {
  if (!p) return '';
  const imgUrl = (p.image && typeof p.image === 'string' && p.image.trim()) 
    ? p.image.trim() 
    : (p.posterTheme && p.posterTheme.image && typeof p.posterTheme.image === 'string' 
      ? p.posterTheme.image.trim() 
      : (p.poster_theme && p.poster_theme.image && typeof p.poster_theme.image === 'string' ? p.poster_theme.image.trim() : ''));
  if (imgUrl) {
    return imgUrl;
  }
  const t = p.posterTheme || {
    badge: (p.categoryName || "AI APP").toUpperCase(),
    highlight: p.title || "AI Center",
    tagline: p.subtitle || "",
    color: "#D97706"
  };

  const badgeText = String(t.badge || "AI CENTER").replace(/[<>&"]/g, '');
  const titleText = String(p.title || "AI App").replace(/[<>&"]/g, '');
  
  // Harmonize any legacy green/cyan into warm luxury amber gold & bronze palette
  let color = t.color || "#D97706";
  if (color === "#22C55E" || color === "#2DD4BF" || color === "#10B981" || color === "#4ADE80" || color === "#34D399") {
    color = "#D97706";
  } else if (color === "#06B6D4" || color === "#22D3EE" || color === "#38BDF8") {
    color = "#D97706";
  } else if (color === "#A855F7" || color === "#F43F5E") {
    color = "#EA580C";
  }

  const pid = (p.id || 'p' + Math.random().toString(36).slice(2, 7)).replace(/[^a-zA-Z0-9_-]/g, '');

  const catVal = String(p.category || '').toLowerCase();
  const fmtVal = String(p.format || '').toLowerCase();
  let topTagText = '⚡ VEO3 AI';
  let centerActionText = 'SẴN SÀNG TẠO VIDEO 9:16';
  let tag2Text = '✓ Veo3 Flow';

  if (catVal === 'chatbot') {
    topTagText = '⚡ CHATBOT';
    centerActionText = (fmtVal.includes('9:16') || fmtVal.includes('9:19')) ? 'SẴN SÀNG TẠO VIDEO 9:16' : 'SẴN SÀNG TẠO PROMPT AI';
    tag2Text = '✓ Chatbot AI';
  } else if (catVal === 'prompt') {
    topTagText = '⚡ MẪU PROMPT';
    centerActionText = (fmtVal.includes('9:16') || fmtVal.includes('9:19')) ? 'SẴN SÀNG TẠO VIDEO 9:16' : 'SẴN SÀNG TẠO PROMPT AI';
    tag2Text = '✓ Prompt Chuẩn';
  } else {
    if (fmtVal.includes('16:9')) {
      centerActionText = 'SẴN SÀNG TẠO VIDEO 16:9';
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="450" height="800" viewBox="0 0 450 800">
    <defs>
      <linearGradient id="bg_${pid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#241D17"/>
        <stop offset="50%" stop-color="#18130F"/>
        <stop offset="100%" stop-color="#0E0B09"/>
      </linearGradient>
      <radialGradient id="glow_${pid}" cx="50%" cy="32%" r="52%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.38"/>
        <stop offset="60%" stop-color="${color}" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="btn_grad_${pid}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#D97706"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg_${pid})"/>
    <rect width="100%" height="100%" fill="url(#glow_${pid})"/>
    
    <!-- Top badge -->
    <rect x="30" y="40" width="130" height="32" rx="16" fill="rgba(245,158,11,0.2)" stroke="${color}" stroke-width="1.5"/>
    <text x="95" y="61" fill="${color}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="12" text-anchor="middle" letter-spacing="1">${topTagText}</text>
    
    <!-- Center visual card -->
    <rect x="30" y="100" width="390" height="520" rx="20" fill="rgba(26,22,18,0.92)" stroke="rgba(245,158,11,0.25)" stroke-width="1.5"/>
    
    <!-- Poster Title -->
    <text x="225" y="165" fill="#E2D4C0" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="13.5" text-anchor="middle" letter-spacing="2">${badgeText.slice(0, 30)}</text>
    <text x="225" y="215" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="22" text-anchor="middle">${titleText.slice(0, 24)}</text>
    ${titleText.length > 24 ? `<text x="225" y="248" fill="#E2D4C0" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="600" font-size="16" text-anchor="middle">${titleText.slice(24, 52)}</text>` : ''}
    
    <!-- Tech Frame illustration -->
    <rect x="60" y="280" width="330" height="210" rx="16" fill="rgba(15,12,10,0.95)" stroke="${color}" stroke-width="1.5" stroke-dasharray="6 4"/>
    <circle cx="225" cy="370" r="44" fill="${color}" fill-opacity="0.22" stroke="${color}" stroke-width="2"/>
    <polygon points="216,352 244,370 216,388" fill="${color}"/>
    <text x="225" y="445" fill="${color}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="13" text-anchor="middle" letter-spacing="1">${centerActionText}</text>
    
    <!-- Feature tags -->
    <rect x="50" y="525" width="105" height="32" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(245,158,11,0.2)" stroke-width="1"/>
    <text x="102" y="546" fill="#F7F2EB" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="600" font-size="11.5" text-anchor="middle">✓ Tự Động</text>
    
    <rect x="170" y="525" width="110" height="32" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(245,158,11,0.2)" stroke-width="1"/>
    <text x="225" y="546" fill="#F7F2EB" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="600" font-size="11.5" text-anchor="middle">${tag2Text}</text>

    <rect x="295" y="525" width="105" height="32" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(245,158,11,0.2)" stroke-width="1"/>
    <text x="347" y="546" fill="#F7F2EB" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="600" font-size="11.5" text-anchor="middle">✓ HD 1080p</text>
    
    <!-- Bottom CTA Bar inside poster -->
    <rect x="40" y="660" width="370" height="56" rx="14" fill="url(#btn_grad_${pid})" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
    <text x="225" y="695" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="15.5" text-anchor="middle" letter-spacing="1">KHÁM PHÁ NGAY ➔</text>
  </svg>`;

  try {
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  } catch (e) {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
}

/**
 * Utility: Extract clean 11-character YouTube Video ID from any input format:
 * - Full iframe tag: <iframe src="https://www.youtube.com/embed/aoG_YF3C_bM..." ...></iframe>
 * - Embed URL: https://www.youtube.com/embed/aoG_YF3C_bM
 * - Standard Watch URL: https://www.youtube.com/watch?v=aoG_YF3C_bM
 * - Short URL: https://youtu.be/aoG_YF3C_bM
 * - Shorts URL: https://www.youtube.com/shorts/aoG_YF3C_bM
 * - Raw ID: aoG_YF3C_bM
 */
function extractYouTubeId(input) {
  if (!input) return '';
  input = String(input).trim();
  
  // 1. If user pasted a full <iframe> embed tag, extract the src first
  const iframeMatch = input.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    input = iframeMatch[1];
  }
  
  // 2. Decode entities
  input = input.replace(/&amp;/g, '&');
  
  // 3. Match known YouTube URL schemes
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/i;
  const match = input.match(regExp);
  if (match && match[1]) {
    return match[1];
  }
  
  // 4. If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }
  
  // 5. Fallback: match any 11-character alphanumeric token
  const loose = input.match(/([a-zA-Z0-9_-]{11})/);
  return loose ? loose[1] : input;
}
if (typeof window !== 'undefined') {
  window.extractYouTubeId = extractYouTubeId;
}

/**
 * Local Database Engine (DB) - Two-way sync with localStorage
 */
const DB = {
  KEYS: {
    PRODUCTS: 'aic_products_db',
    ORDERS: 'aic_orders_db',
    USERS: 'aic_users_db',
    SETTINGS: 'aic_settings_db',
    AUTHOR: 'aic_author_db',
    VERSION: 'aic_db_version'
  },

  CURRENT_VERSION: 'v2.6',

  load() {
    this.init();
    return {
      products: this.getProducts(),
      orders: this.getOrders(),
      users: this.getUsers(),
      settings: this.getSettings(),
      author: this.getAuthor()
    };
  },

  init() {
    const savedVer = localStorage.getItem(this.KEYS.VERSION);
    if (savedVer !== this.CURRENT_VERSION) {
      let existingProducts = [];
      try {
        existingProducts = JSON.parse(localStorage.getItem(this.KEYS.PRODUCTS)) || [];
      } catch (e) {}

      // Preserve all user custom products (those not part of default STORE_DATA.products)
      const customProducts = existingProducts.filter(p => !STORE_DATA.products.some(dp => dp.id === p.id));
      const initialProducts = STORE_DATA.products.map(p => ({ ...p, active: true }));
      const mergedProducts = [...customProducts, ...initialProducts];

      localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(mergedProducts));
      if (!localStorage.getItem(this.KEYS.ORDERS)) {
        localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(STORE_DATA.currentUser.orders));
      }
      localStorage.setItem(this.KEYS.VERSION, this.CURRENT_VERSION);
    }

    if (!localStorage.getItem(this.KEYS.PRODUCTS)) {
      const initialProducts = STORE_DATA.products.map(p => ({ ...p, active: true }));
      localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(initialProducts));
    }
    if (!localStorage.getItem(this.KEYS.ORDERS)) {
      localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(STORE_DATA.currentUser.orders));
    }
    if (!localStorage.getItem(this.KEYS.USERS)) {
      const initialUsers = [
        {
          email: "ganhteam321@gmail.com",
          phone: "0852241386",
          role: "customer",
          status: "active",
          createdAt: "8/9/2026",
          totalOrders: 3,
          totalSpent: 9000
        },
        {
          email: "admin@aicenter.store",
          phone: "0912345678",
          role: "admin",
          status: "active",
          createdAt: "1/8/2026",
          totalOrders: 0,
          totalSpent: 0
        },
        {
          email: "tranminh99@gmail.com",
          phone: "0987654321",
          role: "customer",
          status: "active",
          createdAt: "15/9/2026",
          totalOrders: 2,
          totalSpent: 188000
        }
      ];
      localStorage.setItem(this.KEYS.USERS, JSON.stringify(initialUsers));
    }
    if (!localStorage.getItem(this.KEYS.SETTINGS)) {
      const initialSettings = {
        storeName: "AI Store",
        hotline: "0852 241 386",
        supportZalo: "0852241386",
        storageMode: "server_synced"
      };
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(initialSettings));
    }

    // Try pulling from server if running over HTTP
    if (!this._syncStarted && typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
      this._syncStarted = true;
      this.pullFromServer();
    }
  },

  // Server-Sync Helper (đồng bộ lên Supabase Cloud hoặc /api/db)
  async pushToServer() {
    if (typeof window !== 'undefined') {
      try {
        // Đồng bộ lên Supabase nếu có cấu hình
        if (window.SupabaseDB) {
          const settings = this.getSettings();
          window.SupabaseDB.saveSettings(settings).catch(() => {});
        }

        // Đồng bộ server nội bộ /api/db nếu có
        if (window.location.protocol.startsWith('http')) {
          const payload = JSON.stringify({
            version: this.CURRENT_VERSION,
            lastUpdated: new Date().toISOString(),
            settings: this.getSettings(),
            products: this.getProducts(),
            orders: this.getOrders(),
            users: this.getUsers()
          }, null, 2);
          fetch('/api/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
          }).catch(() => {});
        }
      } catch (e) {}
    }
  },

  // Kéo dữ liệu mới nhất từ Supabase Cloud hoặc Local API
  async pullFromServer() {
    if (typeof window !== 'undefined') {
      try {
        // 1. Thử kéo từ Supabase Cloud trước
        if (window.SupabaseDB) {
          const cloudProducts = await window.SupabaseDB.getProducts();
          if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
            let localProducts = [];
            try {
              localProducts = JSON.parse(localStorage.getItem(this.KEYS.PRODUCTS) || '[]');
            } catch (e) {}

            const mergedProducts = cloudProducts.map(cp => {
              const lp = localProducts.find(p => p.id === cp.id);
              if (lp) {
                const img = cp.image || (cp.posterTheme && cp.posterTheme.image) || (cp.poster_theme && cp.poster_theme.image) || lp.image || (lp.posterTheme && lp.posterTheme.image) || '';
                return {
                  ...cp,
                  ...lp,
                  image: img,
                  posterTheme: {
                    ...(cp.posterTheme || {}),
                    ...(lp.posterTheme || {}),
                    image: img
                  }
                };
              }
              return cp;
            });

            localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(mergedProducts));

            const cloudOrders = await window.SupabaseDB.getOrders();
            if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
              localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(cloudOrders));
            }

            const cloudUsers = await window.SupabaseDB.getProfiles();
            if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
              localStorage.setItem(this.KEYS.USERS, JSON.stringify(cloudUsers));
            }

            const cloudSettings = await window.SupabaseDB.getSettings();
            if (cloudSettings) {
              localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(cloudSettings));
            }

            const cloudAuthor = await window.SupabaseDB.getAuthor();
            if (cloudAuthor) {
              localStorage.setItem(this.KEYS.AUTHOR, JSON.stringify(cloudAuthor));
            }

            window.dispatchEvent(new CustomEvent('aic_db_synced', {
              detail: { products: mergedProducts, orders: cloudOrders, users: cloudUsers, settings: cloudSettings, author: cloudAuthor }
            }));
            return true;
          }
        }

        // 2. Fallback sang /api/db nếu đang chạy server Node/PowerShell
        if (window.location.protocol.startsWith('http')) {
          const res = await fetch('/api/db');
          if (res.ok) {
            const data = await res.json();
            if (data && data.products && Array.isArray(data.products) && data.products.length > 0) {
              let localProducts = [];
              try {
                localProducts = JSON.parse(localStorage.getItem(this.KEYS.PRODUCTS) || '[]');
              } catch (e) {}

              const mergedProducts = data.products.map(dp => {
                const lp = localProducts.find(p => p.id === dp.id);
                if (lp) {
                  const img = dp.image || (dp.posterTheme && dp.posterTheme.image) || lp.image || (lp.posterTheme && lp.posterTheme.image) || '';
                  return {
                    ...dp,
                    ...lp,
                    image: img,
                    posterTheme: {
                      ...(dp.posterTheme || {}),
                      ...(lp.posterTheme || {}),
                      image: img
                    }
                  };
                }
                return dp;
              });

              localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(mergedProducts));
              if (data.orders && Array.isArray(data.orders)) {
                localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(data.orders));
              }
              if (data.users && Array.isArray(data.users)) {
                localStorage.setItem(this.KEYS.USERS, JSON.stringify(data.users));
              }
              if (data.settings) {
                localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(data.settings));
              }
              if (data.author) {
                localStorage.setItem(this.KEYS.AUTHOR, JSON.stringify(data.author));
              }
              window.dispatchEvent(new CustomEvent('aic_db_synced', { detail: { ...data, products: mergedProducts } }));
              return true;
            }
          }
        }
      } catch (e) {
        console.warn('[DB] Lỗi đồng bộ dữ liệu từ server:', e);
      }
    }
    return false;
  },

  broadcastChange(type) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('aic_db_timestamp', Date.now().toString());
        window.dispatchEvent(new CustomEvent('aic_db_changed', { detail: { type } }));
      } catch (e) {}
    }
  },

  // Author CRUD
  getAuthor() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.AUTHOR)) || {
        name: "Phú Nguyễn",
        title: "Admin & Sáng lập viên",
        phone: "0852 241 386",
        zalo: "0852241386",
        email: "ganhteam321@gmail.com",
        youtube_url: "https://www.youtube.com",
        facebook_url: "https://www.facebook.com",
        tiktok_url: "https://www.tiktok.com",
        avatar_url: "",
        bio: "Sáng tạo công cụ & Chatbot tạo video AI tự động"
      };
    } catch (e) {
      return {
        name: "Phú Nguyễn",
        title: "Admin & Sáng lập viên",
        phone: "0852 241 386",
        zalo: "0852241386",
        email: "ganhteam321@gmail.com",
        youtube_url: "https://www.youtube.com",
        facebook_url: "https://www.facebook.com",
        tiktok_url: "https://www.tiktok.com",
        avatar_url: "",
        bio: "Sáng tạo công cụ & Chatbot tạo video AI tự động"
      };
    }
  },

  saveAuthor(author) {
    localStorage.setItem(this.KEYS.AUTHOR, JSON.stringify(author));
    this.broadcastChange('author');
    if (window.SupabaseDB) {
      window.SupabaseDB.saveAuthor(author).catch(() => {});
    }
  },

  // Settings CRUD
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS)) || {
        storeName: "AI Store",
        hotline: "0852 241 386",
        supportZalo: "0852241386",
        storageMode: "server_synced"
      };
    } catch (e) {
      return {};
    }
  },

  saveSettings(settings) {
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    this.broadcastChange('settings');
    this.pushToServer();
  },

  // Products CRUD
  getProductRealSold(productId, ordersList) {
    if (!productId) return 0;
    const orders = ordersList || this.getOrders();
    return orders.filter(o =>
      (o.productId === productId || o.id === productId) &&
      (o.status === 'paid' || o.statusText === 'Đã thanh toán')
    ).length;
  },

  getProducts() {
    this.init();
    try {
      const stored = localStorage.getItem(this.KEYS.PRODUCTS);
      let items = stored ? JSON.parse(stored) : null;
      if (!Array.isArray(items) || items.length === 0) {
        items = STORE_DATA.products.map(p => ({ ...p, active: true }));
      }
      const orders = this.getOrders();
      return items.map(p => {
        const realCount = this.getProductRealSold(p.id, orders);
        const soldReal = (p.sold_real !== undefined) ? Math.max(Number(p.sold_real), realCount) : realCount;
        const soldFake = (p.sold_fake !== undefined) ? Number(p.sold_fake) : (Number(p.sold) || 0);
        return {
          ...p,
          sold_fake: soldFake,
          sold_real: soldReal,
          sold: soldFake + soldReal
        };
      });
    } catch (e) {
      return STORE_DATA.products.map(p => ({
        ...p,
        active: true,
        sold_fake: Number(p.sold) || 0,
        sold_real: 0,
        sold: Number(p.sold) || 0
      }));
    }
  },

  getActiveProducts() {
    return this.getProducts().filter(p => p.active !== false);
  },

  saveProducts(products) {
    localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
    this.broadcastChange('products');
    this.pushToServer();
  },

  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  },

  updateOrAddProduct(product) {
    if (!product || !product.id) return;
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      products[index] = { ...products[index], ...product };
    } else {
      products.unshift(product);
    }
    this.saveProducts(products);
    return product;
  },

  syncProducts(newProducts) {
    if (!Array.isArray(newProducts)) return;
    const current = this.getProducts();
    newProducts.forEach(np => {
      if (!np || !np.id) return;
      const idx = current.findIndex(p => p.id === np.id);
      if (idx !== -1) {
        current[idx] = { ...current[idx], ...np };
      } else {
        current.unshift(np);
      }
    });
    this.saveProducts(current);
  },

  addProduct(newProduct) {
    const products = this.getProducts();
    if (!newProduct.id) {
      newProduct.id = 'app-' + Date.now();
    }
    newProduct.active = newProduct.active !== false;
    
    // Normalize sold_fake, sold_real and total sold
    const soldFake = Math.max(0, Number(newProduct.sold_fake !== undefined ? newProduct.sold_fake : newProduct.sold) || 0);
    const soldReal = Math.max(0, Number(newProduct.sold_real) || 0);
    newProduct.sold_fake = soldFake;
    newProduct.sold_real = soldReal;
    newProduct.sold = soldFake + soldReal;

    newProduct.remainingSlots = Number(newProduct.remainingSlots) || 150;
    newProduct.price = Number(newProduct.price) || 99000;
    newProduct.gia_trial = Number(newProduct.gia_trial) || 9000;
    newProduct.original_price = Number(newProduct.original_price) || Math.round(newProduct.price * 1.5);
    newProduct.createdAt = new Date().toISOString();

    if (!newProduct.posterTheme) {
      newProduct.posterTheme = {
        badge: (newProduct.categoryName || "AI APP").toUpperCase(),
        highlight: newProduct.title.toUpperCase(),
        tagline: newProduct.subtitle || "Tự động tạo video AI chuyên nghiệp",
        color: newProduct.category === 'chatbot' ? '#EA580C' : '#D97706',
        bgGradient: 'linear-gradient(180deg, #241D17 0%, #17130F 60%, #0E0B09 100%)'
      };
    }

    const existingIdx = products.findIndex(p => p.id === newProduct.id);
    if (existingIdx !== -1) {
      products[existingIdx] = { ...products[existingIdx], ...newProduct };
    } else {
      products.unshift(newProduct);
    }

    this.saveProducts(products);
    if (window.SupabaseDB) {
      window.SupabaseDB.upsertProduct(newProduct).catch(() => {});
    }
    return newProduct;
  },

  updateProduct(id, updatedData) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      const existing = products[index];
      const soldFake = (updatedData.sold_fake !== undefined) 
        ? Math.max(0, Number(updatedData.sold_fake) || 0) 
        : ((existing.sold_fake !== undefined) ? existing.sold_fake : (existing.sold || 0));
      const realCount = this.getProductRealSold(id);
      const soldReal = (updatedData.sold_real !== undefined) 
        ? Math.max(Number(updatedData.sold_real) || 0, realCount) 
        : Math.max(Number(existing.sold_real) || 0, realCount);

      products[index] = { 
        ...existing, 
        ...updatedData,
        sold_fake: soldFake,
        sold_real: soldReal,
        sold: soldFake + soldReal
      };
      this.saveProducts(products);
      if (window.SupabaseDB) {
        window.SupabaseDB.upsertProduct(products[index]).catch(() => {});
      }
      return products[index];
    }
    return null;
  },

  deleteProduct(id) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    this.saveProducts(products);
    if (window.SupabaseDB) {
      window.SupabaseDB.deleteProduct(id).catch(() => {});
    }
  },

  toggleProductActive(id) {
    const products = this.getProducts();
    const p = products.find(item => item.id === id);
    if (p) {
      p.active = !p.active;
      this.saveProducts(products);
      if (window.SupabaseDB) {
        window.SupabaseDB.upsertProduct(p).catch(() => {});
      }
      return p.active;
    }
    return false;
  },

  incrementProductSold(id) {
    const products = this.getProducts();
    const p = products.find(item => item.id === id);
    if (p) {
      p.sold_real = (Number(p.sold_real) || 0) + 1;
      const fake = (p.sold_fake !== undefined) ? (Number(p.sold_fake) || 0) : (Number(p.sold) || 0);
      p.sold_fake = fake;
      p.sold = p.sold_fake + p.sold_real;
      p.remainingSlots = Math.max(0, (Number(p.remainingSlots) || 150) - 1);
      this.saveProducts(products);
      if (window.SupabaseDB) {
        window.SupabaseDB.upsertProduct(p).catch(() => {});
      }
    }
  },

  // Orders Management
  getOrders() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.ORDERS)) || [];
    } catch (e) {
      return [];
    }
  },

  saveOrders(orders) {
    localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(orders));
    this.broadcastChange('orders');
    this.pushToServer();
  },

  addOrder(newOrder) {
    const orders = this.getOrders();
    if (!newOrder.code) {
      newOrder.code = 'AIC-' + Math.floor(100000 + Math.random() * 900000);
    }
    if (!newOrder.date) {
      newOrder.date = new Date().toLocaleDateString('vi-VN');
    }
    if (!newOrder.status) {
      newOrder.status = 'paid';
      newOrder.statusText = 'Đã thanh toán';
    }
    orders.unshift(newOrder);
    this.saveOrders(orders);

    // Đồng bộ lên Supabase Cloud
    if (window.SupabaseDB) {
      window.SupabaseDB.createOrder(newOrder).catch(() => {});
    }

    // Increment product sold count if valid product ID
    const targetPid = newOrder.productId || newOrder.id;
    if (targetPid) {
      this.incrementProductSold(targetPid);
    }

    // Update customer spending in users table
    if (newOrder.customerEmail) {
      this.recordUserPurchase(newOrder.customerEmail, newOrder.amount);
    }

    return newOrder;
  },

  updateOrderStatus(orderId, newStatus, accessUrl) {
    const orders = this.getOrders();
    const order = orders.find(o => o.code === orderId || o.id === orderId);
    if (order) {
      order.status = newStatus;
      order.statusText = newStatus === 'paid' ? 'Đã thanh toán' : (newStatus === 'cancelled' ? 'Đã hủy' : 'Chờ thanh toán');
      if (accessUrl !== undefined) {
        order.accessUrl = accessUrl;
      }
      this.saveOrders(orders);

      if (window.SupabaseDB) {
        window.SupabaseDB.updateOrderStatus(order.code, order.status, order.statusText, order.accessUrl).catch(() => {});
      }
      return order;
    }
    return null;
  },

  // Users Management
  getUsers() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.USERS)) || [];
    } catch (e) {
      return [];
    }
  },

  saveUsers(users) {
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    this.broadcastChange('users');
    this.pushToServer();
  },

  recordUserPurchase(email, amount) {
    const users = this.getUsers();
    let u = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (u) {
      u.totalOrders = (Number(u.totalOrders) || 0) + 1;
      u.totalSpent = (Number(u.totalSpent) || 0) + (Number(amount) || 0);
      u.lastTransaction = new Date().toLocaleDateString('vi-VN');
    } else {
      users.push({
        email: email,
        phone: '',
        role: 'customer',
        status: 'active',
        createdAt: new Date().toLocaleDateString('vi-VN'),
        totalOrders: 1,
        totalSpent: Number(amount) || 0
      });
    }
    this.saveUsers(users);
  },

  toggleUserLock(email) {
    const users = this.getUsers();
    const u = users.find(user => user.email === email);
    if (u) {
      u.status = u.status === 'locked' ? 'active' : 'locked';
      this.saveUsers(users);
      return u.status;
    }
    return 'active';
  },

  // KPI Calculations
  getKPIs() {
    const products = this.getProducts();
    const orders = this.getOrders();
    const users = this.getUsers();

    const paidOrders = orders.filter(o => o.status === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    const activeProducts = products.filter(p => p.active !== false).length;

    return {
      totalRevenue,
      totalOrders: orders.length,
      paidOrdersCount: paidOrders.length,
      activeProducts,
      totalUsers: users.length
    };
  },

  // Reset factory seed data
  resetData() {
    localStorage.removeItem(this.KEYS.PRODUCTS);
    localStorage.removeItem(this.KEYS.ORDERS);
    localStorage.removeItem(this.KEYS.USERS);
    localStorage.removeItem(this.KEYS.SETTINGS);
    this.init();
    this.pushToServer();
  }
};

// Expose DB globally
if (typeof window !== 'undefined') {
  window.DB = DB;
}

// Initialize DB right away
DB.init();

