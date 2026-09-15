// Mock catalog data for the CERVOWEAR storefront.
//
// This is intentionally a plain frontend data module (no API calls) — the
// backend isn't wired up yet. Every page imports from here directly. When a
// real backend exists, these exports are the shape controllers should hand
// to the Inertia pages as props.

// Real site navigation, as given by the brand — a women's-only label, so
// there is no menswear branch. Every product `category` below must be one
// of the leaf names nested here (or the section label itself for sections
// with no children, like Bags).
export const NAV_SECTIONS = [
  {
    label: "Women's Wear",
    children: ['Trousers', 'Top & Bodysuit', 'Jumpsuit', 'Skirt', 'T-shirt', 'Blazer', 'Set', 'Shirt', 'Blouse', 'Jacket', 'Cardigan', 'Short', 'Dress'],
  },
  { label: 'Bags', children: [] },
  { label: 'Accessoires', children: ['Belt'] },
];

// category -> parent section label, derived once from NAV_SECTIONS.
export const CATEGORY_SECTION = NAV_SECTIONS.reduce((map, section) => {
  if (section.children.length === 0) map[section.label] = section.label;
  else section.children.forEach((c) => { map[c] = section.label; });
  return map;
}, {});

// Presentation-only grouping of the Women's Wear leaf categories, used by
// both the Shop mega menu and the New In mega menu (one source of truth so
// the two never drift apart). Every leaf in NAV_SECTIONS' "Women's Wear"
// entry must appear exactly once across these groups.
export const SHOP_GROUPS = [
  { label: 'Tops', items: ['T-shirt', 'Blouse', 'Shirt', 'Top & Bodysuit'] },
  { label: 'Bottoms', items: ['Trousers', 'Skirt', 'Short'] },
  { label: 'Outerwear', items: ['Jacket', 'Blazer', 'Cardigan'] },
  { label: 'Dresses & Sets', items: ['Dress', 'Set', 'Jumpsuit'] },
];

// category -> parent shop-group label, derived once from SHOP_GROUPS.
export const CATEGORY_GROUP = SHOP_GROUPS.reduce((map, group) => {
  group.items.forEach((c) => { map[c] = group.label; });
  return map;
}, {});

export const COLOR_HEX = {
  Black: '#1d1f20',
  White: '#f2f2f3',
  Beige: '#d9c7ab',
  Khaki: '#8a8168',
  Indigo: '#3a4a6b',
  Olive: '#5f6a4a',
  Grey: '#8a8d90',
  Stone: '#a99f8f',
  Blush: '#d9b8ab',
  Emerald: '#2f5b48',
};

// Standard size ladders an admin can pick from when a product isn't one
// size — categories default to whichever ladder their SIZE_CHARTS rows
// use, but nothing stops picking a different one (e.g. a petite-only run).
export const SIZE_PRESETS = {
  'Standard (S–XXL)': ['S', 'M', 'L', 'XL', 'XXL'],
  'Standard (S–XL)': ['S', 'M', 'L', 'XL'],
  'Extended (XS–XXXL)': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
};

export const SIZE_CHARTS = {
  'T-shirt': { cols: ['Chest', 'Length'], rows: { S: [90, 64], M: [96, 66], L: [102, 68], XL: [108, 70], XXL: [114, 72] } },
  'Top & Bodysuit': { cols: ['Chest', 'Length'], rows: { S: [86, 58], M: [92, 60], L: [98, 62], XL: [104, 64] } },
  Shirt: { cols: ['Chest', 'Length'], rows: { S: [92, 66], M: [98, 68], L: [104, 70], XL: [110, 72] } },
  Blouse: { cols: ['Chest', 'Length'], rows: { S: [88, 62], M: [94, 64], L: [100, 66], XL: [106, 68] } },
  Blazer: { cols: ['Chest', 'Length'], rows: { S: [94, 62], M: [100, 64], L: [106, 66], XL: [112, 68] } },
  Cardigan: { cols: ['Chest', 'Length'], rows: { S: [94, 64], M: [100, 66], L: [106, 68], XL: [112, 70] } },
  Jacket: { cols: ['Chest', 'Length'], rows: { S: [96, 62], M: [102, 64], L: [108, 66], XL: [114, 68] } },
  Trousers: { cols: ['Waist', 'Hip', 'Inseam'], rows: { S: [68, 92, 76], M: [74, 98, 77], L: [80, 104, 78], XL: [86, 110, 79] } },
  Skirt: { cols: ['Waist', 'Hip', 'Length'], rows: { S: [66, 90, 46], M: [72, 96, 47], L: [78, 102, 48], XL: [84, 108, 49] } },
  Short: { cols: ['Waist', 'Hip', 'Inseam'], rows: { S: [66, 90, 22], M: [72, 96, 23], L: [78, 102, 24], XL: [84, 108, 25] } },
  Jumpsuit: { cols: ['Bust', 'Waist', 'Hip'], rows: { S: [86, 68, 92], M: [92, 74, 98], L: [98, 80, 104], XL: [104, 86, 110] } },
  Set: { cols: ['Bust', 'Waist', 'Hip'], rows: { S: [86, 68, 92], M: [92, 74, 98], L: [98, 80, 104], XL: [104, 86, 110] } },
  Dress: { cols: ['Bust', 'Waist', 'Hip'], rows: { S: [86, 68, 92], M: [92, 74, 98], L: [98, 80, 104], XL: [104, 86, 110] } },
};

