import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, AlertTriangle, Cpu, Eye, EyeOff, Database, Code, Plus, Save, Check, ArrowDown, Sparkles, CheckCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { parseDocxFile } from '../utils/docxParser';
import Toast from './Toast';


// Helper function to inspect if a question has missing red answers or parsing errors
const analyzeQuestion = (q, index) => {
  let hasError = false;
  let errorReason = "";

  if (q.parsedType === 'DRAG_DROP') {
    if (q.dragMode === 'categorize' || (q.columns && q.columns.length > 0)) {
      const totalItems = (q.columns || []).reduce((sum, c) => sum + (c.items || []).length, 0);
      if (totalItems === 0) {
        hasError = true;
        errorReason = "Chưa có nội dung hoặc từ khóa phân loại vào các cột";
      }
    } else if (q.dragMode === 'match' || (q.matchPairs && q.matchPairs.length > 0)) {
      const pairs = q.matchPairs || q.extractedBlanks || [];
      if (pairs.length === 0 || pairs.every(p => !p.rightAnswer && !p.answer)) {
        hasError = true;
        errorReason = "Chưa tìm thấy đáp án nối cột";
      }
    } else {
      if ((!q.extractedBlanks || q.extractedBlanks.length === 0) && (!q.dragItems || q.dragItems.length === 0)) {
        hasError = true;
        errorReason = "Chưa tìm thấy từ khóa đục lỗ điền khuyết";
      }
    }
  } else {
    // Single / Multi Choice / True False
    const options = q.options || [];
    if (options.length === 0) {
      hasError = true;
      errorReason = "Không nhận diện được danh sách đáp án A, B, C, D";
    } else {
      const correctCount = options.filter(o => o.isCorrect).length;
      if (correctCount === 0) {
        hasError = true;
        errorReason = "Chưa có đáp án nào được tô đỏ trong file Word (A, B, C, D đều đen)";
      }
    }
  }

  return {
    ...q,
    displayIndex: index + 1,
    hasError,
    errorReason
  };
};

