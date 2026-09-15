import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import OrderDetailPanel from '@/Components/Admin/OrderDetailPanel';
import AdminLayout from '@/Layouts/AdminLayout';
import { RETURN_STATUSES } from '@/data/orders';
import { priceLabel } from '@/data/products';
import { downloadCsv } from '@/lib/exportCsv';
import { useStore } from '@/lib/StoreContext';

const STATUS_TONE = {
  Requested: { bg: 'var(--color-accent-100)', fg: 'var(--color-accent-800)' },
  Approved: { bg: 'var(--color-accent-2-100)', fg: 'var(--color-accent-2-800)' },
  Rejected: { bg: '#fbe9e9', fg: '#a13333' },
  Completed: { bg: '#e6f4ea', fg: '#1e7d34' },
};

function StatusBadge({ status }) {
  const tone = STATUS_TONE[status] || STATUS_TONE.Requested;
  return <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', background: tone.bg, color: tone.fg, display: 'inline-block' }}>{status}</span>;
}

export default function Returns() {
  const { orders, returns, updateReturnStatus } = useStore();
  const [statusFilter, setStatusFilter] = useState('All');
  const [openOrderId, setOpenOrderId] = useState(null);

  const filtered = useMemo(
    () => (statusFilter === 'All' ? returns : returns.filter((r) => r.status === statusFilter)),
    [returns, statusFilter],
  );

  const openOrder = orders.find((o) => o.id === openOrderId) || null;

  function exportReturns() {
    const header = ['Request', 'Order', 'Customer', 'Type', 'Item', 'Exchange For', 'Reason', 'Note', 'Settlement', 'Amount', 'Date', 'Status'];
    const rows = filtered.map((r) => [
      r.id,
      r.orderId,
      r.customerName,
      r.type,
      r.item ? `${r.item.qty}x ${r.item.name} (${r.item.variantLabel})` : '',
      r.exchangeFor ? `${r.exchangeFor.name} (${r.exchangeFor.variantLabel})` : '',
      r.reason,
      r.note,
      r.settlement?.direction || '',
      r.settlement ? priceLabel(r.settlement.amount) : '',
      r.date,
      r.status,
    ]);
    downloadCsv(`cervowear-returns-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows]);
  }

  return (
    <AdminLayout title="Returns & Exchanges">
      <Head title="Returns & Exchanges — Admin — CERVOWEAR" />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <select className="input" style={{ width: 170 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All statuses</option>
          {RETURN_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="text-muted" style={{ fontSize: 13 }}>{filtered.length} request{filtered.length === 1 ? '' : 's'}</span>
          <button className="btn btn-secondary" onClick={exportReturns}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M12 3v12M7 10l5 5 5-5"></path><path d="M4 21h16"></path></svg>
            Export CSV
          </button>
        </div>
      </div>

      <Blueprint className="card elev-sm" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr><th>Request</th><th>Order</th><th>Customer</th><th>Type</th><th>Item</th><th>Reason</th><th>Settlement</th><th>Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>{r.id}</td>
                <td>
                  <button className="btn btn-ghost" style={{ padding: 0, fontSize: 13, textDecoration: 'underline' }} onClick={() => setOpenOrderId(r.orderId)}>{r.orderId}</button>
                </td>
                <td>{r.customerName}</td>
                <td><span className="tag tag-outline">{r.type}</span></td>
                <td style={{ fontSize: 12.5 }}>
                  {r.item ? (
                    <>
                      <div>{r.item.qty}× {r.item.name} <span className="text-muted">({r.item.variantLabel})</span></div>
                      {r.exchangeFor && <div className="text-muted">→ {r.exchangeFor.name} ({r.exchangeFor.variantLabel})</div>}
                    </>
                  ) : <span className="text-muted">—</span>}
                </td>
                <td className="text-muted">{r.reason}{r.note ? ` — ${r.note}` : ''}</td>
                <td style={{ fontSize: 12.5 }}>
                  {r.settlement ? (
                    <span style={{ fontWeight: 600, color: r.settlement.direction === 'Refund to customer' ? '#a13333' : r.settlement.direction === 'Customer pays' ? '#1e7d34' : 'inherit' }}>
                      {r.settlement.direction}{r.settlement.amount ? ` · ${priceLabel(r.settlement.amount)}` : ''}
                    </span>
                  ) : <span className="text-muted">—</span>}
                </td>
                <td className="text-muted">{r.date}</td>
                <td>
                  <select className="input" style={{ minHeight: 30, padding: '2px 8px', fontSize: 12.5, width: 140 }} value={r.status} onChange={(e) => updateReturnStatus(r.id, e.target.value)}>
                    {RETURN_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="text-muted" style={{ textAlign: 'center', padding: '32px 0' }}>No return or exchange requests.</td></tr>
            )}
          </tbody>
        </table>
      </Blueprint>

      {openOrder && <OrderDetailPanel order={openOrder} onClose={() => setOpenOrderId(null)} allowReturnRequest={false} />}
    </AdminLayout>
  );
}
