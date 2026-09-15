import { priceLabel } from './products';

// Promotions — discount codes and the on-site placements that surface
// them (announcement bar, exit-intent popup, free-shipping progress bar).
// Same spirit as data/lookbooks.js / data/taxonomy.js: a plain seed plus
// pure helpers; the mutable list lives in StoreContext so admin edits
// (and real checkout usage) show up everywhere immediately.

export const DISCOUNT_TYPES = ['Percentage', 'Fixed Amount', 'Free Shipping'];
export const DISCOUNT_SEGMENTS = ['All Customers', 'Lead', 'New', 'Active', 'VIP', 'At Risk', 'Churned'];

export function newDiscountId() {
  return `disc-${Date.now()}`;
}

export function seedDiscountCodes() {
  return [
    {
      id: 'disc-1', code: 'SARAH15', type: 'Percentage', value: 15, maxDiscount: 200,
      influencer: '@sarah', segment: 'All Customers', minOrderAmount: 0, usageLimit: 500, usageCount: 214,
      oncePerCustomer: true, startDate: '2026-08-01', endDate: '2026-10-31', enabled: true,
    },
    {
      id: 'disc-2', code: 'WELCOME10', type: 'Percentage', value: 10, maxDiscount: 150,
      influencer: null, segment: 'New', minOrderAmount: 300, usageLimit: null, usageCount: 89,
      oncePerCustomer: true, startDate: '2026-01-01', endDate: '2026-12-31', enabled: true,
    },
    {
      id: 'disc-3', code: 'VIPFREESHIP', type: 'Free Shipping', value: 0, maxDiscount: null,
      influencer: null, segment: 'VIP', minOrderAmount: 500, usageLimit: 200, usageCount: 47,
      oncePerCustomer: false, startDate: '2026-09-01', endDate: '2026-09-30', enabled: true,
    },
    {
      id: 'disc-4', code: 'BLACKFRIDAY30', type: 'Percentage', value: 30, maxDiscount: 400,
      influencer: null, segment: 'All Customers', minOrderAmount: 500, usageLimit: 1000, usageCount: 0,
      oncePerCustomer: true, startDate: '2026-11-20', endDate: '2026-11-30', enabled: true,
    },
    {
      id: 'disc-5', code: 'SUMMER25', type: 'Fixed Amount', value: 100, maxDiscount: null,
      influencer: '@nour.styles', segment: 'All Customers', minOrderAmount: 400, usageLimit: 300, usageCount: 261,
      oncePerCustomer: true, startDate: '2026-06-01', endDate: '2026-08-15', enabled: true,
    },
  ];
}

export function seedSiteOffers() {
  return {
    announcementBar: { enabled: true, message: 'Free shipping on orders over EGP 900!', discountCode: null, bgColor: '#1d2d3d', textColor: '#f2f2f3' },
    exitPopup: { enabled: true, title: 'Before you go…', subtitle: 'Take 10% off your first order.', image: null, discountCode: 'WELCOME10' },
    freeShippingBar: { enabled: true, threshold: 900 },
  };
}

// A code is only ever "Inactive" because an admin turned it off — every
// other state (Active/Scheduled/Expired) is derived purely from today's
// date against its own start/end, so the table never drifts out of sync
// with reality just because nobody remembered to flip a toggle.
export function discountStatus(code, today = new Date().toISOString().slice(0, 10)) {
  if (!code.enabled) return 'Inactive';
  if (code.endDate && today > code.endDate) return 'Expired';
  if (code.startDate && today < code.startDate) return 'Scheduled';
  return 'Active';
}

export function discountValueLabel(code) {
  if (code.type === 'Percentage') return `${code.value}% OFF`;
  if (code.type === 'Fixed Amount') return `${priceLabel(code.value)} OFF`;
  return 'FREE SHIPPING';
}

// Revenue a code produced — summed from real orders that carried it,
// never a number typed in by hand.
export function revenueForCode(code, orders) {
  return orders
    .filter((o) => o.discountCode === code.code && o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);
}

// The one place checkout logic lives, so the storefront (checkout promo
// field) and the exit-intent popup's "apply" button can never disagree
// about whether a code is valid.
export function evaluateDiscountCode(codeStr, subtotal, codes) {
  const trimmed = codeStr.trim().toUpperCase();
  if (!trimmed) return { ok: false, error: 'Enter a code.' };
  const code = codes.find((c) => c.code.toUpperCase() === trimmed);
  if (!code) return { ok: false, error: 'Code not recognized — check and try again.' };
  const status = discountStatus(code);
  if (status !== 'Active') return { ok: false, error: `This code is ${status.toLowerCase()}.` };
  if (code.usageLimit != null && code.usageCount >= code.usageLimit) return { ok: false, error: 'This code has reached its usage limit.' };
  if (subtotal < code.minOrderAmount) return { ok: false, error: `Minimum order of ${priceLabel(code.minOrderAmount)} required.` };

  let discount = 0;
  let freeShipping = false;
  if (code.type === 'Percentage') {
    discount = subtotal * (code.value / 100);
    if (code.maxDiscount) discount = Math.min(discount, code.maxDiscount);
  } else if (code.type === 'Fixed Amount') {
    discount = Math.min(code.value, subtotal);
  } else {
    freeShipping = true;
  }
  return { ok: true, code, discount: Math.round(discount), freeShipping };
}
