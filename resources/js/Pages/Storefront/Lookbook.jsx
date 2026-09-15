import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ImageSlot from '@/Components/ImageSlot';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { useStore } from '@/lib/StoreContext';

function LookbookRow({ lb, onOpen }) {
  const [mIndex, setMIndex] = useState(0);
  const current = lb.images[mIndex];

  function stepMobile(e, dir) {
    e.stopPropagation();
    setMIndex((i) => (i + dir + lb.images.length) % lb.images.length);
  }

  return (
    <div className="cw-lookbook-row" style={{ borderBottom: '1px solid var(--color-divider)', cursor: 'pointer' }} onClick={() => onOpen(lb.name)}>
      <div className="cw-lookbook-row-inner" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', alignItems: 'center', padding: '18px 32px', gap: 20 }}>
        <div>
          <div className="cw-lookbook-row-title" style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 15, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{lb.name}</div>
          <div className="cw-lookbook-row-meta text-muted" style={{ fontSize: 12, marginTop: 4 }}>{lb.images.length} {lb.images.length === 1 ? 'piece' : 'pieces'}</div>
        </div>

        {/* Desktop: full horizontal filmstrip */}
        <div className="cw-lookbook-strip" style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {lb.images.map((im) => (
            <div key={im.id} className="cw-lookbook-thumb" style={{ flex: '0 0 140px', height: 176, position: 'relative', overflow: 'hidden', transition: 'transform 0.35s ease' }}>
              <ImageSlot src={im.url} placeholder="Look" />
            </div>
          ))}
        </div>

        {/* Mobile: one look at a time, same prev/next + counter pattern as the detail page */}
        <div className="cw-lookbook-row-mobile">
          <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
            <ImageSlot src={current?.url} placeholder="Look" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            {lb.images.length > 1 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button className="btn btn-icon btn-secondary" aria-label="Previous" onClick={(e) => stepMobile(e, -1)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 18l-6-6 6-6"></path></svg>
                </button>
                <span className="text-muted" style={{ fontSize: 12.5 }}>{mIndex + 1} / {lb.images.length}</span>
                <button className="btn btn-icon btn-secondary" aria-label="Next" onClick={(e) => stepMobile(e, 1)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18l6-6-6-6"></path></svg>
                </button>
              </div>
            ) : <span></span>}
            <Link href={`/lookbook/${encodeURIComponent(lb.name)}/all`} style={{ fontSize: 12.5, fontWeight: 600, textDecoration: 'underline' }} onClick={(e) => e.stopPropagation()}>View all</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Lookbook() {
  const { lookbooks } = useStore();

  function openGroup(name) {
    router.get(`/lookbook/${encodeURIComponent(name)}`);
  }

  return (
    <StorefrontLayout>
      <Head title="Lookbook — CERVOWEAR" />
      <div style={{ padding: '56px 32px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(48px,9vw,120px)', lineHeight: 0.95, letterSpacing: '-0.02em' }}>LOOKBOOK</div>
      </div>

      <div style={{ borderTop: '1px solid var(--color-divider)' }}>
        {lookbooks.filter((lb) => lb.images.length > 0).map((lb) => (
          <LookbookRow key={lb.id} lb={lb} onOpen={openGroup} />
        ))}
        {lookbooks.length === 0 && (
          <div className="text-muted" style={{ padding: '60px 32px', textAlign: 'center', fontSize: 14 }}>No lookbooks published yet.</div>
        )}
      </div>
    </StorefrontLayout>
  );
}
