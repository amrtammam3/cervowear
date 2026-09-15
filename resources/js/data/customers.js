import { CONVERSATIONS } from './orders';

// Customer identity here follows the same convention every other admin
// screen already uses (Inbox, Returns): a customer is keyed by exact
// `customerName`, matched against `orders`. No separate id scheme, no
// risk of drifting out of sync with the orders that are the actual source
// of truth for what a customer bought.

export const CUSTOMER_STATUSES = ['Lead', 'New', 'Active', 'VIP', 'At Risk', 'Churned'];

const VIP_SPEND_THRESHOLD = 5000;
const VIP_ORDER_THRESHOLD = 6;
const NEW_WINDOW_DAYS = 30;
const AT_RISK_DAYS = 60;
const CHURNED_DAYS = 120;

function daysAgo(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

// All of a customer's orders, cancellations included — used for the Order
// History list, where hiding a cancelled order would misrepresent what
// actually happened.
export function allOrdersForCustomer(name, orders) {
  return orders.filter((o) => o.customerName === name);
}

// Revenue-bearing orders only — used for every spend/count/recency metric,
// so a cancelled order never inflates a customer's LTV or resets their
// "at risk" clock.
export function billableOrdersForCustomer(name, orders) {
  return orders.filter((o) => o.customerName === name && o.status !== 'Cancelled');
}

export function customerMetrics(name, orders) {
  const billable = billableOrdersForCustomer(name, orders);
  const totalSpent = billable.reduce((s, o) => s + o.total, 0);
  const totalOrders = billable.length;
  const aov = totalOrders ? totalSpent / totalOrders : 0;
  const lastOrderDate = totalOrders ? [...billable].sort((a, b) => a.date.localeCompare(b.date)).slice(-1)[0].date : null;
  return { totalOrders, totalSpent, aov, lastOrderDate };
}

// Lifecycle rules, kept in one place so "what counts as VIP / at risk" is
// a policy decision here — not scattered as inline checks across the
// admin UI, and easy to retune as the brand's real numbers come in.
export function lifecycleStatus({ totalOrders, totalSpent, lastOrderDate }) {
  if (totalOrders === 0) return 'Lead';
  const recency = lastOrderDate ? daysAgo(lastOrderDate) : Infinity;
  const isVip = totalSpent >= VIP_SPEND_THRESHOLD || totalOrders >= VIP_ORDER_THRESHOLD;
  if (recency > CHURNED_DAYS) return 'Churned';
  if (isVip) return 'VIP';
  if (recency > AT_RISK_DAYS) return 'At Risk';
  if (totalOrders === 1 && recency <= NEW_WINDOW_DAYS) return 'New';
  return 'Active';
}

// Most-bought size/color, computed from real order line items — so a
// segment like "customers who usually wear M" means something real
// instead of being guessed.
export function preferredAttributes(name, orders) {
  const items = billableOrdersForCustomer(name, orders).flatMap((o) => o.items);
  const topOf = (list) => {
    const counts = {};
    list.forEach((v) => { if (v) counts[v] = (counts[v] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || null;
  };
  return {
    size: topOf(items.map((i) => i.size)),
    color: topOf(items.map((i) => i.color)),
  };
}

// The governorate to default a manually-created order to — the most
// recent shipping address on file for this customer, if any.
export function defaultGovernorate(name, orders) {
  const withShipping = allOrdersForCustomer(name, orders)
    .filter((o) => o.shipping?.city)
    .sort((a, b) => b.date.localeCompare(a.date));
  return withShipping[0]?.shipping?.city || null;
}

export function whatsappLinkFor(phone, message = '') {
  const digits = (phone || '').replace(/[^\d]/g, '');
  const q = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${q}`;
}

// Seeded once from whatever customer names already appear in `orders` —
// enriched with phone/Instagram/first-touch source from a matching
// Unified Inbox conversation when one exists. New customers (created by
// a future order or manually) get added to this same list at runtime by
// StoreContext, the same pattern as collections/categories/lookbooks.
export function seedCustomers(orders) {
  const names = [...new Set(orders.map((o) => o.customerName))];
  return names.map((name, i) => {
    const convo = CONVERSATIONS.find((c) => c.customerName === name);
    const ownOrders = allOrdersForCustomer(name, orders);
    const withShipping = ownOrders.find((o) => o.shipping?.phone);
    const earliestOrder = [...ownOrders].sort((a, b) => a.date.localeCompare(b.date))[0];
    const channelCounts = {};
    ownOrders.forEach((o) => { channelCounts[o.channel] = (channelCounts[o.channel] || 0) + 1; });
    const topChannel = Object.entries(channelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Direct';
    return {
      id: `cust-${i + 1}`,
      name,
      phone: convo?.customer.phone || withShipping?.shipping?.phone || '',
      instagram: convo?.customer.instagram || null,
      email: withShipping?.shipping?.email || null,
      source: convo?.customer.source || topChannel,
      since: convo?.customer.since || earliestOrder?.date || null,
      notes: [],
      blocked: false,
    };
  });
}

export function newNoteId() {
  return `note-${Date.now()}`;
}
