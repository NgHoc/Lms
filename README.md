# 🎓 NgHoc - Nền Tảng Ôn Thi & Trắc Nghiệm Thông Minh

<p align="center">
  <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80" alt="NgHoc Banner" width="100%" style="border-radius: 12px; max-height: 350px; object-fit: cover;" />
</p>

<p align="center">
  <strong>Hệ thống quản lý học tập, bóc tách đề thi tự động từ file Word (.docx) và luyện thi trắc nghiệm thông minh offline-first.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5.1.6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/JSZip-3.10.1-FF6600?style=for-the-badge&logo=javascript&logoColor=white" alt="JSZip" />
  <img src="https://img.shields.io/badge/Lucide_Icons-0.344.0-F97316?style=for-the-badge" alt="Lucide React" />
  <img src="https://img.shields.io/badge/Storage-LocalStorage%20v2-10B981?style=for-the-badge" alt="LocalStorage" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

---

## 📑 Mục Lục

- [🌟 Giới Thiệu Dự Án](#-giới-thiệu-dự-án)
- [✨ Tính Năng Nổi Bật](#-tính-năng-nổi-bật)
- [🧩 Các Dạng Câu Hỏi Hỗ Trợ](#-các-dạng-câu-hỏi-hỗ-trợ)
- [🛠️ Hướng Dẫn Soạn Thảo File Word (.docx) Chuẩn](#️-hướng-dẫn-soạn-thảo-file-word-docx-chuẩn)
- [🏗️ Cấu Trúc Thư Mục](#️-cấu-trúc-thư-mục)
- [🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án](#-hướng-dẫn-cài-đặt--chạy-dự-án)
- [💡 Chi Tiết Các Phân Hệ Chính](#-chi-tiết-các-phân-hệ-chính)
  - [1. Trang Chủ Tương Tác (Assist Hero)](#1-trang-chủ-tương-tác-assist-hero)
  - [2. Phòng Ôn Luyện & Thi Trắc Nghiệm (Quiz System)](#2-phòng-ôn-luyện--thi-trắc-nghiệm-quiz-system)
  - [3. Quản Lý Nội Dung Học Tập (Course Manager)](#3-quản-lý-nội-dung-học-tập-course-manager)
  - [4. Bóc Tách Đề Thi Tự Động (Docx Parser Engine)](#4-bóc-tách-đề-thi-tự-động-docx-parser-engine)
  - [5. Trung Tâm Hướng Dẫn Video Tương Tác (Interactive Guide)](#5-trung-tâm-hướng-dẫn-video-tương-tác-interactive-guide)
- [🏛️ Kiến Trúc Hệ Thống & Cơ Sở Dữ Liệu (Technical Specs)](#️-kiến-trúc-hệ-thống--cơ-sở-dữ-liệu-technical-specs)
- [🤝 Đóng Góp & Phát Triển](#-đóng-góp--phát-triển)
- [📄 Giấy Phép (License)](#-giấy-phép-license)

---

## 🌟 Giới Thiệu Dự Án

**NgHoc** là nền tảng ôn luyện và kiểm tra trắc nghiệm thông minh, hiện đại, được xây dựng nhằm giải quyết bài toán nhập liệu đề thi thủ công mất thời gian của giảng viên và tối ưu hóa trải nghiệm làm bài thi của học sinh, sinh viên.

Hệ thống tích hợp thuật toán **2-Pass Smart XML Docx Parser** độc quyền, cho phép tự động quét toàn bộ cấu trúc file Word (`.docx`), phân biệt màu chữ đỏ để nhận diện đáp án chính xác cho nhiều dạng đề thi từ cơ bản đến phức tạp (trắc nghiệm đơn, trắc nghiệm nhiều đáp án, Đúng/Sai, kéo thả từ khóa, nối cặp và phân loại bảng).

---

## ✨ Tính Năng Nổi Bật

| Phân hệ | Tính năng chính |
| :--- | :--- |
| ⚡ **Smart Docx Parser** | Tự động phân tích file Word `.docx` 100% ở phía client, nhận diện đáp án bôi đỏ, kiểm tra lỗi và cảnh báo thiếu đáp án trước khi lưu. |
| 📝 **Phòng Thi Đa Chế Độ** | Hỗ trợ các chế độ thi **15 câu** (15 phút), **30 câu** (30 phút), **60 câu** (60 phút) hoặc **Tùy biến bài học** tự chọn. |
| 🎯 **Ma Trận Câu Hỏi & Đánh Dấu** | Bảng điều hướng câu hỏi thời gian thực: Đã làm, Chưa làm, Cần xem lại (Flag) và Đang làm. |
| 📊 **Chấm Điểm & Thống Kê** | Chấm điểm tự động trên thang 10, hiển thị tỷ lệ chính xác, lưu trữ lịch sử làm bài theo từng học phần và biểu đồ phân tích năng lực. |
| 📚 **Quản Lý Học Phần 3 Tầng** | Quản lý toàn diện theo mô hình phân cấp: **Học phần (Courses) ➔ Bài học (Lessons) ➔ Câu hỏi (Questions)** với đầy đủ CRUD. |
| 💾 **Offline-First & Auto-Sync** | Dữ liệu lưu trữ bền vững tại `LocalStorage` (v2), tự động đồng bộ tức thì, không lo mất dữ liệu khi làm bài. |
| 🎨 **Giao Diện Liquid-Glass** | Thiết kế cao cấp theo phong cách Glassmorphism, Floating Navbar, hiệu ứng Ambient Radial Glow và thân thiện với thiết bị di động. |
| 🔊 **Web Audio Synthesizer** | Tích hợp bộ phát hiệu ứng âm thanh tương tác (Click, Chime, Success) trực tiếp qua Web Audio API thuần túy. |

---

## 🧩 Các Dạng Câu Hỏi Hỗ Trợ

Hệ thống hỗ trợ 4 nhóm dạng câu hỏi phổ biến nhất hiện nay:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CÁC DẠNG CÂU HỎI TRẮC NGHIỆM                    │
├───────────────────┬────────────────────────────────────────────────────┤
│ 1. SINGLE_CHOICE  │ Trắc nghiệm 1 đáp án đúng (A, B, C, D)             │
├───────────────────┼────────────────────────────────────────────────────┤
│ 2. MULTI_CHOICE   │ Trắc nghiệm chọn nhiều đáp án đúng                 │
├───────────────────┼────────────────────────────────────────────────────┤
│ 3. TRUE_FALSE     │ Xác định Đúng / Sai cho từng mệnh đề con           │
├───────────────────┼────────────────────────────────────────────────────┤
│ 4. DRAG_DROP      │ • Điền khuyết inline (Đục lỗ từ khóa)              │
│                   │ • Nối cặp / Điền bảng (Match pairs)                │
│                   │ • Phân loại nhóm theo cột (Categorize table)       │
└───────────────────┴────────────────────────────────────────────────────┘
```

---

## 🛠️ Hướng Dẫn Soạn Thảo File Word (.docx) Chuẩn

Để công cụ bóc tách tự động đạt độ chính xác 100%, bạn chỉ cần tuân thủ quy ước định dạng đơn giản sau trong Microsoft Word:

### 1. Dạng Trắc Nghiệm (Single / Multi Choice)
- Tiêu đề bắt đầu bằng: `Câu 1:`, `Câu hỏi 2:` hoặc `Câu 3.`
- Các phương án ghi rõ: `A.`, `B.`, `C.`, `D.`
- **Quy tắc đáp án:** Tô **màu đỏ** (`#FF0000` hoặc màu đỏ chuẩn) cho nội dung đáp án đúng (tô cả dòng hoặc tô ký tự A/B/C/D).

```text
Câu 1: Tác phẩm nào đánh dấu sự ra đời của chủ nghĩa xã hội khoa học?
A. Tuyên ngôn của Đảng Cộng sản (Tô màu đỏ vào phương án này)
B. Tình cảnh nước Anh
C. Bộ tư bản
D. Biện chứng của tự nhiên
```

### 2. Dạng Đúng / Sai (True / False)
- Tiêu đề câu hỏi xác định nhận định Đúng / Sai.
- Mỗi mệnh đề con có thể đánh số `1.`, `2.`, `3.` hoặc không đánh số.
- Dưới mỗi mệnh đề ghi chữ `Đúng` hoặc `Sai` (hoặc tô đỏ chữ đúng).

```text
Câu 2: Xác định tính Đúng / Sai của các nhận định sau:
1. Sứ mệnh lịch sử của giai cấp công nhân mang tính chất quốc tế.
Đúng (Tô màu đỏ)
2. Giai cấp công nhân chỉ hoạt động trong phạm vi một quốc gia riêng lẻ.
Sai (Tô màu đỏ)
```

### 3. Dạng Điền Khuyết / Kéo Thả Từ Khóa (Inline Drag & Drop)
- Trong đoạn văn bản, các từ khóa cần đục lỗ chỉ cần **bôi màu đỏ**.
- Hệ thống sẽ tự động biến các từ màu đỏ thành các ô trống `[BLANK_X]` và tạo danh sách từ khóa xáo trộn để người học kéo thả.

### 4. Dạng Bảng Nối Cặp & Phân Loại (Table Match / Categorize)
- **Bảng nối cặp:** Cột 1 là nội dung câu hỏi/phát biểu (có `___`), Cột 2 là đáp án đúng được **tô đỏ**.
- **Bảng phân loại (Categorize):** Hàng đầu là tiêu đề các cột/nhóm. Các hàng bên dưới chứa các mục con cần phân loại vào từng cột (được tô đỏ).

---

## 🏗️ Cấu Trúc Thư Mục

```
lms-new/
├── index.html                       # HTML entry point, Google Fonts preconnect
├── package.json                     # Thông tin dự án & khai báo dependencies
├── vite.config.js                   # Cấu hình Vite build & React plugin
├── src/
│   ├── main.jsx                     # Khởi tạo React Root
│   ├── App.jsx                      # Root Component, Navigation & Shared State
│   ├── index.css                    # Design system, CSS variables & animations
│   ├── mockData.js                  # Cấu trúc schema dữ liệu mẫu
│   │
│   ├── components/
│   │   ├── Header.jsx               # Floating Glassmorphism Navbar & Mobile Drawer
│   │   ├── AssistHero.jsx           # Landing Page Hero với Video Robot Companion
│   │   ├── AssistHero.css           # Styling chuyên biệt cho Hero & Floating Badges
│   │   ├── QuizSystem.jsx           # Hệ thống phòng thi, ma trận câu hỏi & làm bài
│   │   ├── QuizResult.jsx           # Báo cáo kết quả, xếp loại & phân tích bài làm
│   │   ├── LessonSelector.jsx       # Bộ lọc chọn bài học tùy biến để tạo đề thi
│   │   ├── CourseManager.jsx        # Quản lý CRUD Học phần, Bài học và Câu hỏi
│   │   ├── AdminParser.jsx          # Giao diện tải lên & bóc tách file Word .docx
│   │   ├── GuideVideoModal.jsx      # Video hướng dẫn tương tác 8 chương kèm Web Audio SFX
│   │   ├── ArchitectureViewer.jsx   # Bản vẽ kiến trúc hệ thống & Database ERD
│   │   ├── Toast.jsx                # Component thông báo Toast nổi
│   │   └── ModernLmsTheme.css       # Theme màu sắc, cards, inputs & utilities
│   │
│   ├── hooks/
│   │   └── useBodyScrollLock.js     # Custom hook khóa cuộn trang khi mở modal
│   │
│   ├── store/
│   │   └── lmsStore.js              # Quản lý LocalStorage, lịch sử & tính toán thống kê
│   │
│   └── utils/
│       └── docxParser.js            # Engine phân tích cú pháp XML Word 2-Pass
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu Cầu Môi Trường
- **Node.js**: Phiên bản `18.x` hoặc `20.x` trở lên.
- **Trình duyệt**: Google Chrome, Microsoft Edge, Firefox, Safari phiên bản mới nhất hỗ trợ ES Modules & Web Audio API.

### 1. Clone hoặc Mở Dự Án
```bash
cd d:/lms-new
```

### 2. Cài Đặt Dependencies
```bash
npm install
```

### 3. Khởi Chạy Server Phát Triển (Development)
```bash
npm run dev
```
Sau khi chạy lệnh, ứng dụng sẽ khả dụng tại địa chỉ mặc định: `http://localhost:5173/`

### 4. Build Bản Production
```bash
npm run build
```
Thư mục xuất bản tối ưu hóa sẽ được tạo tại `/dist`.

### 5. Xem Trước Bản Build (Preview)
```bash
npm run preview
```

---

## 💡 Chi Tiết Các Phân Hệ Chính

### 1. Trang Chủ Tương Tác (Assist Hero)
- **Thiết kế Liquid-Glass:** Giao diện 2 cột hiện đại với hiệu ứng ánh sáng mờ ảo (Ambient Radial Glow).
- **Robot Companion Video:** Tích hợp video minh họa tương tác với đường quỹ đạo xoay SVG độc đáo.
- **Floating Badges:** Các huy hiệu nổi chuyển hướng nhanh tới các phân hệ: *Giải đáp thông minh*, *Bóc tách tài liệu*, *Quản lý nội dung*.
- **Thống kê thời gian thực:** Đếm số lượng Học phần, Bài học và Câu hỏi đang có trong hệ thống.

### 2. Phòng Ôn Luyện & Thi Trắc Nghiệm (Quiz System)
- **Đa dạng chế độ luyện thi:**
  - `TEST_15`: 15 câu / 15 phút theo từng bài học cụ thể.
  - `TEST_30`: 30 câu / 30 phút ôn luyện tổng hợp (chọn tối đa 3 bài học).
  - `TEST_60`: 60 câu / 60 phút thi thử toàn diện học phần.
  - `CUSTOM_LESSON_SET`: Lọc đề thi tùy biến linh hoạt số lượng và danh sách bài học.
- **Trải nghiệm phòng thi tối ưu:**
  - Ma trận câu hỏi trực quan với các trạng thái màu sắc rõ ràng (Đã chọn, Chưa chọn, Đang làm, Đánh dấu xem lại).
  - Đồng hồ đếm ngược với cảnh báo khi thời gian dưới 5 phút.
  - Tự động xáo trộn câu hỏi và các phương án trả lời mỗi lượt làm bài.
  - Kéo thả mượt mà trên cả máy tính và thiết bị di động cho các câu hỏi điền khuyết.
- **Báo cáo kết quả chi tiết:**
  - Quy đổi điểm sang thang điểm 10 chuẩn.
  - Đánh giá phân loại học lực (Xuất sắc, Khá giỏi, Đạt yêu cầu, Cần ôn tập thêm).
  - Bộ lọc xem lại chi tiết bài làm: *Tất cả*, *Chỉ câu đúng*, *Chỉ câu sai*.
  - Giải thích chi tiết đáp án kèm đối chiếu câu trả lời của người học.

### 3. Quản Lý Nội Dung Học Tập (Course Manager)
- **Quản lý phân cấp 3 cấp độ:**
  - **Cấp 1 (Học phần):** Mã học phần, Tên môn học, Mô tả tổng quan, số bài học và câu hỏi.
  - **Cấp 2 (Bài học):** Số thứ tự bài, Tên bài học thuộc từng học phần.
  - **Cấp 3 (Câu hỏi):** Dạng câu hỏi, nội dung, danh sách phương án, cấu hình đáp án đúng.
- **An toàn dữ liệu:** Hỗ trợ Cascade Delete có cảnh báo xác nhận khi xóa học phần hoặc bài học.
- **Bộ lọc thông minh:** Cho phép duyệt cây thư mục môn học dạng accordion mở rộng tiện lợi.

### 4. Bóc Tách Đề Thi Tự Động (Docx Parser Engine)
- **Thuật toán 2-Pass:**
  - *Pass 1 (Flatten & Color Extraction):* Phân giải cây DOM XML từ `word/document.xml`, bóc tách các thẻ `<w:p>`, `<w:r>`, đọc màu sắc `<w:color w:val="..."/>` và phân tích bảng biểu `<w:tbl>`.
  - *Pass 2 (Question Node Assembler):* Nhận diện cấu trúc câu hỏi, bóc tách phương án `A-D`, số thứ tự `1-4`, bảng nối cột hoặc phân loại, sau đó gắn cờ `isCorrect` cho các mục có màu đỏ.
- **Kiểm tra chất lượng đề thi (Quality Analyzer):** Tự động phát hiện và cảnh báo các câu hỏi chưa được tô đỏ đáp án hoặc thiếu dữ liệu trước khi lưu vào ngân hàng.
- **Test nhanh:** Chế độ nạp đề mẫu giả lập một chạm giúp kiểm tra tính năng mà không cần chuẩn bị file Word.

### 5. Trung Tâm Hướng Dẫn Video Tương Tác (Interactive Guide)
- Trình diễn 8 chương hướng dẫn chi tiết toàn bộ tính năng của hệ thống.
- Điều khiển đa phương tiện: Play/Pause, tua tiến/lùi 5s, điều chỉnh âm lượng, chế độ xem toàn màn hình (Fullscreen).
- Tích hợp phím tắt nhanh (`Space`, `M`, `F`, `Arrow Left/Right`).
- Âm thanh phản hồi trực quan bằng Web Audio API không phụ thuộc file audio tĩnh bên ngoài.

---

## 🏛️ Kiến Trúc Hệ Thống & Cơ Sở Dữ Liệu (Technical Specs)

### 1. Sơ Đồ Cơ Sở Dữ Liệu Tương Thích (Relational Schema)

```
┌─────────────────┐       ┌─────────────────┐       ┌────────────────────────┐
│     courses     │       │     lessons     │       │       questions        │
├─────────────────┤       ├─────────────────┤       ├────────────────────────┤
│ id (PK)         │◄──┐   │ id (PK)         │◄──┐   │ id (PK)                │
│ code            │   └───┤ course_id (FK)  │   └───┤ lesson_id (FK)         │
│ title           │       │ lesson_number   │       │ type (ENUM)            │
│ description     │       │ title           │       │ content_text (TEXT)    │
│ created_at      │       └─────────────────┘       │ image_urls (JSONB)     │
└─────────────────┘                                 │ explanation (TEXT)     │
                                                    └──────────┬─────────────┘
                                                               │
                                                               ▼
┌─────────────────────────┐                         ┌────────────────────────┐
│   quiz_student_answers  │                         │    question_options    │
├─────────────────────────┤                         ├────────────────────────┤
│ id (PK)                 │                         │ id (PK)                │
│ quiz_session_id (FK)    │                         │ question_id (FK) ──────┘
│ question_id (FK)        │                         │ option_key (VARCHAR)   │
│ selected_option_ids     │                         │ content_text (TEXT)    │
│ is_correct (BOOLEAN)    │                         │ is_correct (BOOLEAN)   │
└─────────────────────────┘                         │ metadata (JSONB)       │
                                                    └────────────────────────┘
```

### 2. Mô Hình Lưu Trữ LocalStorage v2 (Client Storage)
Hệ thống sử dụng các key lưu trữ phiên bản v2 độc lập:
- `lms_courses_v2`: Danh sách học phần.
- `lms_lessons_v2`: Danh sách bài học theo từng học phần.
- `lms_questions_v2`: Ngân hàng câu hỏi chi tiết.
- `lms_history_v2`: Toàn bộ lịch sử các lượt thi của người dùng.

---

## 🤝 Đóng Góp & Phát Triển

Mọi đóng góp nhằm cải thiện và nâng cao tính năng cho hệ thống đều được chào đón!

1. Fork dự án
2. Tạo nhánh tính năng mới (`git checkout -b feature/AmazingFeature`)
3. Commit các thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên nhánh của bạn (`git push origin feature/AmazingFeature`)
5. Mở một Pull Request

---

## 📄 Giấy Phép (License)

Dự án được phân phối dưới giấy phép **MIT License**. Bạn có thể tự do sử dụng, chỉnh sửa và triển khai cho mục đích học tập hoặc thương mại.

<p align="center">
  Được xây dựng với sự tâm huyết dành cho cộng đồng giáo dục và học tập thông minh. ❤️
</p>
