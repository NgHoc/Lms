import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2,
  ChevronRight, Sparkles, FileText, BookOpen, CheckCircle2, Clock,
  Upload, Terminal, Award, HelpCircle, Check, X, ArrowRight, CornerDownRight,
  Layers, Bookmark, BarChart3, FastForward, Rewind
} from 'lucide-react';

// ── Web Audio Sound Effects Synthesizer (No external dependencies) ─────────
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      // Audio context might need user gesture
    }
  }

  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.15, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
    } catch (e) { }
  }

  playChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) { }
  }
}

const sfx = new SoundFX();

// ── Chapters Configuration ────────────────────────────────────────────────
const CHAPTERS = [
  {
    id: 0,
    title: '1. Tổng quan & Trang chủ',
    shortTitle: 'Tổng quan',
    time: 0,
    duration: 22,
    badge: 'Khám phá giao diện',
    desc: 'Làm quen thanh điều hướng nhanh, menu 3 gạch và trung tâm điều khiển.'
  },
  {
    id: 1,
    title: '2. Bóc tách đề Word .docx',
    shortTitle: 'Bóc tách đề AI',
    time: 22,
    duration: 30,
    badge: 'Tự động nhận diện',
    desc: 'Kéo thả file Word có đáp án bôi đỏ, terminal kiểm tra và lưu vào Database.'
  },
  {
    id: 2,
    title: '3. Quản lý học phần & bài học',
    shortTitle: 'Quản lý kho đề',
    time: 52,
    duration: 25,
    badge: 'Kho dữ liệu',
    desc: 'Tổ chức học phần, phân chia bài học (Bài 1, Bài 2...) và ngân hàng câu hỏi.'
  },
  {
    id: 3,
    title: '4. Luyện thi & Kiểm tra',
    shortTitle: 'Làm bài thi',
    time: 77,
    duration: 35,
    badge: 'Phòng thi thông minh',
    desc: 'Chọn chế độ thi 15p/30p/60p, cửa sổ chọn bài nổi, ma trận câu hỏi và cờ đánh dấu.'
  },
  {
    id: 4,
    title: '5. Nộp bài & Xem giải thích',
    shortTitle: 'Kết quả & Lời giải',
    time: 112,
    duration: 25,
    badge: 'Chấm điểm tức thì',
    desc: 'Hệ thống tính điểm thang 10, hiển thị chi tiết câu đúng/sai kèm lời giải chi tiết.'
  }
];

const TOTAL_DURATION = 137; // 2 minutes 17 seconds

