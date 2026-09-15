import { useState } from 'react';
import Blueprint from '@/Components/Blueprint';
import ImageSlot from '@/Components/ImageSlot';
import CreateReturnDialog from '@/Components/Admin/CreateReturnDialog';
import { ORDER_STATUSES, isDepositPayment, orderTotalLabel } from '@/data/orders';
import { priceLabel } from '@/data/products';
import { useStore } from '@/lib/StoreContext';

const STATUS_TONE = {
  New: { bg: 'var(--color-accent-100)', fg: 'var(--color-accent-800)' },
  Confirmed: { bg: 'var(--color-accent-100)', fg: 'var(--color-accent-700)' },
  Preparing: { bg: 'var(--color-neutral-200)', fg: 'var(--color-neutral-800)' },
  Shipped: { bg: 'var(--color-accent-2-100)', fg: 'var(--color-accent-2-800)' },
  Delivered: { bg: '#e6f4ea', fg: '#1e7d34' },
  Cancelled: { bg: '#fbe9e9', fg: '#a13333' },
};

function StatusBadge({ status }) {
  const tone = STATUS_TONE[status] || STATUS_TONE.New;
  return <span style={{ fontSize: 13, fontWeight: 700, padding: '5px 12px', background: tone.bg, color: tone.fg, display: 'inline-block' }}>{status}</span>;
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10, fontSize: 13, padding: '7px 0', borderBottom: '1px solid var(--color-divider)' }}>
      <span className="text-muted">{label}</span>
      <span style={{ fontWeight: 500 }}>{children}</span>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent-700)', marginBottom: 6 }}>{children}</div>;
}

// Shared between admin/Orders.jsx (click a row) and admin/Returns.jsx
// (click an order # to see what's actually being returned) — one place
// that knows how to render everything fulfillment needs to know about an
// order, so the two never drift into showing different information.
export default function OrderDetailPanel({ order, onClose, allowReturnRequest = true }) {
  const { updateOrderStatus, updateOrderShipping } = useStore();
  const [createReturnOpen, setCreateReturnOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ phone: order.shipping?.phone || '', address: order.shipping?.address || '', city: order.shipping?.city || '' });

  function saveAddress() {
    if (!addressForm.phone.trim() || !addressForm.address.trim() || !addressForm.city.trim()) return;
    updateOrderShipping(order.id, addressForm);
    setEditingAddress(false);
  }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'color-mix(in srgb, var(--color-text) 30%, transparent)' }} onClick={onClose}></div>
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(440px,100vw)', zIndex: 151, background: 'var(--color-bg)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-divider)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20 }}>{order.id}</div>
            <button className="btn btn-icon btn-secondary" aria-label="Close" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <StatusBadge status={order.status} />
            <span className="tag tag-outline">{order.channel}</span>
            <span className="text-muted" style={{ fontSize: 12.5 }}>{order.date}</span>
          </div>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <SectionLabel>Customer</SectionLabel>
            <Row label="Name">{order.customerName}</Row>
            <Row label="Phone">{order.shipping?.phone || <span className="text-muted">Not provided</span>}</Row>
            {order.shipping?.email && <Row label="Email">{order.shipping.email}</Row>}
          </div>

          <div>
            <SectionLabel>Shipping Address</SectionLabel>
            {editingAddress ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid var(--color-divider)', padding: 14 }}>
                <div className="field" style={{ margin: 0 }}>
                  <label>Phone</label>
                  <input className="input" value={addressForm.phone} onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Street Address</label>
                  <input className="input" value={addressForm.address} onChange={(e) => setAddressForm((f) => ({ ...f, address: e.target.value }))} />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>City / Governorate</label>
                  <input className="input" value={addressForm.city} onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingAddress(false)}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveAddress}>Save Address</button>
                </div>
              </div>
            ) : order.shipping?.address ? (
              <>
                <Row label="Address">{order.shipping.address}, {order.shipping.city}</Row>
                <button className="btn btn-ghost" style={{ padding: 0, fontSize: 12, marginTop: 6 }} onClick={() => setEditingAddress(true)}>Edit</button>
              </>
            ) : (
              <div style={{ fontSize: 13, padding: '12px 14px', background: 'var(--color-surface)', border: '1px solid var(--color-divider)' }}>
                <div className="text-muted" style={{ marginBottom: 10 }}>No address on file yet — confirm delivery details with {order.customerName} over {order.channel} before this order ships.</div>
                <button className="btn btn-primary btn-block" onClick={() => setEditingAddress(true)}>+ Add Delivery Address</button>
              </div>
            )}
          </div>

          <div>
            <SectionLabel>Payment</SectionLabel>
            <Row label="Method">{order.payment}</Row>
            {isDepositPayment(order.payment) && order.deposit && (
              <>
                <Row label="Deposit Paid">{priceLabel(order.deposit.amount)}</Row>
                <Row label="Due on Delivery">{priceLabel(Math.max(0, order.total - order.deposit.amount))}</Row>
              </>
            )}
          </div>

          {order.notes && (
            <div>
              <SectionLabel>Order Notes</SectionLabel>
              <div className="text-muted" style={{ fontSize: 13 }}>{order.notes}</div>
            </div>
          )}

          <div>
            <SectionLabel>Items</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {order.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Blueprint style={{ width: 44, height: 54, flex: 'none', overflow: 'hidden', position: 'relative' }}>
                    <ImageSlot src={it.image} placeholder="Product" />
                  </Blueprint>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{it.name}</div>
                    <div className="text-muted" style={{ fontSize: 11.5 }}>{it.variantLabel} · Qty {it.qty}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{priceLabel(it.price * it.qty)}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--color-divider)' }}>
              <span>Total</span><span>{orderTotalLabel(order)}</span>
            </div>
          </div>

          <div>
            <SectionLabel>Update Status</SectionLabel>
            <select className="input" value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)}>
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {allowReturnRequest && order.status === 'Delivered' && (
            <div>
              <SectionLabel>Returns &amp; Exchanges</SectionLabel>
              <button className="btn btn-secondary btn-block" onClick={() => setCreateReturnOpen(true)}>Request Return / Exchange</button>
            </div>
          )}
        </div>
      </div>

      {createReturnOpen && (
        <CreateReturnDialog
          customerName={order.customerName}
          orders={[order]}
          onClose={() => setCreateReturnOpen(false)}
          onCreated={() => setCreateReturnOpen(false)}
        />
      )}
    </>
  );
}
