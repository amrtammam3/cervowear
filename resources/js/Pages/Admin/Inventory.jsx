import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import AdminLayout from '@/Layouts/AdminLayout';
import { variantSku } from '@/data/products';
import { downloadCsv } from '@/lib/exportCsv';
import { useStore } from '@/lib/StoreContext';

const LOW_STOCK_THRESHOLD = 5;
const STATUS_FILTERS = ['All', 'In stock', 'Low stock', 'Out of stock'];

function statusFor(stock) {
  if (stock === 0) return 'Out of stock';
  if (stock < LOW_STOCK_THRESHOLD) return 'Low stock';
  return 'In stock';
}

const STATUS_TONE = {
  'In stock': { bg: 'var(--color-accent-100)', fg: 'var(--color-accent-800)' },
  'Low stock': { bg: '#fff4e0', fg: '#a1631a' },
  'Out of stock': { bg: '#fbe9e9', fg: '#a13333' },
};

export default function Inventory() {
  const { products, setVariantStock } = useStore();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const categoryOptions = useMemo(() => ['All', ...new Set(products.map((p) => p.category))], [products]);

  const rows = useMemo(() => {
    const list = [];
    products.forEach((p) => {
      p.colors.forEach((color, ci) => {
        p.sizes.forEach((size, si) => {
          const idx = ci * p.sizes.length + si;
          list.push({ productId: p.id, name: p.name, category: p.category, color, size, ci, si, stock: p.stocks[idx] || 0, sku: variantSku(p, color, size) });
        });
      });
    });
    return list;
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !(r.name.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q))) return false;
      if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && statusFor(r.stock) !== statusFilter) return false;
      return true;
    });
  }, [rows, query, categoryFilter, statusFilter]);

  const totalSkus = rows.length;
  const lowCount = rows.filter((r) => statusFor(r.stock) === 'Low stock').length;
  const outCount = rows.filter((r) => statusFor(r.stock) === 'Out of stock').length;

  function exportInventory() {
    const header = ['Product', 'Category', 'Color', 'Size', 'SKU', 'Stock', 'Status'];
    const data = filtered.map((r) => [r.name, r.category, r.color, r.size, r.sku, r.stock, statusFor(r.stock)]);
    downloadCsv(`cervowear-inventory-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...data]);
  }

  return (
    <AdminLayout title="Inventory">
      <Head title="Inventory — Admin — CERVOWEAR" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 14, marginBottom: 20 }}>
        <Blueprint className="card elev-sm" style={{ padding: 16 }}>
          <div className="card-kicker">Total Variant SKUs</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 26, marginTop: 4 }}>{totalSkus}</div>
        </Blueprint>
        <Blueprint className="card elev-sm" style={{ padding: 16 }}>
          <div className="card-kicker">Low Stock</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 26, marginTop: 4, color: '#a1631a' }}>{lowCount}</div>
        </Blueprint>
        <Blueprint className="card elev-sm" style={{ padding: 16 }}>
          <div className="card-kicker">Out of Stock</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 26, marginTop: 4, color: '#a13333' }}>{outCount}</div>
        </Blueprint>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input className="input" style={{ width: 240 }} placeholder="Search product or SKU…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="input" style={{ width: 170 }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input" style={{ width: 150 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="text-muted" style={{ fontSize: 13 }}>{filtered.length} variant{filtered.length === 1 ? '' : 's'}</span>
          <button className="btn btn-secondary" onClick={exportInventory}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M12 3v12M7 10l5 5 5-5"></path><path d="M4 21h16"></path></svg>
            Export CSV
          </button>
        </div>
      </div>

      <Blueprint className="card elev-sm" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr><th>Product</th><th>Category</th><th>Color</th><th>Size</th><th>SKU</th><th>Stock</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const status = statusFor(r.stock);
              const tone = STATUS_TONE[status];
              return (
                <tr key={r.sku}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td className="text-muted">{r.category}</td>
                  <td>{r.color}</td>
                  <td>{r.size}</td>
                  <td className="text-muted">{r.sku}</td>
                  <td>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      style={{ width: 80, minHeight: 30, padding: '2px 8px' }}
                      value={r.stock}
                      onChange={(e) => setVariantStock(r.productId, r.ci, r.si, Number(e.target.value) || 0)}
                    />
                  </td>
                  <td><span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', background: tone.bg, color: tone.fg, display: 'inline-block' }}>{status}</span></td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-muted" style={{ textAlign: 'center', padding: '32px 0' }}>No variants match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </Blueprint>
    </AdminLayout>
  );
}