export default function GuideVideoModal({ isOpen, onClose, onNavigateTab }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSpeedMenu, setActiveSpeedMenu] = useState(false);

  // Virtual cursor state for demo simulation
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50, clicking: false });

  const playerRef = useRef(null);
  const timerRef = useRef(null);

  // Sound mute sync
  useEffect(() => {
    sfx.muted = isMuted;
  }, [isMuted]);

  // Determine current chapter
  const currentChapter = CHAPTERS.slice().reverse().find(ch => currentTime >= ch.time) || CHAPTERS[0];

  // Playback timer tick
  useEffect(() => {
    if (!isOpen) return;

    if (isPlaying) {
      const intervalMs = 100 / playbackRate;
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= TOTAL_DURATION) {
            setIsPlaying(false);
            return TOTAL_DURATION;
          }
          return Math.min(TOTAL_DURATION, prev + 0.1);
        });
      }, intervalMs);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, playbackRate, isOpen]);

  // Calculate animated cursor position based on current time
  useEffect(() => {
    const t = currentTime;
    let targetX = 50;
    let targetY = 50;
    let isClicking = false;

    // Chapter 0: Home Page Walkthrough
    if (t < 22) {
      if (t < 6) {
        targetX = 25 + Math.sin(t * 1.5) * 8;
        targetY = 40 + Math.cos(t * 1.5) * 6;
      } else if (t < 12) {
        targetX = 85;
        targetY = 18;
        isClicking = t > 9.5 && t < 10.5;
      } else if (t < 18) {
        targetX = 22;
        targetY = 62;
        isClicking = t > 15 && t < 16;
      } else {
        targetX = 42;
        targetY = 62;
      }
    }
    // Chapter 1: Docx Parser
    else if (t < 52) {
      const relT = t - 22;
      if (relT < 8) {
        targetX = 30 + (relT / 8) * 10;
        targetY = 45;
        isClicking = relT > 5 && relT < 6.5;
      } else if (relT < 18) {
        targetX = 75;
        targetY = 50;
      } else {
        targetX = 82;
        targetY = 78;
        isClicking = relT > 24 && relT < 26;
      }
    }
    // Chapter 2: Course Management
    else if (t < 77) {
      const relT = t - 52;
      if (relT < 12) {
        targetX = 32;
        targetY = 40;
        isClicking = relT > 6 && relT < 7.5;
      } else {
        targetX = 70;
        targetY = 55;
        isClicking = relT > 18 && relT < 20;
      }
    }
    // Chapter 3: Quiz Taking
    else if (t < 112) {
      const relT = t - 77;
      if (relT < 10) {
        targetX = 48;
        targetY = 58;
        isClicking = relT > 6 && relT < 7.5;
      } else if (relT < 22) {
        targetX = 40;
        targetY = 52;
        isClicking = relT > 16 && relT < 17.5;
      } else {
        targetX = 82;
        targetY = 82;
        isClicking = relT > 29 && relT < 31;
      }
    }
    // Chapter 4: Results & Score
    else {
      const relT = t - 112;
      if (relT < 10) {
        targetX = 50;
        targetY = 40;
      } else {
        targetX = 50;
        targetY = 70;
      }
    }

    setCursorPos({ x: targetX, y: targetY, clicking: isClicking });

    // Play SFX on clicks
    if (isClicking && Math.floor(t * 10) % 15 === 0) {
      sfx.playClick();
    }
  }, [currentTime]);

  if (!isOpen) return null;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(TOTAL_DURATION, pos * TOTAL_DURATION));
    setCurrentTime(newTime);
    sfx.playClick();
  };

  const jumpToChapter = (chapter) => {
    setCurrentTime(chapter.time);
    setIsPlaying(true);
    sfx.playChime();
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen?.().catch(() => { });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => { });
      setIsFullscreen(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        ref={playerRef}
        className="modal-content animate-fade-in"
        style={{
          maxWidth: isFullscreen ? '100vw' : '1080px',
          width: '100%',
          maxHeight: isFullscreen ? '100vh' : '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: isFullscreen ? 0 : '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 30px 80px -10px rgba(0, 0, 0, 0.65)'
        }}
      >
        {/* ── Modal Video Header ────────────────────────────────────────────── */}
        <div style={{
          padding: '1.1rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0084FF 0%, #0066CC 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 132, 255, 0.35)'
            }}>
              <Play size={16} fill="#ffffff" style={{ marginLeft: '2px' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.2px' }}>
                  Video Hướng Dẫn Sử Dụng Hệ Thống NgHoc LMS
                </h3>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(0, 132, 255, 0.2)',
                  color: '#60a5fa',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '9999px'
                }}>
                  FULL HD 1080p
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                {currentChapter.title} — {currentChapter.desc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── 16:9 Interactive Screen Simulation Stage ──────────────────────── */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          maxHeight: '520px',
          backgroundColor: '#020617',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Animated Virtual Cursor */}
          <div style={{
            position: 'absolute',
            left: `${cursorPos.x}%`,
            top: `${cursorPos.y}%`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 99,
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
          }}>
            <div style={{
              position: 'relative',
              width: '24px',
              height: '24px'
            }}>
              {/* Cursor SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                  fill={cursorPos.clicking ? "#38bdf8" : "#ffffff"}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
              </svg>
              {/* Click Ripple Wave */}
              {cursorPos.clicking && (
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  left: '-4px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '2px solid #38bdf8',
                  animation: 'pulseAura 0.5s ease-out infinite'
                }} />
              )}
            </div>
          </div>

          {/* ═════════ SCENE 0: HOME PAGE (0 - 22s) ═════════ */}
          {currentTime >= 0 && currentTime < 22 && (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.25rem 2rem',
              animation: 'fadeIn 0.3s ease-out',
              fontFamily: 'var(--font-sans)'
            }}>
              {/* Mock Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem' }}>N</div>
                  <span style={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>NgHoc</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                  <span style={{ color: '#0084FF', fontWeight: 800 }}>Trang Chủ</span>
                  <span>Luyện Thi & Kiểm Tra</span>
                  <span>Bóc Tách File Word</span>
                  <span>Quản Lý Học Phần</span>
                </div>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                  <div style={{ width: '14px', height: '2px', background: '#0f172a' }} />
                  <div style={{ width: '14px', height: '2px', background: '#0f172a' }} />
                  <div style={{ width: '14px', height: '2px', background: '#0f172a' }} />
                </div>
              </div>

              {/* Mock Hero Content */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '9999px', background: 'rgba(0,132,255,0.08)', color: '#0084FF', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                    <Sparkles size={12} /> Hệ Thống LMS Hiện Đại 2026
                  </div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.25, margin: '0 0 0.5rem 0' }}>
                    welcome <br />
                    <span style={{ background: 'linear-gradient(135deg, #0084FF, #00C6FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hệ thống ôn tập</span>
                  </h1>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                    Tự động nhận diện câu hỏi từ file Word, trộn đề thi thông minh và tối ưu kết quả học tập.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ padding: '8px 18px', borderRadius: '9999px', background: 'linear-gradient(135deg, #0084FF, #0066CC)', color: '#fff', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Bắt Đầu Luyện Thi <ChevronRight size={14} />
                    </div>
                    <div style={{ padding: '8px 16px', borderRadius: '9999px', background: '#f1f5f9', color: '#0084FF', fontSize: '0.82rem', fontWeight: 700 }}>
                      Xem Hướng Dẫn
                    </div>
                  </div>
                </div>

                {/* Right Companion Card */}
                <div style={{ width: '220px', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(145deg, #f0f9ff, #e0f2fe)', border: '1px solid #bae6fd', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0084FF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem auto' }}>
                    <BookOpen size={24} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0369a1' }}>Quản lý nội dung</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Học phần & Bài học</div>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ SCENE 1: DOCX AI PARSER (22 - 52s) ═════════ */}
          {currentTime >= 22 && currentTime < 52 && (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#090d16',
              color: '#ffffff',
              display: 'flex',
              padding: '1.25rem 1.75rem',
              gap: '1.25rem',
              animation: 'fadeIn 0.3s ease-out',
              fontFamily: 'var(--font-sans)'
            }}>
              {/* Left Upload Panel */}
              <div style={{ flex: 1, backgroundColor: '#0f172a', borderRadius: '16px', border: '1.5px dashed #38bdf8', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Upload size={26} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc', marginBottom: '4px' }}>
                  BoDeThi_TracNghiem.docx
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1rem' }}>
                  Phát hiện đáp án đúng bôi <span style={{ color: '#f43f5e', fontWeight: 800 }}>chữ màu đỏ</span>
                </div>
                <div style={{ width: '85%', height: '6px', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <div style={{ width: currentTime > 32 ? '100%' : `${((currentTime - 22) / 10) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #10b981)', transition: 'width 0.2s linear' }} />
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                  ✓ Đã nhận diện thành công 40 câu hỏi
                </div>
              </div>

              {/* Right Terminal Console */}
              <div style={{ flex: 1.2, backgroundColor: '#020617', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', display: 'flex', flexDirection: 'column', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Terminal size={14} /> Parser Engine Terminal
                  </span>
                  <span style={{ color: '#10b981', fontSize: '0.7rem' }}>ONLINE</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                  <div style={{ color: '#60a5fa' }}>[INFO] Đang giải nén word/document.xml...</div>
                  <div style={{ color: '#34d399' }}>[PARSE] Tìm thấy 40 câu hỏi trắc nghiệm.</div>
                  <div style={{ color: '#fbbf24' }}>[COLOR_DETECT] Nhận diện 40 đáp án bôi đỏ (RGB: FF0000).</div>
                  <div style={{ color: '#a78bfa' }}>[DB_SYNC] Đã liên kết với Học phần: Triết học Mác - Lênin.</div>
                  {currentTime > 36 && (
                    <div style={{ color: '#4ade80', fontWeight: 700 }}>[SUCCESS] Sẵn sàng lưu vào ngân hàng câu hỏi!</div>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <div style={{ padding: '6px 14px', borderRadius: '8px', background: '#10b981', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                    Lưu 40 Câu Vào Database
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ SCENE 2: COURSE MANAGEMENT (52 - 77s) ═════════ */}
          {currentTime >= 52 && currentTime < 77 && (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f8fafc',
              color: '#0f172a',
              display: 'flex',
              padding: '1.25rem 1.75rem',
              gap: '1.25rem',
              animation: 'fadeIn 0.3s ease-out',
              fontFamily: 'var(--font-sans)'
            }}>
              {/* Left Course Cards */}
              <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.85rem 1rem', borderRadius: '12px', background: '#ffffff', border: '2px solid #0084FF', boxShadow: '0 4px 12px rgba(0,132,255,0.12)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#4f46e5', background: '#eef2ff', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>TRIET101</div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', marginTop: '4px' }}>Triết học Mác - Lênin</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>3 Bài học • 120 Câu hỏi</div>
                </div>
                <div style={{ padding: '0.85rem 1rem', borderRadius: '12px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>TTHCM201</div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', marginTop: '4px' }}>Tư tưởng Hồ Chí Minh</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>4 Bài học • 160 Câu hỏi</div>
                </div>
              </div>

              {/* Right Lesson List */}
              <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Danh Sách Bài Học Trong Học Phần
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#0084FF', fontWeight: 700 }}>+ Thêm Bài Học Mới</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, color: '#0084FF', fontSize: '0.82rem' }}>Bài 1:</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Khái lược về Triết học và vai trò</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>40 câu hỏi</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, color: '#0084FF', fontSize: '0.82rem' }}>Bài 2:</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Chủ nghĩa duy vật biện chứng</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>45 câu hỏi</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, color: '#0084FF', fontSize: '0.82rem' }}>Bài 3:</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Chủ nghĩa duy vật lịch sử</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>35 câu hỏi</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ SCENE 3: QUIZ TAKING & MATRIX (77 - 112s) ═════════ */}
          {currentTime >= 77 && currentTime < 112 && (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f8fafc',
              color: '#0f172a',
              display: 'flex',
              padding: '1.25rem 1.75rem',
              gap: '1.25rem',
              animation: 'fadeIn 0.3s ease-out',
              fontFamily: 'var(--font-sans)'
            }}>
              {/* Question Main Panel */}
              <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0084FF' }}>Câu 3 / 20</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#b45309', background: '#fffbeb', padding: '3px 8px', borderRadius: '6px' }}>
                    <Bookmark size={12} /> Đánh dấu câu khó
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                  Theo quan điểm Triết học Mác - Lênin, vật chất là một phạm trù triết học dùng để chỉ cái gì?
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#ffffff', fontSize: '0.85rem', color: '#334155' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>A</span>
                    Toàn bộ thế giới xung quanh con người
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '2px solid #0084FF', background: '#eef2ff', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,132,255,0.15)' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#0084FF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>B</span>
                    Thực tại khách quan được đem lại cho con người trong cảm giác
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#ffffff', fontSize: '0.85rem', color: '#334155' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>C</span>
                    Những gì mắt thường con người có thể nhìn thấy được
                  </div>
                </div>
              </div>

              {/* Question Matrix Sidebar */}
              <div style={{ width: '200px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Ma trận đề thi</span>
                  <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>14:25</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', flex: 1 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                    <div
                      key={n}
                      style={{
                        height: '28px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: n === 3 ? '#0084FF' : n < 3 ? '#e0f2fe' : '#f1f5f9',
                        color: n === 3 ? '#ffffff' : n < 3 ? '#0284c7' : '#64748b'
                      }}
                    >
                      {n}
                    </div>
                  ))}
                </div>
                <div style={{ padding: '6px', borderRadius: '8px', background: '#10b981', color: '#fff', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', marginTop: '0.5rem' }}>
                  Nộp Bài Thi
                </div>
              </div>
            </div>
          )}

          {/* ═════════ SCENE 4: RESULT & SCORE BREAKDOWN (112 - 137s) ═════════ */}
          {currentTime >= 112 && (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease-out',
              fontFamily: 'var(--font-sans)'
            }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.6rem' }}>
                <Award size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 2px 0' }}>
                Chúc Mừng Bạn Đã Hoàn Thành Bài Thi!
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                Triết học Mác - Lênin • Bài 1 • Thời gian làm bài: 11 phút 40 giây
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '6px', padding: '0.5rem 1.75rem', borderRadius: '16px', background: '#ecfdf5', border: '1.5px solid #a7f3d0', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.25rem', fontWeight: 900, color: '#10b981' }}>9.5</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#64748b' }}>/ 10.0</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: '9999px', marginLeft: '6px' }}>
                  Xuất sắc
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#475569' }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Đúng: 19/20 câu</span>
                <span style={{ color: '#f43f5e', fontWeight: 700 }}>✕ Sai: 1/20 câu</span>
                <span style={{ color: '#4f46e5', fontWeight: 700 }}>⚡ Độ chính xác: 95%</span>
              </div>
            </div>
          )}

          {/* Subtitle Caption Overlay Bar */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(12px)',
            color: '#f8fafc',
            padding: '6px 18px',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 600,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0084FF', animation: 'pulseAura 1.5s infinite' }} />
            <span>{currentChapter.title}: {currentChapter.desc}</span>
          </div>
        </div>

        {/* ── Video Player Controls & Progress Bar ──────────────────────────── */}
        <div style={{
          padding: '0.85rem 1.5rem',
          background: '#090d16',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          {/* Progress Timeline Scrubber with Chapter Markers */}
          <div
            onClick={handleSeek}
            style={{
              position: 'relative',
              width: '100%',
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '9999px',
              cursor: 'pointer',
              overflow: 'visible'
            }}
          >
            {/* Filled Progress Bar */}
            <div style={{
              width: `${(currentTime / TOTAL_DURATION) * 100}%`,
              height: '100%',
              borderRadius: '9999px',
              background: 'linear-gradient(90deg, #0084FF 0%, #00C6FF 100%)',
              position: 'relative'
            }}>
              {/* Scrubber Knob */}
              <div style={{
                position: 'absolute',
                right: '-6px',
                top: '-4px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0, 132, 255, 0.6)'
              }} />
            </div>

            {/* Chapter Marker Ticks on Timeline */}
            {CHAPTERS.map(ch => (
              <div
                key={ch.id}
                title={ch.title}
                style={{
                  position: 'absolute',
                  left: `${(ch.time / TOTAL_DURATION) * 100}%`,
                  top: '-2px',
                  width: '2px',
                  height: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  pointerEvents: 'none'
                }}
              />
            ))}
          </div>

          {/* Controls Bar Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (currentTime >= TOTAL_DURATION) setCurrentTime(0);
                  setIsPlaying(!isPlaying);
                  sfx.playClick();
                }}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0084FF 0%, #0066CC 100%)',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 132, 255, 0.35)'
                }}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} fill="#ffffff" style={{ marginLeft: '2px' }} />}
              </button>

              {/* Rewind 10s */}
              <button
                type="button"
                onClick={() => {
                  setCurrentTime(prev => Math.max(0, prev - 10));
                  sfx.playClick();
                }}
                title="Lùi 10 giây"
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Rewind size={18} />
              </button>

              {/* Fast Forward 10s */}
              <button
                type="button"
                onClick={() => {
                  setCurrentTime(prev => Math.min(TOTAL_DURATION, prev + 10));
                  sfx.playClick();
                }}
                title="Tua tới 10 giây"
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <FastForward size={18} />
              </button>

              {/* Replay */}
              <button
                type="button"
                onClick={() => {
                  setCurrentTime(0);
                  setIsPlaying(true);
                  sfx.playChime();
                }}
                title="Xem lại từ đầu"
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <RotateCcw size={16} />
              </button>

              {/* Time Display */}
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8' }}>
                <span style={{ color: '#ffffff' }}>{formatTime(currentTime)}</span> / {formatTime(TOTAL_DURATION)}
              </div>
            </div>

            {/* Right Controls (Speed, Sound, Fullscreen) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsMuted(!isMuted);
                  if (isMuted) sfx.playClick();
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isMuted ? '#f43f5e' : '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={isMuted ? "Bật âm thanh mô phỏng" : "Tắt âm thanh"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              {/* Playback Speed */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setActiveSpeedMenu(!activeSpeedMenu)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {playbackRate}x
                </button>

                {activeSpeedMenu && (
                  <div style={{
                    position: 'absolute',
                    bottom: '120%',
                    right: 0,
                    backgroundColor: '#1e293b',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    zIndex: 100,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                  }}>
                    {[0.75, 1, 1.25, 1.5, 2].map(spd => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => {
                          setPlaybackRate(spd);
                          setActiveSpeedMenu(false);
                          sfx.playClick();
                        }}
                        style={{
                          padding: '6px 14px',
                          border: 'none',
                          borderRadius: '6px',
                          backgroundColor: playbackRate === spd ? '#0084FF' : 'transparent',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        {spd}x {spd === 1 && '(Chuẩn)'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Chapter Selection Bar (Quick Jump) ────────────────────────────── */}
        <div style={{
          padding: '1rem 1.5rem 1.25rem 1.5rem',
          background: '#0f172a',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Chọn nhanh chương hướng dẫn ({CHAPTERS.length} Phần):
            </span>
            <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700 }}>
              Bấm vào thẻ để xem ngay tính năng đó
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.65rem'
          }}>
            {CHAPTERS.map(ch => {
              const isCurrent = currentChapter.id === ch.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => jumpToChapter(ch)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    backgroundColor: isCurrent ? 'rgba(0, 132, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: isCurrent ? '1.5px solid #0084FF' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isCurrent ? '#60a5fa' : '#94a3b8' }}>
                      {formatTime(ch.time)}
                    </span>
                    {isCurrent && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0084FF' }} />
                    )}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isCurrent ? '#ffffff' : '#cbd5e1' }}>
                    {ch.shortTitle}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Action Navigation CTAs */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.5rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateTab?.('parser');
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FileText size={14} style={{ color: '#10b981' }} />
                <span>Thử Bóc Tách Đề Word</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateTab?.('manage');
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <BookOpen size={14} style={{ color: '#9333ea' }} />
                <span>Quản Lý Học Phần</span>
              </button>
            </div>

            <button
              type="button"
              className="assist-btn-primary"
              onClick={() => {
                onClose();
                onNavigateTab?.('quiz');
              }}
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              <span>Vào Làm Bài Thi Ngay</span>
              <div className="assist-btn-primary-bead">
                <ChevronRight size={14} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
