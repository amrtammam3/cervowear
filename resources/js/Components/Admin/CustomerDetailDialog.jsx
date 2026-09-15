import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import OrderDetailPanel from '@/Components/Admin/OrderDetailPanel';
import { allOrdersForCustomer, customerMetrics, defaultGovernorate, lifecycleStatus, preferredAttributes, whatsappLinkFor } from '@/data/customers';
import { CONVERSATIONS } from '@/data/orders';
import { priceLabel } from '@/data/products';
import { useStore } from '@/lib/StoreContext';

const STATUS_TONE = {
  Lead: { bg: 'var(--color-surface)', fg: 'var(--color-text)' },
  New: { bg: 'var(--color-accent-100)', fg: 'var(--color-accent-800)' },
  Active: { bg: 'var(--color-accent-2-100)', fg: 'var(--color-accent-2-800)' },
  VIP: { bg: '#f5e9c8', fg: '#8a6d1a' },
  'At Risk': { bg: '#fff4e0', fg: '#a1631a' },
  Churned: { bg: '#fbe9e9', fg: '#a13333' },
};

function StatusBadge({ status }) {
  const tone = STATUS_TONE[status] || STATUS_TONE.Lead;
  return <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', background: tone.bg, color: tone.fg, display: 'inline-block' }}>{status}</span>;
}

function InfoRow({ label, children, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, fontSize: 13, padding: '7px 0', borderBottom: '1px solid var(--color-divider)' }}>
      <span className="text-muted">{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontWeight: 600, textAlign: 'right' }}>{children}</span>
        {action}
      </span>
    </div>
  );
}

const iconLinkStyle = { width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-divider)', color: 'var(--color-accent-700)', background: 'none', cursor: 'pointer', flex: 'none' };

function IconLink({ label, href, onClick, children }) {
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} style={iconLinkStyle}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} style={iconLinkStyle}>
      {children}
    </button>
  );
}

