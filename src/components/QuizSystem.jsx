import React, { useState, useEffect } from 'react';
import { Clock, Flag, CheckCircle, ArrowLeft, ArrowRight, Award, AlertTriangle, Play, RefreshCw, Bookmark, HelpCircle, Layers } from 'lucide-react';
import QuizResult from './QuizResult';

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

    const durationMins = selectedMode === "TEST_15" ? 15 : selectedMode === "TEST_30" ? 30 : 60;
    setTimeLeft(durationMins * 60);
    setIsTestActive(true);
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (!isTestActive || isSubmitted) return;
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestActive, timeLeft, isSubmitted]);

  // Keypress Enter listener to move to next question
  useEffect(() => {
    if (!isTestActive || isSubmitted || showSubmitConfirmModal) return;

    const handleKeyDown = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'Enter') {
        e.preventDefault();
        setCurrentIndex(prev => Math.min(prev + 1, activeQuestions.length - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTestActive, isSubmitted, showSubmitConfirmModal, activeQuestions.length]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectChoice = (qInstId, optId, isMulti) => {
    setUserAnswers(prev => {
      const current = prev[qInstId] || [];
      if (isMulti) {
        if (current.includes(optId)) {
          return { ...prev, [qInstId]: current.filter(id => id !== optId) };
        } else {
          return { ...prev, [qInstId]: [...current, optId] };
        }
      } else {
        return { ...prev, [qInstId]: [optId] };
      }
    });
  };

  const handleSelectTrueFalse = (qInstId, optKey, value) => {
    setUserAnswers(prev => {
      const current = prev[qInstId] || {};
      return {
        ...prev,
        [qInstId]: {
          ...current,
          [optKey]: value
        }
      };
    });
  };

  const handleDropKeyword = (qInstId, blankId, keyword) => {
    setUserAnswers(prev => {
      const current = prev[qInstId] || {};
      return {
        ...prev,
        [qInstId]: {
          ...current,
          [blankId]: keyword
        }
      };
    });
  };

  const toggleFlag = (qInstId) => {
    setFlaggedQuestions(prev => ({ ...prev, [qInstId]: !prev[qInstId] }));
  };

  // Final Submit Math
  const handleFinalSubmit = () => {
    let totalPossibleScore = activeQuestions.length;
    let earnedPoints = 0;

    const detailedReview = activeQuestions.map(q => {
      const ans = userAnswers[q.instanceId];
      let isCorrect = false;

      if (q.type === 'SINGLE_CHOICE' || q.type === 'MULTI_CHOICE') {
        const correctOptIds = (q.options || []).filter(o => o.isCorrect).map(o => o.id);
        const userOpts = ans || [];
        if (correctOptIds.length === userOpts.length && correctOptIds.every(id => userOpts.includes(id))) {
          isCorrect = true;
          earnedPoints += 1;
        }
      } else if (q.type === 'TRUE_FALSE') {
        const userTF = ans || {};
        let allMatched = true;
        (q.options || []).forEach(opt => {
          const expected = opt.isCorrect;
          const userVal = userTF[opt.key];
          if (userVal !== expected) allMatched = false;
        });
        if (allMatched && Object.keys(userTF).length === (q.options || []).length) {
          isCorrect = true;
          earnedPoints += 1;
        }
      } else if (q.type === 'DRAG_DROP') {
        const userBlanks = ans || {};
        const correctMap = q.correctAnswers || {};
        const totalBlanks = Object.keys(correctMap).length;
        if (totalBlanks === 0) {
          isCorrect = true;
          earnedPoints += 1;
        } else {
          let matchedCount = 0;
          Object.keys(correctMap).forEach(blankId => {
            const userVal = (userBlanks[blankId] || '').toString().trim().toLowerCase();
            const correctVal = (correctMap[blankId] || '').toString().trim().toLowerCase();
            if (userVal && userVal === correctVal) matchedCount++;
          });
          if (matchedCount === totalBlanks && Object.keys(userBlanks).length >= totalBlanks) {
            isCorrect = true;
            earnedPoints += 1;
          }
        }
      }

      return {
        ...q,
        userAnswer: ans,
        isUserCorrect: isCorrect
      };
    });

    const scale10Score = totalPossibleScore > 0 ? (earnedPoints / totalPossibleScore) * 10 : 0;
    let totalDuration = activeSessionMeta
      ? (activeSessionMeta.totalCount * 60)
      : (selectedMode === "TEST_15" ? 15 * 60 : selectedMode === "TEST_30" ? 30 * 60 : 60 * 60);

    setTestResult({
      totalQuestions: activeQuestions.length,
      earnedPoints,
      scale10Score: scale10Score.toFixed(1),
      timeSpentSeconds: totalDuration - timeLeft,
      reviewData: detailedReview,
      sessionMeta: activeSessionMeta
    });

    setIsSubmitted(true);
    setIsTestActive(false);
  };

  const currentQ = activeQuestions[currentIndex];
  const isQuestionAnswered = (qInstId) => {
    const ans = userAnswers[qInstId];
    if (!ans) return false;
    if (Array.isArray(ans)) return ans.length > 0;
    if (typeof ans === 'object') return Object.keys(ans).length > 0;
    return true;
  };

  const answeredCount = activeQuestions.filter(q => isQuestionAnswered(q.instanceId)).length;

  if (isSubmitted && testResult) {
    return (
      <QuizResult
        result={testResult}
        course={testResult.sessionMeta?.course || courses.find(c => c.id === selectedCourseId)}
        mode={testResult.sessionMeta ? `Bộ đề: ${testResult.sessionMeta.lessons?.map(l => 'Bài ' + l.lessonNumber).join(', ')}` : selectedMode}
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

  return (
    <div style={{ maxWidth: '1280px', margin: '1.5rem auto', padding: '0 1rem' }}>
      {!isTestActive ? (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="lms-card" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', textAlign: 'center' }}>
              Hệ Thống Ôn Luyện & Chế Độ Sinh Đề Ngẫu Nhiên
            </h2>
            <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '2rem' }}>
              Lựa chọn Học phần và Chế độ thi để hệ thống tự động sinh cấu trúc bài test từ ngân hàng câu hỏi.
            </p>

            {/* Step 1: Select Course */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#0f172a' }}>
                1. Chọn Học Phần ({courses.length} Học Phần Hiện Có)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {courses.map(course => (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelectedCourseId(course.id);
                    }}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: selectedCourseId === course.id ? '2px solid #1e40af' : '1px solid #e2e8f0',
                      backgroundColor: selectedCourseId === course.id ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#1e40af', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      {course.code}
                    </div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                      {course.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {course.questionsCount || questions.filter(q => lessons.filter(l => l.courseId === course.id).map(l => l.id).includes(q.lessonId)).length} câu hỏi • {lessons.filter(l => l.courseId === course.id).length} bài học
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Select 3 Test Modes */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#0f172a' }}>
                2. Chọn Chế Độ Bài Test
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div onClick={() => setSelectedMode("TEST_15")} style={{ padding: '1.25rem', borderRadius: '12px', border: selectedMode === "TEST_15" ? '2px solid #1e40af' : '1px solid #e2e8f0', backgroundColor: selectedMode === "TEST_15" ? '#eff6ff' : '#ffffff', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <Clock size={18} /> Test 15 Phút
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>15 câu hỏi ngẫu nhiên thuộc 1 Bài học chỉ định.</p>
                </div>

                <div onClick={() => setSelectedMode("TEST_30")} style={{ padding: '1.25rem', borderRadius: '12px', border: selectedMode === "TEST_30" ? '2px solid #1e40af' : '1px solid #e2e8f0', backgroundColor: selectedMode === "TEST_30" ? '#eff6ff' : '#ffffff', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <Clock size={18} /> Test 30 Phút (3 Bài Học)
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>30 câu hỏi ngẫu nhiên từ tối đa 3 Bài học bạn chọn.</p>
                </div>

                <div onClick={() => setSelectedMode("TEST_60")} style={{ padding: '1.25rem', borderRadius: '12px', border: selectedMode === "TEST_60" ? '2px solid #1e40af' : '1px solid #e2e8f0', backgroundColor: selectedMode === "TEST_60" ? '#eff6ff' : '#ffffff', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <Clock size={18} /> Test 60 Phút (Cuối Kỳ)
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>50 câu hỏi ngẫu nhiên toàn bộ kho đề Học phần.</p>
                </div>
              </div>
            </div>

            {/* Config for Test 15 mins */}
            {selectedMode === "TEST_15" && (
              <div style={{ marginBottom: '2rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', color: '#0f172a' }}>
                  Chỉ định Bài học cho Bài Test 15 phút:
                </label>
                <select value={selectedLessonId} onChange={(e) => setSelectedLessonId(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.875rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.875rem', fontWeight: 600, outline: 'none' }}>
                  {courseLessons.map(l => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Config for Test 30 mins (Select up to 3 Lessons) */}
            {selectedMode === "TEST_30" && (
              <div style={{ marginBottom: '2rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                    Chỉ định tối đa 3 Bài học cho Bài Test 30 Phút:
                  </label>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: selected30LessonIds.length === 3 ? '#1e40af' : '#64748b' }}>
                    {selected30LessonIds.length} / 3 bài đã chọn
                  </span>
                </div>

                {courseLessons.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', padding: '0.5rem 0' }}>Học phần này chưa có bài học nào.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
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
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid #1e40af' : '1px solid #cbd5e1',
                            backgroundColor: isSelected ? '#eff6ff' : isDisabled ? '#f1f5f9' : '#ffffff',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            opacity: isDisabled ? 0.5 : 1,
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.625rem'
                          }}
                        >
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '5px',
                            border: isSelected ? 'none' : '2px solid #94a3b8',
                            backgroundColor: isSelected ? '#1e40af' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '0.75rem', fontWeight: 800
                          }}>
                            {isSelected && '✓'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              Bài {l.lessonNumber}: {l.title}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{lessonQsCount} câu hỏi</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button onClick={handleStartTest} className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2.5rem', borderRadius: '9999px' }}>
                <Play size={20} /> Bắt Đầu Làm Bài Test Ngay
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Examination Layout */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
          <div className="lms-card" style={{ padding: '2rem' }}>

            {/* Custom session banner */}
            {activeSessionMeta && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Layers size={18} color="#047857" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#047857' }}>Bộ Đề Ôn Tập: </span>
                  <span style={{ fontSize: '0.8rem', color: '#065f46' }}>
                    {activeSessionMeta.lessons?.map(l => `Bài ${l.lessonNumber}: ${l.title}`).join(' • ')}
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, backgroundColor: '#047857', color: '#fff', padding: '2px 10px', borderRadius: '12px' }}>
                  {activeSessionMeta.totalCount} câu
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                  Câu hỏi {currentIndex + 1} / {activeQuestions.length}
                </span>
                <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                  {currentQ.type === 'SINGLE_CHOICE' ? 'Dạng 1: Chọn 1 đáp án' :
                    currentQ.type === 'MULTI_CHOICE' ? 'Dạng 1: Chọn nhiều đáp án' :
                      currentQ.type === 'TRUE_FALSE' ? 'Dạng 2: Chọn Đúng / Sai' : 'Dạng 3: Điền khuyết / Kéo thả'}
                </span>
              </div>

              <button onClick={() => toggleFlag(currentQ.instanceId)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: flaggedQuestions[currentQ.instanceId] ? '#fffbeb' : '#ffffff', color: flaggedQuestions[currentQ.instanceId] ? '#b45309' : '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                <Bookmark size={16} fill={flaggedQuestions[currentQ.instanceId] ? '#b45309' : 'none'} />
                {flaggedQuestions[currentQ.instanceId] ? 'Đã đánh dấu' : 'Đánh dấu câu này'}
              </button>
            </div>

            {/* Question Title */}
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', lineHeight: 1.6, wordBreak: 'break-word' }}>
              {currentQ.content}
            </div>

            {/* DẠNG 1: Single/Multi Choice */}
            {(currentQ.type === 'SINGLE_CHOICE' || currentQ.type === 'MULTI_CHOICE') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(currentQ.options || []).map(opt => {
                  const currentAns = userAnswers[currentQ.instanceId] || [];
                  const isSelected = currentAns.includes(opt.id);
                  const isMulti = currentQ.type === 'MULTI_CHOICE';

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectChoice(currentQ.instanceId, opt.id, isMulti)}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #1e40af' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.875rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: isMulti ? '6px' : '50%',
                        border: isSelected ? 'none' : '2px solid #cbd5e1',
                        backgroundColor: isSelected ? '#1e40af' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        fontWeight: 700
                      }}>
                        {isSelected && '✓'}
                      </div>
                      <div style={{ flex: 1, fontSize: '0.95rem', color: '#0f172a', fontWeight: 500 }}>
                        <span style={{ fontWeight: 700, color: '#1e40af', marginRight: '0.5rem' }}>{opt.key}.</span>
                        {opt.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DẠNG 2: True/False */}
            {currentQ.type === 'TRUE_FALSE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(currentQ.options || []).map(opt => {
                  const currentAns = (userAnswers[currentQ.instanceId] || {})[opt.key];
                  return (
                    <div key={opt.key} style={{ padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                        <span style={{ color: '#1e40af', marginRight: '0.5rem' }}>{opt.key}.</span>{opt.text}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', width: '200px' }}>
                        <button onClick={() => handleSelectTrueFalse(currentQ.instanceId, opt.key, true)} className={`tf-btn ${currentAns === true ? 'selected-true' : ''}`}>Đúng</button>
                        <button onClick={() => handleSelectTrueFalse(currentQ.instanceId, opt.key, false)} className={`tf-btn ${currentAns === false ? 'selected-false' : ''}`}>Sai</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DẠNG 3: Drag & Drop — 3 chế độ: inline / match / categorize */}
            {currentQ.type === 'DRAG_DROP' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* --- Chế độ INLINE: fill-blank template --- */}
                {(!currentQ.dragMode || currentQ.dragMode === 'inline') && (
                  <>
                    <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', lineHeight: 2, fontSize: '1rem' }}>
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
                                title={filledVal ? "Nhấp để gỡ/sửa đáp án này" : ""}
                              >
                                {filledVal ? (
                                  <span style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.875rem' }}>
                                    {filledVal} <span style={{ color: '#ef4444', fontSize: '0.75rem', marginLeft: '4px' }}>✕</span>
                                  </span>
                                ) : (
                                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Kéo thả vào đây</span>
                                )}
                              </span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Mảnh ghép từ khóa (Nhấp để chèn / Nhấp đáp án ở trên để gỡ):</div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {(currentQ.dragItems || []).map((item, iIdx) => {
                        const ans = userAnswers[currentQ.instanceId] || {};
                        const isPlaced = Object.values(ans).includes(item);
                        return (
                          <button key={iIdx} onClick={() => {
                            if (isPlaced) {
                              // Find and remove
                              const key = Object.keys(ans).find(k => ans[k] === item);
                              if (key) handleDropKeyword(currentQ.instanceId, key, null);
                            } else {
                              const firstEmpty = Object.keys(currentQ.correctAnswers || {}).find(bId => !ans[bId]);
                              if (firstEmpty) handleDropKeyword(currentQ.instanceId, firstEmpty, item);
                            }
                          }} className="drag-chip" style={{ opacity: isPlaced ? 0.4 : 1, border: isPlaced ? '1px dashed #94a3b8' : '1px solid #1e40af' }}>
                            {item} {isPlaced ? '✓' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* --- Chế độ MATCH: mỗi phát biểu 1 dòng riêng (không dùng |) --- */}
                {currentQ.dragMode === 'match' && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(currentQ.matchPairs || currentQ.extractedBlanks || []).map((pair, pIdx) => {
                        const blankId = pair.blankId || `BLANK_${pIdx}`;
                        const leftText = pair.leftText || pair.leftWithBlank || pair.answer;
                        const filledVal = (userAnswers[currentQ.instanceId] || {})[blankId];

                        return (
                          <div key={pIdx} style={{ padding: '0.875rem 1.125rem', border: '1.5px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ flex: 1, fontSize: '0.925rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.5, minWidth: '240px' }}>
                              <span style={{ color: '#1e40af', fontWeight: 800, marginRight: '0.5rem' }}>{pIdx + 1}.</span>
                              {leftText.replace(/\[BLANK_\d+\]/g, '_____')}
                            </div>

                            <div
                              onClick={() => {
                                if (filledVal) handleDropKeyword(currentQ.instanceId, blankId, null);
                              }}
                              style={{
                                padding: '8px 14px', borderRadius: '8px',
                                border: filledVal ? '2px solid #1e40af' : '2px dashed #cbd5e1',
                                backgroundColor: filledVal ? '#eff6ff' : '#f8fafc',
                                color: filledVal ? '#1e40af' : '#94a3b8',
                                fontWeight: filledVal ? 700 : 500, fontSize: '0.85rem',
                                cursor: filledVal ? 'pointer' : 'default',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                transition: 'all 0.15s ease'
                              }}
                              title={filledVal ? "Nhấp để gỡ đáp án này" : ""}
                            >
                              {filledVal ? (
                                <>
                                  <span>{filledVal}</span>
                                  <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.8rem' }}>✕ (Gỡ)</span>
                                </>
                              ) : (
                                <span>Thả/Nhấp chip đáp án →</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>
                        Mảnh ghép đáp án (Nhấp vào mảnh ghép để điền vào ô trống đầu tiên / Nhấp đáp án đã điền để gỡ):
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
                                  const firstEmpty = (currentQ.extractedBlanks || []).map(b => b.blankId).find(bId => !ans[bId]);
                                  if (firstEmpty) handleDropKeyword(currentQ.instanceId, firstEmpty, item);
                                }
                              }}
                              className="drag-chip"
                              style={{ opacity: isPlaced ? 0.4 : 1, border: isPlaced ? '1px dashed #94a3b8' : '1px solid #1e40af' }}
                            >
                              {item} {isPlaced ? '✓ (Đã chọn)' : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* --- Chế độ CATEGORIZE: kéo thả phân loại vào từng cột --- */}
                {currentQ.dragMode === 'categorize' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${(currentQ.columns || []).length}, 1fr)`, gap: '1rem' }}>
                      {(currentQ.columns || []).map((col, colIdx) => {
                        const ans = userAnswers[currentQ.instanceId] || {};
                        const placedItems = Object.entries(ans)
                          .filter(([k, v]) => k.startsWith(`COL_${colIdx}_`) && v)
                          .map(([k, v]) => ({ key: k, value: v }));

                        return (
                          <div key={colIdx} style={{ border: '1.5px solid #bfdbfe', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                            <div style={{ backgroundColor: '#1e40af', color: '#fff', padding: '0.875rem 1rem', fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.4, textAlign: 'center' }}>
                              {col.header}
                            </div>
                            <div style={{ padding: '0.875rem', minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#f8fafc' }}>
                              {placedItems.map(it => (
                                <div
                                  key={it.key}
                                  onClick={() => handleDropKeyword(currentQ.instanceId, it.key, null)}
                                  title="Nhấp để gỡ khỏi cột này"
                                  style={{
                                    padding: '8px 12px', backgroundColor: '#eff6ff', border: '1.5px solid #bfdbfe',
                                    borderRadius: '8px', color: '#1e40af', fontWeight: 700, fontSize: '0.85rem',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    gap: '0.5rem', transition: 'all 0.15s ease'
                                  }}
                                >
                                  <span>{it.value}</span>
                                  <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.8rem' }}>✕ Gỡ</span>
                                </div>
                              ))}
                              {placedItems.length === 0 && (
                                <div style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center', padding: '1.5rem 0.5rem', border: '1.5px dashed #cbd5e1', borderRadius: '8px' }}>
                                  Kéo/Nhấp mảnh ghép bên dưới để thả vào cột này
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.625rem' }}>
                        Mảnh ghép cần phân loại (Nhấp mảnh ghép để gán vào cột hoặc nhấp chữ ✕ Gỡ để bỏ chọn):
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {(currentQ.dragItems || []).map((item, iIdx) => {
                          const ans = userAnswers[currentQ.instanceId] || {};
                          const placedEntry = Object.entries(ans).find(([k, v]) => v === item);
                          const isPlaced = Boolean(placedEntry);

                          return (
                            <div key={iIdx} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <button
                                onClick={() => {
                                  if (isPlaced) {
                                    // Remove if already placed
                                    handleDropKeyword(currentQ.instanceId, placedEntry[0], null);
                                  } else {
                                    // Assign to first matching/available column
                                    const targetCol = (currentQ.columns || []).findIndex((col, cIdx) => {
                                      const placed = Object.entries(ans).filter(([k]) => k.startsWith(`COL_${cIdx}_`)).map(([, v]) => v);
                                      return col.items.includes(item) && !placed.includes(item);
                                    });
                                    const colIndexToUse = targetCol !== -1 ? targetCol : 0;
                                    const col = currentQ.columns[colIndexToUse];
                                    for (let slotIdx = 0; slotIdx < (col?.items?.length || 10); slotIdx++) {
                                      const slotId = `COL_${colIndexToUse}_ITEM_${slotIdx}`;
                                      if (!ans[slotId]) {
                                        handleDropKeyword(currentQ.instanceId, slotId, item);
                                        break;
                                      }
                                    }
                                  }
                                }}
                                className="drag-chip"
                                style={{
                                  opacity: isPlaced ? 0.5 : 1,
                                  backgroundColor: isPlaced ? '#f1f5f9' : '#ffffff',
                                  border: isPlaced ? '1.5px dashed #94a3b8' : '1.5px solid #1e40af'
                                }}
                              >
                                {item} {isPlaced ? '✓' : ''}
                              </button>

                              {/* Column selection buttons if user wants to explicitly choose column */}
                              {!isPlaced && (currentQ.columns || []).length > 1 && (
                                <div style={{ display: 'flex', gap: '3px' }}>
                                  {currentQ.columns.map((col, cIdx) => (
                                    <button
                                      key={cIdx}
                                      onClick={() => {
                                        for (let slotIdx = 0; slotIdx < (col?.items?.length || 10); slotIdx++) {
                                          const slotId = `COL_${cIdx}_ITEM_${slotIdx}`;
                                          if (!ans[slotId]) {
                                            handleDropKeyword(currentQ.instanceId, slotId, item);
                                            break;
                                          }
                                        }
                                      }}
                                      style={{
                                        fontSize: '0.68rem', fontWeight: 700, padding: '1px 5px',
                                        borderRadius: '4px', border: '1px solid #bfdbfe',
                                        backgroundColor: '#eff6ff', color: '#1e40af', cursor: 'pointer'
                                      }}
                                      title={`Gán vào: ${col.header}`}
                                    >
                                      + Cột {cIdx + 1}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

              </div>
            )}

            {/* Nav Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(prev => prev - 1)} className="btn-secondary" style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}>
                <ArrowLeft size={16} /> Câu Trước
              </button>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Đã trả lời {answeredCount} / {activeQuestions.length} câu • Phím Enter: Câu tiếp theo</div>
              {currentIndex < activeQuestions.length - 1 ? (
                <button onClick={() => setCurrentIndex(prev => prev + 1)} className="btn-primary">
                  Câu Tiếp <ArrowRight size={16} />
                </button>
              ) : (
                <button onClick={() => setShowSubmitConfirmModal(true)} className="btn-primary" style={{ backgroundColor: '#10b981' }}>
                  Nộp Bài Thi <CheckCircle size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="lms-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>THỜI GIAN CÒN LẠI</div>
              <div className={`timer-badge ${timeLeft < 180 ? 'danger' : timeLeft < 600 ? 'warning' : ''}`} style={{ justifyContent: 'center' }}>
                <Clock size={22} /> {formatTime(timeLeft)}
              </div>
            </div>

            <div className="lms-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Lưới Danh Sách Câu Hỏi</h4>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e40af' }}>{answeredCount}/{activeQuestions.length} Đã chọn</span>
              </div>

              <div className="matrix-grid">
                {activeQuestions.map((q, idx) => {
                  const isAns = isQuestionAnswered(q.instanceId);
                  const isFlag = flaggedQuestions[q.instanceId];
                  const isCurrent = idx === currentIndex;

                  return (
                    <button key={q.instanceId} onClick={() => setCurrentIndex(idx)} className={`matrix-btn ${isCurrent ? 'active' : isAns ? 'answered' : ''} ${isFlag ? 'flagged' : ''}`}>
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <button onClick={() => setShowSubmitConfirmModal(true)} className="btn-primary" style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center', backgroundColor: '#10b981' }}>
                Nộp Bài Hoàn Thành
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBMIT CONFIRMATION MODAL ─────────────────────────────────────── */}
      {showSubmitConfirmModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '2rem', maxWidth: '440px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Xác Nhận Nộp Bài Thi?
            </h3>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Bạn đã trả lời <strong>{answeredCount} / {activeQuestions.length}</strong> câu hỏi. Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowSubmitConfirmModal(false)}
                className="btn-secondary"
                style={{ flex: 1, padding: '0.65rem 1rem', fontSize: '0.9rem' }}
              >
                Tiếp Tục Làm Bài
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirmModal(false);
                  handleFinalSubmit();
                }}
                className="btn-primary"
                style={{ flex: 1, backgroundColor: '#10b981', padding: '0.65rem 1rem', fontSize: '0.9rem', fontWeight: 800 }}
              >
                Xác Nhận Nộp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