export const ONE_SIZE_FIT = {
  Dress: 'Designed to fit UK 8–14 (EU 36–42). Relaxed, flowy silhouette — model is 172cm tall wearing One Size.',
  Bags: 'One size. See the product photos for exact dimensions and strap drop.',
  Belt: 'One size, adjustable — fits most waist sizes with room to size up or down.',
  Tok: 'One size, wrap style — adjusts to fit all head sizes.',
  'LV Tok': 'One size, wrap style — adjusts to fit all head sizes.',
  Socks: 'One size — fits UK 4–8 (EU 37–41).',
};

// Image roles per product, filled in from photos dropped during design.
// Products with no uploaded photos fall back to the placeholder frame.
const IMAGES = {
  p1: { card: '/images/products/p1-card.webp', main: '/images/products/p1-main.webp', thumbs: ['/images/products/p1-thumb0.webp', '/images/products/p1-alt.webp'], hover: '/images/products/p1-alt.webp' },
  p2: { card: '/images/products/p2-card.webp', main: '/images/products/p2-main.webp', thumbs: ['/images/products/p2-thumb0.webp', '/images/products/p2-thumb1.webp'], hover: '/images/products/p2-alt.webp' },
  p3: { card: '/images/products/Screenshot%202026-09-15%20153040.png', main: '/images/products/Screenshot%202026-09-15%20153040.png', thumbs: [], hover: null },
  p4: { card: '/images/products/p4-main.webp', main: '/images/products/p4-main.webp', thumbs: [], hover: '/images/products/p4-alt.webp' },
  p5: { card: '/images/products/Screenshot%202026-09-06%20170453.png', main: '/images/products/Screenshot%202026-09-06%20170453.png', thumbs: [], hover: null },
  p6: { card: '/images/products/Screenshot%202026-09-06%20182417.png', main: '/images/products/Screenshot%202026-09-06%20182417.png', thumbs: [], hover: null },
  p7: { card: null, main: null, thumbs: [], hover: null },
  p8: { card: null, main: null, thumbs: [], hover: null },
  p9: { card: '/images/products/p9-main.webp', main: '/images/products/p9-main.webp', thumbs: [], hover: '/images/products/p9-alt.webp' },
  p10: { card: '/images/products/Screenshot%202026-09-15%20153218.png', main: '/images/products/Screenshot%202026-09-15%20153218.png', thumbs: [], hover: null },
  p11: { card: '/images/products/Screenshot%202026-09-15%20153353.png', main: '/images/products/Screenshot%202026-09-15%20153353.png', thumbs: [], hover: null },
};

export const SITE_IMAGES = {
  heroMain: '/images/site/hero-main.webp',
  heroThumb: '/images/site/hero-thumb.webp',
  splitClothing: '/images/site/split-clothing.webp',
  splitAccessories: '/images/site/split-accessories.webp',
  megaShopCampaign: '/images/site/mega-shop-campaign.webp',
};

