// Admin-controlled catalog taxonomy — which Collections and Categories are
// currently open for browsing. Same spirit as data/lookbooks.js: a small
// seed plus id/enabled helpers, with the actual mutable list living in
// StoreContext so admin edits show up everywhere immediately (Navbar,
// Footer, Catalog).

import { NAV_SECTIONS, CATEGORY_GROUP, PRODUCTS } from './products';

// Collections are just a label a product can carry (`product.collection`) —
// not part of the structural NAV_SECTIONS taxonomy, so admin can freely
// add/rename/delete/enable them without touching size charts or routing.
export function seedCollections() {
  const names = [...new Set(PRODUCTS.map((p) => p.collection).filter(Boolean))];
  return names.map((name, i) => ({ id: `col-${i + 1}`, name, enabled: true }));
}

export function newCollectionId() {
  return `col-${Date.now()}`;
}

// Categories are the leaves of NAV_SECTIONS (plus section labels with no
// children, like Bags) — these drive the Shop/New In mega menus. Disabling
// one hides it from navigation without touching any product data or size
// chart, since products still carry the category string regardless.
export function seedCategories() {
  const rows = [];
  NAV_SECTIONS.forEach((section) => {
    if (section.children.length === 0) {
      rows.push({ name: section.label, section: section.label, group: null, enabled: true });
    } else {
      section.children.forEach((name) => {
        rows.push({ name, section: section.label, group: CATEGORY_GROUP[name] || null, enabled: true });
      });
    }
  });
  return rows;
}

export function productCountByCategory(name, list = PRODUCTS) {
  return list.filter((p) => p.category === name).length;
}

export function productCountByCollection(name, list = PRODUCTS) {
  return list.filter((p) => p.collection === name).length;
}
