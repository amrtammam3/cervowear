import { useEffect, useState } from 'react';

const WORD = 'CERVOWEAR';
const LETTER_DELAY = 45; // ms between each letter starting its fall
const FALL_DURATION = 750;
const HOLD = 350; // pause once landed, before the curtain lifts
const FADE_DURATION = 550;

// A one-time intro: the wordmark's letters drop in from above the viewport
// and land in place, then the whole curtain fades to reveal the page. Runs
// once per browser session (sessionStorage-gated) so it never replays on
// every navigation back to the homepage.
export default function IntroOverlay() {
  const alreadySeen = typeof window !== 'undefined' && sessionStorage.getItem('cw-intro-seen');
  // entering (letters above, invisible) -> landed (letters fall into place)
  // -> leaving (curtain fades) -> done (unmounted)
  const [phase, setPhase] = useState(alreadySeen ? 'done' : 'entering');

  useEffect(() => {
    if (phase !== 'entering') return undefined;
    const raf = requestAnimationFrame(() => setPhase('landed'));
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'landed') return undefined;
    const landTime = LETTER_DELAY * (WORD.length - 1) + FALL_DURATION;
    const t = setTimeout(() => setPhase('leaving'), landTime + HOLD);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'leaving') return undefined;
    const t = setTimeout(() => {
      sessionStorage.setItem('cw-intro-seen', '1');
      setPhase('done');
    }, FADE_DURATION);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'done') return null;

  const landed = phase === 'landed' || phase === 'leaving';

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'var(--color-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: phase === 'leaving' ? 0 : 1,
        transition: `opacity ${FADE_DURATION}ms cubic-bezier(0.4,0,0.2,1)`,
        pointerEvents: phase === 'leaving' ? 'none' : 'auto',
      }}
    >
      <div style={{ display: 'flex', overflow: 'hidden', padding: '0.2em 0' }}>
        {WORD.split('').map((ch, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-heading)', fontWeight: 600,
              fontSize: 'clamp(32px,6vw,64px)', letterSpacing: '-0.01em',
              color: 'var(--color-text)',
              transform: landed ? 'translateY(0)' : 'translateY(-140%)',
              opacity: landed ? 1 : 0,
              transition: `transform ${FALL_DURATION}ms cubic-bezier(0.16,1,0.3,1) ${i * LETTER_DELAY}ms, opacity ${FALL_DURATION * 0.6}ms ease-out ${i * LETTER_DELAY}ms`,
            }}
          >
            {ch}
          </span>
        ))}
      </div>
    </div>
  );
}
