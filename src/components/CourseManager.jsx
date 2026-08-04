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
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  const [modal, setModal] = useState(null); // {type, data, mode}
  const [confirmDelete, setConfirmDelete] = useState(null); // {type, id, name}
  const [editForm, setEditForm] = useState({});

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
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            Quản Lý Học Phần & Câu Hỏi
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Thêm, sửa, xóa Học phần — Bài học — Câu hỏi trong ngân hàng đề.
          </p>
        </div>
        <button onClick={openAddCourse} className="btn-primary">
          <Plus size={16} /> Thêm Học Phần Mới
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Học phần', value: courses.length, color: '#1e40af', icon: <BookOpen size={18} /> },
          { label: 'Bài học', value: lessons.length, color: '#7c3aed', icon: <Layers size={18} /> },
          { label: 'Câu hỏi', value: questions.length, color: '#065f46', icon: <HelpCircle size={18} /> },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: s.color + '15', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Course list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {courses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>Chưa có học phần nào. Nhấp "Thêm Học Phần Mới" để bắt đầu.</p>
          </div>
        )}

        {courses.map(course => {
          const courseLessons = lessons.filter(l => l.courseId === course.id);
          const courseQCount = questions.filter(q => courseLessons.map(l => l.id).includes(q.lessonId)).length;
          const isExpanded = expandedCourses[course.id];

          return (
            <div key={course.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              {/* Course header row */}
              <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none', backgroundColor: '#fafafa' }}>
                <button onClick={() => toggleCourse(course.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, color: '#1e40af', fontSize: '0.85rem', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>
                      {course.code}
                    </span>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{course.title}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                    {courseLessons.length} bài học • {courseQCount} câu hỏi
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openAddLesson(course.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '5px 10px', borderRadius: '6px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1e40af', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                    <Plus size={13} /> Thêm Bài
                  </button>
                  <button onClick={() => openEditCourse(course)} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Pencil size={13} /> Sửa
                  </button>
                  <button onClick={() => setConfirmDelete({ type: 'course', id: course.id, name: course.title })} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Trash2 size={13} /> Xóa
                  </button>
                </div>
              </div>

              {/* Lessons list */}
              {isExpanded && (
                <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {courseLessons.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                      Chưa có bài học nào trong học phần này.
                    </div>
                  )}

                  {courseLessons.map(lesson => {
                    const lessonQs = questions.filter(q => q.lessonId === lesson.id);
                    const isLessonExpanded = expandedLessons[lesson.id];

                    return (
                      <div key={lesson.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                        {/* Lesson row */}
                        <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.625rem', backgroundColor: isLessonExpanded ? '#f8fafc' : '#ffffff' }}>
                          <button onClick={() => toggleLesson(lesson.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                            {isLessonExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>

                          <span style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#64748b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                            {lesson.lessonNumber}
                          </span>

                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{lesson.title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{lessonQs.length} câu hỏi</div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => openAddQuestion(lesson.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '4px 8px', borderRadius: '5px', border: '1px solid #d1fae5', backgroundColor: '#ecfdf5', color: '#047857', fontSize: '0.73rem', fontWeight: 600, cursor: 'pointer' }}>
                              <Plus size={11} /> Thêm Câu
                            </button>
                            <button onClick={() => openEditLesson(lesson)} style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.73rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Pencil size={11} /> Sửa
                            </button>
                            <button onClick={() => setConfirmDelete({ type: 'lesson', id: lesson.id, name: lesson.title })} style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid #fca5a5', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.73rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Trash2 size={11} /> Xóa
                            </button>
                          </div>
                        </div>

                        {/* Questions list */}
                        {isLessonExpanded && (
                          <div style={{ borderTop: '1px solid #f1f5f9', padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', backgroundColor: '#fdfdfd' }}>
                            {lessonQs.length === 0 && (
                              <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                                Chưa có câu hỏi. Nhấp "Thêm Câu" hoặc Upload file đề.
                              </div>
                            )}

                            {lessonQs.map((q, qIdx) => (
                              <div key={q.id} style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #f1f5f9', backgroundColor: '#ffffff', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', minWidth: '20px', paddingTop: '2px' }}>
                                  {qIdx + 1}
                                </span>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.4, wordBreak: 'break-word' }}>
                                    {q.content?.length > 120 ? q.content.slice(0, 120) + '...' : q.content}
                                  </div>
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: TYPE_COLORS[q.type] + '15', color: TYPE_COLORS[q.type], padding: '1px 7px', borderRadius: '4px', marginTop: '3px', display: 'inline-block' }}>
                                    {TYPE_LABELS[q.type] || q.type}
                                  </span>
                                  {q.options && <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '6px' }}>{q.options.length} lựa chọn • {q.options.filter(o => o.isCorrect).length} đáp án đúng</span>}
                                </div>

                                <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                                  <button onClick={() => openEditQuestion(q)} style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Pencil size={11} /> Sửa
                                  </button>
                                  <button onClick={() => setConfirmDelete({ type: 'question', id: q.id, name: q.content?.slice(0, 40) })} style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid #fca5a5', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Trash2 size={11} /> Xóa
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
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
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '2rem', maxWidth: '420px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>Xác nhận xóa</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Hành động này không thể hoàn tác</div>
              </div>
            </div>

            <p style={{ color: '#334155', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Bạn có chắc muốn xóa <strong>"{confirmDelete.name}"</strong>?
              {confirmDelete.type === 'course' && ' Tất cả bài học và câu hỏi bên trong sẽ bị xóa theo.'}
              {confirmDelete.type === 'lesson' && ' Tất cả câu hỏi trong bài học này sẽ bị xóa theo.'}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Hủy bỏ</button>
              <button
                onClick={() => {
                  if (confirmDelete.type === 'course') deleteCourse(confirmDelete.id);
                  else if (confirmDelete.type === 'lesson') deleteLesson(confirmDelete.id);
                  else deleteQuestion(confirmDelete.id);
                }}
                style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Trash2 size={16} /> Xóa vĩnh viễn
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
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', zIndex: 150, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem', overflowY: 'auto' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: wide ? '680px' : '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{title}</h3>
          <button onClick={onClose} style={{ padding: '4px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: '#f1f5f9', color: '#64748b' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{children}</div>
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
