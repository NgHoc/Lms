import React, { useState } from 'react';
import { Layers, CheckCircle2, AlertCircle, Play, HelpCircle, BookOpen, Info, ArrowLeft, Sparkles, Check } from 'lucide-react';

const TYPE_LABELS = {
  SINGLE_CHOICE: 'Trắc nghiệm đơn',
  MULTI_CHOICE: 'Trắc nghiệm nhiều đáp án',
  TRUE_FALSE: 'Đúng / Sai',
  DRAG_DROP: 'Kéo thả từ khóa'
};

/**
 * LessonSelector: Chọn tối đa 3 bài học từ một học phần để tạo bộ đề tùy biến
 */
export default function LessonSelector({ courses, lessons, questions, onStart, onBack }) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [selectedLessonIds, setSelectedLessonIds] = useState([]);
  const [targetCount, setTargetCount] = useState(30);

  const courseLessons = lessons.filter(l => l.courseId === selectedCourseId);

  const toggleLesson = (id) => {
    setSelectedLessonIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  };

  const selectedLessons = lessons.filter(l => selectedLessonIds.includes(l.id));
  const poolQuestions = questions.filter(q => selectedLessonIds.includes(q.lessonId));
  const totalPool = poolQuestions.length;
  const actualCount = Math.min(targetCount, totalPool);

  const canStart = selectedLessonIds.length > 0 && totalPool > 0;

  const handleStart = () => {
    if (!canStart) return;
    const shuffled = [...poolQuestions].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, actualCount);

    const course = courses.find(c => c.id === selectedCourseId);
    onStart({
      type: 'CUSTOM_LESSON_SET',
      courseId: selectedCourseId,
      course,
      lessonIds: selectedLessonIds,
      lessons: selectedLessons,
      questions: picked,
      totalCount: actualCount
    });
  };

  return (
    <div style={{ maxWidth: '960px', margin: '1rem auto', padding: '0 0.5rem' }} className="animate-fade-in">
      <div className="lms-card" style={{ padding: '2rem 1.5rem', boxShadow: 'var(--shadow-xl)' }}>
        
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            color: '#ffffff',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Layers size={32} />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Tùy Biến Bộ Đề Ôn Tập Trọng Tâm
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
            Chọn học phần mục tiêu, chọn <strong>tối đa 3 bài học</strong> để hệ thống tự động tổng hợp ngân hàng câu hỏi ngẫu nhiên.
          </p>
        </div>

        {/* Step 1: Select Course */}
        <div style={{ marginBottom: '2.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.875rem' }}>
            <span style={{
              background: 'var(--primary-gradient)',
              color: '#fff',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              fontSize: '0.8rem',
              fontWeight: 800,
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
            }}>1</span>
            Bước 1: Chọn Học Phần Mục Tiêu
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {courses.map(course => {
              const lessonCount = lessons.filter(l => l.courseId === course.id).length;
              const qCount = questions.filter(q => lessons.filter(l => l.courseId === course.id).map(l => l.id).includes(q.lessonId)).length;
              const isSelected = selectedCourseId === course.id;

              return (
                <div
                  key={course.id}
                  onClick={() => { setSelectedCourseId(course.id); setSelectedLessonIds([]); }}
                  className={`lms-card-interactive ${isSelected ? 'selected' : ''}`}
                  style={{
                    padding: '1.25rem 1.35rem',
                    borderWidth: isSelected ? '2px' : '1.5px'
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--primary-gradient)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(79, 70, 229, 0.4)'
                    }}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}

                  <div style={{
                    display: 'inline-block',
                    fontWeight: 800,
                    color: '#4f46e5',
                    fontSize: '0.78rem',
                    backgroundColor: '#eef2ff',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    marginBottom: '0.5rem',
                    border: '1px solid #c7d2fe'
                  }}>
                    {course.code}
                  </div>

                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', lineHeight: 1.35, marginBottom: '0.5rem' }}>
                    {course.title}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '0.75rem', fontWeight: 600 }}>
                    <span>📖 {lessonCount} bài học</span>
                    <span>•</span>
                    <span>❓ {qCount} câu hỏi</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Lessons */}
        {selectedCourseId && (
          <div style={{ marginBottom: '2.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                <span style={{
                  background: 'var(--primary-gradient)',
                  color: '#fff',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '26px',
                  height: '26px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
                }}>2</span>
                Bước 2: Chọn Bài Học <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.85rem' }}>(Tối đa 3 bài)</span>
              </label>

              <span className={`badge ${selectedLessonIds.length === 3 ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                {selectedLessonIds.length} / 3 bài học đã chọn
              </span>
            </div>

            {/* Progress bar for selection */}
            <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', marginBottom: '1.25rem', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                borderRadius: '9999px',
                background: 'var(--primary-gradient)',
                width: `${(selectedLessonIds.length / 3) * 100}%`,
                transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }} />
            </div>

            {courseLessons.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', border: '2px dashed #cbd5e1', borderRadius: '16px', backgroundColor: '#f8fafc' }}>
                <AlertCircle size={28} style={{ marginBottom: '0.5rem', color: '#f59e0b' }} />
                <p style={{ fontWeight: 600 }}>Học phần này hiện chưa có bài học nào trong hệ thống.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {courseLessons.sort((a, b) => a.lessonNumber - b.lessonNumber).map(lesson => {
                  const lessonQs = questions.filter(q => q.lessonId === lesson.id);
                  const isSelected = selectedLessonIds.includes(lesson.id);
                  const isDisabled = !isSelected && selectedLessonIds.length >= 3;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => !isDisabled && toggleLesson(lesson.id)}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #4f46e5' : '1.5px solid #e2e8f0',
                        backgroundColor: isSelected ? '#eef2ff' : isDisabled ? '#f8fafc' : '#ffffff',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        opacity: isDisabled ? 0.45 : 1,
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.12)' : 'none'
                      }}
                    >
                      {/* Checkbox indicator */}
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        border: isSelected ? 'none' : '2px solid #cbd5e1',
                        background: isSelected ? 'var(--primary-gradient)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 2px 6px rgba(79, 70, 229, 0.3)' : 'none'
                      }}>
                        {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
                      </div>

                      {/* Lesson number badge */}
                      <span style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? '#4f46e5' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {lesson.lessonNumber}
                      </span>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>
                          {lesson.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem', fontWeight: 500 }}>
                          Ngân hàng câu hỏi: <strong style={{ color: '#4f46e5' }}>{lessonQs.length} câu</strong>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="badge badge-primary" style={{ flexShrink: 0 }}>
                          ĐÃ CHỌN
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Configure question count */}
        {selectedLessonIds.length > 0 && (
          <div style={{ marginBottom: '2rem' }} className="animate-fade-in">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.875rem' }}>
              <span style={{
                background: 'var(--primary-gradient)',
                color: '#fff',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '26px',
                height: '26px',
                fontSize: '0.8rem',
                fontWeight: 800,
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
              }}>3</span>
              Bước 3: Chỉ Định Số Lượng Câu Hỏi
            </label>

            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {[10, 15, 20, 25, 30].map(n => (
                <button
                  key={n}
                  onClick={() => setTargetCount(n)}
                  disabled={n > totalPool}
                  style={{
                    padding: '9px 22px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: targetCount === n ? '2px solid #4f46e5' : '1.5px solid #e2e8f0',
                    background: targetCount === n ? 'var(--primary-gradient)' : n > totalPool ? '#f8fafc' : '#ffffff',
                    color: targetCount === n ? '#ffffff' : n > totalPool ? '#cbd5e1' : '#334155',
                    cursor: n > totalPool ? 'not-allowed' : 'pointer',
                    boxShadow: targetCount === n ? 'var(--shadow-glow)' : 'var(--shadow-xs)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {n} câu
                </button>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Tùy chọn:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPool}
                  value={targetCount}
                  onChange={e => setTargetCount(Math.max(1, Math.min(totalPool, parseInt(e.target.value) || 1)))}
                  style={{
                    width: '84px',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Summary card */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1.35rem',
              backgroundColor: '#ecfdf5',
              border: '1.5px solid #a7f3d0',
              borderRadius: '14px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <Sparkles size={18} color="#059669" />
                <div style={{ fontSize: '0.925rem', fontWeight: 800, color: '#065f46' }}>
                  Tổng kết bộ đề sẵn sàng khởi tạo:
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.875rem', color: '#065f46' }}>
                <div>
                  <span style={{ fontWeight: 700 }}>📚 Học phần:</span> {courses.find(c => c.id === selectedCourseId)?.title}
                </div>
                <div>
                  <span style={{ fontWeight: 700 }}>📖 Bài học:</span> {selectedLessons.map(l => `Bài ${l.lessonNumber}`).join(', ')}
                </div>
                <div>
                  <span style={{ fontWeight: 700 }}>❓ Kho câu hỏi:</span> {totalPool} câu
                </div>
                <div>
                  <span style={{ fontWeight: 700 }}>🎯 Sẽ lấy ngẫu nhiên:</span>{' '}
                  <strong style={{ fontSize: '1.05rem', color: '#4f46e5' }}>{actualCount} câu</strong>
                </div>
              </div>

              {/* Question type breakdown */}
              {poolQuestions.length > 0 && (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {Object.entries(
                    poolQuestions.reduce((acc, q) => { acc[q.type] = (acc[q.type] || 0) + 1; return acc; }, {})
                  ).map(([type, count]) => (
                    <span key={type} style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: '#ffffff',
                      border: '1px solid #a7f3d0',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      color: '#047857'
                    }}>
                      {TYPE_LABELS[type] || type}: {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'flex-end',
          alignItems: 'center',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '1.5rem',
          flexWrap: 'wrap'
        }}>
          {onBack && (
            <button onClick={onBack} className="btn-secondary" style={{ flex: '1 1 120px', justifyContent: 'center' }}>
              <ArrowLeft size={16} /> Quay lại
            </button>
          )}
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="btn-primary"
            style={{
              opacity: canStart ? 1 : 0.45,
              cursor: canStart ? 'pointer' : 'not-allowed',
              padding: '0.85rem 1.75rem',
              fontSize: '1rem',
              flex: '2 1 200px',
              justifyContent: 'center'
            }}
          >
            <Play size={18} /> Bắt Đầu Ôn Tập ({actualCount} Câu)
          </button>
        </div>
      </div>
    </div>
  );
}
