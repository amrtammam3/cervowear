import { useState } from 'react';
import { Head } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import { whatsappHref } from '@/Components/Storefront/WhatsAppButton';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  function submit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <StorefrontLayout>
      <Head title="Contact Us — CERVOWEAR" />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 32 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(26px,3.4vw,40px)', letterSpacing: '-0.01em' }}>Contact Us</div>
        <div className="text-muted" style={{ fontSize: 14, marginTop: 8, maxWidth: 480 }}>Questions about an order, sizing, or a collaboration? Reach out — we usually reply within one business day.</div>

        <div className="cw-contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 32, alignItems: 'start' }}>
          <Blueprint style={{ padding: '28px 24px' }}>
            {sent ? (
              <div style={{ padding: '30px 0', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20 }}>Thank you.</div>
                <div className="text-muted" style={{ fontSize: 14, marginTop: 8 }}>Your message has been received — we'll be in touch soon.</div>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="field">
                  <label htmlFor="contact-name">Name</label>
                  <input id="contact-name" className="input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="field">
                  <label htmlFor="contact-email">Email</label>
                  <input id="contact-email" className="input" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="field">
                  <label htmlFor="contact-message">Message</label>
                  <textarea id="contact-message" className="input" rows={5} required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Send Message</button>
              </form>
            )}
          </Blueprint>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div className="card-kicker" style={{ marginBottom: 8 }}>Customer Care</div>
              <div style={{ fontSize: 14, lineHeight: 1.7 }}>hello@cervowear.com<br />+20 100 000 1234</div>
            </div>
            <div>
              <div className="card-kicker" style={{ marginBottom: 8 }}>Prefer to Chat?</div>
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.14-1.35A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm4.5 14.06c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.41 1.02 2.58.12.17 1.75 2.67 4.24 3.74.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z"></path></svg>
                WhatsApp Us
              </a>
            </div>
            <div>
              <div className="card-kicker" style={{ marginBottom: 8 }}>Hours</div>
              <div style={{ fontSize: 14, lineHeight: 1.7 }}>Sunday – Thursday, 10am – 6pm (Cairo time)</div>
            </div>
            <div>
              <div className="card-kicker" style={{ marginBottom: 8 }}>Follow</div>
              <div style={{ display: 'flex', gap: 14, fontSize: 14 }}>
                <a href="#">Instagram</a><a href="#">TikTok</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
