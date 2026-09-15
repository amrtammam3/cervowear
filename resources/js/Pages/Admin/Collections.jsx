import { useState } from 'react';
import { Head } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import AdminLayout from '@/Layouts/AdminLayout';
import { NAV_SECTIONS } from '@/data/products';
import { productCountByCategory, productCountByCollection } from '@/data/taxonomy';
import { useStore } from '@/lib/StoreContext';

function Toggle({ on, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      style={{
        width: 38, height: 22, flex: 'none', border: '1px solid var(--color-divider)', borderRadius: 999, position: 'relative', cursor: 'pointer',
        background: on ? 'var(--color-accent-700)' : 'var(--color-surface)', transition: 'background 0.15s',
      }}
    >
      <span style={{ position: 'absolute', top: 1, left: on ? 17 : 1, width: 18, height: 18, borderRadius: '50%', background: 'var(--color-bg)', transition: 'left 0.15s' }}></span>
    </button>
  );
}

function CollectionRow({ c, products, onRename, onDelete, onToggle }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(c.name);
  const count = productCountByCollection(c.name, products);

  function save() {
    const res = onRename(name);
    if (res.ok) setEditing(false); else setName(c.name);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--color-divider)' }}>
      <Toggle on={c.enabled} onClick={onToggle} />
      {editing ? (
        <div style={{ display: 'flex', gap: 8, flex: 1 }}>
          <input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} />
          <button className="btn btn-primary" onClick={save}>Save</button>
          <button className="btn btn-secondary" onClick={() => { setName(c.name); setEditing(false); }}>Cancel</button>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, opacity: c.enabled ? 1 : 0.55 }}>{c.name}</div>
            <div className="text-muted" style={{ fontSize: 12 }}>{count} product{count === 1 ? '' : 's'}</div>
          </div>
          <button className="btn btn-secondary" onClick={() => setEditing(true)}>Rename</button>
          <button className="btn btn-secondary" style={{ color: '#a13333' }} onClick={onDelete} title={count > 0 ? 'Remove all products from this collection first' : ''}>Delete</button>
        </>
      )}
    </div>
  );
}

function CategoryRow({ c, products, onDelete, onToggle }) {
  const count = productCountByCategory(c.name, products);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--color-divider)' }}>
      <Toggle on={c.enabled} onClick={onToggle} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, opacity: c.enabled ? 1 : 0.55 }}>{c.name}</div>
        <div className="text-muted" style={{ fontSize: 12 }}>{c.section}{c.group ? ` · ${c.group}` : ''} · {count} product{count === 1 ? '' : 's'}</div>
      </div>
      <button className="btn btn-secondary" style={{ color: '#a13333' }} onClick={onDelete} title={count > 0 ? 'Remove all products from this category first' : ''}>Delete</button>
    </div>
  );
}

export default function Collections() {
  const {
    collections, addCollection, renameCollection, deleteCollection, toggleCollectionEnabled,
    categories, addCategory, deleteCategory, toggleCategoryEnabled, products,
  } = useStore();
  const [tab, setTab] = useState('collections');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [collectionError, setCollectionError] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySection, setNewCategorySection] = useState(NAV_SECTIONS[0].label);
  const [categoryError, setCategoryError] = useState('');

  function submitCollection() {
    const res = addCollection(newCollectionName);
    if (res.ok) { setNewCollectionName(''); setCollectionError(''); } else setCollectionError(res.error);
  }

  function submitCategory() {
    const res = addCategory({ name: newCategoryName, section: newCategorySection });
    if (res.ok) { setNewCategoryName(''); setCategoryError(''); } else setCategoryError(res.error);
  }

  return (
    <AdminLayout title="Collections & Categories">
      <Head title="Collections & Categories — Admin — CERVOWEAR" />

      <div className="seg" style={{ marginBottom: 20, maxWidth: 360 }}>
        <label className="seg-opt"><input type="radio" checked={tab === 'collections'} onChange={() => setTab('collections')} /><span>Collections</span></label>
        <label className="seg-opt"><input type="radio" checked={tab === 'categories'} onChange={() => setTab('categories')} /><span>Categories</span></label>
      </div>

      {tab === 'collections' && (
        <>
          <div className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
            Enabled collections are the ones customers can browse from the storefront footer. A collection can't be renamed or deleted while products still carry its name.
          </div>
          <Blueprint className="card elev-sm" style={{ padding: 20, marginBottom: 20 }}>
            {collections.map((c) => (
              <CollectionRow
                key={c.id}
                c={c}
                products={products}
                onToggle={() => toggleCollectionEnabled(c.id)}
                onRename={(name) => renameCollection(c.id, name)}
                onDelete={() => deleteCollection(c.id)}
              />
            ))}
            {collections.length === 0 && <div className="text-muted" style={{ fontSize: 13, padding: '8px 0' }}>No collections yet.</div>}
          </Blueprint>

          <Blueprint className="card elev-sm" style={{ padding: 20 }}>
            <div className="card-kicker" style={{ marginBottom: 10 }}>New Collection</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" placeholder="e.g. Spring '27" value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitCollection()} />
              <button className="btn btn-primary" onClick={submitCollection} disabled={!newCollectionName.trim()}>+ Add Collection</button>
            </div>
            {collectionError && <div style={{ fontSize: 12.5, color: '#a13333', marginTop: 8 }}>{collectionError}</div>}
          </Blueprint>
        </>
      )}

      {tab === 'categories' && (
        <>
          <div className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
            Enabled categories are the ones shown in the Shop / New In navbar menus. Existing categories can only be enabled or disabled — delete is blocked while products still use one, to keep size charts and filtering intact.
          </div>
          {NAV_SECTIONS.map((section) => (
            <Blueprint key={section.label} className="card elev-sm" style={{ padding: 20, marginBottom: 16 }}>
              <div className="card-kicker" style={{ marginBottom: 4 }}>{section.label}</div>
              {categories.filter((c) => c.section === section.label).map((c) => (
                <CategoryRow key={c.name} c={c} products={products} onToggle={() => toggleCategoryEnabled(c.name)} onDelete={() => deleteCategory(c.name)} />
              ))}
            </Blueprint>
          ))}

          <Blueprint className="card elev-sm" style={{ padding: 20 }}>
            <div className="card-kicker" style={{ marginBottom: 10 }}>New Category</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input className="input" style={{ flex: 1, minWidth: 160 }} placeholder="e.g. Kimono" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitCategory()} />
              <select className="input" style={{ width: 180 }} value={newCategorySection} onChange={(e) => setNewCategorySection(e.target.value)}>
                {NAV_SECTIONS.map((s) => <option key={s.label} value={s.label}>{s.label}</option>)}
              </select>
              <button className="btn btn-primary" onClick={submitCategory} disabled={!newCategoryName.trim()}>+ Add Category</button>
            </div>
            {categoryError && <div style={{ fontSize: 12.5, color: '#a13333', marginTop: 8 }}>{categoryError}</div>}
          </Blueprint>
        </>
      )}
    </AdminLayout>
  );
}
