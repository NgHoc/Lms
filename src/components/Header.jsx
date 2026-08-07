import React from 'react';
import { FileCode, Sparkles, Settings } from 'lucide-react';

const NAV_TABS = [
  { id: 'quiz',   icon: <Sparkles size={17} />, label: 'Ôn Luyện & Thi',   badge: 'Thi thử' },
  { id: 'manage', icon: <Settings size={17} />, label: 'Quản Lý Nội Dung', badge: null },
  { id: 'admin',  icon: <FileCode size={17} />, label: 'Upload & Bóc Tách', badge: 'Word docx' },
];

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.03)'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Left: Brand Logo & Name: NgHoc */}
        <div
          onClick={() => setActiveTab('quiz')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            userSelect: 'none',
            minWidth: '180px'
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '11px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px -2px rgba(79, 70, 229, 0.4)',
            fontWeight: 900,
            fontSize: '1.15rem',
            letterSpacing: '-0.02em',
            transition: 'transform 0.2s ease'
          }}>
            N
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontSize: '1.3rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #0f172a 0%, #4338ca 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
              lineHeight: 1.2
            }}>
              NgHoc
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
              color: '#4f46e5',
              padding: '2px 8px',
              borderRadius: '9999px',
              border: '1px solid #c7d2fe',
              letterSpacing: '0.03em'
            }}>
              PRO
            </span>
          </div>
        </div>

        {/* Center: Navigation Tabs Segmented Control (Desktop) */}
        <nav className="desktop-nav-tabs" style={{
          display: 'flex',
          gap: '6px',
          backgroundColor: '#f1f5f9',
          padding: '5px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.04)',
          margin: '0 auto'
        }}>
          {NAV_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#4f46e5' : '#64748b',
                  boxShadow: isActive ? '0 4px 12px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)' : 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ color: isActive ? '#4f46e5' : '#94a3b8' }}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    backgroundColor: isActive ? '#eef2ff' : '#e2e8f0',
                    color: isActive ? '#4f46e5' : '#64748b',
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    marginLeft: '2px'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Balanced Spacer / System Status */}
        <div className="desktop-user-profile" style={{ minWidth: '180px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '5px 12px',
            borderRadius: '9999px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#64748b'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 0 2px #d1fae5'
            }}></span>
            <span>Hệ Thống Hoạt Động</span>
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Navigation Bar (Active on Mobile Screens) ─────── */}
      <nav className="mobile-bottom-nav">
        {NAV_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="mobile-nav-icon">
                {tab.icon}
              </div>
              <span>{tab.id === 'quiz' ? 'Luyện Thi' : tab.id === 'manage' ? 'Quản Lý' : 'Upload'}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
