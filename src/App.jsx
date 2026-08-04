import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QuizSystem from './components/QuizSystem';
import AdminParser from './components/AdminParser';
import ArchitectureViewer from './components/ArchitectureViewer';
import CourseManager from './components/CourseManager';
import {
  getInitialCourses,
  getInitialLessons,
  getInitialQuestions,
  saveCoursesToStorage,
  saveLessonsToStorage,
  saveQuestionsToStorage
} from './store/lmsStore';

export default function App() {
  const [activeTab, setActiveTab] = useState('quiz');

  // ── Shared reactive state (persisted to localStorage) ─────────────────────
  const [courses, setCourses] = useState(() => getInitialCourses());
  const [lessons, setLessons] = useState(() => getInitialLessons());
  const [questions, setQuestions] = useState(() => getInitialQuestions());

  useEffect(() => { saveCoursesToStorage(courses); }, [courses]);
  useEffect(() => { saveLessonsToStorage(lessons); }, [lessons]);
  useEffect(() => { saveQuestionsToStorage(questions); }, [questions]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1, paddingBottom: '3rem' }}>

        {/* ── Tab: Ôn Luyện & Thi ────────────────────────────────────────── */}
        {activeTab === 'quiz' && (
          <QuizSystem
            courses={courses}
            lessons={lessons}
            questions={questions}
          />
        )}

        {/* ── Tab: Quản Lý Nội Dung (CRUD) ───────────────────────────────── */}
        {activeTab === 'manage' && (
          <div style={{ padding: '2rem 1.5rem' }}>
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
          <AdminParser
            courses={courses}
            setCourses={setCourses}
            lessons={lessons}
            setLessons={setLessons}
            questions={questions}
            setQuestions={setQuestions}
          />
        )}

        {/* ── Tab: Kiến Trúc & ERD ─────────────────────────────────────────── */}
        {activeTab === 'architecture' && <ArchitectureViewer />}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '1rem 1.5rem',
        color: '#64748b',
        fontSize: '0.82rem'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>© 2026 Antigravity LMS v3.1 — Full Persistence & Dynamic Quiz Engine</div>
          <div style={{ display: 'flex', gap: '1.25rem', fontWeight: 700, color: '#1e40af' }}>
            <span>📚 {courses.length} Học phần</span>
            <span>📖 {lessons.length} Bài học</span>
            <span>❓ {questions.length} Câu hỏi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
