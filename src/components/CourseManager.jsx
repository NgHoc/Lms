import React, { useState } from 'react';
import {
  BookOpen, Layers, HelpCircle, Plus, Pencil, Trash2, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, Save, X, AlertTriangle, Eye, FileText
} from 'lucide-react';


const TYPE_LABELS = {
  SINGLE_CHOICE: 'Trắc nghiệm 1 đáp án',
  MULTI_CHOICE: 'Trắc nghiệm nhiều đáp án',
  TRUE_FALSE: 'Đúng / Sai',
  DRAG_DROP: 'Điền khuyết / Kéo thả'
};

const TYPE_COLORS = {
  SINGLE_CHOICE: '#1e40af',
  MULTI_CHOICE: '#7c3aed',
  TRUE_FALSE: '#0369a1',
  DRAG_DROP: '#065f46'
};

export default function CourseManager({ courses, setCourses, lessons, setLessons, questions, setQuestions }) {
  const [selectedCourseId, setSelectedCourseId] = useState(() => courses[0]?.id || null);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  const [modal, setModal] = useState(null); // {type, data, mode}
  const [confirmDelete, setConfirmDelete] = useState(null); // {type, id, name}
  const [editForm, setEditForm] = useState({});

  // Ensure valid selectedCourseId
  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0] || null;
  const activeLessons = activeCourse ? lessons.filter(l => l.courseId === activeCourse.id) : [];

  const getCourseBadgeColors = (code, index) => {
    const c = (code || '').toUpperCase();
    if (c.includes('TRIET') || index % 4 === 0) {
      return { bg: '#eef2ff', color: '#4f46e5', border: '#e0e7ff' };
    }
    if (c.includes('TTHCM') || index % 4 === 1) {
      return { bg: '#ecfdf5', color: '#059669', border: '#d1fae5' };
    }
    if (c.includes('CS') || index % 4 === 2) {
      return { bg: '#eff6ff', color: '#0284c7', border: '#bfdbfe' };
    }
    return { bg: '#faf5ff', color: '#9333ea', border: '#f3e8ff' };
  };

  // Toggle expand state
  const toggleCourse = (id) => setExpandedCourses(p => ({ ...p, [id]: !p[id] }));
  const toggleLesson = (id) => setExpandedLessons(p => ({ ...p, [id]: !p[id] }));

  // ── COURSE CRUD ─────────────────────────────────────────────────────────────
  const openAddCourse = () => {
    setEditForm({ code: '', title: '', description: '' });
    setModal({ type: 'course', mode: 'add' });
  };

  const openEditCourse = (course) => {
    setEditForm({ ...course });
    setModal({ type: 'course', mode: 'edit' });
  };

  const saveCourse = () => {
    if (!editForm.code?.trim() || !editForm.title?.trim()) return;
    if (modal.mode === 'add') {
      const newCourse = {
        id: `c-${Date.now()}`,
        code: editForm.code.trim().toUpperCase(),
        title: editForm.title.trim(),
        description: editForm.description?.trim() || '',
        lessonsCount: 0,
        questionsCount: 0
      };
      setCourses(p => [...p, newCourse]);
    } else {
      setCourses(p => p.map(c => c.id === editForm.id ? { ...c, ...editForm } : c));
    }
    setModal(null);
  };

  const deleteCourse = (id) => {
    setCourses(p => p.filter(c => c.id !== id));
    const lessonIds = lessons.filter(l => l.courseId === id).map(l => l.id);
    setLessons(p => p.filter(l => l.courseId !== id));
    setQuestions(p => p.filter(q => !lessonIds.includes(q.lessonId)));
    setConfirmDelete(null);
  };

  // ── LESSON CRUD ─────────────────────────────────────────────────────────────
  const openAddLesson = (courseId) => {
    const existing = lessons.filter(l => l.courseId === courseId);
    setEditForm({ courseId, lessonNumber: existing.length + 1, title: '' });
    setModal({ type: 'lesson', mode: 'add' });
  };

  const openEditLesson = (lesson) => {
    setEditForm({ ...lesson });
    setModal({ type: 'lesson', mode: 'edit' });
  };

  const saveLesson = () => {
    if (!editForm.title?.trim()) return;
    if (modal.mode === 'add') {
      const newLesson = {
        id: `l-${Date.now()}`,
        courseId: editForm.courseId,
        lessonNumber: parseInt(editForm.lessonNumber) || 1,
        title: editForm.title.trim()
      };
      setLessons(p => [...p, newLesson]);
      setCourses(p => p.map(c => c.id === editForm.courseId ? { ...c, lessonsCount: c.lessonsCount + 1 } : c));
    } else {
      setLessons(p => p.map(l => l.id === editForm.id ? { ...l, ...editForm } : l));
    }
    setModal(null);
  };

  const deleteLesson = (id) => {
    const lesson = lessons.find(l => l.id === id);
    setLessons(p => p.filter(l => l.id !== id));
    setQuestions(p => p.filter(q => q.lessonId !== id));
    if (lesson) {
      setCourses(p => p.map(c => c.id === lesson.courseId ? { ...c, lessonsCount: Math.max(0, c.lessonsCount - 1) } : c));
    }
    setConfirmDelete(null);
  };

  // ── QUESTION CRUD ───────────────────────────────────────────────────────────
  const openAddQuestion = (lessonId) => {
    setEditForm({
      lessonId,
      type: 'SINGLE_CHOICE',
      content: '',
      explanation: '',
      options: [
        { id: `o-${Date.now()}-0`, key: 'A', text: '', isCorrect: false },
        { id: `o-${Date.now()}-1`, key: 'B', text: '', isCorrect: false },
        { id: `o-${Date.now()}-2`, key: 'C', text: '', isCorrect: false },
        { id: `o-${Date.now()}-3`, key: 'D', text: '', isCorrect: false },
      ]
    });
    setModal({ type: 'question', mode: 'add' });
  };

  const openEditQuestion = (q) => {
    setEditForm({ ...q, options: q.options ? [...q.options.map(o => ({ ...o }))] : [] });
    setModal({ type: 'question', mode: 'edit' });
  };

  const saveQuestion = () => {
    if (!editForm.content?.trim()) return;
    if (modal.mode === 'add') {
      const newQ = {
        id: `q-${Date.now()}`,
        ...editForm,
        content: editForm.content.trim(),
      };
      setQuestions(p => [...p, newQ]);
    } else {
      setQuestions(p => p.map(q => q.id === editForm.id ? { ...editForm, content: editForm.content.trim() } : q));
    }
    setModal(null);
  };

  const deleteQuestion = (id) => {
    setQuestions(p => p.filter(q => q.id !== id));
    setConfirmDelete(null);
  };

  // ── Option management helpers ───────────────────────────────────────────────
  const updateOption = (idx, field, value) => {
    setEditForm(p => {
      const opts = [...p.options];
      opts[idx] = { ...opts[idx], [field]: value };
      // For SINGLE_CHOICE: uncheck others when checking one
      if (field === 'isCorrect' && value && p.type === 'SINGLE_CHOICE') {
        opts.forEach((o, i) => { if (i !== idx) opts[i] = { ...o, isCorrect: false }; });
      }
      return { ...p, options: opts };
    });
  };

  const addOption = () => {
    const keys = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nextKey = keys[editForm.options?.length || 0] || String(editForm.options.length + 1);
    setEditForm(p => ({
      ...p,
      options: [...(p.options || []), { id: `o-${Date.now()}`, key: nextKey, text: '', isCorrect: false }]
    }));
  };

  const removeOption = (idx) => {
    setEditForm(p => ({ ...p, options: p.options.filter((_, i) => i !== idx) }));
  };

  // ── Drag & Drop helpers ───────────────────────────────────────────────────
  // dragItems: [{id, text}] — the bank of draggable keywords/answers
  // dragBlanks: [{id, blankId, answer}] — the blanks and their correct answers

  const addDragItem = () => {
    const newItem = { id: `di-${Date.now()}`, text: '' };
    setEditForm(p => ({ ...p, dragItems: [...(p.dragItems || []), newItem.text], _dragItemObjs: [...(p._dragItemObjs || []), newItem] }));
  };

  const updateDragItem = (idx, value) => {
    setEditForm(p => {
      const items = [...(p._dragItemObjs || [])];
      items[idx] = { ...items[idx], text: value };
      return { ...p, _dragItemObjs: items, dragItems: items.map(i => i.text) };
    });
  };

  const removeDragItem = (idx) => {
    setEditForm(p => {
      const items = (p._dragItemObjs || []).filter((_, i) => i !== idx);
      return { ...p, _dragItemObjs: items, dragItems: items.map(i => i.text) };
    });
  };

  const addDragBlank = () => {
    const idx = (editForm._dragBlanks || []).length;
    const blankId = `BLANK_${idx}`;
    setEditForm(p => ({
      ...p,
      _dragBlanks: [...(p._dragBlanks || []), { id: `db-${Date.now()}`, blankId, answer: '' }],
    }));
  };

  const updateDragBlank = (idx, field, value) => {
    setEditForm(p => {
      const blanks = [...(p._dragBlanks || [])];
      blanks[idx] = { ...blanks[idx], [field]: value };
      // Rebuild correctAnswers
      const correctAnswers = Object.fromEntries(blanks.map(b => [b.blankId, b.answer]));
      const extractedBlanks = blanks.map(b => ({ blankId: b.blankId, answer: b.answer }));
      return { ...p, _dragBlanks: blanks, correctAnswers, extractedBlanks };
    });
  };

  const removeDragBlank = (idx) => {
    setEditForm(p => {
      const blanks = (p._dragBlanks || []).filter((_, i) => i !== idx);
      const correctAnswers = Object.fromEntries(blanks.map(b => [b.blankId, b.answer]));
      const extractedBlanks = blanks.map(b => ({ blankId: b.blankId, answer: b.answer }));
      return { ...p, _dragBlanks: blanks, correctAnswers, extractedBlanks };
    });
  };

  // Build renderedTemplate by inserting [BLANK_N] tokens into content at cursor
  const insertBlankToken = (blankId) => {
    setEditForm(p => ({
      ...p,
      content: (p.content || '') + ` [${blankId}]`,
      renderedTemplate: (p.content || '') + ` [${blankId}]`,
    }));
  };

  // Sync renderedTemplate with content for DRAG_DROP
  const syncDragTemplate = (content) => {
    setEditForm(p => ({ ...p, content, renderedTemplate: content }));
  };

  // When switching TO drag-drop type, init drag fields
  const handleTypeChange = (newType) => {
    setEditForm(p => {
      const base = { ...p, type: newType };
      if (newType === 'DRAG_DROP' && !p._dragBlanks) {
        return {
          ...base,
          dragMode: 'inline',
          _dragBlanks: [],
          _dragItemObjs: [],
          dragItems: [],
          correctAnswers: {},
          extractedBlanks: [],
          renderedTemplate: p.content || '',
        };
      }
      return base;
    });
  };

  return (
    <div className="lms-page-container">
      {/* Hero Title Section */}
      <div className="lms-page-hero-header">
        <div className="hero-eyebrow-badge">
          <span className="hero-eyebrow-dot" />
          <span className="hero-eyebrow-text">Cơ Sở Dữ Liệu & Học Phần</span>
        </div>
        <h1 className="hero-title">
          Quản Lý <span className="hero-gradient-title">Học Phần & Ngân Hàng</span> Đề Thi
        </h1>
        <p className="hero-subtitle">
          Thêm, chỉnh sửa, cấu trúc hóa Học phần — Bài học — Câu hỏi trực tiếp và đồng bộ theo thời gian thực.
        </p>
        <div style={{ marginTop: '1.25rem' }}>
          <button onClick={openAddCourse} className="assist-btn-primary" style={{ padding: '12px 28px', borderRadius: '9999px', margin: '0 auto', fontSize: '0.92rem' }}>
            <span>Thêm Học Phần Mới</span>
            <div className="assist-btn-primary-bead">
              <Plus size={16} style={{ color: '#0084FF' }} />
            </div>
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="lms-stats-grid">
        <div className="lms-stat-card">
          <div className="lms-stat-icon-wrapper lms-stat-icon-indigo">
            <BookOpen size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="lms-stat-label">Học phần trong hệ thống</div>
            <div className="lms-stat-value">{courses.length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>học phần</span></div>
          </div>
        </div>

        <div className="lms-stat-card">
          <div className="lms-stat-icon-wrapper lms-stat-icon-blue">
            <Layers size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="lms-stat-label" style={{ color: '#0284c7' }}>Bài học đã phân chia</div>
            <div className="lms-stat-value" style={{ color: '#0369a1' }}>{lessons.length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0284c7' }}>bài</span></div>
          </div>
        </div>

        <div className="lms-stat-card">
          <div className="lms-stat-icon-wrapper lms-stat-icon-emerald">
            <HelpCircle size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="lms-stat-label" style={{ color: '#059669' }}>Tổng số câu hỏi</div>
            <div className="lms-stat-value" style={{ color: '#065f46' }}>{questions.length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#059669' }}>câu</span></div>
          </div>
        </div>
      </div>

      {/* ── 2-Column Master-Detail Layout matching user's design ─────────── */}
      <div className="cm-container">
        {/* ── Left Column: Course List Cards ─────────────────────────────── */}
        <div className="cm-sidebar">
          <div className="cm-sidebar-header">
            <span className="cm-sidebar-title">Danh Sách Học Phần ({courses.length})</span>
            <button
              onClick={openAddCourse}
              className="cm-add-btn"
              style={{ padding: '4px 8px', fontSize: '0.82rem' }}
            >
              <Plus size={14} /> Thêm Học Phần
            </button>
          </div>

          <div className="cm-course-list">
            {courses.map((course, idx) => {
              const courseLessons = lessons.filter(l => l.courseId === course.id);
              const courseQCount = questions.filter(q => courseLessons.map(l => l.id).includes(q.lessonId)).length;
              const isSelected = course.id === (activeCourse?.id);
              const badgeStyle = getCourseBadgeColors(course.code, idx);

              return (
                <div
                  key={course.id}
                  className={`cm-course-card ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedCourseId(course.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      className="cm-course-badge"
                      style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}` }}
                    >
                      {course.code}
                    </span>

                    <div
                      style={{ display: 'flex', gap: '4px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => openEditCourse(course)}
                        title="Chỉnh sửa học phần"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ type: 'course', id: course.id, name: course.title })}
                        title="Xóa học phần"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#f43f5e',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="cm-course-title">
                    {course.title}
                  </div>

                  <div className="cm-course-meta">
                    {courseLessons.length} Bài học • {courseQCount} Câu hỏi
                  </div>
                </div>
              );
            })}

            {courses.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', border: '2px dashed #cbd5e1', borderRadius: '18px', backgroundColor: '#f8fafc' }}>
                <BookOpen size={36} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Chưa có học phần nào</div>
                <button
                  onClick={openAddCourse}
                  className="cm-add-btn"
                  style={{ margin: '0.5rem auto 0', justifyContent: 'center' }}
                >
                  + Thêm Học Phần Đầu Tiên
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Lessons of the Selected Course ─────────────────── */}
        <div className="cm-content-panel">
          {activeCourse ? (
            <>
              <div className="cm-content-header">
                <div>
                  <h2 className="cm-content-title">
                    Danh Sách Bài Học Trong Học Phần
                  </h2>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>
                    Học phần đang chọn: <strong style={{ color: '#0f172a' }}>{activeCourse.code} - {activeCourse.title}</strong>
                  </div>
                </div>

                <button
                  onClick={() => openAddLesson(activeCourse.id)}
                  className="cm-add-btn"
                >
                  <Plus size={16} />
                  <span>Thêm Bài Học Mới</span>
                </button>
              </div>

              {activeLessons.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: '#64748b', border: '2px dashed #e2e8f0', borderRadius: '16px', backgroundColor: '#f8fafc' }}>
                  <Layers size={42} style={{ color: '#94a3b8', marginBottom: '0.75rem', opacity: 0.5 }} />
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>Chưa có bài học nào trong học phần này</div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.35rem 0 1.25rem 0' }}>Bấm nút bên dưới để bắt đầu tạo Bài 1</p>
                  <button
                    onClick={() => openAddLesson(activeCourse.id)}
                    className="assist-btn-primary"
                    style={{ padding: '8px 18px', fontSize: '0.85rem', borderRadius: '10px', margin: '0 auto' }}
                  >
                    <Plus size={15} /> Thêm Bài Học 1
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {activeLessons.map(lesson => {
                    const lessonQs = questions.filter(q => q.lessonId === lesson.id);
                    const isLessonExpanded = expandedLessons[lesson.id];

                    return (
                      <div
                        key={lesson.id}
                        className={`cm-lesson-item ${isLessonExpanded ? 'expanded' : ''}`}
                      >
                        {/* ── Main Lesson Header Row (Matching Screenshot) ── */}
                        <div
                          className="cm-lesson-header"
                          onClick={() => toggleLesson(lesson.id)}
                        >
                          <div className="cm-lesson-left">
                            <span className="cm-lesson-prefix">Bài {lesson.lessonNumber}:</span>
                            <span className="cm-lesson-text">{lesson.title}</span>
                          </div>

                          <div className="cm-lesson-right">
                            <span className="cm-lesson-count">{lessonQs.length} câu hỏi</span>

                            <div
                              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => openAddQuestion(lesson.id)}
                                title="Thêm câu hỏi vào bài này"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #d1fae5',
                                  backgroundColor: '#ecfdf5',
                                  color: '#047857',
                                  fontSize: '0.73rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                <Plus size={12} /> Thêm câu
                              </button>

                              <button
                                onClick={() => openEditLesson(lesson)}
                                title="Sửa tên bài học"
                                style={{
                                  padding: '4px 7px',
                                  borderRadius: '6px',
                                  border: '1px solid #e2e8f0',
                                  backgroundColor: '#ffffff',
                                  color: '#475569',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <Pencil size={12} />
                              </button>

                              <button
                                onClick={() => setConfirmDelete({ type: 'lesson', id: lesson.id, name: lesson.title })}
                                title="Xóa bài học"
                                style={{
                                  padding: '4px 7px',
                                  borderRadius: '6px',
                                  border: '1px solid #fecdd3',
                                  backgroundColor: '#fff1f2',
                                  color: '#e11d48',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                              {isLessonExpanded ? <ChevronDown size={18} color="#0084FF" /> : <ChevronRight size={18} />}
                            </div>
                          </div>
                        </div>

                        {/* ── Expanded Question Bank Drawer ── */}
                        {isLessonExpanded && (
                          <div style={{
                            borderTop: '1px solid #f1f5f9',
                            padding: '1rem 1.25rem',
                            backgroundColor: '#fafcff',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.65rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                                Ngân hàng {lessonQs.length} câu hỏi thuộc Bài {lesson.lessonNumber}:
                              </span>
                              <button
                                onClick={() => openAddQuestion(lesson.id)}
                                className="cm-add-btn"
                                style={{ padding: '2px 8px', fontSize: '0.78rem' }}
                              >
                                <Plus size={13} /> Thêm câu hỏi
                              </button>
                            </div>

                            {lessonQs.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '1.25rem', color: '#94a3b8', fontSize: '0.84rem' }}>
                                Chưa có câu hỏi nào trong bài học này. Nhấp "Thêm câu hỏi" để nhập câu mới hoặc dùng tính năng Bóc Tách File.
                              </div>
                            ) : (
                              lessonQs.map((q, qIdx) => (
                                <div
                                  key={q.id}
                                  style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.85rem'
                                  }}
                                >
                                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0084FF', minWidth: '22px', paddingTop: '2px' }}>
                                    #{qIdx + 1}
                                  </span>

                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.45, wordBreak: 'break-word' }}>
                                      {q.content}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                                      <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        backgroundColor: (TYPE_COLORS[q.type] || '#4f46e5') + '15',
                                        color: TYPE_COLORS[q.type] || '#4f46e5',
                                        padding: '2px 8px',
                                        borderRadius: '4px'
                                      }}>
                                        {TYPE_LABELS[q.type] || q.type}
                                      </span>
                                      {q.options && (
                                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                          {q.options.length} lựa chọn • {q.options.filter(o => o.isCorrect).length} đáp án đúng
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                                    <button
                                      onClick={() => openEditQuestion(q)}
                                      style={{
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        border: '1px solid #e2e8f0',
                                        backgroundColor: '#f8fafc',
                                        color: '#475569',
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '3px'
                                      }}
                                    >
                                      <Pencil size={11} /> Sửa
                                    </button>
                                    <button
                                      onClick={() => setConfirmDelete({ type: 'question', id: q.id, name: q.content?.slice(0, 40) })}
                                      style={{
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        border: '1px solid #fecdd3',
                                        backgroundColor: '#fff1f2',
                                        color: '#e11d48',
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '3px'
                                      }}
                                    >
                                      <Trash2 size={11} /> Xóa
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
              <BookOpen size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontWeight: 600 }}>Vui lòng chọn hoặc tạo một học phần ở cột bên trái để quản lý danh sách bài học.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL: Course ────────────────────────────────────────────────────── */}
      {modal?.type === 'course' && (
        <ModalWrapper title={modal.mode === 'add' ? 'Thêm Học Phần Mới' : 'Chỉnh Sửa Học Phần'} onClose={() => setModal(null)}>
          <FormField label="Mã học phần" required>
            <input value={editForm.code || ''} onChange={e => setEditForm(p => ({ ...p, code: e.target.value }))}
              placeholder="VD: CS101, POL201..." style={inputStyle} />
          </FormField>
          <FormField label="Tên học phần" required>
            <input value={editForm.title || ''} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
              placeholder="VD: Cấu trúc dữ liệu & Thuật toán" style={inputStyle} />
          </FormField>
          <FormField label="Mô tả">
            <textarea value={editForm.description || ''} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
              rows={3} placeholder="Mô tả ngắn về nội dung học phần..." style={{ ...inputStyle, resize: 'vertical' }} />
          </FormField>
          <ModalActions onCancel={() => setModal(null)} onSave={saveCourse} saveLabel={modal.mode === 'add' ? 'Tạo Học Phần' : 'Lưu Thay Đổi'} />
        </ModalWrapper>
      )}

      {/* ── MODAL: Lesson ────────────────────────────────────────────────────── */}
      {modal?.type === 'lesson' && (
        <ModalWrapper title={modal.mode === 'add' ? 'Thêm Bài Học Mới' : 'Chỉnh Sửa Bài Học'} onClose={() => setModal(null)}>
          {modal.mode === 'add' && (
            <FormField label="Thuộc học phần">
              <select value={editForm.courseId || ''} onChange={e => setEditForm(p => ({ ...p, courseId: e.target.value }))} style={inputStyle}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
              </select>
            </FormField>
          )}
          <FormField label="Số thứ tự bài">
            <input type="number" min="1" value={editForm.lessonNumber || 1} onChange={e => setEditForm(p => ({ ...p, lessonNumber: e.target.value }))} style={{ ...inputStyle, width: '120px' }} />
          </FormField>
          <FormField label="Tên bài học" required>
            <input value={editForm.title || ''} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
              placeholder="VD: Bài 1: Mảng và thuật toán sắp xếp" style={inputStyle} />
          </FormField>
          <ModalActions onCancel={() => setModal(null)} onSave={saveLesson} saveLabel={modal.mode === 'add' ? 'Tạo Bài Học' : 'Lưu Thay Đổi'} />
        </ModalWrapper>
      )}

      {/* ── MODAL: Question ─────────────────────────────────────────────────── */}
      {modal?.type === 'question' && (
        <ModalWrapper title={modal.mode === 'add' ? 'Thêm Câu Hỏi Mới' : 'Chỉnh Sửa Câu Hỏi'} onClose={() => setModal(null)} wide>
          <FormField label="Dạng câu hỏi">
            <select value={editForm.type || 'SINGLE_CHOICE'}
              onChange={e => handleTypeChange(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
              <option value="SINGLE_CHOICE">Trắc nghiệm 1 đáp án (A/B/C/D)</option>
              <option value="MULTI_CHOICE">Trắc nghiệm nhiều đáp án</option>
              <option value="TRUE_FALSE">Đúng / Sai (1/2/3/4)</option>
              <option value="DRAG_DROP">Kéo thả / Điền từ vào chỗ trống</option>
            </select>
          </FormField>

          <FormField label="Nội dung câu hỏi" required>
            {editForm.type === 'DRAG_DROP' ? (
              <div>
                <textarea
                  value={editForm.content || ''}
                  onChange={e => syncDragTemplate(e.target.value)}
                  rows={3}
                  placeholder="Nhập câu hỏi, dùng [BLANK_0], [BLANK_1]... để đánh dấu vị trí ô trống. VD: Thuật toán ___ có độ phức tạp [BLANK_0]"
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.875rem' }}
                />
                <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Chèn token:</span>
                  {(editForm._dragBlanks || []).map((b, i) => (
                    <button key={b.id} onClick={() => insertBlankToken(b.blankId)}
                      style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', border: '1px solid #1e40af', backgroundColor: '#eff6ff', color: '#1e40af', cursor: 'pointer' }}>
                      [{b.blankId}]
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <textarea value={editForm.content || ''} onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))}
                rows={3} placeholder="Nhập câu hỏi đầy đủ tại đây..." style={{ ...inputStyle, resize: 'vertical' }} />
            )}
          </FormField>

          {/* ── Options editor: A/B/C/D & TRUE_FALSE ── */}
          {(editForm.type === 'SINGLE_CHOICE' || editForm.type === 'MULTI_CHOICE' || editForm.type === 'TRUE_FALSE') && (
          <FormField label={editForm.type === 'TRUE_FALSE' ? 'Các phát biểu (chọn Đúng / Sai)' : 'Các lựa chọn đáp án'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(editForm.options || []).map((opt, idx) => (
                <div key={opt.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: opt.isCorrect ? '#ecfdf5' : '#f8fafc', border: opt.isCorrect ? '1.5px solid #10b981' : '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#475569', minWidth: '18px' }}>{opt.key}.</span>
                  <input
                    value={opt.text}
                    onChange={e => updateOption(idx, 'text', e.target.value)}
                    placeholder={`Nội dung lựa chọn ${opt.key}...`}
                    style={{ flex: 1, padding: '5px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                  {editForm.type === 'TRUE_FALSE' ? (
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button onClick={() => updateOption(idx, 'isCorrect', true)}
                        style={{ padding: '3px 10px', borderRadius: '5px', border: 'none', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', backgroundColor: opt.isCorrect === true ? '#10b981' : '#e2e8f0', color: opt.isCorrect === true ? '#fff' : '#475569' }}>
                        Đúng
                      </button>
                      <button onClick={() => updateOption(idx, 'isCorrect', false)}
                        style={{ padding: '3px 10px', borderRadius: '5px', border: 'none', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', backgroundColor: opt.isCorrect === false && opt.text ? '#ef4444' : '#e2e8f0', color: opt.isCorrect === false && opt.text ? '#fff' : '#475569' }}>
                        Sai
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => updateOption(idx, 'isCorrect', !opt.isCorrect)}
                      title={opt.isCorrect ? 'Đáp án đúng - Click để bỏ' : 'Click để đánh dấu là đáp án đúng'}
                      style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: opt.isCorrect ? '#10b981' : '#e2e8f0' }}>
                      {opt.isCorrect ? <CheckCircle2 size={16} color="#fff" /> : <XCircle size={16} color="#94a3b8" />}
                    </button>
                  )}
                  <button onClick={() => removeOption(idx)} style={{ padding: '4px', borderRadius: '4px', border: 'none', cursor: 'pointer', color: '#ef4444', backgroundColor: 'transparent' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}

              <button onClick={addOption} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '6px 12px', borderRadius: '7px', border: '1.5px dashed #cbd5e1', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                <Plus size={14} /> Thêm lựa chọn
              </button>
            </div>
          </FormField>
          )}

          {/* ── DRAG_DROP editor ── */}
          {editForm.type === 'DRAG_DROP' && (
            <>
              {/* Blank slots */}
              <FormField label="Ô trống (Blanks) — mỗi ô là 1 vị trí cần điền">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(editForm._dragBlanks || []).map((blank, idx) => (
                    <div key={blank.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.82rem', color: '#1e40af', minWidth: '75px' }}>[{blank.blankId}]</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', minWidth: '65px' }}>→ Đáp án:</span>
                      <input
                        value={blank.answer}
                        onChange={e => updateDragBlank(idx, 'answer', e.target.value)}
                        placeholder="Từ/cụm từ đúng cho ô này..."
                        style={{ flex: 1, padding: '5px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                      />
                      <button onClick={() => removeDragBlank(idx)} style={{ padding: '4px', borderRadius: '4px', border: 'none', cursor: 'pointer', color: '#ef4444', backgroundColor: 'transparent' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button onClick={addDragBlank} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '6px 12px', borderRadius: '7px', border: '1.5px dashed #bfdbfe', backgroundColor: '#f8fafc', color: '#1e40af', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                    <Plus size={14} /> Thêm ô trống mới
                  </button>
                </div>
              </FormField>

              {/* Drag Items bank */}
              <FormField label="Ngân hàng từ kéo thả (bao gồm cả đáp án sai để làm nhiễu)">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(editForm._dragItemObjs || []).map((item, idx) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        value={item.text}
                        onChange={e => updateDragItem(idx, e.target.value)}
                        placeholder={`Từ/cụm từ ${idx + 1} (có thể là đáp án đúng hoặc đáp án gây nhiễu)...`}
                        style={{ flex: 1, padding: '5px 10px', borderRadius: '7px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.875rem' }}
                      />
                      <button onClick={() => removeDragItem(idx)} style={{ padding: '4px', borderRadius: '4px', border: 'none', cursor: 'pointer', color: '#ef4444', backgroundColor: 'transparent' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {/* Quick-fill from blanks */}
                  {(editForm._dragBlanks || []).length > 0 && (
                    <button
                      onClick={() => {
                        const answerItems = (editForm._dragBlanks || [])
                          .filter(b => b.answer.trim())
                          .map(b => ({ id: `di-auto-${b.blankId}`, text: b.answer.trim() }));
                        setEditForm(p => ({
                          ...p,
                          _dragItemObjs: answerItems,
                          dragItems: answerItems.map(i => i.text)
                        }));
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '5px 10px', borderRadius: '6px', border: '1px solid #bbf7d0', backgroundColor: '#ecfdf5', color: '#047857', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                      ✨ Tự động lấy đáp án từ các ô trống
                    </button>
                  )}

                  <button onClick={addDragItem} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '6px 12px', borderRadius: '7px', border: '1.5px dashed #cbd5e1', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                    <Plus size={14} /> Thêm từ vào ngân hàng
                  </button>
                </div>
              </FormField>

              {/* Live preview */}
              {(editForm.content || '').includes('[BLANK_') && (
                <FormField label="Xem trước câu hỏi">
                  <div style={{ padding: '0.875rem 1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', lineHeight: 2, fontSize: '0.9rem' }}>
                    {(editForm.content || '').split(/\[BLANK_\d+\]/).map((part, pIdx) => {
                      const blankId = `BLANK_${pIdx}`;
                      const isLast = pIdx === (editForm._dragBlanks || []).length;
                      const answer = (editForm.correctAnswers || {})[blankId];
                      return (
                        <React.Fragment key={pIdx}>
                          {part}
                          {!isLast && (
                            <span style={{ display: 'inline-block', minWidth: '80px', padding: '2px 10px', borderRadius: '6px', border: '2px solid #1e40af', backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: 700, fontSize: '0.82rem', margin: '0 2px', textAlign: 'center' }}>
                              {answer || blankId}
                            </span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </FormField>
              )}
            </>
          )}

          <FormField label="Giải thích đáp án (tùy chọn)">
            <textarea value={editForm.explanation || ''} onChange={e => setEditForm(p => ({ ...p, explanation: e.target.value }))}
              rows={2} placeholder="Giải thích tại sao đây là đáp án đúng..." style={{ ...inputStyle, resize: 'vertical' }} />
          </FormField>

          <ModalActions onCancel={() => setModal(null)} onSave={saveQuestion} saveLabel={modal.mode === 'add' ? 'Tạo Câu Hỏi' : 'Lưu Thay Đổi'} />
        </ModalWrapper>
      )}

      {/* ── Confirm Delete Dialog ────────────────────────────────────────────── */}
      {confirmDelete && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
          <div className="modal-content" style={{ maxWidth: '440px', width: '100%' }}>
            <div className="modal-dialog-body">
              <div className="modal-dialog-icon danger">
                <AlertTriangle size={26} />
              </div>
              <h3 className="modal-dialog-title">Xác Nhận Xóa?</h3>
              <p className="modal-dialog-text">
                Bạn có chắc muốn xóa <strong>"{confirmDelete.name}"</strong>?
                {confirmDelete.type === 'course' && ' Tất cả bài học và câu hỏi bên trong sẽ bị xóa theo.'}
                {confirmDelete.type === 'lesson' && ' Tất cả câu hỏi trong bài học này sẽ bị xóa theo.'}
                <span style={{ display: 'block', color: '#f43f5e', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600 }}>
                  ⚠️ Hành động này không thể hoàn tác.
                </span>
              </p>
            </div>
            <div className="modal-dialog-actions">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Hủy bỏ</button>
              <button
                onClick={() => {
                  if (confirmDelete.type === 'course') deleteCourse(confirmDelete.id);
                  else if (confirmDelete.type === 'lesson') deleteLesson(confirmDelete.id);
                  else deleteQuestion(confirmDelete.id);
                }}
                style={{
                  flex: 1, maxWidth: '200px', padding: '0.75rem 1rem',
                  borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#fff', fontWeight: 700, fontSize: '0.875rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
                }}
              >
                <Trash2 size={15} /> Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reusable modal components ──────────────────────────────────────────────────
function ModalWrapper({ title, onClose, children, wide = false }) {
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content"
        style={{
          padding: '2rem 2.25rem',
          width: '100%',
          maxWidth: wide ? '720px' : '520px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1.5px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>{children}</div>
      </div>
    </div>
  );
}


function FormField({ label, required, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function ModalActions({ onCancel, onSave, saveLabel }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
      <button onClick={onCancel} className="btn-secondary">Hủy bỏ</button>
      <button onClick={onSave} className="btn-primary"><Save size={15} /> {saveLabel}</button>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.875rem',
  borderRadius: '8px',
  border: '1.5px solid #cbd5e1',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: 'inherit'
};
