import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import ImageSlot from '@/Components/ImageSlot';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { CLAIMED_CODE_KEY } from '@/Components/Storefront/ExitIntentPopup';
import { getProduct, priceLabel } from '@/data/products';
import { useStore } from '@/lib/StoreContext';

const PAYMENT_LABELS = { cod: 'Cash on Delivery', card: 'Card', vodafone: 'Vodafone Cash', instapay: 'InstaPay' };

function SummaryLines({ cartLines }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 360, overflowY: 'auto' }}>
      {cartLines.map((ci) => (
        <div key={ci.key} style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', width: 56, height: 68, flex: 'none', overflow: 'hidden', background: 'var(--color-surface)' }}>
            <ImageSlot src={ci.image} placeholder="Product" />
            <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--color-text)', color: 'var(--color-bg)', fontSize: 10, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ci.qty}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{ci.name}</div>
            <div className="text-muted" style={{ fontSize: 12 }}>{ci.variantLabel}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, flex: 'none' }}>{ci.priceLabel}</div>
        </div>
      ))}
    </div>
  );
}

function SummaryTotals({ cartSubtotal, shippingFee, appliedDiscount, total }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13.5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Subtotal</span><span>{priceLabel(cartSubtotal)}</span></div>
      {appliedDiscount && appliedDiscount.discount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1e7d34' }}><span>Discount ({appliedDiscount.code.code})</span><span>−{priceLabel(appliedDiscount.discount)}</span></div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="text-muted">Shipping</span>
        <span>{shippingFee === 0 ? <span style={{ color: '#1e7d34', fontWeight: 600 }}>Free</span> : priceLabel(shippingFee)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 600, marginTop: 6, paddingTop: 10, borderTop: '1px solid var(--color-divider)' }}><span>Total</span><span>{priceLabel(total)}</span></div>
    </div>
  );
}

function PromoCode({ appliedDiscount, onApply, onRemove }) {
  const [open, setOpen] = useState(!!appliedDiscount);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  function apply() {
    if (!code.trim()) return;
    const result = onApply(code);
    if (!result.ok) setMessage(result.error);
    else { setMessage(''); setCode(''); }
  }

  if (appliedDiscount) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--color-divider)', padding: '8px 12px', fontSize: 13 }}>
        <span>Code <strong>{appliedDiscount.code.code}</strong> applied</span>
        <button type="button" onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--color-accent-700)', textDecoration: 'underline' }}>Remove</button>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12.5, color: 'var(--color-accent-700)', textDecoration: 'underline' }}>
        Have a promo code?
      </button>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input className="input" style={{ minHeight: 34, padding: '6px 10px', fontSize: 13 }} placeholder="Enter discount code" value={code} onChange={(e) => { setCode(e.target.value); setMessage(''); }} onKeyDown={(e) => e.key === 'Enter' && apply()} />
        <button type="button" className="btn btn-secondary" style={{ minHeight: 34, padding: '6px 14px', fontSize: 13 }} onClick={apply}>Apply</button>
      </div>
      {message && <div style={{ fontSize: 12, marginTop: 6, color: '#a13333' }}>{message}</div>}
    </div>
  );
}

