import React, { useState, useRef } from 'react';
import {
  ChevronRight,
  Play,
  PenLine,
  FileText,
  Check,
  X,
  Sparkles,
  BookOpen,
  Settings,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';
import GuideVideoModal from './GuideVideoModal';
import './AssistHero.css';

export default function AssistHero({ setActiveTab, coursesCount = 0, questionsCount = 0, onOpenGuide }) {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [activeBadgeModal, setActiveBadgeModal] = useState(null);
  const videoRef = useRef(null);

  // Navigation handlers
  const handleGoToQuiz = () => {
    if (setActiveTab) setActiveTab('quiz');
  };

  const handleGoToAdmin = () => {
    if (setActiveTab) setActiveTab('admin');
  };

  const handleGoToManage = () => {
    if (setActiveTab) setActiveTab('manage');
  };

  const handleOpenGuideVideo = () => {
    if (onOpenGuide) {
      onOpenGuide();
    } else {
      setShowDemoModal(true);
    }
  };

  return (
    <div className="assist-hero-root">
      {/* ── Main Dual-Column Hero Grid Section ───────────────────────────── */}
      <main className="assist-hero-main">
        <div className="assist-hero-grid">

          {/* ── Left Column: Copy & CTAs ─────────────────────────────────── */}
          <div className="assist-left-col">
            {/* Eyebrow Highlight Badge */}
            <div className="hero-eyebrow-badge">
              <span className="hero-eyebrow-dot" />
              <span className="hero-eyebrow-text">Nền Tảng Ôn Thi & Trắc Nghiệm Thông Minh</span>
            </div>

            {/* Main Display Heading */}
            <h1 className="assist-main-heading">
              Welcome to<br />
              <span className="hero-gradient-title">Hệ thống ôn tập</span>{' '}
            </h1>

            {/* Body Paragraph */}
            <p className="assist-body-text">
              Hệ thống ôn thi và luyện đề trắc nghiệm thông minh, tự động nhận diện và bóc tách đề thi từ Word/Docx, quản lý nội dung học phần và tối ưu hóa kết quả thi.
            </p>

            {/* Button Container */}
            <div className="assist-buttons-wrap">
              {/* Primary Action Button */}
              <button
                type="button"
                className="assist-btn-primary"
                onClick={handleGoToQuiz}
              >
                <span>Bắt Đầu Luyện Thi</span>
                <div className="assist-btn-primary-bead">
                  <ChevronRight size={16} />
                </div>
              </button>

              {/* Ghost Demo Link */}
              <button
                type="button"
                className="assist-btn-demo"
                onClick={handleOpenGuideVideo}
              >
                <div className="assist-btn-demo-bead">
                  <Play size={16} style={{ fill: '#0084FF', marginLeft: '2px' }} />
                </div>
                <span className="assist-btn-demo-text">Xem Hướng Dẫn</span>
              </button>
            </div>

            {/* Quick LMS Tags */}
            <div className="assist-quick-tags">
              <div className="assist-quick-tag" onClick={handleGoToQuiz}>
                <Zap size={14} style={{ color: '#0084FF' }} />
                <span>Trắc nghiệm thông minh</span>
              </div>
              <div className="assist-quick-tag" onClick={handleGoToAdmin}>
                <FileText size={14} style={{ color: '#10B981' }} />
                <span>Tự động nhận diện đáp án Word</span>
              </div>
              <div className="assist-quick-tag" onClick={handleGoToManage}>
                <ShieldCheck size={14} style={{ color: '#9333EA' }} />
                <span>Lưu trữ nội bộ an toàn</span>
              </div>
            </div>
          </div>

          {/* ── Right Column: Hero Robot Companion & Floating Badges ──────── */}
          <div className="assist-right-col">
            {/* Orbital Concentric Ring Lines Art */}
            <svg
              className="assist-orbit-rings-svg"
              viewBox="0 0 620 620"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="orbitGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60B1FF" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#319AFF" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="orbitGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0084FF" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#9333EA" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <circle
                cx="310"
                cy="310"
                r="300"
                stroke="url(#orbitGrad1)"
                strokeWidth="1.2"
                strokeDasharray="6 8"
              />
              <circle
                cx="310"
                cy="310"
                r="230"
                stroke="url(#orbitGrad2)"
                strokeWidth="1.5"
                strokeDasharray="3 6"
              />
              <circle
                cx="310"
                cy="310"
                r="160"
                stroke="rgba(0, 132, 255, 0.25)"
                strokeWidth="1"
              />
              <circle
                cx="580"
                cy="250"
                r="4"
                fill="#0084FF"
              />
              <circle
                cx="120"
                cy="440"
                r="3"
                fill="#10B981"
              />
              <circle
                cx="480"
                cy="510"
                r="3.5"
                fill="#9333EA"
              />
            </svg>

            {/* Video Container */}
            <div className="assist-video-wrapper">
              <video
                ref={videoRef}
                className="assist-robot-video"
                autoPlay
                loop
                muted
                playsInline
                controls={false}
                src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/hero_robo_video.mp4"
                poster="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
              />
            </div>

            {/* ── Dynamic Floating Liquid-Glass Badges (Vietnamese) ─────────── */}

            {/* 1. "Giải đáp thông minh" Badge (Top Right) */}
            <div
              className="assist-floating-badge assist-badge-email"
              onClick={() => setActiveBadgeModal('smart_assist')}
              title="Nhấn để xem tính năng trợ lý học tập"
            >
              <div className="assist-badge-icon-blue">
                <PenLine size={18} />
              </div>
              <div className="assist-badge-text-col">
                <span className="assist-badge-primary-text">Giải đáp thông minh</span>
                <span className="assist-badge-sub-text">Hỗ trợ học tập</span>
              </div>
            </div>

            {/* 2. "Bóc tách tài liệu" Badge (Center Left) */}
            <div
              className="assist-floating-badge assist-badge-summarize"
              onClick={handleGoToAdmin}
              title="Nhấn để chuyển tới trang Bóc Tách Đề Thi Word"
            >
              <div className="assist-badge-icon-green">
                <FileText size={18} />
              </div>
              <div className="assist-badge-text-col">
                <span className="assist-badge-primary-text">Bóc tách tài liệu</span>
                <span className="assist-badge-sub-text">Tự động nhận diện đề Word</span>
              </div>
            </div>

            {/* 3. "Quản lý nội dung" Badge (Bottom Right) */}
            <div
              className="assist-floating-badge assist-badge-todo"
              onClick={handleGoToManage}
              title="Nhấn để chuyển tới Quản Lý Nội Dung & Học Phần"
            >
              <div className="assist-badge-icon-purple">
                <Check size={18} strokeWidth={3} />
              </div>
              <div className="assist-badge-text-col">
                <span className="assist-badge-primary-text">Quản lý nội dung</span>
                <span className="assist-badge-sub-text">Học phần & bài học</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* ── High-Fidelity Interactive Guide Video Modal ──────────────────── */}
      <GuideVideoModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        onNavigateTab={(tab) => {
          if (setActiveTab) setActiveTab(tab);
        }}
      />

      {/* ── Badge Modal Trigger (Smart Assist Feature) ──────────────────── */}
      {activeBadgeModal === 'smart_assist' && (
        <div className="assist-modal-overlay" onClick={() => setActiveBadgeModal(null)}>
          <div className="assist-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="assist-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="assist-badge-icon-blue" style={{ width: '28px', height: '28px' }}>
                  <HelpCircle size={16} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  Trợ Lý Ôn Luyện NgHoc
                </h3>
              </div>
              <button
                type="button"
                className="assist-modal-close-btn"
                onClick={() => setActiveBadgeModal(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginTop: 0 }}>
                Hệ thống hỗ trợ bạn ôn luyện theo từng học phần, trộn đề ngẫu nhiên, tự động chấm điểm và giải thích chi tiết đáp án đúng/sai!
              </p>
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '12px',
                padding: '1rem',
                fontSize: '0.85rem',
                color: '#0369a1'
              }}>
                💡 <strong>Mẹo:</strong> Nhấn nút bên dưới để chuyển trực tiếp sang tab <strong>Ôn Luyện & Thi</strong> và bắt đầu làm bài.
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="assist-btn-primary"
                  onClick={() => {
                    setActiveBadgeModal(null);
                    handleGoToQuiz();
                  }}
                >
                  <span>Mở Phòng Ôn Luyện</span>
                  <div className="assist-btn-primary-bead">
                    <ChevronRight size={14} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
