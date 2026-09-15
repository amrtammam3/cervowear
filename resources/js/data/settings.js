// Store-wide configuration — the handful of settings that actually belong
// in an e-commerce admin (as opposed to accounting/purchasing, which a
// brand with a physical shop already runs through its own bookkeeping or
// ERP, so this app deliberately doesn't duplicate it).

export function seedStoreInfo() {
  return {
    brandName: 'CERVOWEAR',
    logo: null,
    supportPhone: '+20 100 000 1234',
    supportEmail: 'support@cervowear.com',
  };
}

// Egypt shipping is never a flat fee in practice — Cairo/Giza run cheaper
// than the rest of the country. This table is what Checkout looks up by
// the governorate the customer picks, instead of a single hardcoded fee.
export function seedShippingRates() {
  return [
    { id: 'ship-1', governorate: 'Cairo', fee: 60 },
    { id: 'ship-2', governorate: 'Giza', fee: 60 },
    { id: 'ship-3', governorate: 'Alexandria', fee: 75 },
    { id: 'ship-4', governorate: 'Other Governorates', fee: 95 },
  ];
}

export function newShippingRateId() {
  return `ship-${Date.now()}`;
}

export function seedPaymentMethods() {
  return {
    codEnabled: true,
    cardEnabled: true,
    vodafoneCashEnabled: false,
    vodafoneCashNumber: '',
    instapayEnabled: false,
    instapayNumber: '',
  };
}

export const TEAM_ROLES = ['Admin', 'Fulfillment', 'Chat Agent', 'Marketing'];

export const ROLE_DESCRIPTIONS = {
  Admin: 'Full access — orders, products, revenue, ad spend, settings.',
  Fulfillment: 'Orders, inventory, and returns — no revenue or ad spend figures.',
  'Chat Agent': 'Unified Inbox and order creation only — no revenue or ad spend figures.',
  Marketing: 'Promotions, Meta Ads & Attribution, and Lookbook — no order fulfillment.',
};

export function seedTeamMembers() {
  return [
    { id: 'team-1', name: 'Admin User', email: 'admin@cervowear.com', role: 'Admin' },
    { id: 'team-2', name: 'Rana Fouad', email: 'rana@cervowear.com', role: 'Chat Agent' },
  ];
}

export function newTeamMemberId() {
  return `team-${Date.now()}`;
}

// Integrations — connection status only (this app is frontend-only, no
// real OAuth). What a real backend would store: the provider, whether an
// access token is on file, and when it was last refreshed.
export function seedIntegrations() {
  return [
    { id: 'instagram', name: 'Instagram', account: '@cervowear.eg', connected: true, lastSyncedMinutesAgo: 2 },
    { id: 'meta-ads', name: 'Meta Ads', account: 'CERVOWEAR Ad Account', connected: true, lastSyncedMinutesAgo: 14 },
    { id: 'whatsapp', name: 'WhatsApp Business', account: null, connected: false, lastSyncedMinutesAgo: null },
    { id: 'facebook', name: 'Facebook Messenger', account: 'CERVOWEAR Official', connected: true, lastSyncedMinutesAgo: 60 },
  ];
}
