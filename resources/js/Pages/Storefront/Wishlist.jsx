import { Head, router } from '@inertiajs/react';
import ProductCard from '@/Components/Storefront/ProductCard';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { getProduct } from '@/data/products';
import { useStore } from '@/lib/StoreContext';

export default function Wishlist() {
  const { favoriteIds, products: allProducts } = useStore();
  const products = favoriteIds.map((id) => getProduct(id, allProducts)).filter(Boolean);

  return (
    <StorefrontLayout>
      <Head title="Wishlist — CERVOWEAR" />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 32 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(26px,3.4vw,40px)', letterSpacing: '-0.01em' }}>Wishlist</div>
        <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{products.length} {products.length === 1 ? 'item' : 'items'}</div>

        {products.length === 0 ? (
          <div style={{ padding: '72px 0', textAlign: 'center' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ margin: '0 auto', opacity: 0.4 }}>
              <path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-9.3a5 5 0 0 0 0-7.1z"></path>
            </svg>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 18, marginTop: 16 }}>Your wishlist is empty</div>
            <div className="text-muted" style={{ fontSize: 14, marginTop: 6 }}>Tap the heart on anything you love to save it here.</div>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => router.get('/shop')}>Start Browsing</button>
          </div>
        ) : (
          <div className="cw-store-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14, marginTop: 24 }}>
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