// The Customer 360 view — same shape whether it's opened from the
// Customers table or (eventually) the Unified Inbox sidebar: identity,
// real computed LTV/order metrics, lifecycle status, buying preferences,
// internal notes, and full order history with drill-in.
export default function CustomerDetailDialog({ customerId, onClose }) {
  const { customers, orders, addCustomerNote, toggleCustomerBlocked, updateCustomer } = useStore();
  const customer = customers.find((c) => c.id === customerId);
  const [note, setNote] = useState('');
  const [openOrderId, setOpenOrderId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  if (!customer) return null;

  const metrics = customerMetrics(customer.name, orders);
  const status = lifecycleStatus(metrics);
  const prefs = preferredAttributes(customer.name, orders);
  const governorate = defaultGovernorate(customer.name, orders);
  const history = allOrdersForCustomer(customer.name, orders).slice().sort((a, b) => b.date.localeCompare(a.date));
  const conversation = CONVERSATIONS.find((c) => c.customerName === customer.name);
  const openOrder = orders.find((o) => o.id === openOrderId) || null;

  function submitNote() {
    if (!note.trim()) return;
    addCustomerNote(customer.id, note);
    setNote('');
  }

  function startEdit() {
    setEditForm({ name: customer.name, phone: customer.phone || '', instagram: customer.instagram || '', email: customer.email || '' });
    setEditing(true);
  }

  function saveEdit() {
    if (!editForm.name.trim()) return;
    updateCustomer(customer.id, editForm);
    setEditing(false);
  }

  return (
    <>
      <div className="dialog-backdrop" onClick={onClose}>
        <div className="dialog" style={{ width: 'min(640px, 94vw)', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
          <div className="dialog-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {customer.name}
              {customer.blocked && <span className="tag" style={{ color: '#a13333', borderColor: '#a13333' }}>Blocked</span>}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!editing && <button type="button" className="btn btn-ghost" style={{ fontSize: 12.5 }} onClick={startEdit}>Edit</button>}
              <button className="btn btn-icon btn-secondary" aria-label="Close" onClick={onClose}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>
              </button>
            </div>
          </div>

          {customer.blocked && (
            <div style={{ margin: '0 var(--space-4)', padding: '8px 12px', background: '#fbe9e9', color: '#a13333', fontSize: 12.5 }}>
              This customer is blocked — new orders and messages should be handled with caution.
            </div>
          )}

          <div className="dialog-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div className="card-kicker" style={{ marginBottom: 4 }}>Identity</div>

              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
                  <div className="field" style={{ margin: 0 }}>
                    <label>Full name</label>
                    <input className="input" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <label>Phone</label>
                    <input className="input" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <label>Instagram</label>
                    <input className="input" value={editForm.instagram} onChange={(e) => setEditForm((f) => ({ ...f, instagram: e.target.value }))} />
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <label>Email</label>
                    <input className="input" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                  {editForm.name.trim() !== customer.name && (
                    <div className="card-meta">Renaming relinks all of this customer's existing orders and returns to the new name.</div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditing(false)}>Cancel</button>
                    <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={saveEdit} disabled={!editForm.name.trim()}>Save</button>
                  </div>
                </div>
              ) : (
                <>
                  <InfoRow
                    label="Phone"
                    action={customer.phone && <IconLink label="Message on WhatsApp" href={whatsappLinkFor(customer.phone, `Hi ${customer.name.split(' ')[0]}, `)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.14-1.35A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm0 18.2c-1.6 0-3.16-.43-4.52-1.24l-.32-.19-3.05.8.82-2.97-.21-.31a8.18 8.18 0 0 1-1.26-4.29c0-4.53 3.69-8.2 8.24-8.2 4.53 0 8.2 3.67 8.2 8.2 0 4.53-3.67 8.2-8.9 8.2z"></path></svg>
                    </IconLink>}
                  >
                    {customer.phone || <span className="text-muted">Not on file</span>}
                  </InfoRow>
                  <InfoRow
                    label="Instagram"
                    action={conversation && <IconLink label="Open in Unified Inbox" onClick={() => router.get(`/admin/inbox?customer=${encodeURIComponent(customer.name)}`)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"></path></svg>
                    </IconLink>}
                  >
                    {customer.instagram || '—'}
                  </InfoRow>
                  <InfoRow label="Status"><StatusBadge status={status} /></InfoRow>
                  <InfoRow label="Customer Since">{customer.since || '—'}</InfoRow>
                  <InfoRow label="Source">{customer.source}</InfoRow>
                  <InfoRow label="Governorate">{governorate || <span className="text-muted">Unknown</span>}</InfoRow>

                  <div className="card-kicker" style={{ margin: '18px 0 4px' }}>Buying Behavior</div>
                  <InfoRow label="Total Orders">{metrics.totalOrders}</InfoRow>
                  <InfoRow label="Total Spent (LTV)">{priceLabel(metrics.totalSpent)}</InfoRow>
                  <InfoRow label="Avg. Order Value">{metrics.totalOrders ? priceLabel(metrics.aov) : '—'}</InfoRow>
                  <InfoRow label="Last Order">{metrics.lastOrderDate || '—'}</InfoRow>
                  <InfoRow label="Usual Size">{prefs.size || '—'}</InfoRow>
                  <InfoRow label="Usual Color">{prefs.color || '—'}</InfoRow>

                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    {conversation && (
                      <Link href={`/admin/inbox?customer=${encodeURIComponent(customer.name)}`} className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>Open in Inbox</Link>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCustomerBlocked(customer.id)}
                    style={{ marginTop: 14, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, color: '#a13333', textDecoration: 'underline' }}
                  >
                    {customer.blocked ? 'Unblock customer' : 'Block / blacklist customer'}
                  </button>
                </>
              )}
            </div>

            <div>
              <div className="card-kicker" style={{ marginBottom: 8 }}>Internal Notes</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input className="input" placeholder="e.g. Prefers delivery after 5pm" value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitNote()} />
                <button type="button" className="btn btn-secondary" onClick={submitNote} disabled={!note.trim()}>Add</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 120, overflowY: 'auto', marginBottom: 18 }}>
                {customer.notes.length === 0 && <div className="text-muted" style={{ fontSize: 12.5 }}>No notes yet.</div>}
                {customer.notes.map((n) => (
                  <div key={n.id} style={{ fontSize: 12.5, padding: '6px 8px', background: 'var(--color-surface)' }}>
                    <div>{n.text}</div>
                    <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>{n.date}</div>
                  </div>
                ))}
              </div>

              <div className="card-kicker" style={{ marginBottom: 8 }}>Order History</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                {history.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className="blueprint"
                    style={{ padding: '8px 10px', textAlign: 'left', cursor: 'pointer', background: 'none' }}
                    onClick={() => setOpenOrderId(o.id)}
                  >
                    <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                      <span style={{ fontWeight: 600 }}>{o.id}</span>
                      <span className="tag tag-outline">{o.status}</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: 12, marginTop: 3 }}>{o.date} · {o.items.length} item{o.items.length === 1 ? '' : 's'} · {priceLabel(o.total)}</div>
                  </button>
                ))}
                {history.length === 0 && <div className="text-muted" style={{ fontSize: 12.5 }}>No orders yet.</div>}
              </div>
            </div>
          </div>

          <div className="dialog-actions">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      {openOrder && <OrderDetailPanel order={openOrder} onClose={() => setOpenOrderId(null)} allowReturnRequest={false} />}
    </>
  );
}
