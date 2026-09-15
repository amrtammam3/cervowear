import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import ProductCard from '@/Components/Storefront/ProductCard';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { saleProducts } from '@/data/products';
import { useStore } from '@/lib/StoreContext';

export default function Sale() {
  const { products: allProducts } = useStore();
  const products = saleProducts(allProducts);
  const [email, setEmail] = useState('');
  const [notified, setNotified] = useState(false);

  function notifyMe(e) {
    e.preventDefault();
    setNotified(true);
  }

  return (
    <StorefrontLayout>
      <Head title="Sale — CERVOWEAR" />

      <div style={{ background: 'var(--color-accent-900)', color: 'var(--color-bg)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '56px 32px', textAlign: 'center' }}>
          <div className="card-kicker" style={{ color: 'var(--color-accent-300)', marginBottom: 10 }}>Limited Time</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(36px,6vw,64px)', letterSpacing: '-0.01em', lineHeight: 1 }}>THE SALE EDIT</div>
          <div style={{ fontSize: 14, opacity: 0.75, marginTop: 12, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
            {products.length > 0
              ? 'Marked-down pieces, while stock lasts. No code needed — prices are already reduced.'
              : "Nothing's on sale right now — but new promotions drop often. Be the first to know."}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 32 }}>
        {products.length > 0 ? (
          <>
            <div className="text-muted" style={{ fontSize: 13, marginBottom: 20 }}>{products.length} {products.length === 1 ? 'item' : 'items'} on sale</div>
            <div className="cw-store-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14 }}>
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        ) : (
          <div style={{ padding: '40px 0 64px', textAlign: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ margin: '0 auto', opacity: 0.4 }}>
              <path d="M20.6 12.6L12.6 20.6a2 2 0 0 1-2.8 0L3.4 14.2a2 2 0 0 1 0-2.8l8-8A2 2 0 0 1 12.8 3H19a2 2 0 0 1 2 2v6.2a2 2 0 0 1-.4 1.4z"></path>
              <circle cx="15.5" cy="8.5" r="1.2"></circle>
            </svg>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 18, marginTop: 16 }}>No live promotions at the moment</div>
            <div className="text-muted" style={{ fontSize: 14, marginTop: 6, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>Leave your email and we'll let you know the second a sale goes live.</div>

            {notified ? (
              <div className="text-muted" style={{ fontSize: 14, marginTop: 20 }}>Thanks — you're on the list.</div>
            ) : (
              <form onSubmit={notifyMe} style={{ display: 'flex', gap: 0, maxWidth: 340, margin: '20px auto 0', border: '1px solid var(--color-divider)' }}>
                <input required type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', padding: '10px 12px', fontSize: 13, color: 'var(--color-text)' }} />
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 0 }}>Notify Me</button>
              </form>
            )}

            <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={() => router.get('/shop')}>Shop New Arrivals</button>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
