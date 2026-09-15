import { useState } from 'react';
import ProductPicker from '@/Components/Admin/ProductPicker';
import { RETURN_REASONS, RETURN_TYPES } from '@/data/orders';
import { isOneSize, priceLabel } from '@/data/products';
import { useStore } from '@/lib/StoreContext';

// The actual business logic a return/exchange needs, whether it's filed
// from the Unified Inbox (customer messaged about it) or from an order's
// detail panel: which order, which item in it, is this a straight refund
// or a swap — and if it's a swap, does the customer owe more or get money
// back. Nothing about this should be guessable from a bare status list.
export default function CreateReturnDialog({ customerName, orders, onClose, onCreated }) {
  const { requestReturn } = useStore();
  const eligible = orders.filter((o) => o.status !== 'Cancelled');
  const [orderId, setOrderId] = useState(eligible[0]?.id || '');
  const order = eligible.find((o) => o.id === orderId) || null;
  const [itemIndex, setItemIndex] = useState(0);
  const [type, setType] = useState('Return');
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [note, setNote] = useState('');
  const [exchangeProduct, setExchangeProduct] = useState(null);
  const [exchangeColor, setExchangeColor] = useState('');
  const [exchangeSize, setExchangeSize] = useState('');
  const [error, setError] = useState('');

  if (eligible.length === 0) {
    return (
      <div className="dialog-backdrop" onClick={onClose}>
        <div className="dialog" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-title">No Eligible Orders</div>
          <div className="dialog-body">{customerName} has no orders yet to return or exchange against.</div>
          <div className="dialog-actions"><button className="btn btn-secondary" onClick={onClose}>Close</button></div>
        </div>
      </div>
    );
  }

  const item = order?.items[itemIndex] || null;
  const originalValue = item ? item.price * item.qty : 0;

  function selectExchangeProduct(p) {
    setExchangeProduct(p);
    if (p) {
      setExchangeColor(p.colors[0]);
      setExchangeSize(isOneSize(p) ? 'One Size' : p.sizes[0]);
    }
  }

  const exchangeValue = exchangeProduct ? exchangeProduct.price * (item?.qty || 1) : 0;
  const diff = type === 'Exchange' ? exchangeValue - originalValue : -originalValue;
  // diff < 0 → owed to customer (refund); diff > 0 → customer owes more

  function submit() {
    if (!order || !item) { setError('Pick an order and item.'); return; }
    if (type === 'Exchange' && !exchangeProduct) { setError('Pick what they want instead.'); return; }

    const id = requestReturn({
      orderId: order.id,
      customerName,
      type,
      reason,
      note,
      item: { name: item.name, variantLabel: item.variantLabel, qty: item.qty, price: item.price },
      exchangeFor: type === 'Exchange' ? { name: exchangeProduct.name, variantLabel: `${exchangeColor} / ${exchangeSize}`, price: exchangeProduct.price } : null,
      settlement: { direction: diff > 0 ? 'Customer pays' : diff < 0 ? 'Refund to customer' : 'Even swap', amount: Math.abs(diff) },
    });
    onCreated(id);
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" style={{ maxWidth: 520, maxHeight: '88vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Return / Exchange — {customerName}</span>
          <button className="btn btn-icon btn-secondary" aria-label="Close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>
          </button>
        </div>
        <div className="dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {eligible.length > 1 && (
            <div className="field" style={{ margin: 0 }}>
              <label>Which order?</label>
              <select className="input" value={orderId} onChange={(e) => { setOrderId(e.target.value); setItemIndex(0); }}>
                {eligible.map((o) => <option key={o.id} value={o.id}>{o.id} — {o.date} — {priceLabel(o.total)}</option>)}
              </select>
            </div>
          )}

          {order && (
            <div className="field" style={{ margin: 0 }}>
              <label>Which item?</label>
              <select className="input" value={itemIndex} onChange={(e) => setItemIndex(Number(e.target.value))}>
                {order.items.map((it, i) => <option key={i} value={i}>{it.qty}× {it.name} ({it.variantLabel}) — {priceLabel(it.price * it.qty)}</option>)}
              </select>
            </div>
          )}

          <div className="seg">
            {RETURN_TYPES.map((t) => (
              <label key={t} className="seg-opt">
                <input type="radio" name="ret-type" checked={type === t} onChange={() => setType(t)} />
                <span>{t}</span>
              </label>
            ))}
          </div>

          {type === 'Exchange' && (
            <div>
              <div className="card-kicker" style={{ marginBottom: 8 }}>Exchange For</div>
              <ProductPicker value={exchangeProduct} onSelect={selectExchangeProduct} />
              {exchangeProduct && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                  <div className="field" style={{ margin: 0 }}>
                    <label>Color</label>
                    <select className="input" value={exchangeColor} onChange={(e) => setExchangeColor(e.target.value)}>
                      {exchangeProduct.colors.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <label>Size</label>
                    {isOneSize(exchangeProduct) ? (
                      <input className="input" value="One Size" disabled />
                    ) : (
                      <select className="input" value={exchangeSize} onChange={(e) => setExchangeSize(e.target.value)}>
                        {exchangeProduct.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="field" style={{ margin: 0 }}>
            <label>Reason</label>
            <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
              {RETURN_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label>Note (optional)</label>
            <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {item && (type !== 'Exchange' || exchangeProduct) && (
            <div style={{ padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', fontSize: 13, fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              <span>{diff > 0 ? 'Customer pays extra' : diff < 0 ? 'Refund to customer' : 'No balance due'}</span>
              <span>{diff !== 0 ? priceLabel(Math.abs(diff)) : '—'}</span>
            </div>
          )}

          {error && <div style={{ fontSize: 12.5, color: '#a13333' }}>{error}</div>}
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Submit Request</button>
        </div>
      </div>
    </div>
  );
}