export const PRODUCTS = [
  { id: 'p1', name: 'Oversized Satin Shirt', sku: 'CRV-SH-001', category: 'Shirt', collection: 'Winter Collection', published: true, featured: true, price: 850, cost: 380, colors: ['Black', 'White'], sizes: ['S', 'M', 'L', 'XL'], stocks: [18, 22, 15, 4, 12, 9, 14, 0], unitsSold: 156, revenue: 132600, isNew: true },
  { id: 'p2', name: 'Essential Ribbed Top', sku: 'CRV-TB-002', category: 'Top & Bodysuit', collection: 'Core Essentials', published: true, featured: true, price: 450, compareAtPrice: 520, cost: 180, colors: ['Black', 'Beige', 'White'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], stocks: [25, 30, 28, 20, 10, 22, 26, 24, 18, 3, 19, 21, 17, 12, 6], unitsSold: 289, revenue: 130050 },
  { id: 'p3', name: 'Tailored Wide-Leg Trousers', sku: 'CRV-TR-003', category: 'Trousers', collection: 'Ramadan Essentials', published: true, featured: false, price: 980, cost: 420, colors: ['Khaki', 'Black'], sizes: ['S', 'M', 'L', 'XL'], stocks: [16, 14, 10, 5, 20, 18, 12, 8], unitsSold: 98, revenue: 96040 },
  { id: 'p4', name: 'Straight Fit Denim Trousers', sku: 'CRV-TR-004', category: 'Trousers', collection: 'Core Essentials', published: true, featured: false, price: 1150, cost: 520, colors: ['Indigo', 'Black'], sizes: ['S', 'M', 'L', 'XL'], stocks: [14, 12, 9, 2, 17, 15, 11, 6], unitsSold: 74, revenue: 85100 },
  { id: 'p5', name: 'Cropped Tailored Blazer', sku: 'CRV-BL-005', category: 'Blazer', collection: 'Winter Collection', published: true, featured: false, price: 1450, cost: 650, colors: ['Black', 'Olive'], sizes: ['S', 'M', 'L'], stocks: [8, 6, 3, 9, 7, 4], unitsSold: 41, revenue: 59450 },
  { id: 'p6', name: 'Relaxed Crewneck Cardigan', sku: 'CRV-CD-006', category: 'Cardigan', collection: 'Winter Collection', published: true, featured: false, price: 780, cost: 340, colors: ['Grey', 'Black'], sizes: ['S', 'M', 'L', 'XL'], stocks: [15, 13, 9, 4, 18, 16, 10, 7], unitsSold: 112, revenue: 87360 },
  { id: 'p7', name: 'Ribbed Tank Bodysuit', sku: 'CRV-TB-007', category: 'Top & Bodysuit', collection: 'Core Essentials', published: false, featured: false, price: 320, cost: 120, colors: ['Black', 'White'], sizes: ['S', 'M', 'L'], stocks: [22, 19, 14, 20, 17, 12], unitsSold: 65, revenue: 20800 },
  { id: 'p8', name: 'Pleated Midi Skirt', sku: 'CRV-SK-008', category: 'Skirt', collection: 'New Arrivals Teaser', published: false, featured: false, price: 990, cost: 430, colors: ['Black', 'Stone'], sizes: ['S', 'M', 'L', 'XL'], stocks: [11, 9, 6, 2, 13, 10, 7, 3], unitsSold: 53, revenue: 52470 },
  { id: 'p9', name: 'Draped Wrap Dress', sku: 'CRV-DR-009', category: 'Dress', collection: 'New Arrivals Teaser', published: true, featured: true, price: 1290, cost: 560, colors: ['Black', 'Blush', 'Emerald'], sizes: ['One Size'], stocks: [14, 9, 6], unitsSold: 37, revenue: 47730, isLimited: true },
  { id: 'p10', name: 'Structured Top-Handle Bag', sku: 'CRV-BG-010', category: 'Bags', collection: 'Core Essentials', published: true, featured: true, price: 1650, cost: 720, colors: ['Black', 'Beige', 'Blush'], sizes: ['One Size'], stocks: [10, 8, 6], unitsSold: 44, revenue: 72600, isNew: true },
  { id: 'p11', name: 'Leather Waist Belt', sku: 'CRV-BT-011', category: 'Belt', collection: 'Core Essentials', published: true, featured: false, price: 380, cost: 140, colors: ['Black', 'Beige'], sizes: ['One Size'], stocks: [20, 16], unitsSold: 61, revenue: 23180 },
].map((p) => ({ ...p, images: IMAGES[p.id] }));

