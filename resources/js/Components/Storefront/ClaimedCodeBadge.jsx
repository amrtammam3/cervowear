import { useEffect, useState } from 'react';
import { CLAIMED_CODE_KEY } from '@/Components/Storefront/ExitIntentPopup';

// A quiet reminder that follows browsing after someone claims a code from
// the exit-intent popup — so the promise made there ("it'll apply itself
// at checkout") stays visible instead of being forgotten the moment the
// popup closes. Reads sessionStorage fresh on every page load; disappears
// the instant checkout actually redeems the code (or the visitor closes it).
export default function ClaimedCodeBadge() {
  const [code, setCode] = useState(null);

  useEffect(() => {
    setCode(sessionStorage.getItem(CLAIMED_CODE_KEY));
  }, []);

  if (!code) return null;

  return (
    <div
      style={{
        position: 'fixed', left: 20, bottom: 20, zIndex: 90,
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--color-text)', color: 'var(--color-bg)',
        padding: '10px 14px', fontSize: 12.5, fontWeight: 600,
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <span aria-hidden="true">🎁</span>
      <span><strong style={{ letterSpacing: '0.03em' }}>{code}</strong> will apply at checkout</span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => { sessionStorage.removeItem(CLAIMED_CODE_KEY); setCode(null); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, padding: 0, marginLeft: 4, display: 'flex' }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>
      </button>
    </div>
  );
}
