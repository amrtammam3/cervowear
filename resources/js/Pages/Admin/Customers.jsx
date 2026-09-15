import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import ConfirmDialog from '@/Components/Admin/ConfirmDialog';
import CustomerDetailDialog from '@/Components/Admin/CustomerDetailDialog';
import Toast from '@/Components/Admin/Toast';
import AdminLayout from '@/Layouts/AdminLayout';
import { CUSTOMER_STATUSES, customerMetrics, lifecycleStatus } from '@/data/customers';
import { priceLabel } from '@/data/products';
import { downloadCsv } from '@/lib/exportCsv';
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

// Pre-built segments — the one-click audiences a campaign actually needs,
// instead of making the admin hand-build a filter every time.
const SEGMENTS = [
  { label: 'VIP', test: (row) => row.status === 'VIP' },
  { label: 'At Risk', test: (row) => row.status === 'At Risk' },
  { label: 'New', test: (row) => row.status === 'New' },
  { label: 'Churned', test: (row) => row.status === 'Churned' },
];

function WhatsAppCampaignDialog({ recipients, excludedCount, onClose, onSent }) {
  const [message, setMessage] = useState('');

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title">WhatsApp Campaign</div>
        <div className="dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="text-muted" style={{ fontSize: 13 }}>Sending to <strong style={{ color: 'var(--color-text)' }}>{recipients.length}</strong> customer{recipients.length === 1 ? '' : 's'} with a phone number on file.</div>
          {excludedCount > 0 && (
            <div style={{ fontSize: 12.5, color: '#a1631a' }}>{excludedCount} selected customer{excludedCount === 1 ? '' : 's'} {excludedCount === 1 ? 'has' : 'have'} no phone number and will be skipped.</div>
          )}
          <div className="field" style={{ margin: 0 }}>
            <label>Message</label>
            <textarea className="input" rows={4} placeholder="e.g. Your favorite size is back in stock…" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div className="card-meta">No WhatsApp Business API is connected yet — this queues the campaign and exports the recipient list (name + phone) so it can be imported as a broadcast list.</div>
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!message.trim()} onClick={() => onSent(message)}>Queue Campaign</button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const { customers, orders, toggleCustomerBlocked } = useStore();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState(new Set());
  const [openCustomerId, setOpenCustomerId] = useState(null);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [toast, setToast] = useState(null);

  const rows = useMemo(() => customers.map((c) => {
    const metrics = customerMetrics(c.name, orders);
    return { ...c, ...metrics, status: lifecycleStatus(metrics) };
  }), [customers, orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (q && !(r.name.toLowerCase().includes(q) || (r.phone || '').includes(q))) return false;
      return true;
    });
  }, [rows, query, statusFilter]);

  const selectedRows = rows.filter((r) => selected.has(r.id));
  const whatsappEligible = selectedRows.filter((r) => r.phone);

  function toggleOne(id) {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((cur) => (cur.size === filtered.length ? new Set() : new Set(filtered.map((r) => r.id))));
  }

  function applySegment(seg) {
    setSelected(new Set(rows.filter(seg.test).map((r) => r.id)));
    setStatusFilter('All');
    setQuery('');
  }

  function exportSelected() {
    const list = selectedRows.length ? selectedRows : filtered;
    const header = ['Name', 'Phone', 'Source', 'Orders', 'Total Spent', 'Last Order', 'Status'];
    const data = list.map((r) => [r.name, r.phone, r.source, r.totalOrders, r.totalSpent, r.lastOrderDate || '', r.status]);
    downloadCsv(`cervowear-customers-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...data]);
  }

  function handleCampaignSent() {
    setCampaignOpen(false);
    const header = ['Name', 'Phone', 'Source', 'Status'];
    const data = whatsappEligible.map((r) => [r.name, r.phone, r.source, r.status]);
    downloadCsv(`cervowear-whatsapp-campaign-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...data]);
    setToast({ message: `Campaign queued for ${whatsappEligible.length} customer${whatsappEligible.length === 1 ? '' : 's'}.`, tone: 'success' });
    setSelected(new Set());
  }

  function blockSelected() {
    selectedRows.forEach((r) => { if (!r.blocked) toggleCustomerBlocked(r.id); });
    setToast({ message: `${selectedRows.length} customer${selectedRows.length === 1 ? '' : 's'} blocked.`, tone: 'danger' });
    setConfirmBlock(false);
    setSelected(new Set());
  }

  return (
    <AdminLayout title="Customers">
      <Head title="Customers — Admin — CERVOWEAR" />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input className="input" style={{ width: 240 }} placeholder="Search name or phone…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="input" style={{ width: 150 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All statuses</option>
            {CUSTOMER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <span className="text-muted" style={{ fontSize: 13 }}>{filtered.length} customer{filtered.length === 1 ? '' : 's'}</span>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <span className="card-kicker">Segments</span>
        {SEGMENTS.map((seg) => (
          <button key={seg.label} type="button" className="tag tag-outline" style={{ cursor: 'pointer' }} onClick={() => applySegment(seg)}>{seg.label} ({rows.filter(seg.test).length})</button>
        ))}
      </div>

      {selected.size > 0 && (
        <Blueprint className="card elev-sm" style={{ padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.size} selected</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={exportSelected}>Export CSV</button>
            <button className="btn btn-secondary" style={{ color: '#a13333' }} onClick={() => setConfirmBlock(true)}>Block</button>
            <button className="btn btn-primary" disabled={whatsappEligible.length === 0} onClick={() => setCampaignOpen(true)}>WhatsApp Campaign ({whatsappEligible.length} eligible)</button>
            <button className="btn btn-ghost" onClick={() => setSelected(new Set())}>Clear</button>
          </div>
        </Blueprint>
      )}

      <Blueprint className="card elev-sm" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 36 }}><input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleAll} /></th>
              <th>Name</th><th>Phone</th><th>Source</th><th>Orders</th><th>Total Spent</th><th>Last Order</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} /></td>
                <td style={{ fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setOpenCustomerId(r.id)}>
                  {r.name}
                  {r.blocked && <span className="tag" style={{ marginLeft: 8, color: '#a13333', borderColor: '#a13333', fontWeight: 600 }}>Blocked</span>}
                </td>
                <td className="text-muted">{r.phone || '—'}</td>
                <td className="text-muted">{r.source}</td>
                <td>{r.totalOrders}</td>
                <td>{priceLabel(r.totalSpent)}</td>
                <td className="text-muted">{r.lastOrderDate || '—'}</td>
                <td><StatusBadge status={r.status} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-muted" style={{ textAlign: 'center', padding: '32px 0' }}>No customers match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </Blueprint>

      {openCustomerId && <CustomerDetailDialog customerId={openCustomerId} onClose={() => setOpenCustomerId(null)} />}
      {campaignOpen && (
        <WhatsAppCampaignDialog
          recipients={whatsappEligible}
          excludedCount={selectedRows.length - whatsappEligible.length}
          onClose={() => setCampaignOpen(false)}
          onSent={handleCampaignSent}
        />
      )}
      {confirmBlock && (
        <ConfirmDialog
          title="Block selected customers?"
          message={`${selectedRows.length} customer${selectedRows.length === 1 ? '' : 's'} will be flagged as blocked. This doesn't delete their history and can be undone from their profile.`}
          confirmLabel="Block"
          danger
          onConfirm={blockSelected}
          onCancel={() => setConfirmBlock(false)}
        />
      )}
      {toast && <Toast message={toast.message} tone={toast.tone} onDone={() => setToast(null)} />}
    </AdminLayout>
  );
}