// Every lookup below takes the product list as its first argument,
// defaulting to the static seed `PRODUCTS` — so code that hasn't been
// wired to live admin-added products still works, while the storefront
// and admin pages pass `useStore().products` to see everything the admin
// has added, not just the original seed catalog.
export function getProduct(id, list = PRODUCTS) {
  return list.find((p) => p.id === id) || null;
}

export function publishedProducts(list = PRODUCTS) {
  return list.filter((p) => p.published);
}

// Featured first, backfilled with other published products so the
// homepage grid always fills out to `limit` cards — it shouldn't look
// sparse just because only a few products happen to be flagged featured.
export function featuredProducts(list = PRODUCTS, limit = 7) {
  const pub = list.filter((p) => p.published);
  const featured = pub.filter((p) => p.featured);
  const rest = pub.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, limit);
}

export function saleProducts(list = PRODUCTS) {
  return list.filter((p) => p.published && p.compareAtPrice > p.price);
}

export function newArrivals(list = PRODUCTS, limit = 3) {
  return list.filter((p) => p.published && p.isNew).slice(0, limit);
}

export function bestSellers(list = PRODUCTS, limit = 4) {
  return list.filter((p) => p.published).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, limit);
}

export function relatedProducts(list = PRODUCTS, currentId, limit = 4) {
  const current = getProduct(currentId, list);
  if (!current) return [];
  const pool = list.filter((p) => p.published && p.id !== current.id);
  const rank = (p) => {
    if (p.category === current.category) return 0;
    if (CATEGORY_SECTION[p.category] === CATEGORY_SECTION[current.category]) return 1;
    return 2;
  };
  pool.sort((a, b) => rank(a) - rank(b));
  return pool.slice(0, limit);
}

export function priceLabel(amount) {
  return 'EGP ' + Math.round(amount).toLocaleString();
}

export function discountPercent(product) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null;
  return Math.round((1 - product.price / product.compareAtPrice) * 100);
}

// Stock lookup: colors × sizes are laid out row-major in `stocks`, exactly
// like the variant matrix the admin side manages.
export function stockFor(product, colorIdx, sizeIdx) {
  const idx = colorIdx * product.sizes.length + sizeIdx;
  return product.stocks[idx] || 0;
}

export function isOneSize(product) {
  return product.sizes.length === 1 && product.sizes[0] === 'One Size';
}

export function sizeChartFor(product) {
  return SIZE_CHARTS[product.category] || null;
}

export function oneSizeNote(product) {
  return ONE_SIZE_FIT[product.category] || 'One size, designed to fit most body types with a relaxed silhouette.';
}

const DETAILS_COPY = {
  Bags: 'Structured silhouette in premium vegan leather with reinforced handles and a secure top closure. Interior slip pocket keeps essentials organized.',
  Belt: 'Genuine leather belt with a matte metal buckle. Adjustable across multiple hole settings for a precise fit.',
  Tok: 'Lightweight silk-blend wrap, hand-finished for a smooth drape. Ties securely for an all-day hold.',
  'LV Tok': 'Signature print silk-blend wrap, hand-finished for a smooth drape. Ties securely for an all-day hold.',
  Socks: 'Soft ribbed-knit blend with reinforced heel and toe for everyday comfort and durability.',
};
const DEFAULT_DETAILS = 'Cut from premium fabric for structure and drape. Relaxed through the body with a clean, minimal finish true to the CERVOWEAR silhouette.';

const CARE_COPY = {
  Bags: 'Wipe clean with a soft, dry cloth. Avoid prolonged exposure to direct sunlight and moisture. Store stuffed with tissue to hold shape.',
  Belt: 'Wipe clean with a soft, dry cloth. Avoid prolonged exposure to water.',
  Tok: 'Hand wash cold or dry clean. Do not wring — reshape and lay flat to dry.',
  'LV Tok': 'Hand wash cold or dry clean. Do not wring — reshape and lay flat to dry.',
  Socks: 'Machine wash cold with like colors. Do not bleach. Tumble dry low.',
};
const DEFAULT_CARE = 'Machine wash cold, inside out. Do not tumble dry. Iron on low heat if needed. Do not bleach.';