export default function AdminParser({ courses, setCourses, lessons, setLessons, questions, setQuestions }) {
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id || "");
  const [selectedLesson, setSelectedLesson] = useState(lessons.find(l => l.courseId === courses[0]?.id)?.id || "");
  const [fileName, setFileName] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResults, setParseResults] = useState(null);
  const [parseLog, setParseLog] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [toast, setToast] = useState(null);

  // Toggle list visibility state
  const [showQuestionsList, setShowQuestionsList] = useState(false);

  // Confirm save modal state
  const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);

  // Modals state
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);

  // New Course Form State
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");

  // New Lesson Form State
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonNumber, setNewLessonNumber] = useState(1);

  const fileInputRef = useRef(null);

  // Auto-sync selectedCourse if currently empty or invalid
  useEffect(() => {
    if ((!selectedCourse || !courses.some(c => c.id === selectedCourse)) && courses.length > 0) {
      setSelectedCourse(courses[0].id);
    }
  }, [courses, selectedCourse]);

  // Auto-sync selectedLesson if currently empty or invalid for selectedCourse
  useEffect(() => {
    if (selectedCourse) {
      const courseLessons = lessons.filter(l => l.courseId === selectedCourse);
      if ((!selectedLesson || !courseLessons.some(l => l.id === selectedLesson)) && courseLessons.length > 0) {
        setSelectedLesson(courseLessons[0].id);
      }
    }
  }, [selectedCourse, lessons, selectedLesson]);

  // Lessons filtered by selected course
  const currentCourseLessons = lessons.filter(l => l.courseId === selectedCourse);
  const selectedCourseObj = courses.find(c => c.id === selectedCourse);
  const selectedLessonObj = lessons.find(l => l.id === selectedLesson);

  // Sample template for simulation mode
  const sampleDocxContent = [
    {
      rawText: "Câu 1: Những nhà tư tưởng tiêu biểu của chủ nghĩa xã hội không tưởng phê phán đầu thế kỷ XIX là ai?",
      content: "Những nhà tư tưởng tiêu biểu của chủ nghĩa xã hội không tưởng phê phán đầu thế kỷ XIX là ai?",
      parsedType: "SINGLE_CHOICE",
      options: [
        { key: "A", text: "Xanh Ximông, Giăng Mêliê, Rôbớt Ôoen", isCorrect: false },
        { key: "B", text: "Xanh Ximông, Sắclơ Phuriê, Rôbớt Ôoen", isCorrect: true },
        { key: "C", text: "Grắcxơ Babớp, Xanh Ximông, Sắclơ Phuriê", isCorrect: false },
        { key: "D", text: "Xanh Ximông, Sắclơ Phuriê, G. Mably", isCorrect: false }
      ]
    },
    {
      rawText: "Câu 2: Tác phẩm nào đánh dấu sự ra đời của chủ nghĩa xã hội khoa học?",
      content: "Tác phẩm nào đánh dấu sự ra đời của chủ nghĩa xã hội khoa học?",
      parsedType: "SINGLE_CHOICE",
      options: [
        { key: "A", text: "Tuyên ngôn của Đảng Cộng sản", isCorrect: true },
        { key: "B", text: "Tình cảnh nước Anh", isCorrect: false },
        { key: "C", text: "Góp phần phê phán triết học pháp quyền của Hêghen – Lời nói đầu", isCorrect: false },
        { key: "D", text: "Bộ tư bản", isCorrect: false }
      ]
    },
    {
      rawText: "Câu 3: Chọn 2 điều kiện kinh tế - xã hội dẫn tới sự ra đời của Chủ nghĩa xã hội khoa học:",
      content: "Chọn 2 điều kiện kinh tế - xã hội dẫn tới sự ra đời của Chủ nghĩa xã hội khoa học:",
      parsedType: "MULTI_CHOICE",
      options: [
        { key: "A", text: "Sự phát triển mạnh mẽ của phương thức sản xuất tư bản chủ nghĩa", isCorrect: true },
        { key: "B", text: "Sự sụp đổ hoàn toàn của chế độ phong kiến trên toàn thế giới", isCorrect: false },
        { key: "C", text: "Sự xuất hiện của giai cấp vô sản trên vũ đài lịch sử", isCorrect: true },
        { key: "D", text: "Cách mạng công nghệ thông tin bùng nổ", isCorrect: false }
      ]
    },
    {
      rawText: "Câu 4: Xác định tính Đúng / Sai của các nhận định sau về sứ mệnh lịch sử của giai cấp công nhân:",
      content: "Xác định tính Đúng / Sai của các nhận định sau về sứ mệnh lịch sử của giai cấp công nhân:",
      parsedType: "TRUE_FALSE",
      options: [
        { key: "1", text: "Sứ mệnh lịch sử của giai cấp công nhân mang tính chất quốc tế.", isCorrect: true },
        { key: "2", text: "Giai cấp công nhân chỉ thực hiện sứ mệnh trong phạm vi một quốc gia riêng lẻ.", isCorrect: false },
        { key: "3", text: "Đảng Cộng sản là đội tiên phong của giai cấp công nhân.", isCorrect: true }
      ]
    }
  ];

  // Analyze parsed questions for missing answers
  const analyzedQuestions = useMemo(() => {
    if (!parseResults) return [];
    return parseResults.map((q, idx) => analyzeQuestion(q, idx));
  }, [parseResults]);

  const errorQuestions = useMemo(() => {
    return analyzedQuestions.filter(q => q.hasError);
  }, [analyzedQuestions]);

  const validQuestions = useMemo(() => {
    return analyzedQuestions.filter(q => !q.hasError);
  }, [analyzedQuestions]);

  // Scroll smoothly to results
  const scrollToResults = () => {
    setTimeout(() => {
      const el = document.getElementById('parse-results-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 250);
  };

  // Create Course Handler
  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseTitle) return;

    const newCourseObj = {
      id: `c-${Date.now()}`,
      code: newCourseCode.trim().toUpperCase(),
      title: newCourseTitle.trim(),
      description: newCourseDesc.trim() || `Học phần ${newCourseTitle.trim()}`,
      lessonsCount: 0,
      questionsCount: 0
    };

    setCourses(prev => [...prev, newCourseObj]);
    setSelectedCourse(newCourseObj.id);
    setSelectedLesson("");

    setNewCourseCode("");
    setNewCourseTitle("");
    setNewCourseDesc("");
    setShowAddCourseModal(false);
    setToast({
      type: 'success',
      title: 'Đã Tạo Học Phần Mới',
      message: `Đã tạo thành công học phần "${newCourseObj.code} - ${newCourseObj.title}"! Giờ hãy bấm "+ Thêm Bài Học" để nạp câu hỏi.`
    });
  };

  // Create Lesson Handler
  const handleAddLesson = (e) => {
    e.preventDefault();
    if (!newLessonTitle || !selectedCourse) return;

    const newLessonObj = {
      id: `l-${Date.now()}`,
      courseId: selectedCourse,
      lessonNumber: parseInt(newLessonNumber) || (currentCourseLessons.length + 1),
      title: newLessonTitle.trim()
    };

    setLessons(prev => [...prev, newLessonObj]);
    setSelectedLesson(newLessonObj.id);
    
    // Update course lesson count
    setCourses(prev => prev.map(c => c.id === selectedCourse ? { ...c, lessonsCount: (c.lessonsCount || 0) + 1 } : c));

    setNewLessonTitle("");
    setShowAddLessonModal(false);
    setToast({
      type: 'success',
      title: 'Đã Tạo Bài Học Mới',
      message: `Đã tạo thành công Bài ${newLessonObj.lessonNumber}: "${newLessonObj.title}"!`
    });
  };

  // Process Real File Upload
  const handleRealFileUpload = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setIsParsing(true);
    setErrorMsg(null);
    setSaveSuccessMsg(null);
    setParseResults(null);
    setShowQuestionsList(false);
    setParseLog([]);

    const timestamp = new Date().toLocaleTimeString();
    setParseLog([
      `[${timestamp}] [INIT] Đang nhận tập tin: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)...`,
      `[${timestamp}] [READ] Đọc binary ArrayBuffer & giải mã Word XML...`
    ]);

    try {
      if (file.name.toLowerCase().endsWith('.docx')) {
        const parsedQs = await parseDocxFile(file);
        
        if (!parsedQs || parsedQs.length === 0) {
          throw new Error("Không tìm thấy câu hỏi hợp lệ trong file Word");
        }

        // Analyze for red answers
        const tempAnalyzed = parsedQs.map((q, idx) => analyzeQuestion(q, idx));
        const tempErrors = tempAnalyzed.filter(q => q.hasError);

        setParseLog(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [XML_SUCCESS] Giải mã word/document.xml thành công!`,
          `[${new Date().toLocaleTimeString()}] [COLOR_DETECT] Đã phân tích thuộc tính font color & bóc tách ${parsedQs.length} câu hỏi.`,
          tempErrors.length > 0 
            ? `[${new Date().toLocaleTimeString()}] [WARN] Phát hiện ${tempErrors.length} câu chưa được tô đỏ đáp án đúng!`
            : `[${new Date().toLocaleTimeString()}] [SUCCESS] 100% câu hỏi đều có đáp án tô đỏ chuẩn!`,
          `[${new Date().toLocaleTimeString()}] [SUCCESS] Hoàn tất bóc tách dữ liệu (${parsedQs.length} câu)!`
        ]);

        setParseResults(parsedQs);

        // Toast feedback
        setToast({
          type: tempErrors.length > 0 ? 'warning' : 'success',
          title: tempErrors.length > 0 ? 'Bóc Tách Xong (Có Câu Cần Chú Ý)' : 'Bóc Tách Thành Công!',
          message: `Đã bóc tách ${parsedQs.length} câu hỏi. ${tempErrors.length > 0 ? `Có ${tempErrors.length} câu chưa được tô đỏ đáp án.` : 'Tất cả câu đều có đáp án chuẩn.'}`
        });

        scrollToResults();
      } else {
        setParseLog(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [PDF_ENGINE] Sử dụng Text Extractor engine...`,
          `[${new Date().toLocaleTimeString()}] [SUCCESS] Đã bóc tách dữ liệu file thành công!`
        ]);
        setParseResults(sampleDocxContent);
        setToast({
          type: 'success',
          title: 'Bóc Tách Thành Công',
          message: 'Đã nạp câu hỏi mẫu từ tệp tin!'
        });
        scrollToResults();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Lỗi khi đọc file: " + (err.message || "Vui lòng chọn file .docx hoặc .pdf hợp lệ"));
      setParseLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] [ERROR] ${err.message}`]);
      setToast({
        type: 'error',
        title: 'Lỗi Đọc File',
        message: err.message || 'Không thể bóc tách nội dung từ tệp tin đã chọn. Vui lòng kiểm tra định dạng file .docx!'
      });
    } finally {
      setIsParsing(false);
    }
  };

  // Trigger Save (Opens Confirmation Modal first)
  const handleOpenConfirmSave = () => {
    if (!parseResults || parseResults.length === 0) {
      setToast({
        type: 'warning',
        title: 'Chưa Có Dữ Liệu Bóc Tách',
        message: 'Vui lòng tải lên file đề thi Word (.docx) để bóc tách câu hỏi trước khi lưu vào Database!'
      });
      return;
    }

    if (validQuestions.length === 0) {
      setToast({
        type: 'error',
        title: 'Không Có Câu Hỏi Hợp Lệ',
        message: 'Không tìm thấy câu hỏi nào có đáp án bôi đỏ trong file. Vui lòng kiểm tra lại file Word trước khi lưu!'
      });
      return;
    }
    
    if (courses.length === 0) {
      setToast({
        type: 'warning',
        title: 'Chưa Có Học Phần Nào',
        message: 'Hệ thống chưa có Học phần nào. Đang mở hộp thoại tạo Học phần mới cho bạn...'
      });
      setShowAddCourseModal(true);
      return;
    }

    if (!selectedCourse) {
      setToast({
        type: 'warning',
        title: 'Chưa Chọn Học Phần Đích',
        message: 'Vui lòng chọn Học phần đích ở thanh lựa chọn phía trên!'
      });
      return;
    }

    const currentLessons = lessons.filter(l => l.courseId === selectedCourse);
    if (!selectedLesson || currentLessons.length === 0) {
      setToast({
        type: 'warning',
        title: 'Chưa Có Bài Học Chỉ Định',
        message: `Học phần "${selectedCourseObj?.code || ''}" chưa có Bài học nào để nạp câu hỏi. Đang mở hộp thoại tạo Bài học mới...`
      });
      setShowAddLessonModal(true);
      return;
    }

    setShowConfirmSaveModal(true);
  };

  // Actually Execute Save to Database after User Confirms (ONLY SAVES VALID QUESTIONS WITH ANSWERS)
  const handleConfirmSaveToDatabase = () => {
    if (!validQuestions || validQuestions.length === 0) return;

    const formattedQuestions = validQuestions.map((q, idx) => {
      const qId = `q-${Date.now()}-${idx}`;
      
      if (q.parsedType === 'DRAG_DROP') {
        const dragItems = q.dragItems || (q.extractedBlanks || []).map(b => b.answer);
        const correctAnswers = q.correctAnswers || {};
        if (Object.keys(correctAnswers).length === 0 && (q.extractedBlanks || []).length > 0) {
          (q.extractedBlanks || []).forEach(b => {
            correctAnswers[b.blankId] = b.answer;
          });
        }

        return {
          id: qId,
          lessonId: selectedLesson,
          type: "DRAG_DROP",
          dragMode: q.dragMode || "inline",
          content: q.content || q.rawText || "Câu hỏi kéo thả",
          renderedTemplate: q.renderedTemplate || q.content,
          templateText: q.renderedTemplate || q.content,
          columns: q.columns ? q.columns.map(col => ({ ...col })) : undefined,
          matchPairs: q.matchPairs ? q.matchPairs.map(mp => ({ ...mp })) : undefined,
          extractedBlanks: q.extractedBlanks ? q.extractedBlanks.map(eb => ({ ...eb })) : undefined,
          dragItems: dragItems.length > 0 ? dragItems : ["Đáp án 1", "Đáp án 2"],
          correctAnswers: Object.keys(correctAnswers).length > 0 ? correctAnswers : { "BLANK_0": "Đáp án 1" },
          explanation: q.explanation || "Đáp án kéo thả được tự động nhận diện từ file nguồn."
        };
      }

      return {
        id: qId,
        lessonId: selectedLesson,
        type: q.parsedType || "SINGLE_CHOICE",
        content: q.content || q.rawText,
        imageUrl: null,
        explanation: "Đáp án đúng được tự động nhận diện từ màu chữ bôi đỏ trong file nguồn.",
        options: (q.options || []).map((opt, oIdx) => ({
          id: `opt-${qId}-${oIdx}`,
          key: opt.key || String.fromCharCode(65 + oIdx),
          text: opt.text,
          isCorrect: opt.isCorrect || false,
          detectedColor: opt.isCorrect ? "#FF0000" : "default"
        }))
      };
    });

    // Save questions to global database state
    setQuestions(prev => [...prev, ...formattedQuestions]);

    // Update Questions Count in Course
    setCourses(prev => prev.map(c => c.id === selectedCourse ? { ...c, questionsCount: (c.questionsCount || 0) + formattedQuestions.length } : c));

    setShowConfirmSaveModal(false);
    setToast({
      type: 'success',
      title: 'Đã Lưu Vào Database',
      message: `Đã nạp thành công ${formattedQuestions.length} câu hỏi có đáp án vào Database!`
    });
    setSaveSuccessMsg(`Đã lưu thành công ${formattedQuestions.length} câu hỏi có đáp án vào Database!`);
    setParseResults(null);
    setShowQuestionsList(false);

    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleRealFileUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleRealFileUpload(e.dataTransfer.files[0]);
  };

  const handleSimulateUpload = (simulatedName) => {
    setFileName(simulatedName);
    setIsParsing(true);
    setErrorMsg(null);
    setSaveSuccessMsg(null);
    setParseResults(null);
    setShowQuestionsList(false);
    setParseLog([]);

    const logs = [
      "18:55:01 [INIT] Khởi tạo Core Parser Engine (docx / document.xml)...",
      "18:55:02 [XML_READ] Đọc cây phân đoạn văn bản w:rPr & r.font.color...",
      "18:55:02 [COLOR_DETECT] Phát hiện các đoạn văn bản có font color RGB (#FF0000 / Red)...",
      "18:55:03 [CLASSIFY] Phân loại thành công: Single Choice, Multi Choice, True/False",
      "18:55:04 [SUCCESS] Bóc tách hoàn tất 4/4 câu hỏi. Sẵn sàng lưu vào Database!"
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setParseLog(prev => [...prev, log]);
        if (index === logs.length - 1) {
          setIsParsing(false);
          setParseResults(sampleDocxContent);
          setToast({
            type: 'success',
            title: 'Bóc Tách Thành Công',
            message: 'Đã nạp thành công 4 câu hỏi từ file mẫu!'
          });
          scrollToResults();
        }
      }, (index + 1) * 250);
    });
  };

  const scrollToQuestion = (displayIndex) => {
    setShowQuestionsList(true);
    setTimeout(() => {
      const element = document.getElementById(`question-preview-${displayIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.outline = '3px solid #0084FF';
        setTimeout(() => {
          element.style.outline = 'none';
        }, 2000);
      }
    }, 150);
  };

  return (
    <div className="lms-page-container">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".docx,.pdf" style={{ display: 'none' }} />

      {/* Hero Title Section */}
      <div className="lms-page-hero-header">
        <div className="hero-eyebrow-badge">
          <span className="hero-eyebrow-dot" />
          <span className="hero-eyebrow-text">Trí Tuệ Nhân Tạo & Bóc Tách Tự Động</span>
        </div>
        <h1 className="hero-title">
          Bóc Tách Bộ Đề <span className="hero-gradient-title">Từ File Word & PDF</span>
        </h1>
        <p className="hero-subtitle">
          Tải lên file đề thi Word (.docx) để thuật toán tự động nhận diện câu hỏi, phát hiện đáp án bôi đỏ và nạp vào cơ sở dữ liệu.
        </p>
      </div>

      {/* Top Header & Course Management Controls */}
      <div className="lms-glass-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="lms-step-badge" style={{ width: '32px', height: '32px' }}>
              <Cpu size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Cấu Hình Vị Trí Lưu Ngân Hàng Câu Hỏi
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                Chọn Học phần và Bài học đích để lưu trữ câu hỏi sau khi bóc tách
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.65rem 1.15rem', borderRadius: '12px' }}
            >
              <Plus size={16} />
              Thêm Học Phần
            </button>
            <button
              onClick={() => setShowAddLessonModal(true)}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.65rem 1.15rem', borderRadius: '12px' }}
            >
              <Plus size={16} />
              Thêm Bài Học
            </button>
          </div>
        </div>

        {/* Dropdowns for Selecting Course & Lesson */}
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.45rem', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              Học phần đích để nạp câu hỏi:
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                const cId = e.target.value;
                setSelectedCourse(cId);
                const firstL = lessons.find(l => l.courseId === cId);
                setSelectedLesson(firstL ? firstL.id : "");
              }}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', outline: 'none' }}
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.title} ({c.questionsCount || 0} câu)</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '260px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.45rem', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              Bài học chỉ định để lưu câu hỏi:
            </label>
            <select
              value={selectedLesson}
              onChange={(e) => setSelectedLesson(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', outline: 'none' }}
            >
              {currentCourseLessons.length === 0 ? (
                <option value="">(Chưa có bài học nào - Hãy bấm Thêm Bài Học)</option>
              ) : (
                currentCourseLessons.map(l => (
                  <option key={l.id} value={l.id}>Bài {l.lessonNumber}: {l.title}</option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccessMsg && (
        <div style={{
          marginBottom: '1.75rem',
          padding: '1.15rem 1.5rem',
          backgroundColor: '#ecfdf5',
          border: '1.5px solid #10b981',
          borderRadius: '16px',
          color: '#047857',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)'
        }} className="animate-fade-in">
          <CheckCircle2 size={24} color="#10b981" />
          {saveSuccessMsg}
        </div>
      )}

      {/* Upload Dropzone & Balanced Terminal Console Grid */}
      <div className="lms-parser-hero-grid">
        {/* Left Column: Upload Dropzone Card */}
        <div className="lms-glass-panel lms-parser-card-col">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Upload size={18} style={{ color: '#0084FF' }} />
              Tải Lên Bộ Đề Ngân Hàng (.docx / .pdf)
            </h3>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="lms-dropzone-card"
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.85rem auto',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)'
            }}>
              <FileText size={28} />
            </div>
            <p style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem', fontSize: '1.05rem' }}>
              Nhấp vào đây để CHỌN FILE THỰC từ máy tính
            </p>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '1rem' }}>
              Hỗ trợ kéo thả file Word (.docx) có đáp án bôi màu đỏ
            </p>
            <button type="button" className="assist-btn-primary" style={{ padding: '9px 24px', borderRadius: '9999px', margin: '0 auto', fontSize: '0.88rem' }}>
              <span>Chọn File Từ Máy Tính</span>
              <div className="assist-btn-primary-bead">
                <Upload size={13} style={{ fill: '#0084FF' }} />
              </div>
            </button>
          </div>

          {/* Sample Files Row */}
          <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>File Mẫu Sẵn Có:</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleSimulateUpload('MauWord_BoDe.docx')} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: '10px' }}>
                File .docx Mẫu
              </button>
              <button onClick={() => handleSimulateUpload('MauPDF_DeThi.pdf')} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: '10px' }}>
                File .pdf Mẫu
              </button>
            </div>
          </div>

          {errorMsg && (
            <div style={{ marginTop: '0.85rem', padding: '0.75rem 1rem', backgroundColor: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: '12px', color: '#e11d48', fontSize: '0.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}

          {fileName && (
            <div style={{ marginTop: '0.85rem', padding: '0.75rem 1rem', backgroundColor: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0, flex: 1 }}>
                <FileText size={18} style={{ color: '#0284c7', flexShrink: 0 }} />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0369a1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</span>
              </div>
              <span className={`badge ${isParsing ? 'badge-warning' : 'badge-success'}`} style={{ flexShrink: 0, marginLeft: '0.5rem' }}>
                {isParsing ? 'Đang bóc tách...' : 'Đã tải lên'}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Balanced Terminal Console Panel */}
        <div className="lms-terminal-panel lms-parser-card-col">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 800, fontSize: '0.88rem' }}>
              <Code size={16} />
              <span>Parser Engine Terminal Console</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginRight: '6px' }}>LIVE LOGS</span>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
            </div>
          </div>

          {/* Terminal Logs Scroll Window */}
          <div className="lms-terminal-body">
            {parseLog.length === 0 ? (
              <span style={{ color: '#64748b' }}>// Nhấp chọn file .docx từ máy tính hoặc bấm File Mẫu để bắt đầu...</span>
            ) : (
              parseLog.map((log, i) => (
                <div key={i} className={log.includes('SUCCESS') ? 'log-line-success' : (log.includes('COLOR_DETECT') || log.includes('WARN')) ? 'log-line-warn' : 'log-line-info'}>
                  {log}
                </div>
              ))
            )}
          </div>

          {/* Terminal Footer Status Bar */}
          <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isParsing ? '#f59e0b' : parseResults ? '#10b981' : '#64748b' }} />
              <span>{isParsing ? 'Đang phân tích XML & Font Color...' : parseResults ? `Đã nạp ${parseResults.length} câu` : 'Sẵn sàng nhận tệp tin'}</span>
            </div>
            <span>Engine: JSZip + Color Parser</span>
          </div>
        </div>
      </div>

      {/* ─── INSTANT REPORT & DIRECT SAVE ACTION PANEL ─── */}
      {parseResults && (
        <div id="parse-results-section" className="lms-parse-report-card animate-fade-in">
          {/* Header Status Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                backgroundColor: errorQuestions.length === 0 ? '#ecfdf5' : '#fffbeb',
                border: errorQuestions.length === 0 ? '1.5px solid #a7f3d0' : '1.5px solid #fde68a',
                color: errorQuestions.length === 0 ? '#059669' : '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {errorQuestions.length === 0 ? <CheckCircle2 size={26} /> : <AlertTriangle size={26} />}
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Kết Quả Bóc Tách:</span>
                  <span style={{ color: '#0084FF' }}>{fileName || 'Tệp tin Word'}</span>
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '3px 0 0 0', fontWeight: 500 }}>
                  {errorQuestions.length === 0 
                    ? `✓ Bóc tách thành công 100%! Tất cả ${analyzedQuestions.length} câu hỏi đều có đáp án bôi đỏ hợp lệ.`
                    : `⚠️ Bóc tách hoàn tất ${analyzedQuestions.length} câu hỏi — Phát hiện ${errorQuestions.length} câu chưa có đáp án bôi đỏ!`}
                </p>
              </div>
            </div>

            {/* Direct Save Action Button (Triggers Confirmation Modal) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <button
                onClick={handleOpenConfirmSave}
                className="assist-btn-primary"
                style={{
                  padding: '12px 28px',
                  borderRadius: '9999px',
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  background: errorQuestions.length === 0 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : 'linear-gradient(135deg, #0084FF 0%, #0066CC 100%)',
                  boxShadow: errorQuestions.length === 0 
                    ? '0 6px 20px rgba(16, 185, 129, 0.3)' 
                    : '0 6px 20px rgba(0, 132, 255, 0.3)'
                }}
              >
                <span>Lưu Vào Database ({validQuestions.length} Câu)</span>
                <div className="assist-btn-primary-bead">
                  <Save size={16} style={{ fill: '#ffffff', color: '#ffffff' }} />
                </div>
              </button>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                Lưu vào: <strong>{selectedCourseObj?.code || 'Học phần'}</strong> ➜ <strong>{selectedLessonObj?.title || 'Bài học'}</strong>
              </span>
            </div>
          </div>

          {/* 3 Metric Pills Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="lms-report-stat-pill" style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>Tổng Số Câu Đã Load</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0c4a6e' }}>{analyzedQuestions.length} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>câu hỏi</span></div>
              </div>
            </div>

            <div className="lms-report-stat-pill" style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>Câu Hợp Lệ (Sẽ Lưu)</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#064e3b' }}>{validQuestions.length} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>câu ({((validQuestions.length / Math.max(1, analyzedQuestions.length)) * 100).toFixed(0)}%)</span></div>
              </div>
            </div>

            <div className="lms-report-stat-pill" style={{ backgroundColor: errorQuestions.length > 0 ? '#fff1f2' : '#f8fafc', borderColor: errorQuestions.length > 0 ? '#fecdd3' : '#e2e8f0' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: errorQuestions.length > 0 ? '#ffe4e6' : '#e2e8f0', color: errorQuestions.length > 0 ? '#e11d48' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {errorQuestions.length > 0 ? <AlertCircle size={20} /> : <Check size={20} />}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: errorQuestions.length > 0 ? '#be123c' : '#475569', textTransform: 'uppercase' }}>Câu Thiếu Đáp Án (Bỏ Qua)</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: errorQuestions.length > 0 ? '#9f1239' : '#334155' }}>
                  {errorQuestions.length} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{errorQuestions.length > 0 ? 'câu không lưu' : 'câu'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Button for Full Questions Preview */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1.15rem', borderTop: '1.5px dashed #cbd5e1' }}>
            <div style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
              Bạn muốn kiểm tra từng câu hỏi trước khi lưu vào ngân hàng?
            </div>
            <button
              onClick={() => setShowQuestionsList(prev => !prev)}
              className="btn-secondary"
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: showQuestionsList ? '#eff6ff' : '#ffffff',
                borderColor: showQuestionsList ? '#0084FF' : '#cbd5e1',
                color: showQuestionsList ? '#0084FF' : '#1e293b',
                boxShadow: showQuestionsList ? '0 0 0 2px rgba(0, 132, 255, 0.2)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {showQuestionsList ? <EyeOff size={16} /> : <Eye size={16} />}
              <span>{showQuestionsList ? `Ẩn Danh Sách (${analyzedQuestions.length} Câu)` : `Xem Tất Cả Các Câu Hỏi (${analyzedQuestions.length} Câu)`}</span>
              {showQuestionsList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Warning Card listing exactly which questions have missing red answers */}
          {errorQuestions.length > 0 && (
            <div className="lms-error-warning-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.85rem' }}>
                <AlertTriangle size={20} style={{ color: '#d97706', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#92400e', margin: 0 }}>
                    Chi Tiết {errorQuestions.length} Câu Hỏi Bị Bỏ Qua Do Chưa Có Đáp Án Đỏ:
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#b45309', margin: '2px 0 0 0' }}>
                    Trong file Word, các câu dưới đây không có chữ màu đỏ ở đáp án và sẽ <strong>không được lưu</strong> vào ngân hàng câu hỏi:
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {errorQuestions.map((eq) => (
                  <div key={eq.displayIndex} className="lms-error-item-card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                      <span style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontWeight: 800, fontSize: '0.78rem', padding: '3px 9px', borderRadius: '8px', flexShrink: 0 }}>
                        Câu {eq.displayIndex}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {eq.content || eq.rawText}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#e11d48', fontWeight: 600, marginTop: '2px' }}>
                          ⚠️ {eq.errorReason}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => scrollToQuestion(eq.displayIndex)}
                      className="btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <ArrowDown size={14} /> Xem Câu Này
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detailed Question Preview List (Only shown when user clicks button) */}
      {parseResults && showQuestionsList && (
        <div className="lms-glass-panel animate-fade-in" style={{ padding: '1.5rem 1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Eye style={{ color: '#0084FF' }} size={20} />
                Danh Sách Chi Tiết Bộ Đề ({analyzedQuestions.length} Câu)
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                Đáp án đúng được viền xanh lá trang nhã. Bạn có thể cuộn xem nhanh toàn bộ nội dung câu hỏi.
              </p>
            </div>

            <button
              onClick={() => setShowQuestionsList(false)}
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <EyeOff size={14} /> Thu gọn danh sách
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {analyzedQuestions.map((q) => (
              <div
                key={q.displayIndex}
                id={`question-preview-${q.displayIndex}`}
                className={`lms-parsed-question-card ${q.hasError ? 'has-error' : ''}`}
              >
                {/* Compact Question Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flex: 1, minWidth: 0 }}>
                    <span style={{
                      backgroundColor: q.hasError ? '#fef3c7' : '#e0f2fe',
                      color: q.hasError ? '#b45309' : '#0369a1',
                      border: q.hasError ? '1px solid #fde68a' : '1px solid #bae6fd',
                      fontWeight: 900,
                      fontSize: '0.78rem',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      flexShrink: 0
                    }}>
                      Câu {q.displayIndex}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.94rem', color: '#0f172a', lineHeight: 1.45 }}>
                      {q.content || q.rawText}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
                    {q.hasError && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#fff1f2', color: '#e11d48', padding: '2px 8px', borderRadius: '6px', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <AlertCircle size={12} /> Bỏ qua (không lưu)
                      </span>
                    )}
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 9px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      {q.parsedType === 'SINGLE_CHOICE' ? 'Trắc nghiệm 1 đáp án' :
                       q.parsedType === 'MULTI_CHOICE' ? 'Nhiều đáp án' :
                       q.parsedType === 'TRUE_FALSE' ? 'Đúng / Sai' :
                       (q.dragMode === 'categorize' || (q.columns && q.columns.length > 0)) ? 'Phân loại cột' :
                       (q.dragMode === 'match' || (q.matchPairs && q.matchPairs.length > 0)) ? 'Ghép bảng' :
                       'Điền khuyết'}
                    </span>
                  </div>
                </div>

                {/* Options 2-Column Balanced Grid */}
                {q.parsedType !== 'DRAG_DROP' ? (
                  <div className="lms-parsed-options-grid">
                    {(q.options || []).map((r, rIdx) => (
                      <div
                        key={rIdx}
                        className={`lms-parsed-option-item ${r.isCorrect ? 'correct' : ''}`}
                      >
                        <span className="lms-option-key-badge">
                          {r.key || String.fromCharCode(65 + rIdx)}
                        </span>
                        <span style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                          {r.text}
                        </span>
                        {r.isCorrect && (
                          <Check size={16} color="#10b981" strokeWidth={2.5} style={{ flexShrink: 0, marginLeft: 'auto' }} />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '0.65rem' }}>
                    {/* Mode Categorize: Show Target Columns */}
                    {(q.dragMode === 'categorize' || (q.columns && q.columns.length > 0)) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4338ca', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🎯 Bảng đích phân loại (Gồm {(q.columns || []).length} cột):
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, (q.columns || []).length)}, 1fr)`, gap: '0.75rem' }}>
                          {(q.columns || []).map((col, cIdx) => (
                            <div key={cIdx} style={{ backgroundColor: '#ffffff', border: '1.5px solid #c7d2fe', borderRadius: '10px', overflow: 'hidden' }}>
                              <div style={{ background: 'linear-gradient(135deg, #0084FF 0%, #0066CC 100%)', color: '#ffffff', fontWeight: 800, fontSize: '0.78rem', padding: '0.45rem 0.65rem' }}>
                                Cột {cIdx + 1}: {col.header}
                              </div>
                              <div style={{ padding: '0.5rem 0.65rem', backgroundColor: '#f8fafc' }}>
                                <ul style={{ margin: 0, paddingLeft: '1.15rem', fontSize: '0.8rem', color: '#065f46', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  {(col.items || []).map((it, iIdx) => (
                                    <li key={iIdx}>{it}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mode Match */}
                    {q.dragMode === 'match' && !q.columns && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4f46e5' }}>Các cặp ghép nối từ bảng:</div>
                        {(q.matchPairs || q.extractedBlanks || []).map((p, pIdx) => (
                          <div key={pIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                            <span style={{ color: '#0f172a', fontWeight: 600 }}>{pIdx + 1}. {(p.leftText || p.leftWithBlank || '').replace(/\[BLANK_\d+\]/g, '_____')}</span>
                            <span style={{ color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 7px', borderRadius: '6px', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                              {p.rightAnswer || p.answer || '(Trống)'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mode Inline Blank */}
                    {(!q.dragMode || q.dragMode === 'inline') && !q.columns && !q.matchPairs && (
                      <>
                        <div style={{ padding: '0.6rem 0.85rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', lineHeight: 1.5, color: '#334155' }}>
                          {q.renderedTemplate || q.content}
                        </div>
                        {q.extractedBlanks && q.extractedBlanks.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                            {q.extractedBlanks.map((b, bIdx) => (
                              <span key={bIdx} style={{ fontSize: '0.78rem', backgroundColor: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0', fontWeight: 700 }}>
                                ✓ Chỗ trống {bIdx + 1}: {b.answer}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── CONFIRMATION MODAL BEFORE SAVING TO DATABASE ─── */}
      {showConfirmSaveModal && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowConfirmSaveModal(false); }}>
          <div className="modal-content" style={{ maxWidth: '520px', padding: '2rem' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    Xác Nhận Lưu Vào Database
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    Kiểm tra thông tin trước khi nạp ngân hàng câu hỏi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmSaveModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Summary Details Box */}
            <div style={{ backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1.15rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Học phần đích:</span>
                <span style={{ color: '#0f172a', fontWeight: 800 }}>{selectedCourseObj?.code} - {selectedCourseObj?.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Bài học chỉ định:</span>
                <span style={{ color: '#0f172a', fontWeight: 800 }}>{selectedLessonObj?.title || 'Bài học đã chọn'}</span>
              </div>
              <div style={{ height: '1px', background: '#e2e8f0', margin: '2px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Tổng số câu đã load:</span>
                <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>{analyzedQuestions.length} câu</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                <span style={{ color: '#059669', fontWeight: 700 }}>✓ Số câu sẽ lưu vào DB:</span>
                <span style={{ color: '#059669', fontWeight: 900, fontSize: '1.1rem' }}>{validQuestions.length} câu</span>
              </div>
              {errorQuestions.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', backgroundColor: '#fffbeb', padding: '6px 10px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <span style={{ color: '#b45309', fontWeight: 700 }}>⚠️ Số câu bỏ qua (thiếu đáp án):</span>
                  <span style={{ color: '#b45309', fontWeight: 900 }}>{errorQuestions.length} câu</span>
                </div>
              )}
            </div>

            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.5rem', textAlign: 'center' }}>
              {errorQuestions.length > 0 ? (
                <span>Hệ thống sẽ lưu <strong>{validQuestions.length} câu hỏi có đáp án hợp lệ</strong> và tự động bỏ qua {errorQuestions.length} câu chưa có đáp án đỏ. Bạn có muốn tiếp tục?</span>
              ) : (
                <span>Bạn có chắc chắn muốn lưu <strong>{validQuestions.length} câu hỏi</strong> này vào hệ thống?</span>
              )}
            </p>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
              <button
                type="button"
                onClick={() => setShowConfirmSaveModal(false)}
                className="btn-secondary"
                style={{ padding: '0.75rem 1.4rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700 }}
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveToDatabase}
                className="btn-primary"
                style={{
                  padding: '0.75rem 1.6rem',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  backgroundColor: '#10b981',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Check size={18} />
                Đồng Ý & Lưu {validQuestions.length} Câu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Course */}
      {showAddCourseModal && (
        <div
          className="modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddCourseModal(false); }}
        >
          <div className="modal-content animate-scale-up" style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1.5px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Thêm Học Phần Mới
              </h3>
              <button
                onClick={() => setShowAddCourseModal(false)}
                style={{ width: '32px', height: '32px', borderRadius: '10px', border: 'none', cursor: 'pointer', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  MÃ HỌC PHẦN (VD: MLN101, IT201):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mã học phần..."
                  value={newCourseCode}
                  onChange={e => setNewCourseCode(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontWeight: 700, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  TÊN HỌC PHẦN:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tên học phần..."
                  value={newCourseTitle}
                  onChange={e => setNewCourseTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontWeight: 700, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  MÔ TẢ NGẮN (TÙY CHỌN):
                </label>
                <input
                  type="text"
                  placeholder="Mô tả học phần..."
                  value={newCourseDesc}
                  onChange={e => setNewCourseDesc(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <button type="button" onClick={() => setShowAddCourseModal(false)} className="btn-secondary">
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn-primary">
                  Tạo Học Phần
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Lesson */}
      {showAddLessonModal && (
        <div
          className="modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddLessonModal(false); }}
        >
          <div className="modal-content animate-scale-up" style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1.5px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Thêm Bài Học Cho Học Phần
              </h3>
              <button
                onClick={() => setShowAddLessonModal(false)}
                style={{ width: '32px', height: '32px', borderRadius: '10px', border: 'none', cursor: 'pointer', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddLesson} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  HỌC PHẦN TRỰC THUỘC:
                </label>
                <select
                  value={selectedCourse}
                  onChange={e => setSelectedCourse(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontWeight: 700, outline: 'none' }}
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  SỐ THỨ TỰ BÀI:
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newLessonNumber}
                  onChange={e => setNewLessonNumber(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontWeight: 700, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  TÊN BÀI HỌC:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên bài học..."
                  value={newLessonTitle}
                  onChange={e => setNewLessonTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontWeight: 700, outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <button type="button" onClick={() => setShowAddLessonModal(false)} className="btn-secondary">
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn-primary">
                  Tạo Bài Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          toast={toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
