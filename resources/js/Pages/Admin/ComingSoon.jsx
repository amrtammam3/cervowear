import { Head } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ComingSoon({ title, reason }) {
  return (
    <AdminLayout title={title}>
      <Head title={`${title} — Admin — CERVOWEAR`} />
      <Blueprint className="card elev-sm" style={{ padding: '60px 32px', textAlign: 'center', alignItems: 'center' }}>
        <div className="card-kicker" style={{ marginBottom: 8 }}>Coming Soon</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 22 }}>{title}</div>
        <div className="text-muted" style={{ fontSize: 14, marginTop: 8, maxWidth: 460, lineHeight: 1.6 }}>
          {reason || 'This section of the admin is next up — the Dashboard overview is live now so the shape of the whole workspace is clear.'}
        </div>
      </Blueprint>
    </AdminLayout>
  );
}
