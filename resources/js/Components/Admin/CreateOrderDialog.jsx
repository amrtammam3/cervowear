import { useState } from 'react';
import ProductPicker from '@/Components/Admin/ProductPicker';
import { PAYMENT_METHODS, isDepositPayment } from '@/data/orders';
import { isOneSize, priceLabel } from '@/data/products';
import { useStore } from '@/lib/StoreContext';

const CITIES = ['Cairo', 'Giza', 'Alexandria', 'Other Governorate'];

// Used from the Unified Inbox's "+ Create Order" — the whole business
// reason a conversation carries a `channel`. A customer can DM a photo or
// a model number (it's printed on every product page) and the admin turns
// that straight into a real, fulfillable order — full address, phone, and
// deposit included — without the customer ever touching checkout.
export default function CreateOrderDialog({ customerName, customerPhone, channel, onClose, onCreated }) {
  const { placeOrder } = useStore();
  const [product, setProduct] = useState(null);
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [lines, setLines] = useState([]);
  const [payment, setPayment] = useState(PAYMENT_METHODS[0]);
  const [depositAmount, setDepositAmount] = useState('');
  const [contact, setContact] = useState({ phone: customerPhone || '', address: '', city: CITIES[0] });
  const [error, setError] = useState('');

  function selectProduct(p) {
    setProduct(p);
    if (p) {
      setColor(p.colors[0]);
      setSize(isOneSize(p) ? 'One Size' : p.sizes[0]);
    }
  }

  function addLine() {
    if (!product) return;
    setLines((cur) => [...cur, { productId: product.id, name: product.name, color, size, variantLabel: `${color} / ${size}`, qty: Math.max(1, qty), price: product.price, image: product.images?.card || product.images?.main || null }]);
    setProduct(null);
    setQty(1);
    setError('');
  }

  function removeLine(i) {
    setLines((cur) => cur.filter((_, idx) => idx !== i));
  }

  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const depositIsRequired = isDepositPayment(payment);

  function submit() {
    if (lines.length === 0) { setError('Add at least one item.'); return; }
    if (!contact.phone.trim()) { setError('Customer phone is required.'); return; }
    if (!contact.address.trim()) { setError('Delivery address is required.'); return; }
    if (depositIsRequired && (!depositAmount || Number(depositAmount) <= 0)) { setError('Enter the deposit amount received.'); return; }

    const id = placeOrder({
      customerName,
      channel,
      items: lines,
      payment,
      date: new Date().toISOString().slice(0, 10),
      status: 'Confirmed',
      shipping: { phone: contact.phone, address: contact.address, city: contact.city },
      deposit: depositIsRequired ? { amount: Number(depositAmount) } : null,
    });
    onCreated(id);
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" style={{ maxWidth: 540, maxHeight: '88vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Create Order — {customerName}</span>
          <button className="btn btn-icon btn-secondary" aria-label="Close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>
          </button>
        </div>
        <div className="dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="tag tag-outline" style={{ alignSelf: 'flex-start' }}>Taken over {channel}</div>

          <div>
            <div className="card-kicker" style={{ marginBottom: 8 }}>Items</div>

            <ProductPicker value={product} onSelect={selectProduct} />

            {product && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 8, alignItems: 'end', marginTop: 10 }}>
                <div className="field" style={{ margin: 0 }}>
                  <label>Color</label>
                  <select className="input" value={color} onChange={(e) => setColor(e.target.value)}>
                    {product.colors.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Size</label>
                  {isOneSize(product) ? (
                    <input className="input" value="One Size" disabled />
                  ) : (
                    <select className="input" value={size} onChange={(e) => setSize(e.target.value)}>
                      {product.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                </div>
                <div className="field" style={{ margin: 0, width: 70 }}>
                  <label>Qty</label>
                  <input className="input" type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
                </div>
                <button type="button" className="btn btn-secondary" onClick={addLine}>+ Add</button>
              </div>
            )}

            {lines.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--color-divider)', paddingTop: 10, marginTop: 12 }}>
                {lines.map((l, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span>{l.qty}× {l.name} <span className="text-muted">({l.variantLabel})</span></span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 600 }}>{priceLabel(l.price * l.qty)}</span>
                      <button type="button" className="btn btn-ghost" style={{ padding: 0, fontSize: 12 }} onClick={() => removeLine(i)}>Remove</button>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14, marginTop: 4 }}>
                  <span>Total</span><span>{priceLabel(total)}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="card-kicker" style={{ marginBottom: 8 }}>Delivery Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Phone</label>
                <input className="input" required value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>City</label>
                <select className="input" value={contact.city} onChange={(e) => setContact((c) => ({ ...c, city: e.target.value }))}>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Address</label>
              <input className="input" required value={contact.address} onChange={(e) => setContact((c) => ({ ...c, address: e.target.value }))} />
            </div>
          </div>

          <div>
            <div className="card-kicker" style={{ marginBottom: 8 }}>Payment</div>
            <select className="input" value={payment} onChange={(e) => setPayment(e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            {depositIsRequired && (
              <div className="field">
                <label>Deposit Amount Received (EGP)</label>
                <input className="input" type="number" min="1" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
                {lines.length > 0 && depositAmount && (
                  <div className="card-meta" style={{ marginTop: 6 }}>Remaining due on delivery: {priceLabel(Math.max(0, total - Number(depositAmount || 0)))}</div>
                )}
              </div>
            )}
          </div>

          {error && <div style={{ fontSize: 12.5, color: '#a13333' }}>{error}</div>}
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Create Order</button>
        </div>
      </div>
    </div>
  );
}
