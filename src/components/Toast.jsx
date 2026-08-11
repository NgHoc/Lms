import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const TOAST_TYPES = {
  success: {
    icon: <CheckCircle2 size={20} />,
    bgColor: '#ecfdf5',
    borderColor: '#6ee7b7',
    iconColor: '#059669',
    textColor: '#065f46',
    progressColor: '#10b981',
    badge: 'THÀNH CÔNG'
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    bgColor: '#fffbeb',
    borderColor: '#fcd34d',
    iconColor: '#d97706',
    textColor: '#92400e',
    progressColor: '#f59e0b',
    badge: 'CẢNH BÁO'
  },
  error: {
    icon: <AlertCircle size={20} />,
    bgColor: '#fef2f2',
    borderColor: '#fca5a5',
    iconColor: '#dc2626',
    textColor: '#991b1b',
    progressColor: '#ef4444',
    badge: 'LỖI HỆ THỐNG'
  },
  info: {
    icon: <Info size={20} />,
    bgColor: '#eff6ff',
    borderColor: '#93c5fd',
    iconColor: '#2563eb',
    textColor: '#1e40af',
    progressColor: '#3b82f6',
    badge: 'THÔNG BÁO'
  }
};

export default function Toast({ toast, type, title, message, duration: customDuration, onClose }) {
  const actualToast = toast || (message || title ? { type, title, message, duration: customDuration } : null);
  if (!actualToast) return null;

  const typeConfig = TOAST_TYPES[actualToast.type || 'info'] || TOAST_TYPES.info;
  const duration = actualToast.duration || customDuration || 4500;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [actualToast, duration, onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      maxWidth: '440px',
      width: 'calc(100vw - 40px)',
      pointerEvents: 'auto',
      animation: 'slideInTop 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: `1.5px solid ${typeConfig.borderColor}`,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          backgroundColor: typeConfig.bgColor
        }}>
          <div style={{
            color: typeConfig.iconColor,
            flexShrink: 0,
            marginTop: '2px'
          }}>
            {typeConfig.icon}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '3px'
            }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: typeConfig.iconColor,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {typeConfig.badge}
              </span>
              {actualToast.title && (
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  color: typeConfig.textColor
                }}>
                  • {actualToast.title}
                </span>
              )}
            </div>

            <div style={{
              fontSize: '0.85rem',
              color: '#334155',
              lineHeight: 1.45,
              fontWeight: 500,
              wordBreak: 'break-word'
            }}>
              {actualToast.message}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#334155'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Dynamic Progress Bar Animation */}
        <div style={{
          height: '3px',
          width: '100%',
          backgroundColor: 'rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            backgroundColor: typeConfig.progressColor,
            animation: `toastProgress ${duration}ms linear forwards`
          }} />
        </div>
      </div>
    </div>
  );
}
