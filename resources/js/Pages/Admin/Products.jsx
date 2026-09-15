import { Fragment, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import ConfirmDialog from '@/Components/Admin/ConfirmDialog';
import Pagination from '@/Components/Admin/Pagination';
import ProductFormDialog from '@/Components/Admin/ProductFormDialog';
import Toast from '@/Components/Admin/Toast';
import AdminLayout from '@/Layouts/AdminLayout';
import { priceLabel, variantSku } from '@/data/products';
import { useStore } from '@/lib/StoreContext';

const LOW_STOCK_THRESHOLD = 5;

function StatusTag({ p }) {
  return (
    <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <span className={`tag ${p.published ? 'tag-accent' : 'tag-outline'}`}>{p.published ? 'Published' : 'Draft'}</span>
      {p.featured && <span className="tag tag-outline">Featured</span>}
    </span>
  );
}

function IconButton({ label, danger, onClick, children }) {
  return (
    <button
      type="button"
      className="btn btn-icon btn-secondary"
      aria-label={label}
      title={label}
      onClick={onClick}
      style={danger ? { color: '#a13333' } : undefined}
    >
      {children}
    </button>
  );
}

function VariantRows({ product }) {
  return (
    <tr>
      <td colSpan={8} style={{ padding: 0, background: 'var(--color-surface)' }}>
        <table className="table" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th style={{ paddingLeft: 40 }}>Color</th>
              <th>Size</th>
              <th>SKU</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {product.colors.flatMap((color, ci) =>
              product.sizes.map((size, si) => {
                const idx = ci * product.sizes.length + si;
                const stock = product.stocks[idx] || 0;
                const status = stock === 0 ? { label: 'Out of stock', cls: '' } : stock < LOW_STOCK_THRESHOLD ? { label: 'Low stock', cls: 'tag-outline' } : { label: 'In stock', cls: 'tag-accent' };
                return (
                  <tr key={`${color}-${size}`}>
                    <td style={{ paddingLeft: 40 }}>{color}</td>
                    <td>{size}</td>
                    <td className="text-muted">{variantSku(product, color, size)}</td>
                    <td>{stock}</td>
                    <td><span className={`tag ${status.cls || 'tag-outline'}`} style={status.cls ? {} : { color: '#a13333', borderColor: '#a13333' }}>{status.label}</span></td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </td>
    </tr>
  );
}

export default function Products() {
  const { products, deleteProduct } = useStore();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [products, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function updateQuery(v) {
    setQuery(v);
    setPage(1);
  }

  function toggle(id) {
    setExpanded((cur) => ({ ...cur, [id]: !cur[id] }));
  }

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(p) {
    setEditing(p);
    setFormOpen(true);
  }

  function handleSaved() {
    const wasEdit = !!editing;
    setFormOpen(false);
    setToast({ message: wasEdit ? 'Product updated.' : 'Product created.', tone: 'success' });
  }

  function confirmRemove() {
    deleteProduct(confirmDelete.id);
    setToast({ message: `"${confirmDelete.name}" deleted.`, tone: 'danger' });
    setConfirmDelete(null);
  }

  return (
    <AdminLayout title="Products">
      <Head title="Products — Admin — CERVOWEAR" />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="input" style={{ width: 320 }} placeholder="Search by name, SKU, or category…" value={query} onChange={(e) => updateQuery(e.target.value)} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="text-muted" style={{ fontSize: 13 }}>{filtered.length} product{filtered.length === 1 ? '' : 's'}</span>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
        </div>
      </div>

      <Blueprint className="card elev-sm" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr><th>Product</th><th>SKU</th><th>Category</th><th>Collection</th><th>Price</th><th>Total Stock</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
          </thead>
          <tbody>
            {paged.map((p) => {
              const totalStock = p.stocks.reduce((s, n) => s + n, 0);
              return (
                <Fragment key={p.id}>
                  <tr>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td className="text-muted">{p.sku}</td>
                    <td>{p.category}</td>
                    <td className="text-muted">{p.collection}</td>
                    <td>{priceLabel(p.price)}</td>
                    <td>{totalStock}</td>
                    <td><StatusTag p={p} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                        <IconButton label={expanded[p.id] ? 'Hide variants' : 'Show variants'} onClick={() => toggle(p.id)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded[p.id] ? 'rotate(180deg)' : 'none' }}><path d="M6 9l6 6 6-6"></path></svg>
                        </IconButton>
                        <IconButton label="Edit product" onClick={() => openEdit(p)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </IconButton>
                        <IconButton label="Delete product" danger onClick={() => setConfirmDelete(p)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"></path><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"></path></svg>
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                  {expanded[p.id] && <VariantRows product={p} />}
                </Fragment>
              );
            })}
            {paged.length === 0 && (
              <tr><td colSpan={8} className="text-muted" style={{ textAlign: 'center', padding: '32px 0' }}>No products match "{query}".</td></tr>
            )}
          </tbody>
        </table>
        <div style={{ borderTop: '1px solid var(--color-divider)' }}>
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            pageSize={pageSize}
            total={filtered.length}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          />
        </div>
      </Blueprint>

      {formOpen && (
        <ProductFormDialog
          product={editing}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete product?"
          message={`"${confirmDelete.name}" and all its variants will be permanently removed. This can't be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={confirmRemove}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} onDone={() => setToast(null)} />}
    </AdminLayout>
  );
}
