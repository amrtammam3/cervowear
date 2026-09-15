import { Head, Link } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { whatsappHref } from '@/Components/Storefront/WhatsAppButton';

const STEPS = [
  { n: '01', title: 'Request', body: 'Contact us on WhatsApp or email with your order number within 14 days of delivery.' },
  { n: '02', title: 'Send It Back', body: 'Pack the item unworn, with tags attached, in its original packaging.' },
  { n: '03', title: 'Get Refunded', body: 'Once received and inspected, your refund or exchange is processed within 3–5 business days.' },
];

const FAQ_ITEMS = [
  { q: 'How long do I have to return an item?', a: '14 days from the delivery date, as long as it is unworn, unwashed, and still has its original tags.' },
  { q: 'Can I exchange for a different size?', a: 'Yes — request an exchange the same way as a return and let us know the size you need. Subject to availability.' },
  { q: 'Are sale items returnable?', a: 'Sale items can be exchanged for a different size but are final sale for refunds, unless faulty.' },
  { q: 'Who pays for return shipping?', a: 'Return shipping is on us for faulty or incorrect items. For change-of-mind returns, shipping is covered by the customer.' },
];

export default function Returns() {
  return (
    <StorefrontLayout>
      <Head title="Returns & Exchanges — CERVOWEAR" />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 32 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(26px,3.4vw,40px)', letterSpacing: '-0.01em' }}>Returns &amp; Exchanges</div>
        <div className="text-muted" style={{ fontSize: 14, marginTop: 8, maxWidth: 520 }}>Not quite right? You have 14 days from delivery to return or exchange it — here's how.</div>

        <div className="cw-returns-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16, marginTop: 32 }}>
          {STEPS.map((s) => (
            <Blueprint key={s.n} style={{ padding: '24px 20px' }}>
              <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent-700)', fontSize: 22 }}>{s.n}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 16, marginTop: 8 }}>{s.title}</div>
              <div className="text-muted" style={{ fontSize: 13.5, marginTop: 6, lineHeight: 1.5 }}>{s.body}</div>
            </Blueprint>
          ))}
        </div>

        <div style={{ marginTop: 48, maxWidth: 720 }}>
          <div className="card-kicker" style={{ marginBottom: 16 }}>Common Questions</div>
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} style={{ padding: '16px 0', borderTop: '1px solid var(--color-divider)' }}>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>{item.q}</div>
              <div className="text-muted" style={{ fontSize: 13.5, marginTop: 6, lineHeight: 1.5 }}>{item.a}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href={whatsappHref('a return')} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Start a Return on WhatsApp</a>
          <Link href="/contact" className="btn btn-secondary">Contact Support</Link>
        </div>
      </div>
    </StorefrontLayout>
  );
}
