import { useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import ImageSlot from '@/Components/ImageSlot';
import AdminLayout from '@/Layouts/AdminLayout';
import { MAX_IMAGES_PER_LOOKBOOK, MAX_LOOKBOOKS } from '@/data/lookbooks';
import { useStore } from '@/lib/StoreContext';

function ImageUploadTile({ onFile }) {
  const inputRef = useRef(null);
  return (
    <>
      <button
        type="button"
        className="blueprint"
        onClick={() => inputRef.current?.click()}
        style={{ width: 84, height: 100, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none', color: 'var(--color-accent-700)' }}
      >
        <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(URL.createObjectURL(file));
          e.target.value = '';
        }}
      />
    </>
  );
}

function LookbookCard({ lb, onRename, onDelete, onAddImage, onRemoveImage }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(lb.name);

  function saveName() {
    onRename(name.trim() || lb.name);
    setEditing(false);
  }

  return (
    <Blueprint className="card elev-sm" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
        {editing ? (
          <div style={{ display: 'flex', gap: 8, flex: 1 }}>
            <input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveName()} />
            <button className="btn btn-primary" onClick={saveName}>Save</button>
            <button className="btn btn-secondary" onClick={() => { setName(lb.name); setEditing(false); }}>Cancel</button>
          </div>
        ) : (
          <>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 18 }}>{lb.name}</div>
              <div className="text-muted" style={{ fontSize: 12.5, marginTop: 2 }}>{lb.images.length} / {MAX_IMAGES_PER_LOOKBOOK} photos</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setEditing(true)}>Rename</button>
              <button className="btn btn-secondary" onClick={onDelete} style={{ color: '#a13333' }}>Delete</button>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {lb.images.map((im) => (
          <div key={im.id} style={{ position: 'relative', width: 84, height: 100, flex: 'none', overflow: 'hidden' }}>
            <ImageSlot src={im.url} placeholder="Photo" />
            <button
              type="button"
              aria-label="Remove photo"
              onClick={() => onRemoveImage(im.id)}
              style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, background: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        ))}
        {lb.images.length < MAX_IMAGES_PER_LOOKBOOK && <ImageUploadTile onFile={onAddImage} />}
      </div>
    </Blueprint>
  );
}

export default function Lookbook() {
  const { lookbooks, addLookbook, renameLookbook, deleteLookbook, addLookbookImage, removeLookbookImage } = useStore();
  const [newName, setNewName] = useState('');

  function createLookbook() {
    if (!newName.trim() || lookbooks.length >= MAX_LOOKBOOKS) return;
    addLookbook(newName.trim());
    setNewName('');
  }

  return (
    <AdminLayout title="Lookbook">
      <Head title="Lookbook — Admin — CERVOWEAR" />

      <div className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
        {lookbooks.length} / {MAX_LOOKBOOKS} lookbooks — this is exactly what shows on the public <a href="/lookbook" target="_blank" rel="noreferrer">/lookbook</a> page.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
        {lookbooks.map((lb) => (
          <LookbookCard
            key={lb.id}
            lb={lb}
            onRename={(name) => renameLookbook(lb.id, name)}
            onDelete={() => deleteLookbook(lb.id)}
            onAddImage={(url) => addLookbookImage(lb.id, url)}
            onRemoveImage={(imageId) => removeLookbookImage(lb.id, imageId)}
          />
        ))}
      </div>

      {lookbooks.length < MAX_LOOKBOOKS ? (
        <Blueprint className="card elev-sm" style={{ padding: 20 }}>
          <div className="card-kicker" style={{ marginBottom: 10 }}>New Lookbook</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" placeholder="e.g. Summer '26" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createLookbook()} />
            <button className="btn btn-primary" onClick={createLookbook} disabled={!newName.trim()}>+ Add Lookbook</button>
          </div>
        </Blueprint>
      ) : (
        <div className="text-muted" style={{ fontSize: 13 }}>Maximum of {MAX_LOOKBOOKS} lookbooks reached — delete one to add another.</div>
      )}
    </AdminLayout>
  );
}