export function detailsCopyFor(product) {
  return product.details || DETAILS_COPY[product.category] || DEFAULT_DETAILS;
}

export function careCopyFor(product) {
  return CARE_COPY[product.category] || DEFAULT_CARE;
}

// Admin dashboard KPIs, computed from the same mock catalog — there's no
// orders/analytics backend yet, so "orders" and the trend line are modeled
// from unitsSold at a plausible items-per-order ratio rather than invented
// outright. Swap this for real aggregates once the backend exists.
const ITEMS_PER_ORDER = 1.6;
const LOW_STOCK_THRESHOLD = 5;

export function dashboardStats(list = PRODUCTS) {
  const pub = publishedProducts(list);
  const totalRevenue = pub.reduce((sum, p) => sum + (p.revenue || 0), 0);
  const totalUnits = pub.reduce((sum, p) => sum + (p.unitsSold || 0), 0);
  const orders = Math.max(1, Math.round(totalUnits / ITEMS_PER_ORDER));
  const aov = totalRevenue / orders;

  const lowStockVariants = pub.reduce((sum, p) => sum + p.stocks.filter((s) => s > 0 && s < LOW_STOCK_THRESHOLD).length, 0);
  const pendingOrders = Math.max(1, Math.round(orders * 0.04));

  const topProducts = [...pub]
    .sort((a, b) => (b.unitsSold || 0) - (a.unitsSold || 0))
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      initials: p.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
      unitsSold: p.unitsSold || 0,
      revenue: priceLabel(p.revenue || 0),
      stock: p.stocks.reduce((s, n) => s + n, 0),
    }));

  // A deterministic 7-bar trend seeded from total revenue, so the shape is
  // stable across renders instead of re-randomizing every load.
  const seed = Math.round(totalRevenue) % 97;
  const weights = [0.62, 0.74, 0.58, 0.86, 0.7, 0.95, 0.8];
  const trend = weights.map((w, i) => Math.round(totalRevenue / 7 * w * (0.85 + ((seed + i * 13) % 30) / 100)));

  return {
    revenueLabel: priceLabel(totalRevenue),
    revenueDelta: '+12.4%',
    orders,
    ordersDelta: '+6.1%',
    aovLabel: priceLabel(aov),
    unitsSold: totalUnits,
    pendingOrders,
    lowStockVariants,
    trend,
    topProducts,
  };
}

// Suggests an English colour name from a picked hex swatch by nearest
// match against the brand's known colour library — so an admin can just
// pick a colour on the palette and get a sensible starting name to tweak,
// instead of typing one from scratch every time.
export function suggestColorName(hex, knownColors = COLOR_HEX) {
  const toRgb = (h) => {
    const n = h.replace('#', '');
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  };
  const [r, g, b] = toRgb(hex);
  let best = null;
  let bestDist = Infinity;
  Object.entries(knownColors).forEach(([name, knownHex]) => {
    const [kr, kg, kb] = toRgb(knownHex);
    const dist = (r - kr) ** 2 + (g - kg) ** 2 + (b - kb) ** 2;
    if (dist < bestDist) { bestDist = dist; best = name; }
  });
  return best || 'New Shade';
}

// Builds a fresh row-major stocks matrix (colors × sizes, see `stockFor`)
// for a color/size combination, carrying over any stock counts that still
// line up by name so editing a product's variants doesn't zero out counts
// for colors/sizes that didn't change.
export function buildVariantMatrix(colors, sizes, previous = null) {
  return colors.flatMap((color, ci) =>
    sizes.map((size, si) => {
      let stock = 0;
      if (previous && previous.colors && previous.sizes) {
        const pci = previous.colors.indexOf(color);
        const psi = previous.sizes.indexOf(size);
        if (pci !== -1 && psi !== -1) stock = previous.stocks[pci * previous.sizes.length + psi] || 0;
      }
      return { color, size, colorIdx: ci, sizeIdx: si, stock };
    }),
  );
}

export function variantSku(product, color, size) {
  const colorCode = color.replace(/\s+/g, '').slice(0, 3).toUpperCase();
  const sizeCode = size.replace(/\s+/g, '').toUpperCase();
  return `${product.sku}-${colorCode}-${sizeCode}`;
}
