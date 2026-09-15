import { Head, Link } from '@inertiajs/react';
import ImageSlot from '@/Components/ImageSlot';
import { useStore } from '@/lib/StoreContext';

// Deliberately bare — no navbar, no footer, no product info. Just the
// lookbook's photos and a way back. This is a lookbook, not a shop page.
export default function LookbookGallery({ collection: collectionName }) {
  const { lookbooks } = useStore();
  const lb = lookbooks.find((l) => l.name === collectionName) || null;
  const photos = lb?.images || [];
  const backHref = `/lookbook/${encodeURIComponent(collectionName)}`;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
      <Head title={`${lb?.name || 'Lookbook'} — CERVOWEAR`} />

      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-bg)', borderBottom: '1px solid var(--color-divider)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 15, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{lb?.name}</div>
        <Link href={backHref} style={{ fontSize: 13, fontWeight: 600, textDecoration: 'underline' }}>Close</Link>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        <div className="cw-lookbook-gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
          {photos.map((im) => (
            <div key={im.id} style={{ position: 'relative', height: 320, overflow: 'hidden' }}>
              <ImageSlot src={im.url} placeholder="Look" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
