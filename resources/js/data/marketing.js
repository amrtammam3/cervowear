// Meta Ads & Attribution — mock campaign spend, matched against the real
// orders/conversations already in the app. This is what a production
// build would compute from: a daily Meta Marketing API pull (spend,
// impressions, clicks per campaign) stored in a `campaigns` table, and an
// `ad_id`/`fbclid` captured at the point of contact (UTM on a site visit,
// or the ad id Meta attaches to a Click-to-WhatsApp/DM conversation) and
// carried through to the order it produced. Both feeds are just plain SQL
// aggregates once that attribution link exists — cheap enough for shared
// hosting, cached for 1-3h so a page refresh never re-hits the Meta API.

export const CAMPAIGNS = [
  { id: 'camp-1', name: 'Winter Launch — Reels', platform: 'Instagram', objective: 'Awareness', status: 'Active', spend: 4200, impressions: 186000, clicks: 5400 },
  { id: 'camp-2', name: 'New Arrivals — Stories', platform: 'Instagram', objective: 'Traffic', status: 'Active', spend: 3100, impressions: 142000, clicks: 4100 },
  { id: 'camp-3', name: 'Retarget Cart Abandon', platform: 'Facebook', objective: 'Click to WhatsApp', status: 'Active', spend: 1100, impressions: 38000, clicks: 980 },
  { id: 'camp-4', name: 'Ramadan Collection Boost', platform: 'Facebook', objective: 'Click to Messenger', status: 'Paused', spend: 2600, impressions: 97000, clicks: 2300 },
];

// order id -> campaign id. Stands in for the `ad_id` a real checkout/order
// would inherit from the session that started at that ad's UTM link or
// Click-to-Chat conversation.
export const ORDER_ATTRIBUTION = {
  'ORD-10476': 'camp-1', 'ORD-10477': 'camp-1', 'ORD-10488': 'camp-1',
  'ORD-10472': 'camp-2', 'ORD-10478': 'camp-2', 'ORD-10483': 'camp-2', 'ORD-10474': 'camp-2', 'ORD-10481': 'camp-2',
  'ORD-10473': 'camp-3', 'ORD-10475': 'camp-3', 'ORD-10480': 'camp-3', 'ORD-10485': 'camp-3',
  'ORD-10471': 'camp-4', 'ORD-10484': 'camp-4',
};

// Unified Inbox conversation id -> campaign id — the Ad → Conversation
// half of the funnel, before it ever becomes an order.
export const CONVERSATION_ATTRIBUTION = {
  c1: 'camp-2', // Ahmed Mohamed — Instagram
  c2: 'camp-3', // Sara Ali — WhatsApp
  c3: 'camp-2', // Mostafa Hassan — Instagram
  c4: 'camp-4', // Nour Ibrahim — Messenger
};

export function campaignStats(campaign, orders) {
  const attributedOrders = orders.filter((o) => ORDER_ATTRIBUTION[o.id] === campaign.id);
  const billable = attributedOrders.filter((o) => o.status !== 'Cancelled');
  const revenue = billable.reduce((sum, o) => sum + o.total, 0);
  const roas = campaign.spend ? revenue / campaign.spend : 0;
  const cpa = billable.length ? campaign.spend / billable.length : 0;
  const conversionRate = campaign.clicks ? (billable.length / campaign.clicks) * 100 : 0;
  const ctr = campaign.impressions ? (campaign.clicks / campaign.impressions) * 100 : 0;
  return { attributedOrders, orders: billable.length, revenue, roas, cpa, conversionRate, ctr };
}

export function overallMarketingStats(orders) {
  return CAMPAIGNS.reduce((acc, c) => {
    const s = campaignStats(c, orders);
    acc.spend += c.spend;
    acc.revenue += s.revenue;
    acc.orders += s.orders;
    acc.roas = acc.spend ? acc.revenue / acc.spend : 0;
    return acc;
  }, { spend: 0, revenue: 0, orders: 0, roas: 0 });
}

export function conversationIdsForCampaign(campaignId) {
  return Object.entries(CONVERSATION_ATTRIBUTION).filter(([, cid]) => cid === campaignId).map(([id]) => id);
}

// A campaign only earns a "scale" or "review" call once it's spent enough
// to mean something — a single-day, EGP-200 campaign hitting 6x ROAS is
// luck, not a signal.
const MIN_SPEND_FOR_VERDICT = 500;
export function campaignVerdict(campaign, stats) {
  if (campaign.spend < MIN_SPEND_FOR_VERDICT) return null;
  if (stats.roas >= 3) return { label: 'Scale', tone: 'good' };
  if (stats.roas < 1) return { label: 'Review', tone: 'bad' };
  return null;
}