export default function Checkout() {
  const { cartItems, cartLines, cartSubtotal, clearCart, placeOrder, products, checkDiscountCode, shippingRates, paymentMethods } = useStore();
  const paymentOptions = [
    paymentMethods.codEnabled && { value: 'cod', label: PAYMENT_LABELS.cod },
    paymentMethods.cardEnabled && { value: 'card', label: PAYMENT_LABELS.card },
    paymentMethods.vodafoneCashEnabled && paymentMethods.vodafoneCashNumber && { value: 'vodafone', label: PAYMENT_LABELS.vodafone, instructions: `Send payment to ${paymentMethods.vodafoneCashNumber}, then enter the order notes at delivery.` },
    paymentMethods.instapayEnabled && paymentMethods.instapayNumber && { value: 'instapay', label: PAYMENT_LABELS.instapay, instructions: `Send payment to ${paymentMethods.instapayNumber}.` },
  ].filter(Boolean);
  const [payment, setPayment] = useState(paymentOptions[0]?.value || 'cod');
  const [placed, setPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', apartment: '', city: '', governorate: shippingRates[0]?.governorate || '' });
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  const hasItems = cartLines.length > 0;
  const shippingRateForGovernorate = shippingRates.find((r) => r.governorate === form.governorate)?.fee ?? (shippingRates[0]?.fee || 0);

  // A code claimed from the exit-intent popup rides through in
  // sessionStorage and applies itself here — the customer never has to
  // retype what they already agreed to grab.
  useEffect(() => {
    const claimed = sessionStorage.getItem(CLAIMED_CODE_KEY);
    if (claimed && hasItems) {
      const result = checkDiscountCode(claimed, cartSubtotal);
      if (result.ok) setAppliedDiscount(result);
      sessionStorage.removeItem(CLAIMED_CODE_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasItems]);

  function applyCode(codeStr) {
    const result = checkDiscountCode(codeStr, cartSubtotal);
    if (result.ok) setAppliedDiscount(result);
    return result;
  }

  const shippingFee = appliedDiscount?.freeShipping ? 0 : (hasItems ? shippingRateForGovernorate : 0);
  const discountAmount = appliedDiscount?.discount || 0;
  const total = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function submitOrder(e) {
    e.preventDefault();
    const items = cartItems.map((ci) => {
      const p = getProduct(ci.productId, products);
      return { productId: ci.productId, name: p.name, variantLabel: `${ci.color} / ${ci.size}`, color: ci.color, size: ci.size, qty: ci.qty, price: p.price, image: p.images?.card || p.images?.main || null };
    });
    const id = placeOrder({
      customerName: form.name,
      channel: 'Website',
      items,
      payment: PAYMENT_LABELS[payment],
      date: new Date().toISOString().slice(0, 10),
      notes: '',
      shipping: { phone: form.phone, email: form.email, address: `${form.address}${form.apartment ? `, ${form.apartment}` : ''}, ${form.city}`, city: form.governorate },
      discountCode: appliedDiscount?.code.code || null,
      discountAmount,
    });
    setOrderNumber(id);
    setPlaced(true);
    clearCart();
  }

  if (placed) {
    return (
      <StorefrontLayout minimal>
        <Head title="Order Confirmed — CERVOWEAR" />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(28px,4vw,40px)', letterSpacing: '-0.01em' }}>Thank You</div>
          <div className="text-muted" style={{ fontSize: 14, marginTop: 12 }}>Your order <strong style={{ color: 'var(--color-text)' }}>{orderNumber}</strong> has been placed. A confirmation will be sent to {form.email || 'your email'} shortly.</div>
          <button className="btn btn-primary" style={{ marginTop: 28 }} onClick={() => router.get('/shop')}>Continue Shopping</button>
        </div>
      </StorefrontLayout>
    );
  }

  if (!hasItems) {
    return (
      <StorefrontLayout minimal>
        <Head title="Checkout — CERVOWEAR" />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(24px,4vw,32px)', letterSpacing: '-0.01em' }}>Your Bag Is Empty</div>
          <div className="text-muted" style={{ fontSize: 14, marginTop: 10 }}>Add something to your bag before checking out.</div>
          <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => router.get('/shop')}>Shop Now</button>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout minimal>
      <Head title="Checkout — CERVOWEAR" />

      {/* MOBILE — collapsed total bar instead of the full summary, so the
          customer sees what they owe without scrolling past it first. */}
      <div className="cw-checkout-mobile-summary" style={{ display: 'none', position: 'sticky', top: 64, zIndex: 20, background: 'var(--color-bg)', borderBottom: '1px solid var(--color-divider)' }}>
        <button
          type="button"
          onClick={() => setMobileSummaryOpen((v) => !v)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ transform: mobileSummaryOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6"></path></svg>
            Order Summary ({cartLines.length} item{cartLines.length === 1 ? '' : 's'})
          </span>
          {!mobileSummaryOpen && <span style={{ fontWeight: 700, fontSize: 14.5 }}>{priceLabel(total)}</span>}
        </button>
        {mobileSummaryOpen && (
          <div style={{ padding: '0 20px 18px' }}>
            <SummaryLines cartLines={cartLines} />
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--color-divider)' }}>
              <SummaryTotals cartSubtotal={cartSubtotal} shippingFee={shippingFee} appliedDiscount={appliedDiscount} total={total} />
            </div>
            <div style={{ marginTop: 14 }}><PromoCode appliedDiscount={appliedDiscount} onApply={applyCode} onRemove={() => setAppliedDiscount(null)} /></div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 100px' }}>
        <form onSubmit={submitOrder} className="cw-checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 48, alignItems: 'start' }}>
          {/* DESKTOP — full summary card, sticky in the right column. Hidden
              on mobile in favor of the collapsed bar above. */}
          <Blueprint className="cw-checkout-summary" style={{ padding: '24px 22px', position: 'sticky', top: 88 }}>
            <div className="card-kicker" style={{ marginBottom: 16 }}>Order Summary</div>
            <SummaryLines cartLines={cartLines} />
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-divider)' }}>
              <SummaryTotals cartSubtotal={cartSubtotal} shippingFee={shippingFee} appliedDiscount={appliedDiscount} total={total} />
            </div>
            <div style={{ marginTop: 16 }}><PromoCode appliedDiscount={appliedDiscount} onApply={applyCode} onRemove={() => setAppliedDiscount(null)} /></div>
          </Blueprint>

          {/* FORM */}
          <div className="cw-checkout-form">
            <div className="card-kicker" style={{ marginBottom: 14 }}>Contact Information</div>
            <div className="field">
              <label htmlFor="co-email">Email address</label>
              <input id="co-email" className="input" type="email" autoComplete="email" required value={form.email} onChange={update('email')} />
            </div>

            <div className="card-kicker" style={{ margin: '28px 0 14px' }}>Delivery</div>
            <div className="field">
              <label htmlFor="co-name">Full name</label>
              <input id="co-name" className="input" autoComplete="name" required value={form.name} onChange={update('name')} />
            </div>
            <div className="field">
              <label htmlFor="co-address">Address</label>
              <input id="co-address" className="input" autoComplete="street-address" placeholder="Enter your street address" required value={form.address} onChange={update('address')} />
            </div>
            <div className="field">
              <label htmlFor="co-apartment">Apartment, suite, etc. (optional)</label>
              <input id="co-apartment" className="input" autoComplete="address-line2" placeholder="Apartment, suite, building number" value={form.apartment} onChange={update('apartment')} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="field">
                <label htmlFor="co-city">City</label>
                <input id="co-city" className="input" autoComplete="address-level2" placeholder="Enter your city name" required value={form.city} onChange={update('city')} />
              </div>
              <div className="field">
                <label htmlFor="co-gov">Governorate</label>
                <select id="co-gov" className="input" autoComplete="address-level1" value={form.governorate} onChange={update('governorate')}>
                  {shippingRates.map((r) => <option key={r.id} value={r.governorate}>{r.governorate}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="co-phone">Phone</label>
              <input id="co-phone" className="input" type="tel" inputMode="tel" autoComplete="tel" required value={form.phone} onChange={update('phone')} />
            </div>

            <div className="card-kicker" style={{ margin: '28px 0 14px' }}>Payment</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {paymentOptions.map((opt) => (
                <label key={opt.value}>
                  <div className="radio" style={{ border: '1px solid var(--color-divider)', padding: '12px 14px', cursor: 'pointer' }}>
                    <input type="radio" name="payment" checked={payment === opt.value} onChange={() => setPayment(opt.value)} />
                    <span className="dot"></span>
                    {opt.label}
                  </div>
                  {payment === opt.value && opt.instructions && (
                    <div className="card-meta" style={{ padding: '8px 14px 0' }}>{opt.instructions}</div>
                  )}
                </label>
              ))}
            </div>

            {/* Desktop submit — the mobile one is the sticky bar below. */}
            <button type="submit" className="btn btn-primary btn-block cw-checkout-submit-desktop" style={{ marginTop: 28, padding: '13px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Place Order</button>
          </div>
        </form>
      </div>

      {/* MOBILE — sticky CTA, always in view regardless of scroll position. */}
      <div className="cw-checkout-mobile-cta" style={{ display: 'none', position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 30, padding: 14, background: 'var(--color-bg)', borderTop: '1px solid var(--color-divider)' }}>
        <button type="button" className="btn btn-primary btn-block" style={{ padding: '13px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }} onClick={submitOrder}>
          Place Order
        </button>
      </div>
    </StorefrontLayout>
  );
}
