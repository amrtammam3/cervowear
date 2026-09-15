import { Link, router } from '@inertiajs/react';
import { whatsappHref } from '@/Components/Storefront/WhatsAppButton';

function shopLink(category) {
  return (e) => { e.preventDefault(); router.get('/shop', { category }); };
}

const SOCIALS = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="18" height="18" rx="5"></rect>
        <circle cx="12" cy="12" r="4"></circle>
        <circle cx="17.2" cy="6.8" r="1"></circle>
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.6 3c.4 2.2 2 3.8 4.4 4v3c-1.6 0-3.1-.5-4.4-1.4v6.8a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v3.1a2.6 2.6 0 1 0 1.9 2.5V3h2.8z"></path>
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: whatsappHref(),
    external: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.14-1.35A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm4.5 14.06c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.41 1.02 2.58.12.17 1.75 2.67 4.24 3.74.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z"></path>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <div style={{ position: 'relative', background: 'var(--color-accent-900)', color: 'var(--color-bg)', marginTop: 20, overflow: 'hidden' }}>
      <div
        className="cw-footer-watermark"
        aria-hidden="true"
        style={{
          position: 'absolute', left: '50%', bottom: -40, transform: 'translateX(-50%)',
          fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '13vw', lineHeight: 1,
          letterSpacing: '-0.02em', whiteSpace: 'nowrap', color: 'transparent',
          WebkitTextStroke: '1px color-mix(in srgb, var(--color-bg) 10%, transparent)',
          pointerEvents: 'none', userSelect: 'none',
        }}
      >
        CERVOWEAR
      </div>

      <div style={{ position: 'relative', maxWidth: 1400, margin: '0 auto', padding: '48px 32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(34px,6vw,64px)', letterSpacing: '-0.01em', color: 'var(--color-accent-300)', lineHeight: 1 }}>
              CERVOWEAR<span style={{ fontSize: '0.4em', verticalAlign: 'top' }}>®</span>
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 15, letterSpacing: '0.03em', opacity: 0.85, marginTop: 6, textTransform: 'uppercase' }}>
              Tailored for every version of her.
            </div>
          </div>
          <div>
            <div className="card-kicker" style={{ color: 'var(--color-bg)', opacity: 0.6, marginBottom: 8, textAlign: 'right' }}>Follow Us</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target={s.external ? '_blank' : undefined} rel={s.external ? 'noopener noreferrer' : undefined} aria-label={s.label} title={s.label} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid color-mix(in srgb, var(--color-bg) 35%, transparent)', color: 'var(--color-bg)' }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="cw-store-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 24, marginTop: 40 }}>
          <div className="cw-store-footer-newsletter">
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 10 }}>Sign up for new arrivals and offers.</div>
            <div style={{ display: 'flex', gap: 0, border: '1px solid color-mix(in srgb, var(--color-bg) 35%, transparent)', maxWidth: 420 }}>
              <input placeholder="E-mail" style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', color: 'var(--color-bg)', padding: '10px 12px', fontSize: 13 }} />
              <button className="btn btn-icon" style={{ border: 'none', borderLeft: '1px solid color-mix(in srgb, var(--color-bg) 35%, transparent)', background: 'transparent', color: 'var(--color-bg)' }} aria-label="Subscribe">→</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 4 }}>Shop</div>
            <a href="#" onClick={shopLink('New In')} style={{ color: 'var(--color-bg)', opacity: 0.85, fontSize: 13.5 }}>New In</a>
            <a href="#" onClick={shopLink('Bags')} style={{ color: 'var(--color-bg)', opacity: 0.85, fontSize: 13.5 }}>Bags</a>
            <a href="#" onClick={shopLink('Accessoires')} style={{ color: 'var(--color-bg)', opacity: 0.85, fontSize: 13.5 }}>Accessoires</a>
            <Link href="/sale" style={{ color: 'var(--color-bg)', opacity: 0.85, fontSize: 13.5 }}>Sale</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 4 }}>Support</div>
            <Link href="/faq" style={{ color: 'var(--color-bg)', opacity: 0.85, fontSize: 13.5 }}>FAQ</Link>
            <Link href="/returns" style={{ color: 'var(--color-bg)', opacity: 0.85, fontSize: 13.5 }}>Returns &amp; Exchanges</Link>
            <Link href="/contact" style={{ color: 'var(--color-bg)', opacity: 0.85, fontSize: 13.5 }}>Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
