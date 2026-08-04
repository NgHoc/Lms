import React from 'react';
import { BookOpen, FileCode, Layers, Database, User, Sparkles, Settings } from 'lucide-react';

const NAV_TABS = [
  { id: 'quiz',         icon: <Sparkles size={15} />,  label: 'Ôn Luyện & Thi' },
  { id: 'manage',       icon: <Settings size={15} />,  label: 'Quản Lý Nội Dung' },
  { id: 'admin',        icon: <FileCode size={15} />,  label: 'Upload & Bóc Tách' },
  { id: 'architecture', icon: <Database size={15} />,  label: 'Kiến Trúc & ERD' },
];

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '11px',
            backgroundColor: '#1e40af', color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(30,64,175,0.3)'
          }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                LMS Student Testing
              </h1>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#1e40af', padding: '2px 7px', borderRadius: '9999px', border: '1px solid #bfdbfe' }}>
                v3.1
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
              Hệ thống ôn luyện thông minh & Ngân hàng đề thi
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: '3px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', flexWrap: 'wrap' }}>
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '7px 13px', borderRadius: '7px', border: 'none',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: activeTab === tab.id ? '#ffffff' : 'transparent',
                color: activeTab === tab.id ? '#1e40af' : '#64748b',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* User Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '5px 11px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '9999px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={14} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>Nguyễn Văn An</div>
            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>MSSV: 20240192</div>
          </div>
        </div>
      </div>
    </header>
  );
}
