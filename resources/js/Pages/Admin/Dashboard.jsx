import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import AdminLayout from '@/Layouts/AdminLayout';
import { overallMarketingStats } from '@/data/marketing';
import { dashboardStats, priceLabel } from '@/data/products';
import { useStore } from '@/lib/StoreContext';

const RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export default function Dashboard() {
  const { products, orders } = useStore();
  const [range, setRange] = useState('week');
  const stats = dashboardStats(products);
  const marketing = overallMarketingStats(orders);
  const maxTrend = Math.max(...stats.trend, 1);
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <AdminLayout title="Dashboard">
      <Head title="Dashboard — Admin — CERVOWEAR" />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>How CERVOWEAR is doing right now.</div>
        <div className="seg" style={{ whiteSpace: 'nowrap' }}>
          {RANGES.map((r) => (
            <label key={r.value} className="seg-opt">
              <input type="radio" name="range" checked={range === r.value} onChange={() => setRange(r.value)} />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="cw-admin-kpi-grid" style={{ display: 'grid', gap: 14, marginBottom: 24 }}>
        <Blueprint className="card elev-sm">
          <div className="card-kicker">Revenue</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 600 }}>{stats.revenueLabel}</div>
          <div className="card-meta">{stats.revenueDelta} vs previous period</div>
        </Blueprint>
        <Blueprint className="card elev-sm">
          <div className="card-kicker">Orders</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 600 }}>{stats.orders}</div>
          <div className="card-meta">{stats.ordersDelta} vs previous period</div>
        </Blueprint>
        <Blueprint className="card elev-sm">
          <div className="card-kicker">Avg. Order Value</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 600 }}>{stats.aovLabel}</div>
          <div className="card-meta">{stats.unitsSold} items sold</div>
        </Blueprint>
        <Blueprint className="card elev-sm">
          <div className="card-kicker">Needs Attention</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 600 }}>{stats.pendingOrders} pending</div>
          <div className="card-meta">{stats.lowStockVariants} variants low on stock</div>
        </Blueprint>
      </div>

      <div className="cw-admin-chart-row" style={{ display: 'grid', gap: 16, marginBottom: 16 }}>
        <Blueprint className="card elev-sm" style={{ minHeight: 220 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div className="card-title">Sales Trend</div>
            <div className="card-meta">Last 7 days · {stats.revenueDelta}</div>
          </div>
          <svg viewBox="0 0 560 160" style={{ width: '100%', height: 160, marginTop: 6 }} preserveAspectRatio="none">
            {stats.trend.map((v, i) => {
              const h = Math.max(4, (v / maxTrend) * 130);
              const x = 10 + i * 79;
              return (
                <g key={i}>
                  <rect x={x} y={150 - h} width="46" height={h} fill="var(--color-accent-300)" />
                  <text x={x + 23} y="152" fontSize="11" fill="var(--color-text)" opacity="0.6" textAnchor="middle">{dayLabels[i]}</text>
                </g>
              );
            })}
          </svg>
        </Blueprint>
        <Blueprint className="card elev-sm">
          <div className="card-title">Marketing Overview</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4, flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span className="text-muted">Ad Spend</span><span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{priceLabel(marketing.spend)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span className="text-muted">Revenue Attributed</span><span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{priceLabel(marketing.revenue)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span className="text-muted">Blended ROAS</span><span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{marketing.roas.toFixed(1)}x</span></div>
          </div>
          <Link href="/admin/marketing" className="btn btn-ghost" style={{ alignSelf: 'flex-start', paddingLeft: 0 }}>View Meta Ads →</Link>
        </Blueprint>
      </div>

      <Blueprint className="card elev-sm">
        <div className="card-title" style={{ marginBottom: 4 }}>Top Selling Products</div>
        <table className="table">
          <thead><tr><th>Product</th><th>SKU</th><th>Units Sold</th><th>Revenue</th><th>Stock</th></tr></thead>
          <tbody>
            {stats.topProducts.map((p) => (
              <tr key={p.id}>
                <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Blueprint style={{ width: 32, height: 32, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: 12, color: 'var(--color-accent-700)' }}>{p.initials}</Blueprint>
                  <span>{p.name}</span>
                </td>
                <td className="text-muted">{p.sku}</td>
                <td>{p.unitsSold}</td>
                <td>{p.revenue}</td>
                <td>{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Blueprint>
    </AdminLayout>
  );
}
