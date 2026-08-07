import React, { useState, useEffect } from 'react';
import {
  Clock, Flag, CheckCircle, ArrowLeft, ArrowRight, Award, AlertTriangle,
  Play, RefreshCw, Bookmark, HelpCircle, Layers, Check, Sparkles, BookOpen, ChevronRight,
  TrendingUp, Target, History, Trash2, X, Eye, Calendar
} from 'lucide-react';
import QuizResult from './QuizResult';
import { getInitialHistory, addHistoryItem, clearHistoryFromStorage } from '../store/lmsStore';

function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function QuizSystem({ courses, lessons, questions, customSession, onClearCustomSession }) {
  // Test Setup State
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || "");
  const [selectedMode, setSelectedMode] = useState("TEST_15"); // TEST_15, TEST_30, TEST_60
  const [selectedLessonId, setSelectedLessonId] = useState(lessons.find(l => l.courseId === courses[0]?.id)?.id || "");
  const [selected30LessonIds, setSelected30LessonIds] = useState([]);

  // Attempt History State
  const [history, setHistory] = useState(() => getInitialHistory());
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Active Test State
  const [isTestActive, setIsTestActive] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activeSessionMeta, setActiveSessionMeta] = useState(null);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [showMobileMatrixModal, setShowMobileMatrixModal] = useState(false);
  const [activeSlotId, setActiveSlotId] = useState(null);

  // Lessons for selected course
  const courseLessons = lessons.filter(l => l.courseId === selectedCourseId);

  // Keep selected30LessonIds synced when course or lessons change
  useEffect(() => {
    const cLessons = lessons.filter(l => l.courseId === selectedCourseId);
    setSelected30LessonIds(cLessons.slice(0, 3).map(l => l.id));
    if (cLessons.length > 0) {
      setSelectedLessonId(cLessons[0].id);
    }
  }, [selectedCourseId, lessons]);

  // Auto-start when customSession is injected
  useEffect(() => {
    if (customSession && !isTestActive && !isSubmitted) {
      const qs = customSession.questions.map((q, idx) => ({ ...q, instanceId: `inst-${idx + 1}-${q.id}` }));
      setActiveQuestions(qs);
      setCurrentIndex(0);
      setUserAnswers({});
      setFlaggedQuestions({});
      setIsSubmitted(false);
      setTestResult(null);
      setActiveSessionMeta(customSession);
      setTimeLeft(customSession.totalCount * 60);
      setIsTestActive(true);
    }
  }, [customSession]);

  // Dynamic Question Sampler with Randomization
  const sampleRandom = (arr, count) => {
    if (!arr || arr.length === 0) return [];
    const shuffled = shuffleArray(arr);
    if (shuffled.length >= count) {
      return shuffled.slice(0, count);
    }
    let result = [...shuffled];
    while (result.length < count) {
      result.push(...shuffleArray(arr));
    }
    return result.slice(0, count);
  };

  const getDynamicQuestionsForTest = (courseId, mode, lessonId, chosen30LessonIds) => {
    const courseLessonIds = lessons.filter(l => l.courseId === courseId).map(l => l.id);
    let pool = questions.filter(q => courseLessonIds.includes(q.lessonId));

    if (pool.length === 0) pool = questions; // Fallback if course bank empty

    let selectedList = [];
    if (mode === "TEST_15") {
      let lessonQs = pool.filter(q => q.lessonId === lessonId);
      if (lessonQs.length === 0) lessonQs = pool;
      selectedList = sampleRandom(lessonQs, 15);
    } else if (mode === "TEST_30") {
      const targetLessons = (chosen30LessonIds && chosen30LessonIds.length > 0)
        ? chosen30LessonIds
        : courseLessonIds.slice(0, 3);

      let combinedPool = pool.filter(q => targetLessons.includes(q.lessonId));
      if (combinedPool.length === 0) combinedPool = pool;

      const perLessonCount = Math.ceil(30 / Math.max(1, targetLessons.length));
      targetLessons.forEach(lId => {
        let lQs = pool.filter(q => q.lessonId === lId);
        if (lQs.length > 0) {
          selectedList.push(...sampleRandom(lQs, perLessonCount));
        }
      });

      if (selectedList.length < 30) {
        const remainingNeeded = 30 - selectedList.length;
        selectedList.push(...sampleRandom(combinedPool, remainingNeeded));
      }
      selectedList = shuffleArray(selectedList).slice(0, 30);
    } else {
      // TEST_60: 50 random questions from course bank
      selectedList = sampleRandom(pool, 50);
    }

    return selectedList.map((q, idx) => ({
      ...q,
      instanceId: `inst-${idx + 1}-${Math.random().toString(36).substr(2, 6)}-${q.id}`
    }));
  };

  // Start Test Handler
  const handleStartTest = () => {
    const qs = getDynamicQuestionsForTest(selectedCourseId, selectedMode, selectedLessonId, selected30LessonIds);
    setActiveQuestions(qs);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    setIsSubmitted(false);
    setTestResult(null);
    setActiveSessionMeta(null);
    setShowSubmitConfirmModal(false);
    if (onClearCustomSession) onClearCustomSession();

    let durationSeconds = 15 * 60;
    if (selectedMode === "TEST_30") durationSeconds = 30 * 60;
    if (selectedMode === "TEST_60") durationSeconds = 60 * 60;

    setTimeLeft(durationSeconds);
    setIsTestActive(true);
  };

  // Timer Tick
  useEffect(() => {
    if (!isTestActive || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTestActive, isSubmitted]);

  // Keyboard navigation: Enter for next, Arrow Left / Right
  useEffect(() => {
    if (!isTestActive || isSubmitted) return;
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        setCurrentIndex(prev => Math.min(prev + 1, activeQuestions.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTestActive, isSubmitted, activeQuestions.length]);

  // Format Time Remaining (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle Flag question
  const toggleFlag = (instanceId) => {
    setFlaggedQuestions(prev => ({ ...prev, [instanceId]: !prev[instanceId] }));
  };

  // Handler for Single / Multi Choice
  const handleSelectChoice = (instanceId, optId, isMulti) => {
    setUserAnswers(prev => {
      const current = prev[instanceId] || [];
      if (isMulti) {
        if (current.includes(optId)) {
          return { ...prev, [instanceId]: current.filter(id => id !== optId) };
        } else {
          return { ...prev, [instanceId]: [...current, optId] };
        }
      } else {
        return { ...prev, [instanceId]: [optId] };
      }
    });
  };

  // Handler for True / False
  const handleSelectTrueFalse = (instanceId, optKey, value) => {
    setUserAnswers(prev => {
      const current = prev[instanceId] || {};
      return {
        ...prev,
        [instanceId]: {
          ...current,
          [optKey]: value
        }
      };
    });
  };

  // Handler for Drag & Drop / Keyword Slot
  const handleDropKeyword = (instanceId, blankId, keyword) => {
    setUserAnswers(prev => {
      const current = prev[instanceId] || {};
      if (keyword === null) {
        const copy = { ...current };
        delete copy[blankId];
        return { ...prev, [instanceId]: copy };
      }
      return {
        ...prev,
        [instanceId]: {
          ...current,
          [blankId]: keyword
        }
      };
    });
  };

  // Grading Algorithm
  const calculateResult = () => {
    let earnedPoints = 0;
    const totalQuestions = activeQuestions.length;

    const reviewData = activeQuestions.map(q => {
      const uAns = userAnswers[q.instanceId];
      let isCorrect = false;
      let questionScore = 0;

      if (q.type === 'SINGLE_CHOICE') {
        const correctOpt = (q.options || []).find(o => o.isCorrect);
        if (correctOpt && uAns && uAns.length === 1 && uAns[0] === correctOpt.id) {
          isCorrect = true;
          questionScore = 1.0;
        }
      } else if (q.type === 'MULTI_CHOICE') {
        const correctIds = (q.options || []).filter(o => o.isCorrect).map(o => o.id);
        const userSelected = uAns || [];
        const isExact = correctIds.length === userSelected.length &&
          correctIds.every(id => userSelected.includes(id));
        if (isExact) {
          isCorrect = true;
          questionScore = 1.0;
        }
      } else if (q.type === 'TRUE_FALSE') {
        const opts = q.options || [];
        const userObj = uAns || {};
        let correctSubCount = 0;
        opts.forEach(opt => {
          if (userObj[opt.key] === opt.isCorrect) {
            correctSubCount++;
          }
        });
        if (opts.length > 0) {
          questionScore = correctSubCount / opts.length;
          isCorrect = correctSubCount === opts.length;
        }
      } else if (q.type === 'DRAG_DROP') {
        const userObj = uAns || {};
        if (q.dragMode === 'categorize' && q.columns && q.columns.length > 0) {
          const totalItems = q.columns.reduce((sum, col) => sum + (col.items?.length || 0), 0);
          let correctPlacedCount = 0;
          let misplacedCount = 0;

          q.columns.forEach((col, colIdx) => {
            const correctSet = (col.items || []).map(it => it.trim().toLowerCase());
            const userInThisCol = Object.entries(userObj)
              .filter(([k, v]) => k.startsWith(`COL_${colIdx}_`) && v)
              .map(([, v]) => v.trim().toLowerCase());

            userInThisCol.forEach(uItem => {
              if (correctSet.includes(uItem)) {
                correctPlacedCount++;
              } else {
                misplacedCount++;
              }
            });
          });

          if (totalItems > 0) {
            questionScore = Math.max(0, (correctPlacedCount - misplacedCount * 0.5) / totalItems);
            isCorrect = correctPlacedCount === totalItems && misplacedCount === 0;
          }
        } else {
          const correctObj = q.correctAnswers || {};
          const totalBlanks = Object.keys(correctObj).length;
          let matchedCount = 0;

          Object.keys(correctObj).forEach(bId => {
            if (userObj[bId] && userObj[bId].trim().toLowerCase() === correctObj[bId].trim().toLowerCase()) {
              matchedCount++;
            }
          });

          if (totalBlanks > 0) {
            questionScore = matchedCount / totalBlanks;
            isCorrect = matchedCount === totalBlanks;
          }
        }
      }

      earnedPoints += questionScore;

      return {
        ...q,
        userAnswer: uAns,
        isUserCorrect: isCorrect,
        questionScore
      };
    });

    const scale10Score = ((earnedPoints / Math.max(1, totalQuestions)) * 10).toFixed(1);

    let totalDuration = 15 * 60;
    if (activeSessionMeta) totalDuration = activeSessionMeta.totalCount * 60;
    else if (selectedMode === "TEST_30") totalDuration = 30 * 60;
    else if (selectedMode === "TEST_60") totalDuration = 60 * 60;

    const timeSpentSeconds = Math.max(0, totalDuration - timeLeft);

    return {
      totalQuestions,
      earnedPoints: earnedPoints.toFixed(1),
      scale10Score,
      timeSpentSeconds,
      reviewData,
      sessionMeta: activeSessionMeta
    };
  };

  const handleFinalSubmit = () => {
    const res = calculateResult();
    setTestResult(res);
    setIsSubmitted(true);
    setIsTestActive(false);

    // Save attempt to history
    try {
      const activeCourse = courses.find(c => c.id === selectedCourseId);
      const activeLesson = lessons.find(l => l.id === selectedLessonId);
      const modeLabel = activeSessionMeta
        ? `Bộ đề tùy biến (${activeSessionMeta.lessons?.map(l => 'Bài ' + l.lessonNumber).join(', ')})`
        : selectedMode === 'TEST_15'
        ? `15 Phút (${activeLesson?.title || 'Bài 1'})`
        : selectedMode === 'TEST_30'
        ? '30 Phút (Tổng hợp 3 bài)'
        : '60 Phút (Toàn bộ học phần)';

      const historyItem = {
        id: `hist-${Date.now()}`,
        timestamp: Date.now(),
        dateStr: new Date().toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        courseTitle: activeSessionMeta?.course?.title || activeCourse?.title || 'Đề thi tổng hợp',
        modeTitle: modeLabel,
        totalQuestions: res.total,
        correctCount: res.correct,
        score10: Number(Number(res.scale10Score).toFixed(1)),
        percentage: Math.round(res.percentage),
        timeSpentSeconds: res.timeSpentSeconds,
        reviewResult: res
      };
      const updatedHistory = addHistoryItem(historyItem);
      setHistory(updatedHistory);
    } catch (e) {
      console.error('Error saving history item:', e);
    }
  };

  const currentQ = activeQuestions[currentIndex];

  // Helper check if question is answered
  const isQuestionAnswered = (instanceId) => {
    const ans = userAnswers[instanceId];
    if (!ans) return false;
    if (Array.isArray(ans)) return ans.length > 0;
    if (typeof ans === 'object') return Object.keys(ans).length > 0;
    return true;
  };

  const answeredCount = activeQuestions.filter(q => isQuestionAnswered(q.instanceId)).length;
  const progressPercent = activeQuestions.length > 0 ? (answeredCount / activeQuestions.length) * 100 : 0;

  if (isSubmitted && testResult) {
    return (
      <QuizResult
        result={testResult}
        course={testResult.sessionMeta?.course || courses.find(c => c.id === selectedCourseId)}
        mode={testResult.sessionMeta ? `Bộ đề tùy biến: ${testResult.sessionMeta.lessons?.map(l => 'Bài ' + l.lessonNumber).join(', ')}` : selectedMode}
        onRetake={() => {
          if (onClearCustomSession) onClearCustomSession();
          setActiveSessionMeta(null);
          setIsSubmitted(false);
          setTestResult(null);
          setIsTestActive(false);
        }}
      />
    );
  }

  // Statistics calculations from persistent attempt history
  const totalAttempts = history.length;
  const avgScore = totalAttempts > 0
    ? (history.reduce((sum, h) => sum + (h.score10 || 0), 0) / totalAttempts).toFixed(1)
    : '0.0';
  const maxScore = totalAttempts > 0
    ? Math.max(...history.map(h => h.score10 || 0)).toFixed(1)
    : '0.0';
  const totalQuestionsDone = history.reduce((sum, h) => sum + (h.totalQuestions || 0), 0);
  const totalCorrectDone = history.reduce((sum, h) => sum + (h.correctCount || 0), 0);
  const overallAccuracy = totalQuestionsDone > 0
    ? Math.round((totalCorrectDone / totalQuestionsDone) * 100)
    : 0;

  return (
    <div style={{ maxWidth: '1400px', margin: '1.5rem auto', padding: '0 1.25rem' }}>
      {!isTestActive ? (
        <div style={{ maxWidth: '960px', margin: '0 auto' }} className="animate-fade-in">
          
          {/* Main Card Container */}
          <div className="lms-card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
            
            {/* Hero Title */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '4px 14px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                color: '#4f46e5',
                fontSize: '0.8rem',
                fontWeight: 800,
                border: '1px solid #c7d2fe',
                marginBottom: '1rem'
              }}>
                <Sparkles size={14} /> NGÂN HÀNG ĐỀ THI THÔNG MINH
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
                Hệ Thống Ôn Luyện & Thi Thử Trực Tuyến
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.975rem', maxWidth: '640px', margin: '0 auto' }}>
                Lựa chọn Học phần và Chế độ thi phù hợp để hệ thống tự động trích xuất và xáo trộn câu hỏi từ ngân hàng đề thi.
              </p>
            </div>

            {/* Realtime Statistics Summary Bar (Lượt làm bài, Điểm TB, Điểm cao nhất) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1rem',
              marginBottom: '2.25rem'
            }}>
              {/* Lượt làm bài card */}
              <div
                onClick={() => setShowHistoryModal(true)}
                className="lms-card-interactive"
                style={{
                  padding: '1.25rem 1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  border: '1.5px solid #e2e8f0',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
                }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(79, 70, 229, 0.15)',
                  flexShrink: 0
                }}>
                  <Target size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Lượt làm bài
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                    {totalAttempts} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>lượt</span>
                  </div>
                </div>
              </div>

              {/* Điểm trung bình card (Click mở xem chi tiết) */}
              <div
                onClick={() => setShowHistoryModal(true)}
                className="lms-card-interactive"
                style={{
                  padding: '1.25rem 1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  border: '2px solid #818cf8',
                  background: 'linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%)',
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px -2px rgba(79, 70, 229, 0.15)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
                    flexShrink: 0
                  }}>
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#4f46e5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Điểm trung bình
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e1b4b', lineHeight: 1.2 }}>
                      {avgScore} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6366f1' }}>/ 10</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  backgroundColor: '#ffffff',
                  color: '#4f46e5',
                  padding: '4px 8px',
                  borderRadius: '9999px',
                  border: '1px solid #c7d2fe',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  flexShrink: 0
                }}>
                  <span>Chi tiết</span>
                  <ChevronRight size={12} />
                </div>
              </div>

              {/* Điểm cao nhất card */}
              <div
                onClick={() => setShowHistoryModal(true)}
                className="lms-card-interactive"
                style={{
                  padding: '1.25rem 1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  border: '1.5px solid #e2e8f0',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
                }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(5, 150, 105, 0.15)',
                  flexShrink: 0
                }}>
                  <Award size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Điểm cao nhất
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#065f46', lineHeight: 1.2 }}>
                    {maxScore} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#059669' }}>/ 10</span>
                  </div>
                </div>
              </div>
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
                Bước 1: Chọn Học Phần ({courses.length} Học Phần Hiện Có)
              </label>

              {courses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', color: '#94a3b8', border: '2px dashed #cbd5e1', borderRadius: '16px', backgroundColor: '#f8fafc' }}>
                  <BookOpen size={44} style={{ marginBottom: '0.75rem', opacity: 0.4, color: '#4f46e5' }} />
                  <p style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem', marginBottom: '0.35rem' }}>
                    Chưa có học phần nào trong cơ sở dữ liệu
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '460px', margin: '0 auto' }}>
                    Vui lòng chuyển sang tab <strong>"Quản Lý Nội Dung"</strong> để tự tạo hoặc tab <strong>"Upload & Bóc Tách"</strong> để nhập file Word đề thi vào hệ thống.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {courses.map(course => {
                    const isSelected = selectedCourseId === course.id;
                    const cLessonCount = lessons.filter(l => l.courseId === course.id).length;
                    const cQuestionCount = course.questionsCount || questions.filter(q => lessons.filter(l => l.courseId === course.id).map(l => l.id).includes(q.lessonId)).length;

                    return (
                      <div
                        key={course.id}
                        onClick={() => setSelectedCourseId(course.id)}
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

                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', lineHeight: 1.35, marginBottom: '0.5rem' }}>
                          {course.title}
                        </div>

                        <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', gap: '0.75rem', fontWeight: 600 }}>
                          <span>📖 {cLessonCount} bài học</span>
                          <span>•</span>
                          <span>❓ {cQuestionCount} câu hỏi</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Select 3 Test Modes */}
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
                }}>2</span>
                Bước 2: Chọn Chế Độ Thi Thử
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                
                {/* Mode 15 */}
                <div
                  onClick={() => setSelectedMode("TEST_15")}
                  className={`lms-card-interactive ${selectedMode === "TEST_15" ? 'selected' : ''}`}
                  style={{ padding: '1.35rem', borderWidth: selectedMode === "TEST_15" ? '2px' : '1.5px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: selectedMode === "TEST_15" ? 'var(--primary-gradient)' : '#eef2ff',
                      color: selectedMode === "TEST_15" ? '#fff' : '#4f46e5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Clock size={18} />
                    </div>
                    <span className="badge badge-primary">15 Phút</span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                    Test 15 Phút Nhanh
                  </h4>
                  <p style={{ fontSize: '0.825rem', color: '#64748b', lineHeight: 1.4 }}>
                    15 câu hỏi ngẫu nhiên thuộc 1 Bài học cụ thể bạn chỉ định.
                  </p>
                </div>

                {/* Mode 30 */}
                <div
                  onClick={() => setSelectedMode("TEST_30")}
                  className={`lms-card-interactive ${selectedMode === "TEST_30" ? 'selected' : ''}`}
                  style={{ padding: '1.35rem', borderWidth: selectedMode === "TEST_30" ? '2px' : '1.5px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: selectedMode === "TEST_30" ? 'var(--primary-gradient)' : '#f3e8ff',
                      color: selectedMode === "TEST_30" ? '#fff' : '#7c3aed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Layers size={18} />
                    </div>
                    <span className="badge badge-warning">30 Phút</span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                    Test 30 Phút (Tối đa 3 Bài)
                  </h4>
                  <p style={{ fontSize: '0.825rem', color: '#64748b', lineHeight: 1.4 }}>
                    30 câu hỏi ngẫu nhiên tổng hợp từ tối đa 3 Bài học bạn tự chọn.
                  </p>
                </div>

                {/* Mode 60 */}
                <div
                  onClick={() => setSelectedMode("TEST_60")}
                  className={`lms-card-interactive ${selectedMode === "TEST_60" ? 'selected' : ''}`}
                  style={{ padding: '1.35rem', borderWidth: selectedMode === "TEST_60" ? '2px' : '1.5px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: selectedMode === "TEST_60" ? 'var(--primary-gradient)' : '#ecfdf5',
                      color: selectedMode === "TEST_60" ? '#fff' : '#059669',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Award size={18} />
                    </div>
                    <span className="badge badge-success">60 Phút</span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                    Test Cuối Kỳ Chuẩn
                  </h4>
                  <p style={{ fontSize: '0.825rem', color: '#64748b', lineHeight: 1.4 }}>
                    50 câu hỏi phủ khắp toàn bộ kho đề thi của Học phần.
                  </p>
                </div>
              </div>
            </div>

            {/* Config for Test 15 mins */}
            {selectedMode === "TEST_15" && (
              <div style={{ marginBottom: '2.25rem', padding: '1.35rem', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1.5px solid #e2e8f0' }} className="animate-fade-in">
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#0f172a' }}>
                  Chỉ định Bài học cho bài test 15 phút:
                </label>
                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    color: '#0f172a'
                  }}
                >
                  {courseLessons.map(l => (
                    <option key={l.id} value={l.id}>
                      Bài {l.lessonNumber}: {l.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Config for Test 30 mins */}
            {selectedMode === "TEST_30" && (
              <div style={{ marginBottom: '2.25rem', padding: '1.35rem', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1.5px solid #e2e8f0' }} className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                  <label style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                    Chỉ định tối đa 3 Bài học cho bài test 30 phút:
                  </label>
                  <span className={`badge ${selected30LessonIds.length === 3 ? 'badge-primary' : 'badge-warning'}`}>
                    {selected30LessonIds.length} / 3 bài đã chọn
                  </span>
                </div>

                {courseLessons.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', padding: '1rem 0', textAlign: 'center' }}>
                    Học phần này chưa có bài học nào.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                    {courseLessons.map(l => {
                      const isSelected = selected30LessonIds.includes(l.id);
                      const isDisabled = !isSelected && selected30LessonIds.length >= 3;
                      const lessonQsCount = questions.filter(q => q.lessonId === l.id).length;

                      return (
                        <div
                          key={l.id}
                          onClick={() => {
                            if (isDisabled) return;
                            setSelected30LessonIds(prev => {
                              if (prev.includes(l.id)) {
                                if (prev.length === 1) return prev; // Keep at least 1
                                return prev.filter(id => id !== l.id);
                              }
                              return [...prev, l.id];
                            });
                          }}
                          style={{
                            padding: '0.875rem 1.125rem',
                            borderRadius: '12px',
                            border: isSelected ? '2px solid #4f46e5' : '1.5px solid #cbd5e1',
                            backgroundColor: isSelected ? '#eef2ff' : isDisabled ? '#f1f5f9' : '#ffffff',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            opacity: isDisabled ? 0.45 : 1,
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}
                        >
                          <div style={{
                            width: '22px', height: '22px', borderRadius: '6px',
                            border: isSelected ? 'none' : '2px solid #94a3b8',
                            background: isSelected ? 'var(--primary-gradient)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '0.8rem', fontWeight: 800
                          }}>
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              Bài {l.lessonNumber}: {l.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{lessonQsCount} câu hỏi</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Start Button */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                onClick={handleStartTest}
                disabled={courses.length === 0 || !selectedCourseId || questions.length === 0}
                className="btn-primary"
                style={{
                  fontSize: '1.05rem',
                  padding: '1rem 3.5rem',
                  borderRadius: '9999px',
                  opacity: (courses.length === 0 || !selectedCourseId || questions.length === 0) ? 0.5 : 1,
                  cursor: (courses.length === 0 || !selectedCourseId || questions.length === 0) ? 'not-allowed' : 'pointer'
                }}
              >
                <Play size={22} /> Bắt Đầu Làm Bài Test Ngay
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Examination Layout */
        <div className="quiz-layout-grid animate-fade-in">
          
          {/* Main Question Box */}
          <div className="lms-card quiz-main-card" style={{ boxShadow: 'var(--shadow-lg)' }}>

            {/* Custom session banner if exists */}
            {activeSessionMeta && (
              <div style={{
                marginBottom: '1.25rem',
                padding: '0.875rem 1.25rem',
                backgroundColor: '#ecfdf5',
                border: '1.5px solid #a7f3d0',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Layers size={18} color="#059669" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#047857' }}>Bộ Đề Tùy Biến: </span>
                  <span style={{ fontSize: '0.82rem', color: '#065f46', fontWeight: 600 }}>
                    {activeSessionMeta.lessons?.map(l => `Bài ${l.lessonNumber}: ${l.title}`).join(' • ')}
                  </span>
                </div>
                <span className="badge badge-success" style={{ flexShrink: 0 }}>
                  {activeSessionMeta.totalCount} câu
                </span>
              </div>
            )}

            {/* Question Progress Header Bar */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
              
              {/* Dynamic Progress Bar */}
              <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', marginBottom: '1rem', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: '9999px',
                  background: 'var(--primary-gradient)',
                  width: `${progressPercent}%`,
                  transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                  {/* Tap to open Question Map Modal on Mobile */}
                  <button
                    onClick={() => setShowMobileMatrixModal(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      background: 'var(--primary-gradient)',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
                      cursor: 'pointer'
                    }}
                    title="Bấm để mở Ma trận toàn bộ câu hỏi"
                  >
                    <span>Câu {currentIndex + 1} / {activeQuestions.length}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>▾</span>
                  </button>

                  <span style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 600 }}>
                    {currentQ.type === 'SINGLE_CHOICE' ? 'Dạng 1: 1 đáp án' :
                      currentQ.type === 'MULTI_CHOICE' ? 'Dạng 1: Nhiều đáp án' :
                        currentQ.type === 'TRUE_FALSE' ? 'Dạng 2: Đúng / Sai' : 'Dạng 3: Kéo thả'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => toggleFlag(currentQ.instanceId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      border: flaggedQuestions[currentQ.instanceId] ? '1.5px solid #fde68a' : '1.5px solid #e2e8f0',
                      backgroundColor: flaggedQuestions[currentQ.instanceId] ? '#fffbeb' : '#ffffff',
                      color: flaggedQuestions[currentQ.instanceId] ? '#b45309' : '#64748b',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: flaggedQuestions[currentQ.instanceId] ? '0 2px 8px rgba(245, 158, 11, 0.2)' : 'none'
                    }}
                  >
                    <Bookmark size={15} fill={flaggedQuestions[currentQ.instanceId] ? '#b45309' : 'none'} />
                    <span>{flaggedQuestions[currentQ.instanceId] ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Question Title Statement */}
            <div style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '1.75rem',
              lineHeight: 1.6,
              wordBreak: 'break-word',
              letterSpacing: '-0.01em'
            }}>
              {currentQ.content}
            </div>

            {/* DẠNG 1: Single / Multi Choice */}
            {(currentQ.type === 'SINGLE_CHOICE' || currentQ.type === 'MULTI_CHOICE') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {(currentQ.options || []).map(opt => {
                  const currentAns = userAnswers[currentQ.instanceId] || [];
                  const isSelected = currentAns.includes(opt.id);
                  const isMulti = currentQ.type === 'MULTI_CHOICE';

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectChoice(currentQ.instanceId, opt.id, isMulti)}
                      className={`option-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="option-key-badge">
                        {opt.key}
                      </div>

                      <div style={{ flex: 1, fontSize: '0.95rem', color: isSelected ? '#1e1b4b' : '#334155', fontWeight: isSelected ? 700 : 500, lineHeight: 1.5 }}>
                        {opt.text}
                      </div>

                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: isMulti ? '6px' : '50%',
                        border: isSelected ? 'none' : '2px solid #cbd5e1',
                        background: isSelected ? 'var(--primary-gradient)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        flexShrink: 0,
                        transition: 'all 0.2s ease'
                      }}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DẠNG 2: True / False */}
            {currentQ.type === 'TRUE_FALSE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(currentQ.options || []).map(opt => {
                  const currentAns = (userAnswers[currentQ.instanceId] || {})[opt.key];
                  return (
                    <div
                      key={opt.key}
                      className="tf-option-row"
                      style={{
                        padding: '1.15rem 1.35rem',
                        borderRadius: '14px',
                        border: '1.5px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        boxShadow: 'var(--shadow-xs)'
                      }}
                    >
                      <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', minWidth: '200px', lineHeight: 1.5 }}>
                        <span style={{ color: '#4f46e5', fontWeight: 800, marginRight: '0.5rem' }}>{opt.key}.</span>
                        {opt.text}
                      </div>

                      <div className="tf-btn-group" style={{ display: 'flex', gap: '0.625rem', minWidth: '200px' }}>
                        <button
                          onClick={() => handleSelectTrueFalse(currentQ.instanceId, opt.key, true)}
                          className={`tf-btn ${currentAns === true ? 'selected-true' : ''}`}
                        >
                          ✓ Đúng
                        </button>
                        <button
                          onClick={() => handleSelectTrueFalse(currentQ.instanceId, opt.key, false)}
                          className={`tf-btn ${currentAns === false ? 'selected-false' : ''}`}
                        >
                          ✕ Sai
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DẠNG 3: Drag & Drop */}
            {currentQ.type === 'DRAG_DROP' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

                {/* --- Mode INLINE: fill-blank template --- */}
                {(!currentQ.dragMode || currentQ.dragMode === 'inline') && (
                  <>
                    <div style={{
                      padding: '1.5rem',
                      backgroundColor: '#f8fafc',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '16px',
                      lineHeight: 2.2,
                      fontSize: '1.05rem',
                      color: '#0f172a'
                    }}>
                      {(currentQ.renderedTemplate || currentQ.templateText || currentQ.content).split(/\[BLANK_\d+\]/).map((part, pIdx) => {
                        const blankId = `BLANK_${pIdx}`;
                        const isLast = pIdx === Object.keys(currentQ.correctAnswers || {}).length;
                        const filledVal = (userAnswers[currentQ.instanceId] || {})[blankId];
                        return (
                          <React.Fragment key={pIdx}>
                            {part}
                            {!isLast && (
                              <span
                                className={`drop-slot ${filledVal ? 'filled' : ''}`}
                                onClick={() => {
                                  if (filledVal) handleDropKeyword(currentQ.instanceId, blankId, null);
                                }}
                                style={{ cursor: filledVal ? 'pointer' : 'default' }}
                                title={filledVal ? "Nhấp để gỡ đáp án này" : "Nhấp chip bên dưới để điền vào đây"}
                              >
                                {filledVal ? (
                                  <span style={{ fontWeight: 800, color: '#4f46e5', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    {filledVal} <span style={{ color: '#f43f5e', fontSize: '0.75rem' }}>✕</span>
                                  </span>
                                ) : (
                                  <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>[ Ô trống {pIdx + 1} ]</span>
                                )}
                              </span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', marginBottom: '0.75rem' }}>
                        Mảnh ghép từ khóa (Nhấp chip để chèn vào ô trống đầu tiên / Nhấp đáp án ở trên để gỡ):
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {(currentQ.dragItems || []).map((item, iIdx) => {
                          const ans = userAnswers[currentQ.instanceId] || {};
                          const isPlaced = Object.values(ans).includes(item);
                          return (
                            <button
                              key={iIdx}
                              onClick={() => {
                                if (isPlaced) {
                                  const key = Object.keys(ans).find(k => ans[k] === item);
                                  if (key) handleDropKeyword(currentQ.instanceId, key, null);
                                } else {
                                  const firstEmpty = Object.keys(currentQ.correctAnswers || {}).find(bId => !ans[bId]);
                                  if (firstEmpty) handleDropKeyword(currentQ.instanceId, firstEmpty, item);
                                }
                              }}
                              className={`drag-chip ${isPlaced ? 'placed' : ''}`}
                            >
                              {item} {isPlaced ? '✓' : '+'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* --- Mode MATCH: Statement Pair (Table-based Match) --- */}
                {currentQ.dragMode === 'match' && (
                  <>
                    <div style={{
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      backgroundColor: '#ffffff',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      {/* Table Header */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(220px, 1fr)',
                        backgroundColor: '#f8fafc',
                        borderBottom: '1.5px solid #e2e8f0',
                        padding: '0.85rem 1.25rem',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        color: '#475569'
                      }}>
                        <div>Phát Biểu / Nội Dung Cần Ghép</div>
                        <div style={{ textAlign: 'center' }}>Ô Trống Kéo Thả Đáp Án Khớp</div>
                      </div>

                      {/* Table Body Rows */}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {(currentQ.matchPairs || currentQ.extractedBlanks || []).map((pair, pIdx) => {
                          const blankId = pair.blankId || `BLANK_${pIdx}`;
                          const leftText = pair.leftText || pair.leftWithBlank || pair.answer || '';
                          const filledVal = (userAnswers[currentQ.instanceId] || {})[blankId];
                          const isActive = activeSlotId === blankId;

                          return (
                            <div
                              key={pIdx}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(0, 1.4fr) minmax(220px, 1fr)',
                                borderBottom: pIdx < (currentQ.matchPairs?.length || currentQ.extractedBlanks?.length) - 1 ? '1px solid #f1f5f9' : 'none',
                                backgroundColor: isActive ? '#f5f3ff' : '#ffffff',
                                transition: 'background-color 0.2s ease',
                                alignItems: 'center'
                              }}
                            >
                              {/* Left Cell: Statement */}
                              <div style={{
                                padding: '1.1rem 1.25rem',
                                fontSize: '0.95rem',
                                color: '#0f172a',
                                fontWeight: 600,
                                lineHeight: 1.6,
                                borderRight: '1px solid #f1f5f9'
                              }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '50%',
                                  backgroundColor: '#eef2ff',
                                  color: '#4f46e5',
                                  fontWeight: 800,
                                  fontSize: '0.78rem',
                                  marginRight: '0.6rem'
                                }}>
                                  {pIdx + 1}
                                </span>
                                {leftText.replace(/\[BLANK_\d+\]/g, ' _____ ')}
                              </div>

                              {/* Right Cell: Drop Slot */}
                              <div style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'center' }}>
                                <div
                                  onClick={() => {
                                    if (filledVal) {
                                      handleDropKeyword(currentQ.instanceId, blankId, null);
                                      setActiveSlotId(blankId);
                                    } else {
                                      setActiveSlotId(isActive ? null : blankId);
                                    }
                                  }}
                                  style={{
                                    width: '100%',
                                    maxWidth: '280px',
                                    minHeight: '46px',
                                    padding: '8px 14px',
                                    borderRadius: '12px',
                                    border: filledVal
                                      ? '2px solid #4f46e5'
                                      : isActive
                                        ? '2px solid #6366f1'
                                        : '2px dashed #cbd5e1',
                                    backgroundColor: filledVal
                                      ? '#eef2ff'
                                      : isActive
                                        ? '#faf5ff'
                                        : '#f8fafc',
                                    color: filledVal ? '#4f46e5' : isActive ? '#6366f1' : '#94a3b8',
                                    fontWeight: filledVal ? 800 : 700,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                    boxShadow: filledVal
                                      ? '0 2px 8px rgba(79, 70, 229, 0.15)'
                                      : isActive
                                        ? '0 0 0 3px rgba(99, 102, 241, 0.25)'
                                        : 'none'
                                  }}
                                  title={filledVal ? "Nhấp để gỡ đáp án này" : "Nhấp để chọn ô này trước khi bấm từ khóa"}
                                >
                                  {filledVal ? (
                                    <>
                                      <span style={{ flex: 1, textAlign: 'left', wordBreak: 'break-word' }}>{filledVal}</span>
                                      <span style={{
                                        color: '#f43f5e',
                                        backgroundColor: '#ffe4e6',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        flexShrink: 0
                                      }}>✕</span>
                                    </>
                                  ) : (
                                    <span style={{ fontSize: '0.8rem', color: isActive ? '#6366f1' : '#94a3b8', width: '100%', textAlign: 'center' }}>
                                      {isActive ? '⚡ Đang chọn ô này (bấm từ khóa)' : '＋ Bấm để chọn ô này'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Drag / Select Chips Bank */}
                    <div style={{
                      marginTop: '1rem',
                      padding: '1.25rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Mảnh ghép từ khóa (Nhấp từ khóa để tự động đưa vào ô trống):</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                          {activeSlotId ? `🎯 Đang nhắm: Ô ${parseInt(activeSlotId.replace('BLANK_', '')) + 1}` : 'Tự động điền vào ô trống đầu tiên'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {(currentQ.dragItems || []).map((item, iIdx) => {
                          const ans = userAnswers[currentQ.instanceId] || {};
                          const isPlaced = Object.values(ans).includes(item);
                          return (
                            <button
                              key={iIdx}
                              onClick={() => {
                                if (isPlaced) {
                                  // Unplace
                                  const key = Object.keys(ans).find(k => ans[k] === item);
                                  if (key) handleDropKeyword(currentQ.instanceId, key, null);
                                } else {
                                  // Place to active slot or first empty
                                  let targetSlot = activeSlotId && !ans[activeSlotId] ? activeSlotId : null;
                                  if (!targetSlot) {
                                    targetSlot = (currentQ.extractedBlanks || currentQ.matchPairs || []).map((b, idx) => b.blankId || `BLANK_${idx}`).find(bId => !ans[bId]);
                                  }
                                  if (targetSlot) {
                                    handleDropKeyword(currentQ.instanceId, targetSlot, item);
                                    // Move to next empty slot
                                    const nextEmpty = (currentQ.extractedBlanks || currentQ.matchPairs || [])
                                      .map((b, idx) => b.blankId || `BLANK_${idx}`)
                                      .find(bId => bId !== targetSlot && !ans[bId]);
                                    setActiveSlotId(nextEmpty || null);
                                  }
                                }
                              }}
                              className={`drag-chip ${isPlaced ? 'placed' : ''}`}
                            >
                              {item} {isPlaced ? '✓ (Đã chọn)' : '+'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* --- Mode CATEGORIZE: Multi-column classification --- */}
                {currentQ.dragMode === 'categorize' && (
                  <>
                    <div
                      className="categorize-columns-grid"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Math.max(1, (currentQ.columns || []).length)}, 1fr)`,
                        gap: '1.25rem'
                      }}
                    >
                      {(currentQ.columns || []).map((col, colIdx) => {
                        const ans = userAnswers[currentQ.instanceId] || {};
                        const placedItems = Object.entries(ans)
                          .filter(([k, v]) => k.startsWith(`COL_${colIdx}_`) && v)
                          .map(([k, v]) => ({ key: k, value: v }));

                        return (
                          <div
                            key={colIdx}
                            style={{
                              border: '1.5px solid #c7d2fe',
                              borderRadius: '16px',
                              overflow: 'hidden',
                              backgroundColor: '#ffffff',
                              boxShadow: 'var(--shadow-sm)',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                          >
                            <div style={{
                              background: 'var(--primary-gradient)',
                              color: '#fff',
                              padding: '1rem 1.25rem',
                              fontWeight: 800,
                              fontSize: '0.92rem',
                              lineHeight: 1.5,
                              textAlign: 'center',
                              minHeight: '70px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {col.header}
                            </div>

                            <div style={{
                              padding: '1.25rem',
                              minHeight: '180px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.75rem',
                              backgroundColor: '#f8fafc',
                              flex: 1
                            }}>
                              {placedItems.map(it => (
                                <div
                                  key={it.key}
                                  onClick={() => handleDropKeyword(currentQ.instanceId, it.key, null)}
                                  title="Nhấp để gỡ khỏi cột này"
                                  style={{
                                    padding: '10px 14px',
                                    backgroundColor: '#ffffff',
                                    border: '1.5px solid #818cf8',
                                    borderRadius: '12px',
                                    color: '#312e81',
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    lineHeight: 1.5,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.75rem',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.08)'
                                  }}
                                >
                                  <span style={{ flex: 1 }}>{it.value}</span>
                                  <span style={{
                                    color: '#f43f5e',
                                    backgroundColor: '#ffe4e6',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    flexShrink: 0
                                  }}>
                                    ✕ Gỡ
                                  </span>
                                </div>
                              ))}

                              {placedItems.length === 0 && (
                                <div style={{
                                  color: '#94a3b8',
                                  fontSize: '0.85rem',
                                  textAlign: 'center',
                                  padding: '2.5rem 1rem',
                                  border: '2px dashed #cbd5e1',
                                  borderRadius: '12px',
                                  backgroundColor: '#ffffff',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  Chưa có mục nào (Bấm chọn cột từ danh sách bên dưới)
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Drag Items with Quick Column Targets */}
                    <div style={{
                      marginTop: '1.25rem',
                      padding: '1.25rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '16px',
                      border: '1.5px solid #e2e8f0'
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.875rem' }}>
                        Mảnh ghép cần phân loại (Bấm nút [Vào Cột...] để xếp vào nhóm tương ứng):
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(currentQ.dragItems || []).map((item, iIdx) => {
                          const ans = userAnswers[currentQ.instanceId] || {};
                          const placedEntry = Object.entries(ans).find(([k, v]) => v === item);
                          const isPlaced = Boolean(placedEntry);
                          let placedColIdx = -1;
                          if (isPlaced) {
                            const match = placedEntry[0].match(/COL_(\d+)_/);
                            if (match) placedColIdx = parseInt(match[1]);
                          }

                          return (
                            <div
                              key={iIdx}
                              style={{
                                padding: '0.85rem 1.15rem',
                                backgroundColor: isPlaced ? '#f8fafc' : '#ffffff',
                                border: isPlaced ? '1.5px solid #cbd5e1' : '1.5px solid #e2e8f0',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '0.75rem',
                                boxShadow: 'var(--shadow-xs)'
                              }}
                            >
                              <div style={{ flex: 1, minWidth: '240px', fontSize: '0.9rem', fontWeight: 600, color: isPlaced ? '#64748b' : '#0f172a' }}>
                                {item}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {isPlaced ? (
                                  <button
                                    onClick={() => handleDropKeyword(currentQ.instanceId, placedEntry[0], null)}
                                    style={{
                                      padding: '6px 12px',
                                      backgroundColor: '#fee2e2',
                                      color: '#dc2626',
                                      border: '1px solid #fca5a5',
                                      borderRadius: '8px',
                                      fontWeight: 800,
                                      fontSize: '0.8rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    ✕ Đang ở Cột {placedColIdx + 1} (Bấm để gỡ)
                                  </button>
                                ) : (
                                  (currentQ.columns || []).map((col, cIdx) => (
                                    <button
                                      key={cIdx}
                                      onClick={() => {
                                        for (let slotIdx = 0; slotIdx < 20; slotIdx++) {
                                          const slotId = `COL_${cIdx}_ITEM_${slotIdx}`;
                                          if (!ans[slotId]) {
                                            handleDropKeyword(currentQ.instanceId, slotId, item);
                                            break;
                                          }
                                        }
                                      }}
                                      style={{
                                        padding: '7px 13px',
                                        backgroundColor: '#eef2ff',
                                        color: '#4f46e5',
                                        border: '1.5px solid #c7d2fe',
                                        borderRadius: '8px',
                                        fontWeight: 800,
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                      }}
                                    >
                                      → Vào Cột {cIdx + 1}
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

              </div>
            )}

            {/* Bottom Nav Controls */}
            <div className="quiz-action-footer" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '3rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #f1f5f9',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div className="btn-group" style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  className="btn-secondary"
                  style={{ opacity: currentIndex === 0 ? 0.45 : 1, padding: '0.75rem 1.25rem' }}
                >
                  <ArrowLeft size={16} /> Câu Trước
                </button>

                {currentIndex < activeQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="btn-primary"
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    Câu Tiếp <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmitConfirmModal(true)}
                    className="btn-success"
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    Nộp Bài Thi <CheckCircle size={16} />
                  </button>
                )}
              </div>

              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                Đã trả lời <strong style={{ color: '#4f46e5' }}>{answeredCount}</strong> / {activeQuestions.length} câu
              </div>
            </div>
          </div>

          {/* Right Sidebar: Timer & Question Matrix */}
          <div className="quiz-palette-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Timer Card */}
            <div className="lms-card" style={{ padding: '1.5rem', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                THỜI GIAN CÒN LẠI
              </div>
              <div className={`timer-badge ${timeLeft < 180 ? 'danger' : timeLeft < 600 ? 'warning' : ''}`} style={{ justifyContent: 'center', width: '100%' }}>
                <Clock size={22} /> {formatTime(timeLeft)}
              </div>
            </div>

            {/* Matrix Card */}
            <div className="lms-card" style={{ padding: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  Ma Trận Câu Hỏi
                </h4>
                <span className="badge badge-primary">
                  {answeredCount}/{activeQuestions.length} Đã xong
                </span>
              </div>

              {/* Status Legend */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '1rem', fontWeight: 600, padding: '0 2px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#eef2ff', border: '1px solid #c7d2fe' }} /> Đã làm
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} /> Đánh dấu
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--primary-gradient)' }} /> Đang xem
                </span>
              </div>

              <div className="matrix-grid">
                {activeQuestions.map((q, idx) => {
                  const isAns = isQuestionAnswered(q.instanceId);
                  const isFlag = flaggedQuestions[q.instanceId];
                  const isCurrent = idx === currentIndex;

                  return (
                    <button
                      key={q.instanceId}
                      onClick={() => setCurrentIndex(idx)}
                      className={`matrix-btn ${isCurrent ? 'active' : isAns ? 'answered' : ''} ${isFlag ? 'flagged' : ''}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowSubmitConfirmModal(true)}
                className="btn-success"
                style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
              >
                Nộp Bài Hoàn Thành
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE QUESTION MATRIX MODAL / BOTTOM SHEET ─────────────────────── */}
      {showMobileMatrixModal && isTestActive && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }} className="animate-fade-in" onClick={() => setShowMobileMatrixModal(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '1.5rem 1.25rem 2rem 1.25rem',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Ma Trận Câu Hỏi
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  Đã hoàn thành {answeredCount} / {activeQuestions.length} câu • Còn {formatTime(timeLeft)}
                </div>
              </div>

              <button
                onClick={() => setShowMobileMatrixModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ✕
              </button>
            </div>

            {/* Status Legend */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '1.25rem', fontWeight: 600, padding: '0 4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#eef2ff', border: '1px solid #c7d2fe' }} /> Đã làm
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} /> Đánh dấu
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--primary-gradient)' }} /> Đang xem
              </span>
            </div>

            {/* Matrix buttons */}
            <div className="matrix-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {activeQuestions.map((q, idx) => {
                const isAns = isQuestionAnswered(q.instanceId);
                const isFlag = flaggedQuestions[q.instanceId];
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.instanceId}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowMobileMatrixModal(false);
                    }}
                    className={`matrix-btn ${isCurrent ? 'active' : isAns ? 'answered' : ''} ${isFlag ? 'flagged' : ''}`}
                    style={{ height: '46px', fontSize: '0.95rem' }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowMobileMatrixModal(false);
                  setShowSubmitConfirmModal(true);
                }}
                className="btn-success"
                style={{ flex: 1, padding: '0.85rem', justifyContent: 'center' }}
              >
                Nộp Bài Hoàn Thành
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBMIT CONFIRMATION MODAL ─────────────────────────────────────── */}
      {showSubmitConfirmModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }} className="animate-fade-in">
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2.25rem',
            maxWidth: '460px',
            width: '100%',
            boxShadow: 'var(--shadow-xl)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#fffbeb',
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              border: '2px solid #fde68a'
            }}>
              <AlertTriangle size={30} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Xác Nhận Nộp Bài Thi?
            </h3>

            <p style={{ color: '#475569', fontSize: '0.925rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Bạn đã trả lời <strong style={{ color: '#4f46e5' }}>{answeredCount} / {activeQuestions.length}</strong> câu hỏi.
              {answeredCount < activeQuestions.length && (
                <span style={{ display: 'block', color: '#f43f5e', fontWeight: 700, marginTop: '0.35rem' }}>
                  ⚠️ Còn {activeQuestions.length - answeredCount} câu chưa trả lời!
                </span>
              )}
            </p>

            <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowSubmitConfirmModal(false)}
                className="btn-secondary"
                style={{ flex: 1, padding: '0.75rem 1rem' }}
              >
                Tiếp Tục Làm Bài
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirmModal(false);
                  handleFinalSubmit();
                }}
                className="btn-success"
                style={{ flex: 1, padding: '0.75rem 1rem' }}
              >
                Xác Nhận Nộp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Lịch Sử & Điểm Số Các Lần Làm Bài ──────────────────────── */}
      {showHistoryModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 250,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }} className="animate-fade-in">
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '820px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                }}>
                  <History size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                    Lịch Sử Luyện Thi & Điểm Số
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, fontWeight: 500 }}>
                    Theo dõi tiến độ ôn luyện và xem lại chi tiết tất cả các bài thi đã làm
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử các lần làm bài không?')) {
                        const cleared = clearHistoryFromStorage();
                        setHistory(cleared);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #fecdd3',
                      backgroundColor: '#fff1f2',
                      color: '#e11d48',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Xóa Lịch Sử</span>
                  </button>
                )}
                <button
                  onClick={() => setShowHistoryModal(false)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Mini Stats Overview */}
            <div style={{
              padding: '1rem 1.75rem',
              backgroundColor: '#f1f5f9',
              borderBottom: '1px solid #e2e8f0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem'
            }}>
              <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Tổng lượt thi</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{totalAttempts} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>lần</span></div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #c7d2fe' }}>
                <div style={{ fontSize: '0.72rem', color: '#4f46e5', fontWeight: 800, textTransform: 'uppercase' }}>Điểm TB</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#4f46e5' }}>{avgScore} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>/ 10</span></div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 800, textTransform: 'uppercase' }}>Điểm Cao Nhất</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#059669' }}>{maxScore} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>/ 10</span></div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Tỷ Lệ Đúng</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{overallAccuracy}%</div>
              </div>
            </div>

            {/* Modal Body: History List */}
            <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: '#94a3b8' }}>
                  <History size={48} style={{ marginBottom: '1rem', opacity: 0.35, color: '#4f46e5' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.35rem' }}>
                    Chưa có lịch sử làm bài nào
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '420px', margin: '0 auto' }}>
                    Sau khi hoàn thành bất kỳ bài thi trắc nghiệm nào, kết quả và điểm số chi tiết sẽ được tự động lưu lại tại đây để bạn tiện theo dõi!
                  </p>
                </div>
              ) : (
                history.map((item, idx) => {
                  const isExcellent = item.score10 >= 8.5;
                  const isGood = item.score10 >= 7.0 && item.score10 < 8.5;
                  const isAverage = item.score10 >= 5.0 && item.score10 < 7.0;

                  const badgeColor = isExcellent
                    ? { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', label: 'Xuất sắc' }
                    : isGood
                    ? { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', label: 'Khá - Giỏi' }
                    : isAverage
                    ? { bg: '#fffbeb', text: '#d97706', border: '#fde68a', label: 'Đạt' }
                    : { bg: '#fef2f2', text: '#e11d48', border: '#fecdd3', label: 'Cần ôn lại' };

                  const m = Math.floor(item.timeSpentSeconds / 60);
                  const s = item.timeSpentSeconds % 60;
                  const timeText = `${m > 0 ? `${m}p ` : ''}${s}s`;

                  return (
                    <div
                      key={item.id || idx}
                      style={{
                        padding: '1.1rem 1.25rem',
                        borderRadius: '16px',
                        border: '1.5px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)'
                      }}
                    >
                      {/* Left: Attempt Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem'
                        }}>
                          #{history.length - idx}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                              {item.courseTitle}
                            </span>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: '#eef2ff',
                              color: '#4f46e5',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              border: '1px solid #c7d2fe'
                            }}>
                              {item.modeTitle}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Calendar size={13} /> {item.dateStr}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={13} /> {timeText}
                            </span>
                            <span>
                              Đúng: <strong style={{ color: '#059669' }}>{item.correctCount}</strong>/{item.totalQuestions} câu
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Score Badge & Review Action */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div style={{
                          padding: '6px 14px',
                          borderRadius: '12px',
                          backgroundColor: badgeColor.bg,
                          border: `1.5px solid ${badgeColor.border}`,
                          textAlign: 'right'
                        }}>
                          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: badgeColor.text, lineHeight: 1.1 }}>
                            {item.score10} <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>/ 10</span>
                          </div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: badgeColor.text }}>
                            {badgeColor.label} ({item.percentage}%)
                          </div>
                        </div>

                        {item.reviewResult && (
                          <button
                            onClick={() => {
                              setTestResult(item.reviewResult);
                              setIsSubmitted(true);
                              setShowHistoryModal(false);
                            }}
                            className="btn-secondary"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '8px 14px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Eye size={15} />
                            <span>Xem Lại Đề</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.75rem',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="btn-primary"
                style={{ padding: '0.65rem 1.5rem', fontSize: '0.875rem' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
