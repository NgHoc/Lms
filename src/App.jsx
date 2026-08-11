import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QuizSystem from './components/QuizSystem';
import AdminParser from './components/AdminParser';
import CourseManager from './components/CourseManager';
import AssistHero from './components/AssistHero';
import GuideVideoModal from './components/GuideVideoModal';
import './components/AssistHero.css';
import './components/ModernLmsTheme.css';
import {
  getInitialCourses,
  getInitialLessons,
  getInitialQuestions,
  saveCoursesToStorage,
  saveLessonsToStorage,
  saveQuestionsToStorage
} from './store/lmsStore';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showGuideModal, setShowGuideModal] = useState(false);

  // ── Shared reactive state (persisted to localStorage) ─────────────────────
  const [courses, setCourses] = useState(() => getInitialCourses());
  const [lessons, setLessons] = useState(() => getInitialLessons());
  const [questions, setQuestions] = useState(() => getInitialQuestions());

  useEffect(() => { saveCoursesToStorage(courses); }, [courses]);
  useEffect(() => { saveLessonsToStorage(lessons); }, [lessons]);
  useEffect(() => { saveQuestionsToStorage(questions); }, [questions]);

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
    }}>
      {/* ── Global Ambient Radial Glow Spotlights ───────────────────────── */}
      <div className="assist-ambient-aura-1" />
      <div className="assist-ambient-aura-2" />
      <div className="assist-ambient-aura-3" />

      {/* ── Unified Floating Liquid-Glass Header Across All Pages ──────── */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGuide={() => setShowGuideModal(true)}
      />

      {/* ── Global Interactive Guide Video Modal ────────────────────────── */}
      <GuideVideoModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
        }}
      />

      {/* ── Main Content Area with Adaptive Top Padding for Floating Navbar ─ */}
      <main className={`app-main-content ${activeTab === 'home' ? 'is-home' : ''}`}>
        {/* ── Tab: Assist. AI Landing Page (Home) ─────────────────────────── */}
        {activeTab === 'home' && (
          <AssistHero
            setActiveTab={setActiveTab}
            coursesCount={courses.length}
            questionsCount={questions.length}
            onOpenGuide={() => setShowGuideModal(true)}
          />
        )}

        {/* ── Tab: Ôn Luyện & Thi ────────────────────────────────────────── */}
        {activeTab === 'quiz' && (
          <div className="page-content-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem' }}>
            <QuizSystem
              courses={courses}
              lessons={lessons}
              questions={questions}
            />
          </div>
        )}

        {/* ── Tab: Quản Lý Nội Dung (CRUD) ───────────────────────────────── */}
        {activeTab === 'manage' && (
          <div className="page-content-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem' }}>
            <CourseManager
              courses={courses}
              setCourses={setCourses}
              lessons={lessons}
              setLessons={setLessons}
              questions={questions}
              setQuestions={setQuestions}
            />
          </div>
        )}

        {/* ── Tab: Upload & Bóc Tách File ─────────────────────────────────── */}
        {activeTab === 'admin' && (
          <div className="page-content-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem' }}>
            <AdminParser
              courses={courses}
              setCourses={setCourses}
              lessons={lessons}
              setLessons={setLessons}
              questions={questions}
              setQuestions={setQuestions}
            />
          </div>
        )}
      </main>

      {/* Modern Premium Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(226, 232, 240, 0.8)',
        padding: '1.25rem 1.5rem',
        color: '#64748b',
        fontSize: '0.875rem',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          {/* Brand Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div
              onClick={() => setActiveTab('home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <span style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.75rem'
              }}>
                N
              </span>
              <span style={{
                fontWeight: 900,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #0f172a 0%, #4338ca 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em'
              }}>
                NgHoc
              </span>
            </div>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
              Nền tảng thi trắc nghiệm & ôn tập thông minh
            </span>
          </div>

          {/* Realtime Stats Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontWeight: 700, fontSize: '0.8rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#eef2ff',
              color: '#4f46e5',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid #c7d2fe',
              boxShadow: '0 1px 3px rgba(79, 70, 229, 0.08)'
            }}>
              <span>📚</span>
              <span>{courses.length} Học phần</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#f3e8ff',
              color: '#7c3aed',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid #ddd6fe',
              boxShadow: '0 1px 3px rgba(124, 58, 237, 0.08)'
            }}>
              <span>📖</span>
              <span>{lessons.length} Bài học</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid #a7f3d0',
              boxShadow: '0 1px 3px rgba(5, 150, 105, 0.08)'
            }}>
              <span>❓</span>
              <span>{questions.length} Câu hỏi</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
