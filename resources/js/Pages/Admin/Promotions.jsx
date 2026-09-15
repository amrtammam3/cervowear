import { useState } from 'react';
import { Head } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import DiscountCodeFormDialog from '@/Components/Admin/DiscountCodeFormDialog';
import Toast from '@/Components/Admin/Toast';
import AdminLayout from '@/Layouts/AdminLayout';
import { discountStatus, discountValueLabel, revenueForCode } from '@/data/promotions';
import { priceLabel } from '@/data/products';
import { useStore } from '@/lib/StoreContext';

const STATUS_TONE = {
  Active: { bg: '#e6f4ea', fg: '#1e7d34' },
  Scheduled: { bg: 'var(--color-accent-100)', fg: 'var(--color-accent-800)' },
  Expired: { bg: 'var(--color-surface)', fg: 'color-mix(in srgb, var(--color-text) 55%, transparent)' },
  Inactive: { bg: '#fbe9e9', fg: '#a13333' },
};

function StatusBadge({ status }) {
  const tone = STATUS_TONE[status];
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', background: tone.bg, color: tone.fg, display: 'inline-block' }}>{status}</span>;
}

function Toggle({ on, onClick }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} onClick={onClick}
      style={{ width: 38, height: 22, flex: 'none', border: '1px solid var(--color-divider)', borderRadius: 999, position: 'relative', cursor: 'pointer', background: on ? 'var(--color-accent-700)' : 'var(--color-surface)', transition: 'background 0.15s' }}
    >
      <span style={{ position: 'absolute', top: 1, left: on ? 17 : 1, width: 18, height: 18, borderRadius: '50%', background: 'var(--color-bg)', transition: 'left 0.15s' }}></span>
    </button>
  );
}

function ProgressBar({ value, max }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ width: 110 }}>
      <div style={{ height: 6, background: 'var(--color-divider)', position: 'relative' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-accent-700)' }}></div>
      </div>
      <div className="text-muted" style={{ fontSize: 11, marginTop: 3 }}>{value.toLocaleString()} / {max ? max.toLocaleString() : '∞'}</div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy code"
      title="Copy code"
      onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: copied ? '#1e7d34' : 'var(--color-accent-700)', display: 'inline-flex', alignItems: 'center' }}
    >
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"></path></svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="12" height="12" rx="1"></rect><path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg>
      )}
    </button>
  );
}

