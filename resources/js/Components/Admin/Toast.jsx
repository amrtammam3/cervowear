import { useEffect } from 'react';

const TONE = {
  success: { bg: '#1e7d34', icon: <path d="M20 6L9 17l-5-5" /> },
  danger: { bg: '#a13333', icon: <path d="M6 6l12 12M18 6L6 18" /> },
};

// A brief, auto-dismissing confirmation for admin actions (create / update
// / delete) — so the admin gets clear, professional feedback that
// something actually happened instead of the table just silently changing.
export default function Toast({ message, tone = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [message, onDone]);

  const { bg, icon } = TONE[tone] || TONE.success;

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: bg, color: '#fff', boxShadow: 'var(--shadow-lg)', fontSize: 13.5, fontWeight: 600, maxWidth: 360 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>{icon}</svg>
      {message}
    </div>
  );
}
