import { useState } from 'react';
import { Head } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import Toast from '@/Components/Admin/Toast';
import AdminLayout from '@/Layouts/AdminLayout';
import { seedHomePage } from '@/data/homePage';
import { useStore } from '@/lib/StoreContext';

const TABS = [
  { key: 'hero', label: 'Hero', hint: 'The full-bleed photo at the very top of the home page.' },
  { key: 'categories', label: 'Categories', hint: 'The "Shop by Category" split section.' },
  { key: 'newArrivals', label: 'New Arrivals', hint: 'The text tile inside the New In grid.' },
  { key: 'ourStory', label: 'Our Story', hint: 'The split photo + copy section, right before Best sellers.' },
  { key: 'bestSellers', label: 'Best sellers', hint: 'Auto-pulled from your top-selling published products.' },
];

function Toggle({ on, onClick }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} onClick={onClick}
      style={{ width: 38, height: 22, flex: 'none', border: '1px solid var(--color-divider)', borderRadius: 999, position: 'relative', cursor: 'pointer', background: on ? 'var(--color-accent-700)' : 'var(--color-surface)', transition: 'background 0.15s' }}
    >
      <span style={{ position: 'absolute', top: 1, left: on ? 17 : 1, width: 18, height: 18, borderRadius: '50%', background: 'var(--color-bg)', transition: 'left 0.15s' }}></span>
    </button>
  );
}

function PhotoField({ label, value, onChange }) {
  function pick(e) {
    const file = e.target.files?.[0];
    if (file) onChange(URL.createObjectURL(file));
    e.target.value = '';
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 74, height: 92, flex: 'none', border: '1px solid var(--color-divider)', overflow: 'hidden', background: 'var(--color-surface)' }}>
        {value ? <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{label}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            Replace photo
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={pick} />
          </label>
          {value && <button type="button" className="btn btn-ghost" onClick={() => onChange(null)}>Remove</button>}
        </div>
      </div>
    </div>
  );
}

function HeroTab({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 520 }}>
      <PhotoField label="Hero photo" value={value.image} onChange={(image) => onChange({ image })} />
      <div className="field" style={{ margin: 0 }}>
        <label>Clicking the hero opens</label>
        <select className="input" value={value.linkCategory} onChange={(e) => onChange({ linkCategory: e.target.value })}>
          <option value="New In">New In</option>
          <option value="All">All (Shop All)</option>
          <option value="Bags">Bags</option>
          <option value="Accessoires">Accessoires</option>
        </select>
      </div>
    </div>
  );
}

function CategoriesTab({ value, onChange }) {
  function setTilePhoto(label, photo) {
    onChange({ tilePhotos: { ...value.tilePhotos, [label]: photo } });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 520 }}>
      <PhotoField label="Section photo (the large photo next to the heading)" value={value.photo} onChange={(photo) => onChange({ photo })} />
      <div className="field" style={{ margin: 0 }}>
        <label>Eyebrow label</label>
        <input className="input" value={value.eyebrow} onChange={(e) => onChange({ eyebrow: e.target.value })} />
      </div>
      <div className="field" style={{ margin: 0 }}>
        <label>Heading</label>
        <input className="input" value={value.heading} onChange={(e) => onChange({ heading: e.target.value })} />
      </div>
      <div className="field" style={{ margin: 0 }}>
        <label>Description</label>
        <textarea className="input" rows={3} value={value.description} onChange={(e) => onChange({ description: e.target.value })} />
      </div>

      <div style={{ borderTop: '1px solid var(--color-divider)', marginTop: 8, paddingTop: 18 }}>
        <div className="card-title">Category Tile Photos</div>
        <div className="card-meta" style={{ marginBottom: 14 }}>One photo per tile — these tiles don't hover-swap, so a single photo is all each needs. A tile only shows on the home page while that category is enabled (Collections).</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {Object.keys(value.tilePhotos).map((label) => (
            <PhotoField key={label} label={label} value={value.tilePhotos[label]} onChange={(photo) => setTilePhoto(label, photo)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NewArrivalsTab({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 520 }}>
      <PhotoField label="Tile photo (optional — shows as a background instead of plain text)" value={value.photo} onChange={(photo) => onChange({ photo })} />
      <div className="field" style={{ margin: 0 }}>
        <label>Kicker</label>
        <input className="input" value={value.kicker} onChange={(e) => onChange({ kicker: e.target.value })} />
      </div>
      <div className="field" style={{ margin: 0 }}>
        <label>Tile heading</label>
        <textarea className="input" rows={2} value={value.tileHeading} onChange={(e) => onChange({ tileHeading: e.target.value })} />
        <div className="card-meta">Use a line break for a two-line tile, e.g. "New{'\n'}Arrivals".</div>
      </div>
    </div>
  );
}

