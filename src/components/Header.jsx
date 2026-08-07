import React from 'react';
import { BookOpen, FileCode, Layers, Database, User, Sparkles, Settings, GraduationCap } from 'lucide-react';

const NAV_TABS = [
  { id: 'quiz',         icon: <Sparkles size={16} />,     label: 'Ôn Luyện & Thi',     badge: 'Thi thử' },
  { id: 'manage',       icon: <Settings size={16} />,     label: 'Quản Lý Nội Dung',   badge: null },
  { id: 'admin',        icon: <FileCode size={16} />,     label: 'Upload & Bóc Tách', badge: 'Word docx' },
  { id: 'architecture', icon: <Database size={16} />,     label: 'Kiến Trúc & ERD',   badge: null },
];

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(255, 255, 255, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand Logo & Name */}
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
            boxShadow: '0 6px 16px -2px rgba(79, 70, 229, 0.4)',
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
          }}>
            <GraduationCap size={24} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontSize: '1.15rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #0f172a 0%, #4338ca 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.025em',
                lineHeight: 1.2
              }}>
                Antigravity LMS
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                color: '#4f46e5',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: '1px solid #c7d2fe',
                letterSpacing: '0.02em'
              }}>
                v3.2 PRO
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, fontWeight: 500 }}>
              Hệ thống ôn luyện thông minh & Ngân hàng đề thi tương tác
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="desktop-nav-tabs" style={{
          display: 'flex',
          gap: '4px',
          backgroundColor: '#f1f5f9',
          padding: '5px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.04)'
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
                  gap: '0.45rem',
                  padding: '8px 15px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.85rem',
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
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    backgroundColor: isActive ? '#eef2ff' : '#e2e8f0',
                    color: isActive ? '#4f46e5' : '#64748b',
                    padding: '1px 6px',
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

        {/* User Profile Card (Desktop) */}
        <div className="desktop-user-profile" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '6px 14px 6px 8px',
          backgroundColor: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '9999px',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
            color: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem',
            position: 'relative'
          }}>
            <User size={16} />
            <span style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '9px',
              height: '9px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              border: '2px solid #ffffff'
            }} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              Nguyễn Văn An
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
              MSSV: 20240192 • Sinh viên
            </div>
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
              <span>{tab.id === 'quiz' ? 'Luyện Thi' : tab.id === 'manage' ? 'Quản Lý' : tab.id === 'admin' ? 'Upload' : 'Kiến Trúc'}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
