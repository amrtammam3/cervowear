import { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import ImageSlot from '@/Components/ImageSlot';
import ProductCard from '@/Components/Storefront/ProductCard';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import {
  careCopyFor, detailsCopyFor, discountPercent, getProduct, isOneSize as isOneSizeProduct, oneSizeNote,
  priceLabel, relatedProducts, sizeChartFor, stockFor,
} from '@/data/products';
import { useStore } from '@/lib/StoreContext';

export default function Product({ id }) {
  const { addToCart, products, colorHex } = useStore();
  const product = getProduct(id, products) || products[0];

  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [careOpen, setCareOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const oneSize = isOneSizeProduct(product);
  const off = discountPercent(product);
  const chart = sizeChartFor(product);
  const related = useMemo(() => relatedProducts(products, product.id, 4), [products, product.id]);

  const sizes = product.sizes.map((sz, szi) => {
    const inStock = stockFor(product, colorIdx, szi) > 0;
    return { label: sz, selected: sz === size, inStock };
  });

  const canAddToCart = oneSize || !!size;
  const thumbs = [0, 1, 2, 3].map((i) => (product.images?.thumbs || [])[i] || null);

  function handleAdd() {
    if (!canAddToCart) return;
    addToCart(product.id, product.colors[colorIdx], oneSize ? 'One Size' : size);
  }

  return (
    <StorefrontLayout>
      <Head title={`${product.name} — CERVOWEAR`} />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 32 }}>
        <button className="btn btn-ghost" style={{ fontSize: 12, marginBottom: 20 }} onClick={() => router.get('/shop')}>← Back to Shop</button>
        <div className="cw-pdp-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,72px) minmax(0,1.1fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>

          <div className="cw-pdp-thumbs" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {thumbs.map((src, i) => (
              <Blueprint key={i} style={{ width: 72, height: 90, overflow: 'hidden', flex: 'none', position: 'relative' }}>
                <ImageSlot src={src} placeholder="Detail shot" />
              </Blueprint>
            ))}
          </div>

          <Blueprint className="cw-pdp-main" style={{ position: 'relative', height: 560 }}>
            <ImageSlot src={product.images?.main || product.images?.card} placeholder="Main product photo" />
          </Blueprint>

          {/* spec-sheet plate */}
          <Blueprint className="cw-pdp-plate" style={{ position: 'relative', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'color-mix(in srgb, var(--color-text) 68%, transparent)' }}>{product.category} — {product.sku}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(26px,3vw,36px)', lineHeight: 1.05, letterSpacing: '-0.01em', marginTop: 12 }}>{product.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: off ? 'var(--color-accent-800)' : 'var(--color-text)' }}>{priceLabel(product.price)}</span>
              {product.compareAtPrice && <span className="text-muted" style={{ fontSize: 15, textDecoration: 'line-through' }}>{priceLabel(product.compareAtPrice)}</span>}
              {off && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.02em', color: 'var(--color-bg)', background: 'var(--color-accent-800)', padding: '3px 8px' }}>-{off}% OFF</span>}
            </div>

            <div style={{ marginTop: 24 }}>
              <div className="card-kicker" style={{ marginBottom: 10 }}>Color</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {product.colors.map((c, i) => (
                  <button
                    key={c}
                    title={c}
                    onClick={() => { setColorIdx(i); setSize(null); }}
                    style={{ cursor: 'pointer', width: 30, height: 30, borderRadius: '50%', background: colorHex[c] || '#999', border: `2px solid ${i === colorIdx ? 'var(--color-accent-700)' : 'transparent'}`, boxShadow: '0 0 0 1px var(--color-divider) inset', padding: 0 }}
                  ></button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <div className="card-kicker">Size</div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, textDecoration: 'underline', color: 'color-mix(in srgb, var(--color-text) 68%, transparent)' }} onClick={() => setSizeGuideOpen(true)}>Size Guide</button>
              </div>
              {oneSize ? (
                <Blueprint style={{ padding: '10px 14px', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span className="tag tag-accent">One Size</span>
                  <span className="text-muted" style={{ fontSize: 12.5 }}>{oneSizeNote(product)}</span>
                </Blueprint>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {sizes.map((sz) => (
                    <button
                      key={sz.label}
                      className={`tag ${sz.selected ? 'tag-accent' : 'tag-outline'}`}
                      style={{ cursor: sz.inStock ? 'pointer' : 'not-allowed', minWidth: 34, textAlign: 'center', position: 'relative', opacity: sz.inStock ? 1 : 0.45 }}
                      disabled={!sz.inStock}
                      onClick={() => sz.inStock && setSize(sz.label)}
                    >
                      {sz.label}
                      {!sz.inStock && (
                        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                          <span style={{ width: '120%', height: 1, background: 'currentColor', transform: 'rotate(-18deg)' }}></span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} disabled={!canAddToCart} onClick={handleAdd}>Add to Bag</button>
              <button className="btn btn-secondary" style={{ flex: 1 }} disabled={!canAddToCart} onClick={handleAdd}>Buy It Now</button>
            </div>

            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column' }}>
              <div style={{ borderTop: '1px solid var(--color-divider)' }}>
                <button style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', padding: '14px 0', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14, letterSpacing: '0.02em', color: 'var(--color-text)' }} onClick={() => setDetailsOpen((v) => !v)}>
                  <span>01. Details</span>
                </button>
                {detailsOpen && (
                  <div className="text-muted" style={{ fontSize: 13.5, lineHeight: 1.5, paddingBottom: 16 }}>{detailsCopyFor(product)}</div>
                )}
              </div>
              <div style={{ borderTop: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)' }}>
                <button style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', padding: '14px 0', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14, letterSpacing: '0.02em', color: 'var(--color-text)' }} onClick={() => setCareOpen((v) => !v)}>
                  <span>02. Care</span>
                </button>
                {careOpen && (
                  <div className="text-muted" style={{ fontSize: 13.5, lineHeight: 1.5, paddingBottom: 16 }}>{careCopyFor(product)}</div>
                )}
              </div>
            </div>
          </Blueprint>
        </div>
      </div>

      {/* YOU MAY ALSO LIKE */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px 48px' }}>
        <div className="card-kicker" style={{ marginBottom: 16 }}>You May Also Like</div>
        <div className="cw-store-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14 }}>
          {related.map((rp) => (
            <div key={rp.id} style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => router.get(`/products/${rp.id}`)}>
              <Blueprint style={{ overflow: 'hidden', position: 'relative', height: 260 }}>
                <ImageSlot src={rp.images?.card || rp.images?.main} placeholder="Product photo" />
              </Blueprint>
              <div style={{ paddingTop: 10, fontSize: 13.5, fontWeight: 600, letterSpacing: '0.01em' }}>{rp.name}</div>
              <div className="text-muted" style={{ fontSize: 12.5, marginTop: 2 }}>{priceLabel(rp.price)}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {rp.colors.map((c) => (
                  <span key={c} style={{ width: 14, height: 14, borderRadius: '50%', background: colorHex[c] || '#999', boxShadow: '0 0 0 1px var(--color-divider) inset' }}></span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {sizeGuideOpen && (
        <div className="dialog-backdrop" onClick={() => setSizeGuideOpen(false)}>
          <div className="dialog" style={{ maxWidth: 520, background: 'var(--color-bg)' }} onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Size Guide</span>
              <button className="btn btn-icon btn-secondary" aria-label="Close" onClick={() => setSizeGuideOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>
              </button>
            </div>
            <div className="dialog-body">
              {chart && !oneSize ? (
                <>
                  <table className="table">
                    <thead><tr><th>Size</th>{chart.cols.map((col) => <th key={col}>{col} (cm)</th>)}</tr></thead>
                    <tbody>
                      {Object.keys(chart.rows).map((sz) => (
                        <tr key={sz}><td>{sz}</td>{chart.rows[sz].map((v, i) => <td key={i}>{v}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="card-meta" style={{ marginTop: 12 }}>Measurements are body measurements, not garment measurements. If between sizes, we recommend sizing up.</div>
                </>
              ) : (
                <div style={{ fontSize: 14, lineHeight: 1.6 }}>{oneSizeNote(product)}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </StorefrontLayout>
  );
}
