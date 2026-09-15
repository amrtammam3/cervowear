import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ImageSlot from '@/Components/ImageSlot';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { useStore } from '@/lib/StoreContext';

export default function LookbookDetail({ collection: collectionName }) {
  const { lookbooks } = useStore();
  const lb = lookbooks.find((l) => l.name === collectionName) || null;
  const photos = lb?.images || [];
  const [index, setIndex] = useState(0);

  if (!lb || photos.length === 0) {
    return (
      <StorefrontLayout>
        <Head title="Lookbook — CERVOWEAR" />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 24 }}>Look not found</div>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => router.get('/lookbook')}>Back to Lookbook</button>
        </div>
      </StorefrontLayout>
    );
  }

  const current = photos[index];

  function go(delta) {
    setIndex((i) => (i + delta + photos.length) % photos.length);
  }

  return (
    <StorefrontLayout>
      <Head title={`${lb.name} — Lookbook — CERVOWEAR`} />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 32px' }}>
        <Link href="/lookbook" className="btn btn-ghost" style={{ fontSize: 12, marginBottom: 20 }}>← Lookbook</Link>

        <div className="cw-lookbook-detail-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr', gap: 28, alignItems: 'start' }}>
          <div className="cw-lookbook-detail-meta">
            <div className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lookbook</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(24px,2.6vw,32px)', letterSpacing: '-0.01em', marginTop: 6 }}>{lb.name}</div>
            <div className="text-muted" style={{ fontSize: 13, marginTop: 10 }}>{photos.length} {photos.length === 1 ? 'look' : 'looks'}</div>
          </div>

          <div className="cw-lookbook-detail-thumbs" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
            {photos.map((im, i) => (
              <button
                key={im.id}
                onClick={() => setIndex(i)}
                style={{ position: 'relative', height: 150, overflow: 'hidden', padding: 0, border: i === index ? '2px solid var(--color-accent-700)' : 'none', cursor: 'pointer', background: 'none' }}
              >
                <ImageSlot src={im.url} placeholder="Look" />
              </button>
            ))}
          </div>

          <div className="cw-lookbook-detail-main">
            <div className="cw-lookbook-detail-photo" style={{ position: 'relative', height: 560, overflow: 'hidden' }}>
              <ImageSlot src={current.url} placeholder="Look" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="btn btn-icon btn-secondary" aria-label="Previous" onClick={() => go(-1)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 18l-6-6 6-6"></path></svg>
                </button>
                <span className="text-muted" style={{ fontSize: 13 }}>{index + 1} / {photos.length}</span>
                <button className="btn btn-icon btn-secondary" aria-label="Next" onClick={() => go(1)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18l6-6-6-6"></path></svg>
                </button>
              </div>
              <Link href={`/lookbook/${encodeURIComponent(lb.name)}/all`} style={{ fontSize: 13, fontWeight: 600, textDecoration: 'underline' }}>View all</Link>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
