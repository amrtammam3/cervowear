import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

const SECTIONS = [
  {
    label: 'Orders & Shipping',
    items: [
      { q: 'How long does delivery take?', a: 'Cairo & Giza: 1–2 business days. Rest of Egypt: 3–5 business days.' },
      { q: 'How much is shipping?', a: 'Flat rate shipping across Egypt. The exact fee shows at checkout before you pay.' },
      { q: 'Can I track my order?', a: 'Yes — you\'ll get a tracking link by SMS or WhatsApp once your order ships.' },
      { q: 'Do you ship outside Egypt?', a: 'Not yet — currently we only deliver within Egypt.' },
    ],
  },
  {
    label: 'Payment',
    items: [
      { q: 'What payment methods do you accept?', a: 'Cash on delivery, and major credit/debit cards.' },
      { q: 'Is it safe to pay online?', a: 'Yes, all card payments are processed through a secure, encrypted payment gateway.' },
    ],
  },
  {
    label: 'Sizing',
    items: [
      { q: 'How do I find my size?', a: 'Each product page has a Size Guide with measurements for that category.' },
      { q: 'What if I\'m between sizes?', a: 'We generally recommend sizing up for a more relaxed fit — check the product\'s specific notes too.' },
    ],
  },
  {
    label: 'Returns',
    items: [
      { q: 'What is your return policy?', a: '14 days from delivery on unworn items with tags attached. Full details on our Returns & Exchanges page.' },
    ],
  },
];

export default function Faq() {
  const [openKey, setOpenKey] = useState(null);

  return (
    <StorefrontLayout>
      <Head title="FAQ — CERVOWEAR" />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(26px,3.4vw,40px)', letterSpacing: '-0.01em' }}>Frequently Asked Questions</div>
        <div className="text-muted" style={{ fontSize: 14, marginTop: 8 }}>
          Can't find what you're looking for? <Link href="/contact" style={{ textDecoration: 'underline' }}>Contact us</Link>.
        </div>

        {SECTIONS.map((section) => (
          <div key={section.label} style={{ marginTop: 36 }}>
            <div className="card-kicker" style={{ marginBottom: 6 }}>{section.label}</div>
            {section.items.map((item) => {
              const key = `${section.label}|${item.q}`;
              const open = openKey === key;
              return (
                <div key={key} style={{ borderTop: '1px solid var(--color-divider)' }}>
                  <button
                    onClick={() => setOpenKey(open ? null : key)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: 'none', border: 'none', padding: '16px 0', cursor: 'pointer', textAlign: 'left', fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}
                  >
                    <span>{item.q}</span>
                    <span style={{ flex: 'none', fontSize: 18, lineHeight: 1 }}>{open ? '−' : '+'}</span>
                  </button>
                  {open && <div className="text-muted" style={{ fontSize: 13.5, lineHeight: 1.5, paddingBottom: 18 }}>{item.a}</div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </StorefrontLayout>
  );
}
