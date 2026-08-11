import React, { useState } from 'react';
import {
  Award, CheckCircle2, XCircle, Clock, BookOpen, AlertCircle,
  FileText, RotateCcw, Filter, Check, X, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';

export default function QuizResult({ result, course, mode, onRetake }) {
  const { totalQuestions, earnedPoints, scale10Score, timeSpentSeconds, reviewData } = result;
  const [filterType, setFilterType] = useState('ALL'); // ALL, CORRECT, INCORRECT
  const [expandedExplanations, setExpandedExplanations] = useState({});

  const toggleExplanation = (idx) => {
    setExpandedExplanations(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const minutesSpent = Math.floor(timeSpentSeconds / 60);
  const secondsSpent = timeSpentSeconds % 60;
  const accuracyPercent = Math.round((parseFloat(earnedPoints) / Math.max(1, totalQuestions)) * 100);

  // Grade classification
  const numScore = parseFloat(scale10Score);
  const gradeLabel = numScore >= 8.5 ? "Xuất sắc" :
                     numScore >= 7.0 ? "Khá giỏi" :
                     numScore >= 5.0 ? "Đạt yêu cầu" : "Cần ôn tập thêm";

  const gradeColor = numScore >= 8.5 ? "#10b981" :
                     numScore >= 7.0 ? "#4f46e5" :
                     numScore >= 5.0 ? "#f59e0b" : "#f43f5e";

  const filteredQuestions = reviewData.filter(q => {
    if (filterType === 'CORRECT') return q.isUserCorrect;
    if (filterType === 'INCORRECT') return !q.isUserCorrect;
    return true;
  });

  const correctCount = reviewData.filter(q => q.isUserCorrect).length;
  const incorrectCount = reviewData.length - correctCount;

  return (
    <div style={{ maxWidth: '1060px', margin: '2rem auto', padding: '0 1.25rem' }} className="animate-fade-in">
      
      {/* ── Result Celebration Hero Card ────────────────────────────────────── */}
      <div className="lms-card" style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-xl)',
        background: 'linear-gradient(180deg, #ffffff 0%, #fafbff 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow backdrop behind badge */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          background: `${gradeColor}18`,
          color: gradeColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          boxShadow: `0 8px 24px -4px ${gradeColor}30`,
          border: `2px solid ${gradeColor}40`
        }}>
          <Award size={42} />
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', marginBottom: '0.35rem' }}>
          Kết Quả Hoàn Thành Bài Kiểm Tra
        </h2>

        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem', fontWeight: 500 }}>
          {course?.code} - {course?.title} • <span style={{ color: '#4f46e5', fontWeight: 700 }}>{mode === 'TEST_15' ? '15 Phút' : mode === 'TEST_30' ? '30 Phút' : mode === 'TEST_60' ? '60 Phút' : mode}</span>
        </p>

        {/* Big Score Gauge Badge */}
        <div style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          border: '2px solid #c7d2fe',
          padding: '1.75rem 3.5rem',
          borderRadius: '24px',
          marginBottom: '2rem',
          boxShadow: '0 12px 30px -6px rgba(79, 70, 229, 0.15)'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ĐIỂM TỔNG KẾT
          </span>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: '0.25rem 0' }}>
            <span style={{ fontSize: '3.75rem', fontWeight: 900, color: gradeColor, lineHeight: 1, letterSpacing: '-0.03em' }}>
              {scale10Score}
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#94a3b8' }}>
              / 10.0
            </span>
          </div>

          <span style={{
            fontSize: '0.875rem',
            fontWeight: 800,
            color: gradeColor,
            backgroundColor: `${gradeColor}18`,
            padding: '4px 16px',
            borderRadius: '9999px',
            border: `1px solid ${gradeColor}40`,
            marginTop: '0.35rem'
          }}>
            Xếp loại: {gradeLabel}
          </span>
        </div>

        {/* 4 Quick Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          maxWidth: '840px',
          margin: '0 auto 2rem auto'
        }}>
          <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.35rem' }}>Số câu trả lời đúng</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>
              {earnedPoints} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>/ {totalQuestions} câu</span>
            </div>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.35rem' }}>Thời gian làm bài</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4f46e5' }}>
              {minutesSpent}m {secondsSpent}s
            </div>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.35rem' }}>Tỷ lệ chính xác</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
              {accuracyPercent}%
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div>
          <button
            onClick={onRetake}
            className="btn-primary"
            style={{ padding: '0.875rem 2.5rem', fontSize: '1rem', borderRadius: '9999px' }}
          >
            <RotateCcw size={18} /> Làm Lại Bài Test Mới
          </button>
        </div>
      </div>

      {/* ── Detailed Review & Explanations ──────────────────────────────────── */}
      <div className="lms-card" style={{ padding: '2.25rem', boxShadow: 'var(--shadow-lg)' }}>
        
        {/* Header & Filter Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '1.25rem'
        }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <FileText style={{ color: '#4f46e5' }} size={24} />
            Chi Tiết Đáp Án & Lời Giải Thích
          </h3>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
            <button
              onClick={() => setFilterType('ALL')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: filterType === 'ALL' ? '#ffffff' : 'transparent',
                color: filterType === 'ALL' ? '#4f46e5' : '#64748b',
                boxShadow: filterType === 'ALL' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              Tất cả ({reviewData.length})
            </button>

            <button
              onClick={() => setFilterType('CORRECT')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: filterType === 'CORRECT' ? '#ffffff' : 'transparent',
                color: filterType === 'CORRECT' ? '#10b981' : '#64748b',
                boxShadow: filterType === 'CORRECT' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              ✓ Đúng ({correctCount})
            </button>

            <button
              onClick={() => setFilterType('INCORRECT')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: filterType === 'INCORRECT' ? '#ffffff' : 'transparent',
                color: filterType === 'INCORRECT' ? '#f43f5e' : '#64748b',
                boxShadow: filterType === 'INCORRECT' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              ✕ Sai ({incorrectCount})
            </button>
          </div>
        </div>

        {/* Question Review List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredQuestions.map((q, idx) => {
            const isCorrect = q.isUserCorrect;
            const originalIndex = reviewData.findIndex(item => item.instanceId === q.instanceId);

            return (
              <div
                key={q.instanceId || idx}
                style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1.5px solid',
                  borderColor: isCorrect ? '#a7f3d0' : '#fecdd3',
                  backgroundColor: isCorrect ? '#f0fdf4' : '#fff1f2',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '1.02rem', color: '#1e293b', lineHeight: 1.65, letterSpacing: '-0.2px', flex: 1 }}>
                    <span style={{ color: '#4f46e5', fontWeight: 800, marginRight: '0.5rem' }}>
                      Câu {originalIndex + 1}:
                    </span>
                    {q.content}
                  </div>

                  {isCorrect ? (
                    <span className="badge badge-success" style={{ flexShrink: 0, padding: '4px 10px', fontSize: '0.8rem' }}>
                      <CheckCircle2 size={15} /> +{q.questionScore.toFixed(1)} đ
                    </span>
                  ) : (
                    <span className="badge badge-danger" style={{ flexShrink: 0, padding: '4px 10px', fontSize: '0.8rem' }}>
                      <XCircle size={15} /> +{q.questionScore.toFixed(1)} đ
                    </span>
                  )}
                </div>

                {/* Option Review Breakdown for Single / Multi Choice */}
                {(q.type === 'SINGLE_CHOICE' || q.type === 'MULTI_CHOICE') && q.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    {q.options.map(opt => {
                      const userSelected = (q.userAnswer || []).includes(opt.id);
                      const isOptionCorrect = opt.isCorrect;

                      return (
                        <div
                          key={opt.id}
                          style={{
                            padding: '0.65rem 1rem',
                            borderRadius: '10px',
                            border: isOptionCorrect ? '1.5px solid #10b981' : userSelected ? '1.5px solid #f43f5e' : '1px solid #e2e8f0',
                            backgroundColor: isOptionCorrect ? '#ecfdf5' : userSelected ? '#fef2f2' : '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.88rem',
                            lineHeight: 1.6,
                            letterSpacing: '-0.15px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontWeight: isOptionCorrect || userSelected ? 600 : 400 }}>
                            <strong style={{ color: isOptionCorrect ? '#10b981' : '#64748b' }}>{opt.key}.</strong>
                            {opt.text}
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                            {userSelected && (
                              <span style={{ color: isOptionCorrect ? '#10b981' : '#f43f5e' }}>
                                (Bạn chọn)
                              </span>
                            )}
                            {isOptionCorrect && (
                              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <Check size={14} /> Đáp án đúng
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* True/False Breakdown */}
                {q.type === 'TRUE_FALSE' && q.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    {q.options.map(opt => {
                      const userChoice = (q.userAnswer || {})[opt.key];
                      const isSubCorrect = userChoice === opt.isCorrect;

                      return (
                        <div
                          key={opt.key}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: isSubCorrect ? '1.5px solid #10b981' : '1.5px solid #f43f5e',
                            backgroundColor: isSubCorrect ? '#ecfdf5' : '#fef2f2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                            fontSize: '0.875rem'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: '220px', color: '#0f172a', fontWeight: 600 }}>
                            <strong style={{ color: '#4f46e5', marginRight: '0.4rem' }}>{opt.key}.</strong>
                            {opt.text}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', fontWeight: 800 }}>
                            <span>
                              Bạn chọn:{' '}
                              <span style={{ color: userChoice === undefined ? '#94a3b8' : userChoice ? '#059669' : '#e11d48' }}>
                                {userChoice === undefined ? '(Chưa chọn)' : userChoice ? 'Đúng' : 'Sai'}
                              </span>
                            </span>
                            <span style={{ color: '#10b981', backgroundColor: '#ffffff', padding: '3px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                              Đáp án: {opt.isCorrect ? 'Đúng' : 'Sai'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Drag & Drop Breakdown */}
                {q.type === 'DRAG_DROP' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '1rem' }}>
                    {/* Match Mode Review */}
                    {q.dragMode === 'match' && (q.matchPairs || q.extractedBlanks || []).map((pair, pIdx) => {
                      const blankId = pair.blankId || `BLANK_${pIdx}`;
                      const userVal = (q.userAnswer || {})[blankId] || '';
                      const correctVal = (q.correctAnswers || {})[blankId] || pair.rightAnswer || pair.answer || '';
                      const isMatchCorrect = userVal.trim().toLowerCase() === correctVal.trim().toLowerCase();

                      return (
                        <div
                          key={pIdx}
                          style={{
                            padding: '0.85rem 1.15rem',
                            borderRadius: '12px',
                            border: isMatchCorrect ? '1.5px solid #10b981' : '1.5px solid #f43f5e',
                            backgroundColor: isMatchCorrect ? '#ecfdf5' : '#fef2f2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                            fontSize: '0.875rem'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: '240px', color: '#0f172a', fontWeight: 600 }}>
                            <strong style={{ color: '#4f46e5', marginRight: '0.4rem' }}>{pIdx + 1}.</strong>
                            {(pair.leftText || pair.leftWithBlank || pair.answer || '').replace(/\[BLANK_\d+\]/g, '_____')}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', fontWeight: 800 }}>
                            <span>
                              Đã ghép:{' '}
                              <span style={{ color: userVal ? (isMatchCorrect ? '#059669' : '#e11d48') : '#94a3b8' }}>
                                {userVal || '(Để trống)'}
                              </span>
                            </span>
                            {!isMatchCorrect && (
                              <span style={{ color: '#059669', backgroundColor: '#ffffff', padding: '3px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                                Đáp án đúng: {correctVal}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Categorize Mode Review */}
                    {q.dragMode === 'categorize' && q.columns && (
                      <div
                        className="categorize-columns-grid"
                        style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, q.columns.length)}, 1fr)`, gap: '1rem' }}
                      >
                        {q.columns.map((col, colIdx) => {
                          const correctSet = (col.items || []).map(it => it.trim().toLowerCase());
                          const userPlaced = Object.entries(q.userAnswer || {})
                            .filter(([k, v]) => k.startsWith(`COL_${colIdx}_`) && v)
                            .map(([, v]) => v);

                          return (
                            <div key={colIdx} style={{ border: '1.5px solid #c7d2fe', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                              <div style={{ background: 'var(--primary-gradient)', color: '#fff', padding: '0.75rem 1rem', fontWeight: 800, fontSize: '0.85rem', textAlign: 'center' }}>
                                {col.header}
                              </div>
                              <div style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#f8fafc', minHeight: '120px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>Bạn đã xếp vào cột này:</div>
                                {userPlaced.map((uItem, uIdx) => {
                                  const isCorrectPlacement = correctSet.includes(uItem.trim().toLowerCase());
                                  return (
                                    <div
                                      key={uIdx}
                                      style={{
                                        padding: '6px 10px',
                                        borderRadius: '8px',
                                        border: isCorrectPlacement ? '1.5px solid #10b981' : '1.5px solid #f43f5e',
                                        backgroundColor: isCorrectPlacement ? '#ecfdf5' : '#fef2f2',
                                        color: isCorrectPlacement ? '#065f46' : '#991b1b',
                                        fontSize: '0.82rem',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                      }}
                                    >
                                      <span>{uItem}</span>
                                      <span>{isCorrectPlacement ? '✓ Đúng' : '✕ Sai'}</span>
                                    </div>
                                  );
                                })}
                                {userPlaced.length === 0 && (
                                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontStyle: 'italic', padding: '0.5rem' }}>
                                    (Chưa xếp mục nào vào đây)
                                  </div>
                                )}

                                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', marginBottom: '0.25rem' }}>Mục đúng chuẩn:</div>
                                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.78rem', color: '#065f46' }}>
                                    {(col.items || []).map((it, idx) => (
                                      <li key={idx}>{it}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Inline / Other Mode Review */}
                    {(!q.dragMode || q.dragMode === 'inline') && (
                      <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.875rem' }}>
                        <div style={{ fontWeight: 800, color: '#475569', marginBottom: '0.5rem' }}>Đối chiếu đáp án điền khuyết:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {Object.entries(q.correctAnswers || {}).map(([bId, corVal], bIdx) => {
                            const uVal = (q.userAnswer || {})[bId] || '';
                            const isOK = uVal.trim().toLowerCase() === corVal.trim().toLowerCase();
                            return (
                              <div key={bId} style={{ padding: '6px 12px', borderRadius: '8px', border: isOK ? '1.5px solid #10b981' : '1.5px solid #f43f5e', backgroundColor: isOK ? '#ecfdf5' : '#fef2f2', fontSize: '0.8rem', fontWeight: 700 }}>
                                Ô {bIdx + 1}: Bạn chọn <strong>{uVal || '(trống)'}</strong> {isOK ? '✓' : `✕ (Đúng: ${corVal})`}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation Card */}
                {q.explanation && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem 1.25rem',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.875rem',
                    color: '#334155',
                    lineHeight: 1.6,
                    boxShadow: 'var(--shadow-xs)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4f46e5', fontWeight: 800, marginBottom: '0.25rem' }}>
                      <Sparkles size={16} /> Giải thích chi tiết:
                    </div>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
