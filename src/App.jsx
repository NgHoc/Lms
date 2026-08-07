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

      {/* Modern Footer */}
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '1.25rem 1.5rem',
        color: '#64748b',
        fontSize: '0.85rem'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 800, color: '#0f172a' }}>Antigravity LMS PRO</span>
            <span>•</span>
            <span>Nền tảng thi trắc nghiệm & ôn tập thông minh</span>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', fontWeight: 700, color: '#4f46e5' }}>
            <span style={{ backgroundColor: '#eef2ff', padding: '4px 10px', borderRadius: '8px', border: '1px solid #c7d2fe' }}>📚 {courses.length} Học phần</span>
            <span style={{ backgroundColor: '#f3e8ff', padding: '4px 10px', borderRadius: '8px', border: '1px solid #ddd6fe', color: '#7c3aed' }}>📖 {lessons.length} Bài học</span>
            <span style={{ backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '8px', border: '1px solid #a7f3d0', color: '#059669' }}>❓ {questions.length} Câu hỏi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
