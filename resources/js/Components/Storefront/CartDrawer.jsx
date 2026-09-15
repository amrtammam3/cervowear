import { useRef } from 'react';
import { router } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import ImageSlot from '@/Components/ImageSlot';
import { featuredProducts, isOneSize, priceLabel } from '@/data/products';
import { useStore } from '@/lib/StoreContext';

export default function CartDrawer() {
  const { cartOpen, closeCart, cartLines, cartSubtotal, cartSubtotalLabel, setQty, removeItem, addToCart, products, siteOffers } = useStore();
  const railRef = useRef(null);
  if (!cartOpen) return null;
  const hasItems = cartLines.length > 0;
  const suggestions = hasItems ? [] : featuredProducts(products, 6);
  const { freeShippingBar } = siteOffers;
  const remaining = Math.max(0, freeShippingBar.threshold - cartSubtotal);
  const qualifies = remaining === 0;
  const progressPct = freeShippingBar.threshold ? Math.min(100, (cartSubtotal / freeShippingBar.threshold) * 100) : 100;

  function continueShopping() {
    closeCart();
    router.get('/shop');
  }

  function goProduct(id) {
    closeCart();
    router.get(`/products/${id}`);
  }

  function quickAdd(p) {
    if (isOneSize(p)) addToCart(p.id, p.colors[0], 'One Size');
    else goProduct(p.id);
  }

  function scrollRail(dir) {
    railRef.current?.scrollBy({ left: dir * 160, behavior: 'smooth' });
  }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'color-mix(in srgb, var(--color-text) 30%, transparent)' }} onClick={closeCart}></div>
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(420px,100vw)', zIndex: 151, background: 'var(--color-bg)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottom: '1px solid var(--color-divider)' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em' }}>Your Cart</div>
          <button className="btn btn-icon btn-secondary" aria-label="Close" onClick={closeCart}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>
          </button>
        </div>

        {hasItems && freeShippingBar.enabled && (
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-divider)' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>
              {qualifies ? "You've unlocked free shipping! 🎉" : `You're ${priceLabel(remaining)} away from free shipping!`}
            </div>
            <div style={{ height: 5, background: 'var(--color-divider)' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: qualifies ? '#1e7d34' : 'var(--color-accent-700)', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
          {hasItems ? cartLines.map((ci) => (
            <div key={ci.key} style={{ display: 'flex', gap: 14, padding: '18px 0', borderBottom: '1px solid var(--color-divider)' }}>
              <Blueprint style={{ width: 80, height: 96, flex: 'none', overflow: 'hidden', position: 'relative' }}>
                <ImageSlot src={ci.image} placeholder="Product photo" />
              </Blueprint>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{ci.name}</div>
                  <div style={{ textAlign: 'right', flex: 'none' }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{ci.priceLabel}</div>
                    {ci.hasCompareAt && <div className="text-muted" style={{ fontSize: 12, textDecoration: 'line-through' }}>{ci.compareAtLabel}</div>}
                  </div>
                </div>
                <div className="text-muted" style={{ fontSize: 12.5 }}>{ci.variantLabel}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-divider)' }}>
                    <button style={{ width: 28, height: 28, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }} onClick={() => setQty(ci.key, ci.qty - 1)}>−</button>
                    <span style={{ width: 28, textAlign: 'center', fontSize: 13 }}>{ci.qty}</span>
                    <button style={{ width: 28, height: 28, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }} onClick={() => setQty(ci.key, ci.qty + 1)}>+</button>
                  </div>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--color-accent-700)', textDecoration: 'underline' }} onClick={() => removeItem(ci.key)}>Remove</button>
                </div>
              </div>
            </div>
          )) : (
            <div style={{ padding: '40px 0 8px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(24px,6vw,30px)', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>Your Bag Is Empty</div>
              <div className="text-muted" style={{ fontSize: 13, marginTop: 8 }}>Looks like you haven't added anything yet.</div>
              <button className="btn btn-primary" style={{ marginTop: 20, padding: '12px 28px', textTransform: 'uppercase', letterSpacing: '0.04em' }} onClick={continueShopping}>Continue Shopping</button>

              {suggestions.length > 0 && (
                <div style={{ marginTop: 44, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div className="card-kicker">You May Also Like</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-icon btn-secondary" aria-label="Previous" style={{ width: 26, height: 26 }} onClick={() => scrollRail(-1)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"></path></svg>
                      </button>
                      <button className="btn btn-icon btn-secondary" aria-label="Next" style={{ width: 26, height: 26 }} onClick={() => scrollRail(1)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"></path></svg>
                      </button>
                    </div>
                  </div>
                  <div ref={railRef} style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 4, marginRight: -20 }}>
                    {suggestions.map((p) => (
                      <div key={p.id} style={{ flex: '0 0 132px', scrollSnapAlign: 'start' }}>
                        <Blueprint style={{ width: 132, height: 158, overflow: 'hidden', position: 'relative', cursor: 'pointer' }} onClick={() => goProduct(p.id)}>
                          <ImageSlot src={p.images?.card || p.images?.main} placeholder="Product photo" />
                        </Blueprint>
                        <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 8, lineHeight: 1.3 }}>{p.name}</div>
                        <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{priceLabel(p.price)}</div>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--color-accent-700)', textDecoration: 'underline' }} onClick={() => quickAdd(p)}>
                          {isOneSize(p) ? 'Add to Cart' : 'Select Size'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {hasItems && (
          <div style={{ padding: 20, borderTop: '1px solid var(--color-divider)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 600 }}>
              <span>Total</span><span>{cartSubtotalLabel}</span>
            </div>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>Taxes and shipping calculated at checkout.</div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={() => { closeCart(); router.get('/checkout'); }}>Checkout</button>
          </div>
        )}
      </div>
    </>
  );
}