function DiscountCodesTab() {
  const { discountCodes, orders, toggleDiscountCodeEnabled } = useStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const rows = discountCodes.map((c) => ({ ...c, status: discountStatus(c), revenue: revenueForCode(c, orders) }));
  const filtered = rows.filter((r) => {
    if (filter !== 'All' && r.status !== filter) return false;
    if (query.trim() && !r.code.toLowerCase().includes(query.trim().toLowerCase())) return false;
    return true;
  });

  function openAdd() { setEditing(null); setFormOpen(true); }
  function openEdit(c) { setEditing(c); setFormOpen(true); }
  function handleSaved() {
    const wasEdit = !!editing;
    setFormOpen(false);
    setToast({ message: wasEdit ? 'Discount code updated.' : 'Discount code created.', tone: 'success' });
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input className="input" style={{ width: 220 }} placeholder="Search by code…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="seg">
            {['All', 'Active', 'Scheduled', 'Expired', 'Inactive'].map((f) => (
              <label key={f} className="seg-opt"><input type="radio" checked={filter === f} onChange={() => setFilter(f)} /><span>{f}</span></label>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Discount Code</button>
      </div>

      <Blueprint className="card elev-sm" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr><th>Code</th><th>Type &amp; Value</th><th>Usage</th><th>Revenue Generated</th><th>Validity</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                    {r.code}
                    <CopyButton text={r.code} />
                  </div>
                  {r.influencer && <div className="tag tag-outline" style={{ marginTop: 4, fontSize: 10.5 }}>Influencer: {r.influencer}</div>}
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{discountValueLabel(r)}</div>
                  {r.maxDiscount && <div className="text-muted" style={{ fontSize: 11.5 }}>Max {priceLabel(r.maxDiscount)}</div>}
                </td>
                <td><ProgressBar value={r.usageCount} max={r.usageLimit} /></td>
                <td style={{ fontWeight: 600 }}>{priceLabel(r.revenue)}</td>
                <td>
                  <div style={{ fontSize: 12.5 }}>{r.startDate} → {r.endDate}</div>
                  <div style={{ marginTop: 4 }}><StatusBadge status={r.status} /></div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost" style={{ padding: 0, fontSize: 12.5, textDecoration: 'underline' }} onClick={() => openEdit(r)}>Edit</button>
                    <Toggle on={r.enabled} onClick={() => toggleDiscountCodeEnabled(r.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-muted" style={{ textAlign: 'center', padding: '32px 0' }}>No discount codes match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </Blueprint>

      {formOpen && <DiscountCodeFormDialog code={editing} onClose={() => setFormOpen(false)} onSaved={handleSaved} />}
      {toast && <Toast message={toast.message} tone={toast.tone} onDone={() => setToast(null)} />}
    </>
  );
}

function OfferCard({ title, children }) {
  return (
    <Blueprint className="card elev-sm" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card-title">{title}</div>
      {children}
    </Blueprint>
  );
}

function OnSiteOffersTab() {
  const { siteOffers, updateSiteOffer, discountCodes } = useStore();
  const { announcementBar, exitPopup, freeShippingBar } = siteOffers;

  function addImage(e) {
    const file = e.target.files?.[0];
    if (file) updateSiteOffer('exitPopup', { image: URL.createObjectURL(file) });
    e.target.value = '';
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }} className="cw-promo-grid">
      <OfferCard title="Top Announcement Bar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="text-muted" style={{ fontSize: 13 }}>Shown above the navbar, site-wide</span>
          <Toggle on={announcementBar.enabled} onClick={() => updateSiteOffer('announcementBar', { enabled: !announcementBar.enabled })} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Message</label>
          <input className="input" value={announcementBar.message} onChange={(e) => updateSiteOffer('announcementBar', { message: e.target.value })} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Linked Discount Code (optional)</label>
          <select className="input" value={announcementBar.discountCode || ''} onChange={(e) => updateSiteOffer('announcementBar', { discountCode: e.target.value || null })}>
            <option value="">None</option>
            {discountCodes.map((c) => <option key={c.id} value={c.code}>{c.code}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Background</label>
            <input type="color" className="input" style={{ padding: 2, height: 36 }} value={announcementBar.bgColor} onChange={(e) => updateSiteOffer('announcementBar', { bgColor: e.target.value })} />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Text Color</label>
            <input type="color" className="input" style={{ padding: 2, height: 36 }} value={announcementBar.textColor} onChange={(e) => updateSiteOffer('announcementBar', { textColor: e.target.value })} />
          </div>
        </div>
        <div style={{ padding: '8px 12px', fontSize: 12.5, fontWeight: 600, textAlign: 'center', background: announcementBar.bgColor, color: announcementBar.textColor }}>
          {announcementBar.message || 'Preview'}
        </div>
      </OfferCard>

      <OfferCard title="Exit-Intent Pop-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="text-muted" style={{ fontSize: 13 }}>Fires once per visit, when the cursor moves to leave the page — never on checkout</span>
          <Toggle on={exitPopup.enabled} onClick={() => updateSiteOffer('exitPopup', { enabled: !exitPopup.enabled })} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Title</label>
          <input className="input" value={exitPopup.title} onChange={(e) => updateSiteOffer('exitPopup', { title: e.target.value })} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Subtitle</label>
          <input className="input" value={exitPopup.subtitle} onChange={(e) => updateSiteOffer('exitPopup', { subtitle: e.target.value })} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Discount Code Applied</label>
          <select className="input" value={exitPopup.discountCode || ''} onChange={(e) => updateSiteOffer('exitPopup', { discountCode: e.target.value || null })}>
            <option value="">None</option>
            {discountCodes.map((c) => <option key={c.id} value={c.code}>{c.code}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Promo Image</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {exitPopup.image ? (
              <div style={{ position: 'relative', width: 64, height: 78, flex: 'none', overflow: 'hidden' }}>
                <img src={exitPopup.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div className="text-muted" style={{ fontSize: 12 }}>Falls back to the brand hero photo.</div>
            )}
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              Upload
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={addImage} />
            </label>
          </div>
        </div>
      </OfferCard>

      <OfferCard title="Cart Free-Shipping Bar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="text-muted" style={{ fontSize: 13 }}>Shown inside the cart drawer</span>
          <Toggle on={freeShippingBar.enabled} onClick={() => updateSiteOffer('freeShippingBar', { enabled: !freeShippingBar.enabled })} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Free Shipping Threshold (EGP)</label>
          <input className="input" type="number" min="0" value={freeShippingBar.threshold} onChange={(e) => updateSiteOffer('freeShippingBar', { threshold: Number(e.target.value) || 0 })} />
        </div>
        <div className="card-meta">Example: "You're EGP 150 away from free shipping!" once the cart subtotal passes 0 but stays under the threshold.</div>
      </OfferCard>
    </div>
  );
}

export default function Promotions() {
  const [tab, setTab] = useState('codes');

  return (
    <AdminLayout title="Promotions">
      <Head title="Promotions — Admin — CERVOWEAR" />

      <div className="seg" style={{ marginBottom: 20, maxWidth: 360 }}>
        <label className="seg-opt"><input type="radio" checked={tab === 'codes'} onChange={() => setTab('codes')} /><span>Discount Codes</span></label>
        <label className="seg-opt"><input type="radio" checked={tab === 'offers'} onChange={() => setTab('offers')} /><span>On-Site Offers</span></label>
      </div>

      {tab === 'codes' ? <DiscountCodesTab /> : <OnSiteOffersTab />}
    </AdminLayout>
  );
}
