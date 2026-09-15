import { useState } from 'react';
import { router } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import ImageSlot from '@/Components/ImageSlot';
import { discountPercent, priceLabel } from '@/data/products';
import { useStore } from '@/lib/StoreContext';

export default function ProductCard({ product }) {
  const { favoriteIds, toggleFavorite } = useStore();
  const [hovered, setHovered] = useState(false);
  const isFavorite = favoriteIds.includes(product.id);
  const off = discountPercent(product);

  function open() {
    router.get(`/products/${product.id}`);
  }

  return (
    <Blueprint
      style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
      onClick={open}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3 / 4' }}>
        <ImageSlot src={product.images?.card} placeholder="Product photo" style={{ objectPosition: 'center 18%' }} />
        {hovered && product.images?.hover && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <ImageSlot src={product.images.hover} placeholder="Hover / alt photo" style={{ objectPosition: 'center 18%' }} />
          </div>
        )}
        <button
          className="btn btn-primary"
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            transform: hovered ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.25s ease',
          }}
          onClick={(e) => { e.stopPropagation(); open(); }}
        >
          Add to Cart
        </button>
        {product.isNew && <span style={{ position: 'absolute', top: 10, left: 10, background: 'var(--color-text)', color: 'var(--color-bg)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 8px' }}>New</span>}
        {product.isLimited && <span style={{ position: 'absolute', top: 10, right: 10, border: '1px solid var(--color-accent-700)', color: 'var(--color-accent-700)', background: 'var(--color-bg)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 8px' }}>Limited</span>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 10px 12px', gap: 8 }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '0.02em' }}>{product.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: off ? 'var(--color-accent-800)' : 'var(--color-text)' }}>{priceLabel(product.price)}</span>
            {product.compareAtPrice && <span className="text-muted" style={{ fontSize: 12, textDecoration: 'line-through' }}>{priceLabel(product.compareAtPrice)}</span>}
            {off && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.02em', color: 'var(--color-bg)', background: 'var(--color-accent-800)', padding: '2px 6px' }}>-{off}%</span>}
          </div>
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flex: 'none' }} onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }} aria-label="Favorite">
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-accent-700)' }}>
            <path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-9.3a5 5 0 0 0 0-7.1z"></path>
          </svg>
        </button>
      </div>
    </Blueprint>
  );
}