function OurStoryTab({ value, onChange }) {
  return (
    <Blueprint className="card elev-sm" style={{ padding: 24, maxWidth: 640 }}>
      <div className="card-title">Our Story</div>
      <div className="card-meta" style={{ marginBottom: 18 }}>The split photo + copy section, right before Best sellers.</div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 20 }}>
        <PhotoField label="Main portrait photo" value={value.mainPhoto} onChange={(mainPhoto) => onChange({ mainPhoto })} />
        <PhotoField label="Detail photo" value={value.detailPhoto} onChange={(detailPhoto) => onChange({ detailPhoto })} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field" style={{ margin: 0 }}>
          <label>Eyebrow label</label>
          <input className="input" value={value.eyebrow} onChange={(e) => onChange({ eyebrow: e.target.value })} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Bold lead-in</label>
          <input className="input" value={value.leadIn} onChange={(e) => onChange({ leadIn: e.target.value })} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Paragraph</label>
          <textarea className="input" rows={4} value={value.paragraph} onChange={(e) => onChange({ paragraph: e.target.value })} />
        </div>
      </div>
    </Blueprint>
  );
}

function BestSellersTab({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 520 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="text-muted" style={{ fontSize: 13 }}>Shown on the home page, ranked by units sold</span>
        <Toggle on={value.enabled} onClick={() => onChange({ enabled: !value.enabled })} />
      </div>
      <div className="field" style={{ margin: 0 }}>
        <label>Eyebrow label</label>
        <input className="input" value={value.eyebrow} onChange={(e) => onChange({ eyebrow: e.target.value })} />
      </div>
      <div className="field" style={{ margin: 0 }}>
        <label>Heading</label>
        <input className="input" value={value.heading} onChange={(e) => onChange({ heading: e.target.value })} />
      </div>
      <div className="card-meta">Shows your top 4 sellers, picked automatically among published products, to match the grid layout. Manage which products are published from Products.</div>
    </div>
  );
}

const TAB_COMPONENTS = {
  hero: HeroTab,
  categories: CategoriesTab,
  newArrivals: NewArrivalsTab,
  ourStory: OurStoryTab,
  bestSellers: BestSellersTab,
};

export default function HomePage() {
  const { homePage, saveHomePageSection } = useStore();
  const [tab, setTab] = useState('hero');
  const [draft, setDraft] = useState(homePage);
  const [toast, setToast] = useState(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(homePage);
  const ActiveTab = TAB_COMPONENTS[tab];
  const activeMeta = TABS.find((t) => t.key === tab);

  function patchActive(patch) {
    setDraft((cur) => ({ ...cur, [tab]: { ...cur[tab], ...patch } }));
  }

  function handleSave() {
    Object.keys(draft).forEach((key) => {
      if (JSON.stringify(draft[key]) !== JSON.stringify(homePage[key])) saveHomePageSection(key, draft[key]);
    });
    setToast({ message: 'Home page updated.', tone: 'success' });
  }

  function handleDiscard() {
    setDraft(homePage);
  }

  function handleResetDefaults() {
    setDraft((cur) => ({ ...cur, [tab]: seedHomePage()[tab] }));
  }

  return (
    <AdminLayout title="Home Page">
      <Head title="Home Page — Admin — CERVOWEAR" />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <span className="text-muted" style={{ fontSize: 13 }}>{dirty ? 'Unsaved changes' : 'No unsaved changes'}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={handleResetDefaults}>Reset to defaults</button>
          <button type="button" className="btn btn-secondary" disabled={!dirty} onClick={handleDiscard}>Discard</button>
          <button type="button" className="btn btn-primary" disabled={!dirty} onClick={handleSave}>Save changes</button>
        </div>
      </div>

      <div className="seg" style={{ marginBottom: 20 }}>
        {TABS.map((t) => (
          <label key={t.key} className="seg-opt"><input type="radio" checked={tab === t.key} onChange={() => setTab(t.key)} /><span>{t.label}</span></label>
        ))}
      </div>

      {tab === 'ourStory' ? (
        <ActiveTab value={draft[tab]} onChange={patchActive} />
      ) : (
        <Blueprint className="card elev-sm" style={{ padding: 24 }}>
          <div className="card-title">{activeMeta.label}</div>
          <div className="card-meta" style={{ marginBottom: 18 }}>{activeMeta.hint}</div>
          <ActiveTab value={draft[tab]} onChange={patchActive} />
        </Blueprint>
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} onDone={() => setToast(null)} />}
    </AdminLayout>
  );
}
