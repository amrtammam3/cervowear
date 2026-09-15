import { useState } from 'react';
import { Head } from '@inertiajs/react';
import CreateOrderDialog from '@/Components/Admin/CreateOrderDialog';
import CreateReturnDialog from '@/Components/Admin/CreateReturnDialog';
import AdminLayout from '@/Layouts/AdminLayout';
import { CONVERSATIONS } from '@/data/orders';
import { useStore } from '@/lib/StoreContext';

const FILTERS = ['All', 'Instagram', 'WhatsApp', 'Messenger', 'Unread'];

export default function Inbox({ customer = null }) {
  const { orders } = useStore();
  const [filter, setFilter] = useState('All');
  const preselected = customer ? CONVERSATIONS.find((c) => c.customerName === customer) : null;
  const [activeId, setActiveId] = useState(preselected?.id || CONVERSATIONS[0]?.id);
  const [draft, setDraft] = useState('');
  const [localMessages, setLocalMessages] = useState({});
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [createReturnOpen, setCreateReturnOpen] = useState(false);
  const [justCreated, setJustCreated] = useState(null);

  const list = CONVERSATIONS.filter((c) => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return c.unread;
    return c.channel === filter;
  });
  const active = CONVERSATIONS.find((c) => c.id === activeId) || list[0];
  const extraMessages = (active && localMessages[active.id]) || [];
  const customerOrders = active ? orders.filter((o) => o.customerName === active.customerName) : [];

  function sendReply() {
    if (!draft.trim() || !active) return;
    setLocalMessages((cur) => ({ ...cur, [active.id]: [...(cur[active.id] || []), { from: 'admin', text: draft.trim() }] }));
    setDraft('');
  }

  return (
    <AdminLayout title="Unified Inbox">
      <Head title="Unified Inbox — Admin — CERVOWEAR" />

      <div className="cw-inbox-grid" style={{ display: 'grid', gridTemplateColumns: '290px 1fr 290px', gap: 0, height: 'calc(100vh - 140px)', border: '1px solid var(--color-divider)' }}>
        <div style={{ borderRight: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 4, padding: 10, borderBottom: '1px solid var(--color-divider)', flexWrap: 'wrap' }}>
            {FILTERS.map((f) => (
              <button key={f} className={`tag ${filter === f ? 'tag-accent' : 'tag-outline'}`} style={{ cursor: 'pointer' }} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {list.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveId(c.id)}
                style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-divider)', cursor: 'pointer', background: active?.id === c.id ? 'var(--color-accent-100)' : 'transparent' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{c.customerName}</span>
                  <span style={{ fontSize: 11, color: 'color-mix(in srgb, var(--color-text) 50%, transparent)' }}>{c.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <span className="tag tag-outline" style={{ fontSize: 10 }}>{c.channel}</span>
                  {c.unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent)' }}></span>}
                </div>
                <div className="text-muted" style={{ fontSize: 12.5, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage}</div>
              </div>
            ))}
          </div>
        </div>

        {active && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, borderRight: '1px solid var(--color-divider)' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 17 }}>{active.customerName}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                    <span className="tag tag-outline">{active.channel}</span>
                    <span className="tag tag-neutral">{active.customer.status}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={() => setCreateOrderOpen(true)}>+ Create Order</button>
                  <button className="btn btn-secondary" onClick={() => setCreateReturnOpen(true)}>+ Create Return/Exchange</button>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...active.messages, ...extraMessages].map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.from === 'admin' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '75%', padding: '9px 13px', fontSize: 13.5, background: m.from === 'admin' ? 'var(--color-accent)' : 'var(--color-surface)', color: m.from === 'admin' ? 'var(--color-bg)' : 'var(--color-text)' }}>{m.text}</div>
                  </div>
                ))}
                {justCreated && (
                  <div style={{ alignSelf: 'center', fontSize: 12.5 }} className="text-muted">{justCreated} ✓</div>
                )}
              </div>
              <div style={{ padding: '14px 18px', borderTop: '1px solid var(--color-divider)', display: 'flex', gap: 8 }}>
                <input className="input" placeholder="Type a reply…" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReply()} />
                <button className="btn btn-primary btn-icon" onClick={sendReply}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l18-8-8 18-2-8-8-2z"></path></svg>
                </button>
              </div>
            </div>

            <div style={{ padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="card-kicker">Customer 360</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Phone</span><span>{active.customer.phone}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Instagram</span><span>{active.customer.instagram || '—'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Status</span><span className="tag tag-accent">{active.customer.status}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Customer Since</span><span>{active.customer.since}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Total Orders</span><span>{customerOrders.length}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Total Spent</span><span style={{ fontWeight: 600 }}>{active.customer.totalSpentLabel}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Last Order</span><span>{active.customer.lastOrder}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Source</span><span>{active.customer.source}</span></div>
              </div>
              <div className="hr"></div>
              <div className="card-kicker">Recent Orders</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {customerOrders.slice(0, 3).map((o) => (
                  <div key={o.id} className="blueprint" style={{ padding: '8px 10px' }}>
                    <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}><span>{o.id}</span><span className="tag tag-neutral">{o.status}</span></div>
                    <div className="text-muted" style={{ fontSize: 12.5, marginTop: 3 }}>{o.items.length} item{o.items.length === 1 ? '' : 's'} · EGP {o.total.toLocaleString()}</div>
                  </div>
                ))}
                {customerOrders.length === 0 && <div className="text-muted" style={{ fontSize: 12.5 }}>No previous orders — this would be their first.</div>}
              </div>
            </div>
          </>
        )}
      </div>

      {createOrderOpen && active && (
        <CreateOrderDialog
          customerName={active.customerName}
          customerPhone={active.customer.phone}
          channel={active.channel}
          onClose={() => setCreateOrderOpen(false)}
          onCreated={(id) => { setCreateOrderOpen(false); setJustCreated(`Order ${id} created`); }}
        />
      )}

      {createReturnOpen && active && (
        <CreateReturnDialog
          customerName={active.customerName}
          orders={customerOrders}
          onClose={() => setCreateReturnOpen(false)}
          onCreated={(id) => { setCreateReturnOpen(false); setJustCreated(`Return request ${id} filed`); }}
        />
      )}
    </AdminLayout>
  );
}
