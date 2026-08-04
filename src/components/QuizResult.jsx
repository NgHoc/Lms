import React from 'react';
import { Award, CheckCircle2, XCircle, Clock, BookOpen, AlertCircle, FileText } from 'lucide-react';

export default function QuizResult({ result, course, mode, onRetake }) {
  const { totalQuestions, earnedPoints, scale10Score, timeSpentSeconds, reviewData } = result;

  const minutesSpent = Math.floor(timeSpentSeconds / 60);
  const secondsSpent = timeSpentSeconds % 60;

  // Grade classification
  const gradeLabel = parseFloat(scale10Score) >= 8.5 ? "Xuất sắc" :
                     parseFloat(scale10Score) >= 7.0 ? "Khá giỏi" :
                     parseFloat(scale10Score) >= 5.0 ? "Đạt yêu cầu" : "Cần ôn tập thêm";

  const gradeColor = parseFloat(scale10Score) >= 8.5 ? "#10b981" :
                     parseFloat(scale10Score) >= 7.0 ? "#1e40af" :
                     parseFloat(scale10Score) >= 5.0 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Result Card Header */}
      <div className="lms-card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: gradeColor + '15',
          color: gradeColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto'
        }}>
          <Award size={40} />
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
          Kết Quả Làm Bài Kiểm Tra
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {course?.code} - {course?.title} ({mode === 'TEST_15' ? '15 Phút' : mode === 'TEST_30' ? '30 Phút' : mode === 'TEST_60' ? '60 Phút' : mode})
        </p>

        {/* Big Score Badge */}
        <div style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#eff6ff',
          border: '2px solid #bfdbfe',
          padding: '1.25rem 3rem',
          borderRadius: '16px',
          marginBottom: '1.5rem'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Điểm Thang 10
          </span>
          <span style={{ fontSize: '3rem', fontWeight: 900, color: gradeColor }}>
            {scale10Score} <span style={{ fontSize: '1.5rem', color: '#64748b' }}>/ 10.0</span>
          </span>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: gradeColor,
            backgroundColor: gradeColor + '20',
            padding: '2px 12px',
            borderRadius: '9999px',
            marginTop: '0.25rem'
          }}>
            Xếp loại: {gradeLabel}
          </span>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          maxWidth: '650px',
          margin: '0 auto'
        }}>
          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Số câu đúng</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
              {earnedPoints} / {totalQuestions} câu
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Thời gian làm bài</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e40af' }}>
              {minutesSpent}m {secondsSpent}s
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Tỷ lệ chính xác</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {((earnedPoints / (totalQuestions || 1)) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Review Section */}
      <div className="lms-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText style={{ color: '#1e40af' }} size={22} />
          Chi Tiết Đáp Án & Giải Thích Chi Tiết
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {reviewData.map((q, idx) => (
            <div
              key={idx}
              style={{
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                backgroundColor: q.isUserCorrect ? '#ecfdf5' : '#fef2f2',
                borderLeft: `4px solid ${q.isUserCorrect ? '#10b981' : '#ef4444'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                  Câu {idx + 1}: {q.content}
                </span>
                {q.isUserCorrect ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                    <CheckCircle2 size={18} /> Chính xác (+1.0 đ)
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>
                    <XCircle size={18} /> Sai (0.0 đ)
                  </span>
                )}
              </div>

              {/* Explanation box */}
              {q.explanation && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.85rem',
                  color: '#334155'
                }}>
                  <strong style={{ color: '#1e40af' }}>Giải thích chi tiết: </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
