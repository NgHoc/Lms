import React, { useState } from 'react';
import { Layers, Database, Code, Server, ArrowRight, ShieldCheck, FileSpreadsheet, Cpu } from 'lucide-react';

export default function ArchitectureViewer() {
  const [activeSubTab, setActiveSubTab] = useState('stack');

  return (
    <div style={{ maxWidth: '1200px', margin: '1.5rem auto', padding: '0 0.5rem' }}>
      {/* Header Banner */}
      <div className="lms-card" style={{ padding: '1.75rem 1.25rem', marginBottom: '1.5rem', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Layers style={{ color: '#1e40af', flexShrink: 0 }} size={28} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
            Hồ Sơ Kiến Trúc System & Tài Liệu Thiết Kế Kỹ Thuật
          </h2>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Báo cáo tư vấn giải pháp toàn diện cho Hệ thống LMS Sinh viên (Tech Stack, DB Schema ERD, Thuật toán bóc tách file Word/PDF màu sắc & API Flow).
        </p>

        {/* Sub-nav tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveSubTab('stack')}
            className={activeSubTab === 'stack' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.85rem' }}
          >
            <Server size={16} />
            1. Tech Stack
          </button>

          <button
            onClick={() => setActiveSubTab('schema')}
            className={activeSubTab === 'schema' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.85rem' }}
          >
            <Database size={16} />
            2. Database Schema (ERD)
          </button>

          <button
            onClick={() => setActiveSubTab('algorithm')}
            className={activeSubTab === 'algorithm' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.85rem' }}
          >
            <Cpu size={16} />
            3. Thuật Toán Bóc Tách File
          </button>

          <button
            onClick={() => setActiveSubTab('api')}
            className={activeSubTab === 'api' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.85rem' }}
          >
            <Code size={16} />
            4. Luồng API Specs
          </button>
        </div>
      </div>

      {/* Content 1: Tech Stack */}
      {activeSubTab === 'stack' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="lms-card" style={{ padding: '1.5rem', borderTop: '4px solid #1e40af' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.75rem' }}>
              Backend & Core Processing Engine
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li><strong>Python (FastAPI):</strong> Async framework hiệu năng cao, tích hợp thư viện bóc tách file native.</li>
              <li><strong>python-docx:</strong> Đọc trực tiếp cấu trúc XML Word, r.font.color.rgb, w:rPr & trích xuất inline shapes/images.</li>
              <li><strong>PyMuPDF (fitz):</strong> Đọc file PDF, trích xuất text spans kèm thuộc tính RGB color & font bounding box.</li>
              <li><strong>SQLAlchemy 2.0:</strong> ORM bất đồng bộ giao tiếp PostgreSQL.</li>
            </ul>
          </div>

          <div className="lms-card" style={{ padding: '1.5rem', borderTop: '4px solid #10b981' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginBottom: '0.75rem' }}>
              Database & Caching Layer
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li><strong>PostgreSQL 16:</strong> Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, hỗ trợ native JSONB cho mảnh ghép kéo thả & câu hỏi phức hợp.</li>
              <li><strong>Redis 7:</strong> Bộ nhớ đệm tốc độ cao lưu trữ thời gian đồng hồ đếm ngược, state làm bài và autosave chống mất bài thi.</li>
            </ul>
          </div>

          <div className="lms-card" style={{ padding: '1.5rem', borderTop: '4px solid #f59e0b' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.75rem' }}>
              Frontend & UI/UX Experience
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li><strong>React 18 + Vite:</strong> Đóng gói cực nhanh, phản hồi tức thì.</li>
              <li><strong>Vanilla CSS System:</strong> Tùy biến màu Trắng - Xanh chủ đạo (White & Primary Blue) giảm mỏi mắt cho sinh viên.</li>
              <li><strong>HTML5 Drag & Drop API:</strong> Xử lý tương tác kéo thả từ khóa mượt mà cho Dạng câu hỏi 3.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Content 2: Database Schema */}
      {activeSubTab === 'schema' && (
        <div className="lms-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            Thiết Kế Cơ Sở Dữ Liệu PostgreSQL (Relational ERD Tables)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {[
              {
                name: 'courses',
                cols: ['id (UUID, PK)', 'code (VARCHAR)', 'title (VARCHAR)', 'description (TEXT)', 'created_at (TIMESTAMP)']
              },
              {
                name: 'lessons',
                cols: ['id (UUID, PK)', 'course_id (UUID, FK)', 'lesson_number (INT)', 'title (VARCHAR)']
              },
              {
                name: 'questions',
                cols: ['id (UUID, PK)', 'lesson_id (UUID, FK)', 'type (SINGLE_CHOICE / MULTI_CHOICE / TRUE_FALSE / DRAG_DROP)', 'content_text (TEXT)', 'image_urls (JSONB)', 'explanation (TEXT)']
              },
              {
                name: 'question_options',
                cols: ['id (UUID, PK)', 'question_id (UUID, FK)', 'option_key (VARCHAR)', 'content_text (TEXT)', 'is_correct (BOOLEAN)', 'color_hex (VARCHAR)', 'metadata (JSONB)']
              },
              {
                name: 'quiz_sessions',
                cols: ['id (UUID, PK)', 'student_id (UUID, FK)', 'course_id (UUID, FK)', 'mode (TEST_15 / TEST_30 / TEST_60)', 'started_at', 'expires_at', 'total_score (FLOAT, 0-10)']
              },
              {
                name: 'quiz_student_answers',
                cols: ['id (UUID, PK)', 'quiz_session_id (UUID, FK)', 'question_id (UUID, FK)', 'selected_option_ids (JSONB)', 'is_correct (BOOLEAN)']
              }
            ].map((tbl, i) => (
              <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: '#f8fafc' }}>
                <div style={{ fontWeight: 800, color: '#1e40af', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                  TABLE: {tbl.name}
                </div>
                <ul style={{ fontSize: '0.8rem', color: '#334155', listStyle: 'inside square' }}>
                  {tbl.cols.map((c, cI) => <li key={cI}>{c}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content 3: Parsing Algorithm */}
      {activeSubTab === 'algorithm' && (
        <div className="lms-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            Thuật Toán Bóc Tách File Word (.docx) & PDF Bằng Phân Biệt Màu Sắc Chữ
          </h3>

          <div style={{ backgroundColor: '#0f172a', color: '#38bdf8', padding: '1.25rem', borderRadius: '10px', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6, overflowX: 'auto' }}>
{`def parse_document_by_color(file_path, lesson_id):
    # 1. Khởi tạo Document object & Danh sách chứa câu hỏi
    doc = docx.Document(file_path)
    questions = []
    
    # 2. Duyệt từng paragraph trong file Word
    for p in doc.paragraphs:
        # Kiểm tra màu sắc của từng Text Run (<w:rPr><w:color w:val="FF0000"/></w:rPr>)
        red_runs = []
        for run in p.runs:
            color = run.font.color.rgb or get_xml_color(run)
            if is_red_threshold(color): # Red R > 180, G < 70, B < 70
                red_runs.append(run.text)
        
        # 3. Phân loại dạng câu hỏi:
        if is_question_header(p.text):
            create_new_question_node()
        elif is_option_format(p.text): # 'A.', 'B.', 'C.', 'D.'
            is_correct = len(red_runs) > 0 # Nếu text option bôi đỏ -> Là đáp án đúng!
            append_option(is_correct=is_correct)
        elif 'Đúng' in p.text and 'Sai' in p.text:
            # Dạng 2: True/False -> Nếu chữ 'Đúng' được bôi đỏ -> Correct = True
            is_true = 'Đúng' in red_runs
            append_tf_option(is_true)
        elif len(red_runs) > 0:
            # Dạng 3: Điền khuyết / Kéo thả -> Các từ bôi đỏ được đục lỗ thành ___
            blank_text = replace_keywords_with_blanks(p.text, red_runs)
            create_drag_drop_question(blank_text, drag_items=red_runs)`}
          </div>
        </div>
      )}

      {/* Content 4: API Flow */}
      {activeSubTab === 'api' && (
        <div className="lms-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            Danh Sách & Luồng Giao Tiếp RESTful API
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { method: 'POST', endpoint: '/api/v1/admin/lessons/{lesson_id}/upload-bank', desc: 'Admin upload file Word/PDF. Backend thực thi thuật toán bóc tách màu sắc & lưu DB.' },
              { method: 'POST', endpoint: '/api/v1/quizzes/start', desc: 'Sinh đề thi ngẫu nhiên theo chế độ (TEST_15, TEST_30, TEST_60). Trả về session_id & câu hỏi không chứa answer key.' },
              { method: 'POST', endpoint: '/api/v1/quizzes/{session_id}/autosave', desc: 'Autosave đáp án chọn của sinh viên theo thời gian thực vào Redis cache.' },
              { method: 'POST', endpoint: '/api/v1/quizzes/{session_id}/submit', desc: 'Chấm điểm tự động trên thang 10, lưu lịch sử bài làm & trả về báo cáo kết quả chi tiết.' },
              { method: 'GET', endpoint: '/api/v1/quizzes/history', desc: 'Tra cứu lịch sử làm bài thi & biểu đồ điểm số của sinh viên.' }
            ].map((api, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  backgroundColor: api.method === 'POST' ? '#10b981' : '#1e40af',
                  color: '#ffffff'
                }}>
                  {api.method}
                </span>
                <code style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', minWidth: '320px' }}>
                  {api.endpoint}
                </code>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {api.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
