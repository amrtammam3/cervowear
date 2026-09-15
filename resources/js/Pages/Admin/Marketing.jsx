import { Fragment, useState } from 'react';
import { Head } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import AdminLayout from '@/Layouts/AdminLayout';
import { CAMPAIGNS, campaignStats, campaignVerdict, conversationIdsForCampaign, overallMarketingStats } from '@/data/marketing';
import { priceLabel } from '@/data/products';
import { CONVERSATIONS } from '@/data/orders';
import { useStore } from '@/lib/StoreContext';

const VERDICT_TONE = {
  good: { bg: '#e6f4ea', fg: '#1e7d34' },
  bad: { bg: '#fbe9e9', fg: '#a13333' },
};

const STATUS_TONE = {
  Active: { bg: 'var(--color-accent-100)', fg: 'var(--color-accent-800)' },
  Paused: { bg: 'var(--color-surface)', fg: 'var(--color-text)' },
};

function Kpi({ label, value, sub }) {
  return (
    <Blueprint className="card elev-sm" style={{ padding: 16 }}>
      <div className="card-kicker">{label}</div>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 26, marginTop: 4 }}>{value}</div>
      {sub && <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>}
    </Blueprint>
  );
}

function CampaignDetailRow({ campaign, stats, orders }) {
  const convoIds = conversationIdsForCampaign(campaign.id);
  const conversations = CONVERSATIONS.filter((c) => convoIds.includes(c.id));
  const convoToOrder = conversations.map((c) => ({
    ...c,
    hasOrder: orders.some((o) => o.customerName === c.customerName && o.status !== 'Cancelled'),
  }));

  return (
    <tr>
      <td colSpan={9} style={{ padding: 0, background: 'var(--color-surface)' }}>
        <div style={{ padding: '16px 24px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div className="card-kicker" style={{ marginBottom: 8 }}>Attributed Orders ({stats.orders})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
              {stats.attributedOrders.map((o) => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '4px 0', borderBottom: '1px solid var(--color-divider)' }}>
                  <span>{o.id} · {o.customerName}{o.status === 'Cancelled' ? ' (cancelled)' : ''}</span>
                  <span style={{ fontWeight: 600 }}>{priceLabel(o.total)}</span>
                </div>
              ))}
              {stats.attributedOrders.length === 0 && <div className="text-muted" style={{ fontSize: 12.5 }}>No orders attributed yet.</div>}
            </div>
          </div>
          <div>
            <div className="card-kicker" style={{ marginBottom: 8 }}>Ad → Conversation → Order</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {convoToOrder.map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, padding: '4px 0', borderBottom: '1px solid var(--color-divider)' }}>
                  <span>{c.customerName} · {c.channel}</span>
                  <span className={`tag ${c.hasOrder ? 'tag-accent' : 'tag-outline'}`} style={{ fontSize: 10.5 }}>{c.hasOrder ? 'Converted' : 'No order yet'}</span>
                </div>
              ))}
              {convoToOrder.length === 0 && <div className="text-muted" style={{ fontSize: 12.5 }}>No tracked conversations for this campaign.</div>}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function Marketing() {
  const { orders } = useStore();
  const [expanded, setExpanded] = useState({});
  const overall = overallMarketingStats(orders);

  function toggle(id) {
    setExpanded((cur) => ({ ...cur, [id]: !cur[id] }));
  }

  return (
    <AdminLayout title="Meta Ads & Attribution">
      <Head title="Meta Ads & Attribution — Admin — CERVOWEAR" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14, marginBottom: 20 }}>
        <Kpi label="Ad Spend" value={priceLabel(overall.spend)} />
        <Kpi label="Attributed Revenue" value={priceLabel(overall.revenue)} sub="From real orders, not Meta's own reporting" />
        <Kpi label="Blended ROAS" value={`${overall.roas.toFixed(1)}x`} />
        <Kpi label="Orders Attributed" value={overall.orders} />
      </div>

      <Blueprint className="card elev-sm" style={{ padding: 0, marginBottom: 20 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Campaign</th><th>Platform</th><th>Objective</th><th>Status</th><th>Spend</th><th>Clicks</th><th>Orders</th><th>ROAS</th><th></th>
            </tr>
          </thead>
          <tbody>
            {CAMPAIGNS.map((c) => {
              const stats = campaignStats(c, orders);
              const verdict = campaignVerdict(c, stats);
              const statusTone = STATUS_TONE[c.status] || STATUS_TONE.Paused;
              return (
                <Fragment key={c.id}>
                  <tr>
                    <td style={{ fontWeight: 600 }}>
                      {c.name}
                      {verdict && <span className="tag" style={{ marginLeft: 8, fontSize: 10.5, background: VERDICT_TONE[verdict.tone].bg, color: VERDICT_TONE[verdict.tone].fg, border: 'none' }}>{verdict.label}</span>}
                    </td>
                    <td>{c.platform}</td>
                    <td className="text-muted">{c.objective}</td>
                    <td><span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', background: statusTone.bg, color: statusTone.fg, display: 'inline-block' }}>{c.status}</span></td>
                    <td>{priceLabel(c.spend)}</td>
                    <td>{c.clicks.toLocaleString()}</td>
                    <td>{stats.orders}</td>
                    <td style={{ fontWeight: 600, color: stats.roas >= 3 ? '#1e7d34' : stats.roas < 1 ? '#a13333' : 'inherit' }}>{stats.roas.toFixed(1)}x</td>
                    <td>
                      <button className="btn btn-ghost" style={{ padding: 0, fontSize: 12.5, textDecoration: 'underline' }} onClick={() => toggle(c.id)}>{expanded[c.id] ? 'Hide' : 'Details'}</button>
                    </td>
                  </tr>
                  {expanded[c.id] && <CampaignDetailRow campaign={c} stats={stats} orders={orders} />}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </Blueprint>
    </AdminLayout>
  );
}
