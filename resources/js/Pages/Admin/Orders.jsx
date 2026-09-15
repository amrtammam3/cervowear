import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import OrderDetailPanel from '@/Components/Admin/OrderDetailPanel';
import AdminLayout from '@/Layouts/AdminLayout';
import { CHANNELS, ORDER_STATUSES, itemsSummary, orderTotalLabel } from '@/data/orders';
import { downloadCsv } from '@/lib/exportCsv';
import { useStore } from '@/lib/StoreContext';

export default function Orders() {
  const { orders, updateOrderStatus } = useStore();
  const [statusFilter, setStatusFilter] = useState('All');
  const [channelFilter, setChannelFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const selected = orders.find((o) => o.id === selectedId) || null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'All' && o.status !== statusFilter) return false;
      if (channelFilter !== 'All' && o.channel !== channelFilter) return false;
      if (q && !(o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [orders, statusFilter, channelFilter, search]);

  function exportOrders() {
    const header = ['Order', 'Date', 'Customer', 'Phone', 'Channel', 'Items', 'Total (EGP)', 'Payment', 'Status', 'Address'];
    const rows = filtered.map((o) => [
      o.id, o.date, o.customerName, o.shipping?.phone || '', o.channel, itemsSummary(o), o.total, o.payment, o.status,
      o.shipping ? `${o.shipping.address}, ${o.shipping.city}` : '',
    ]);
    downloadCsv(`cervowear-orders-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows]);
  }

  return (
    <AdminLayout title="Orders">
      <Head title="Orders — Admin — CERVOWEAR" />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="input" style={{ width: 220 }} placeholder="Search order # or customer…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input" style={{ width: 150 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All statuses</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input" style={{ width: 150 }} value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}>
            <option value="All">All channels</option>
            {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="text-muted" style={{ fontSize: 13 }}>{filtered.length} order{filtered.length === 1 ? '' : 's'}</span>
          <button className="btn btn-secondary" onClick={exportOrders}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M12 3v12M7 10l5 5 5-5"></path><path d="M4 21h16"></path></svg>
            Export CSV
          </button>
        </div>
      </div>

      <Blueprint className="card elev-sm" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Channel</th><th>Items</th><th style={{ textAlign: 'right' }}>Total</th><th>Payment</th><th>Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedId(o.id)}>
                <td style={{ fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{o.id}</td>
                <td>{o.customerName}</td>
                <td><span className="tag tag-outline">{o.channel}</span></td>
                <td className="text-muted" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{itemsSummary(o)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{orderTotalLabel(o)}</td>
                <td className="text-muted">{o.payment}</td>
                <td className="text-muted">{o.date}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select className="input" style={{ minHeight: 30, padding: '2px 8px', fontSize: 12.5, width: 140 }} value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)}>
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-muted" style={{ textAlign: 'center', padding: '32px 0' }}>No orders match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </Blueprint>

      {selected && <OrderDetailPanel order={selected} onClose={() => setSelectedId(null)} />}
    </AdminLayout>
  );
}
