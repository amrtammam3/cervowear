import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import ImageSlot from '@/Components/ImageSlot';
import { SITE_IMAGES } from '@/data/products';
import { discountValueLabel } from '@/data/promotions';
import { useStore } from '@/lib/StoreContext';

export const CLAIMED_CODE_KEY = 'cw-claimed-code';

// Fires once per page visit, only when the cursor actually leaves through
// the top of the viewport — the same signal desktop sites use for "about
// to close the tab / switch away", not a timer that interrupts someone
// mid-browse. Scoped to component state (not sessionStorage) so it's
// ready to trigger again on the next page the customer lands on, instead
// of going quiet for the rest of the browser session after the first
// dismissal. Never mounted on checkout (see StorefrontLayout) — popping
// this up while someone is already trying to pay would be the exact
// opposite of helpful.
export default function ExitIntentPopup() {
  const { siteOffers, discountCodes, checkDiscountCode, cartSubtotal } = useStore();
  const { exitPopup } = siteOffers;
  const [visible, setVisible] = useState(false);
  const [firedThisVisit, setFiredThisVisit] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (firedThisVisit || !exitPopup.enabled) return undefined;

    function fire() {
      setVisible(true);
      setFiredThisVisit(true);
    }

    // Desktop: the cursor leaving through the top of the viewport — the
    // same signal desktop sites use for "about to close the tab / switch
    // away".
    function onMouseLeave(e) {
      if (e.clientY <= 0) fire();
    }
    document.addEventListener('mouseleave', onMouseLeave);

    // Touch devices have no cursor, so there's no equivalent "about to
    // close" gesture to hook into. Reading scroll position itself is too
    // unreliable — a route change resets scroll on its own and can look
    // identical to a real swipe. Instead, watch the actual finger gesture:
    // a downward drag while already at the very top of the page — the same
    // motion (and the same place on the page) mobile browsers use for
    // pull-to-refresh, a much closer real analog to "leaving" than a
    // scroll-position side effect. Only armed on coarse-pointer (touch)
    // devices so it never doubles up with the desktop trigger above.
    if (!window.matchMedia('(pointer: coarse)').matches) return () => document.removeEventListener('mouseleave', onMouseLeave);

    let startY = null;
    function onTouchStart(e) {
      startY = window.scrollY <= 0 ? e.touches[0].clientY : null;
    }
    function onTouchMove(e) {
      if (startY == null) return;
      if (e.touches[0].clientY - startY > 70) fire();
    }
    function onTouchEnd() {
      startY = null;
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [firedThisVisit, exitPopup.enabled]);

  if (!visible || !exitPopup.enabled) return null;

  const codeCheck = exitPopup.discountCode ? checkDiscountCode(exitPopup.discountCode, cartSubtotal) : null;
  const codeObj = exitPopup.discountCode ? discountCodes.find((c) => c.code === exitPopup.discountCode) : null;
  const valueLabel = codeObj ? discountValueLabel(codeObj) : null;

  function claim() {
    if (exitPopup.discountCode) sessionStorage.setItem(CLAIMED_CODE_KEY, exitPopup.discountCode);
    setClaimed(true);
  }

  function startShopping() {
    setVisible(false);
    router.get('/shop');
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--color-text) 55%, transparent)', padding: 20 }} onClick={() => setVisible(false)}>
      <div
        style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', width: 'min(760px, 100%)', maxHeight: '90vh', background: 'var(--color-bg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}
        className="cw-exit-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button" aria-label="Close" onClick={() => setVisible(false)}
          style={{ position: 'absolute', top: 12, right: 12, zIndex: 1, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', border: '1px solid var(--color-divider)', cursor: 'pointer' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>
        </button>

        <div className="cw-exit-popup-image" style={{ position: 'relative', minHeight: 260 }}>
          <ImageSlot src={exitPopup.image || SITE_IMAGES.heroThumb} className="duotone" placeholder="Look" />
        </div>

        <div style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {claimed ? (
            <>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e6f4ea', color: '#1e7d34', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(22px,3vw,28px)', letterSpacing: '-0.01em', lineHeight: 1.15 }}>You're all set!</div>
              <div style={{ fontSize: 14, marginTop: 10, lineHeight: 1.55 }}>
                <strong style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.04em' }}>{exitPopup.discountCode}</strong> will apply automatically at checkout — no need to type it in.
              </div>
              <button className="btn btn-block" style={{ marginTop: 22, padding: '14px 0', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--color-text)', color: 'var(--color-bg)', border: 'none' }} onClick={startShopping}>Start Shopping</button>
            </>
          ) : (
            <>
              <span className="tag tag-accent" style={{ alignSelf: 'flex-start', marginBottom: 14 }}>Limited-time offer</span>

              {valueLabel ? (
                <>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(34px,5vw,46px)', letterSpacing: '-0.02em', lineHeight: 1 }}>{valueLabel}</div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14, marginTop: 8, letterSpacing: '0.01em' }}>{exitPopup.title}</div>
                </>
              ) : (
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(24px,3vw,32px)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>{exitPopup.title}</div>
              )}
              <div className="text-muted" style={{ fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>{exitPopup.subtitle}</div>

              {exitPopup.discountCode && (
                <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 10, border: '1.5px dashed var(--color-accent)', padding: '12px 14px', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 2 }}>Your code</div>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, letterSpacing: '0.05em' }}>{exitPopup.discountCode}</span>
                  </div>
                  {codeCheck?.ok && <span className="tag tag-accent" style={{ fontSize: 10.5 }}>Ready to use</span>}
                </div>
              )}

              <button className="btn btn-block" style={{ marginTop: 20, padding: '14px 0', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--color-text)', color: 'var(--color-bg)', border: 'none' }} onClick={claim}>
                {valueLabel ? `Claim My ${valueLabel}` : exitPopup.discountCode ? 'Claim & Shop' : 'Shop Now'}
              </button>
              <button type="button" onClick={() => setVisible(false)} style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)', textDecoration: 'underline', alignSelf: 'center' }}>Maybe later</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
