import React, { useState } from 'react';
import { Layers, CheckCircle2, AlertCircle, Play, HelpCircle, BookOpen, Info } from 'lucide-react';

/**
 * LessonSelector: Chọn tối đa 3 bài học từ một học phần để tạo bộ đề 30 câu
 */
export default function LessonSelector({ courses, lessons, questions, onStart, onBack }) {
  const [selectedCourseId, setSelectedCourseId] = useState('');
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
    // Shuffle and pick actualCount questions
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
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
      <div className="lms-card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Layers size={30} color="#1e40af" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Tạo Bộ Câu Hỏi Ôn Tập
          </h2>
          <p style={{ color: '#64748b' }}>
            Chọn học phần, sau đó chọn <strong>tối đa 3 bài học</strong> để hệ thống tổng hợp bộ đề ôn tập.
          </p>
        </div>

        {/* Step 1: Select Course */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.625rem' }}>
            <span style={{ backgroundColor: '#1e40af', color: '#fff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', fontSize: '0.75rem', fontWeight: 800, marginRight: '0.5rem' }}>1</span>
            Chọn Học Phần
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
            {courses.map(course => {
              const lessonCount = lessons.filter(l => l.courseId === course.id).length;
              const qCount = questions.filter(q => lessons.filter(l => l.courseId === course.id).map(l => l.id).includes(q.lessonId)).length;
              const isSelected = selectedCourseId === course.id;

              return (
                <div key={course.id}
                  onClick={() => { setSelectedCourseId(course.id); setSelectedLessonIds([]); }}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #1e40af' : '1.5px solid #e2e8f0',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}>
                  {isSelected && (
                    <CheckCircle2 size={18} color="#1e40af" style={{ position: 'absolute', top: '10px', right: '10px' }} />
                  )}
                  <div style={{ fontWeight: 800, color: '#1e40af', fontSize: '0.78rem', marginBottom: '0.25rem' }}>{course.code}</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', lineHeight: 1.3, marginBottom: '0.4rem' }}>{course.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{lessonCount} bài • {qCount} câu hỏi</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Lessons */}
        {selectedCourseId && (
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                <span style={{ backgroundColor: '#1e40af', color: '#fff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', fontSize: '0.75rem', fontWeight: 800, marginRight: '0.5rem' }}>2</span>
                Chọn Bài Học <span style={{ color: '#64748b', fontWeight: 400 }}>(Tối đa 3 bài)</span>
              </label>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: selectedLessonIds.length === 3 ? '#1e40af' : '#64748b' }}>
                {selectedLessonIds.length} / 3 đã chọn
              </span>
            </div>

            {/* Selection progress bar */}
            <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '0.875rem' }}>
              <div style={{ height: '100%', borderRadius: '4px', backgroundColor: '#1e40af', width: `${(selectedLessonIds.length / 3) * 100}%`, transition: 'width 0.3s' }} />
            </div>

            {courseLessons.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', border: '1.5px dashed #e2e8f0', borderRadius: '12px' }}>
                <AlertCircle size={24} style={{ marginBottom: '0.5rem' }} />
                <p>Học phần này chưa có bài học nào.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {courseLessons.sort((a, b) => a.lessonNumber - b.lessonNumber).map(lesson => {
                  const lessonQs = questions.filter(q => q.lessonId === lesson.id);
                  const isSelected = selectedLessonIds.includes(lesson.id);
                  const isDisabled = !isSelected && selectedLessonIds.length >= 3;

                  return (
                    <div key={lesson.id}
                      onClick={() => !isDisabled && toggleLesson(lesson.id)}
                      style={{
                        padding: '0.875rem 1.125rem',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #1e40af' : '1.5px solid #e2e8f0',
                        backgroundColor: isSelected ? '#eff6ff' : isDisabled ? '#fafafa' : '#ffffff',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.875rem',
                        opacity: isDisabled ? 0.55 : 1,
                        transition: 'all 0.15s'
                      }}>

                      {/* Checkbox indicator */}
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '6px',
                        border: isSelected ? 'none' : '2px solid #cbd5e1',
                        backgroundColor: isSelected ? '#1e40af' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, transition: 'all 0.15s'
                      }}>
                        {isSelected && <CheckCircle2 size={16} color="#fff" />}
                      </div>

                      {/* Lesson number badge */}
                      <span style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        backgroundColor: isSelected ? '#1e40af' : '#f1f5f9',
                        color: isSelected ? '#fff' : '#64748b',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.78rem', fontWeight: 800, flexShrink: 0
                      }}>
                        {lesson.lessonNumber}
                      </span>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{lesson.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                          {lessonQs.length} câu hỏi có sẵn
                        </div>
                      </div>

                      {isSelected && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#1e40af', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>
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
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.625rem' }}>
              <span style={{ backgroundColor: '#1e40af', color: '#fff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', fontSize: '0.75rem', fontWeight: 800, marginRight: '0.5rem' }}>3</span>
              Số Câu Hỏi Trong Bộ Đề
            </label>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[10, 15, 20, 25, 30].map(n => (
                <button key={n}
                  onClick={() => setTargetCount(n)}
                  disabled={n > totalPool}
                  style={{
                    padding: '8px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem',
                    border: targetCount === n ? '2px solid #1e40af' : '1.5px solid #e2e8f0',
                    backgroundColor: targetCount === n ? '#1e40af' : n > totalPool ? '#f8fafc' : '#ffffff',
                    color: targetCount === n ? '#fff' : n > totalPool ? '#cbd5e1' : '#475569',
                    cursor: n > totalPool ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s'
                  }}>
                  {n} câu
                </button>
              ))}
              <input type="number" min="1" max={totalPool} value={targetCount}
                onChange={e => setTargetCount(Math.max(1, Math.min(totalPool, parseInt(e.target.value) || 1)))}
                style={{ width: '80px', padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }} />
            </div>

            {/* Summary card */}
            <div style={{ marginTop: '1.25rem', padding: '1.25rem', backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <Info size={16} color="#047857" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#047857' }}>Tóm tắt bộ đề sẽ được tạo:</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#065f46' }}>
                  <span style={{ fontWeight: 700 }}>📚 Học phần:</span> {courses.find(c => c.id === selectedCourseId)?.title}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#065f46' }}>
                  <span style={{ fontWeight: 700 }}>📖 Bài học:</span> {selectedLessons.map(l => `Bài ${l.lessonNumber}`).join(', ')}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#065f46' }}>
                  <span style={{ fontWeight: 700 }}>❓ Ngân hàng đề:</span> {totalPool} câu
                </div>
                <div style={{ fontSize: '0.85rem', color: '#065f46' }}>
                  <span style={{ fontWeight: 700 }}>🎯 Sẽ lấy ngẫu nhiên:</span> <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1e40af' }}>{actualCount} câu</span>
                </div>
              </div>

              {/* Question type breakdown */}
              {poolQuestions.length > 0 && (
                <div style={{ marginTop: '0.875rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {Object.entries(
                    poolQuestions.reduce((acc, q) => { acc[q.type] = (acc[q.type] || 0) + 1; return acc; }, {})
                  ).map(([type, count]) => (
                    <span key={type} style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#fff', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '10px', color: '#047857' }}>
                      {TYPE_LABELS[type] || type}: {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
          {onBack && (
            <button onClick={onBack} className="btn-secondary">← Quay lại</button>
          )}
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="btn-primary"
            style={{ opacity: canStart ? 1 : 0.5, cursor: canStart ? 'pointer' : 'not-allowed', padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 800 }}>
            <Play size={18} /> Bắt Đầu Ôn Tập ({actualCount} Câu)
          </button>
        </div>
      </div>
    </div>
  );
}

const TYPE_LABELS = {
  SINGLE_CHOICE: 'Trắc nghiệm',
  MULTI_CHOICE: 'Nhiều đáp án',
  TRUE_FALSE: 'Đúng/Sai',
  DRAG_DROP: 'Kéo thả'
};
