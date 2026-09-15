import { Head } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import AdminLayout from '@/Layouts/AdminLayout';
import { useStore } from '@/lib/StoreContext';

function StatusBadge({ connected }) {
  return (
    <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', display: 'inline-block', background: connected ? 'var(--color-accent-100)' : 'var(--color-surface)', color: connected ? 'var(--color-accent-800)' : 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
      {connected ? 'Connected' : 'Not connected'}
    </span>
  );
}

function lastSyncLabel(minutesAgo) {
  if (minutesAgo == null) return '—';
  if (minutesAgo < 60) return `${minutesAgo} min ago`;
  const hours = Math.round(minutesAgo / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}

export default function Integrations() {
  const { integrations, toggleIntegration } = useStore();

  return (
    <AdminLayout title="Integrations">
      <Head title="Integrations — Admin — CERVOWEAR" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 16, maxWidth: 900 }}>
        {integrations.map((i) => (
          <Blueprint key={i.id} className="card elev-sm" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{i.name}</div>
              <StatusBadge connected={i.connected} />
            </div>
            <div className="text-muted" style={{ fontSize: 13, marginBottom: 4 }}>{i.account || 'Not connected'}</div>
            <div className="card-meta" style={{ marginBottom: 16 }}>Last sync: {lastSyncLabel(i.lastSyncedMinutesAgo)}</div>
            <button
              className={`btn ${i.connected ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => toggleIntegration(i.id)}
            >
              {i.connected ? 'Disconnect' : 'Connect'}
            </button>
          </Blueprint>
        ))}
      </div>
    </AdminLayout>
  );
}
