import React, { useState } from 'react';
import { ArrowRight, Menu, X, ChevronDown, Play } from 'lucide-react';

const NAV_TABS = [
  { id: 'home', label: 'Trang Chủ' },
  { id: 'quiz', label: 'Ôn Luyện & Thi' },
  { id: 'manage', label: 'Quản Lý Nội Dung' },
  { id: 'admin', label: 'Bóc Tách File' },
];

export default function Header({ activeTab, setActiveTab, onOpenGuide }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* ── Fixed Floating Liquid-Glass Navigation Bar ─────────────────────── */}
      <header className="assist-nav-container" style={{ zIndex: 100 }}>
        <div className="assist-nav-inner">
          {/* Left: Brand Logo */}
          <div
            onClick={() => setActiveTab('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px -2px rgba(79, 70, 229, 0.35)',
              fontWeight: 900,
              fontSize: '1.05rem',
              letterSpacing: '-0.02em',
              transition: 'transform 0.2s ease'
            }}>
              N
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #0f172a 0%, #4338ca 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.03em',
                fontFamily: 'var(--font-outfit), var(--font-sans)',
                lineHeight: 1.2
              }}>
                NgHoc
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                color: '#4f46e5',
                padding: '2px 7px',
                borderRadius: '9999px',
                border: '1px solid #c7d2fe',
                letterSpacing: '0.03em'
              }}>
                _zgoc
              </span>
            </div>
          </div>

          {/* Center: Desktop Clean Typography Navigation Links (Style như mẫu reference) */}
          <nav className="desktop-nav-tabs" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            margin: '0 auto'
          }}>
            {NAV_TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    position: 'relative',
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 0',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#0f172a' : 'rgba(15, 23, 42, 0.65)',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    letterSpacing: '-0.2px',
                    fontFamily: 'var(--font-sans)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#0f172a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(15, 23, 42, 0.65)';
                    }
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.id === 'quiz' && (
                    <ChevronDown size={14} style={{ opacity: 0.6, marginLeft: '1px' }} />
                  )}
                  {/* Subtle active underline dot indicator */}
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '16px',
                      height: '2.5px',
                      borderRadius: '9999px',
                      backgroundColor: '#0084FF'
                    }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Clean 3-Bar Hamburger Menu Button matching reference */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở Menu"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span style={{ width: '20px', height: '2.5px', backgroundColor: '#0f172a', borderRadius: '4px', display: 'block' }} />
              <span style={{ width: '20px', height: '2.5px', backgroundColor: '#0f172a', borderRadius: '4px', display: 'block' }} />
              <span style={{ width: '20px', height: '2.5px', backgroundColor: '#0f172a', borderRadius: '4px', display: 'block' }} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Slide-In Drawer ────────────────────────────────────────── */}
      <div
        className={`assist-mobile-drawer-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside className={`assist-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.95rem'
            }}>
              N
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>NgHoc</span>
          </div>
          <button
            type="button"
            className="assist-modal-close-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {NAV_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'rgba(0, 132, 255, 0.08)' : 'transparent',
                  color: isActive ? '#0084FF' : '#334155',
                  textAlign: 'left'
                }}
              >
                <span>{tab.label}</span>
                {isActive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0084FF' }} />}
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenGuide) onOpenGuide();
            }}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '14px',
              background: 'rgba(0, 132, 255, 0.08)',
              color: '#0084FF',
              border: '1px solid rgba(0, 132, 255, 0.2)',
              fontWeight: 700,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Play size={16} style={{ fill: '#0084FF' }} />
            <span>Xem Video Hướng Dẫn</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('quiz');
              setMobileMenuOpen(false);
            }}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '14px',
              background: '#0084FF',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <span>Bắt Đầu Luyện Thi</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
