import { createContext, useContext, useMemo, useState } from 'react';
import { COLOR_HEX, PRODUCTS, getProduct, priceLabel } from '@/data/products';
import { seedOrders, seedReturns } from '@/data/orders';
import { MAX_IMAGES_PER_LOOKBOOK, MAX_LOOKBOOKS, newImageEntry, newLookbookId, seedLookbooks } from '@/data/lookbooks';
import { newCollectionId, productCountByCategory, productCountByCollection, seedCategories, seedCollections } from '@/data/taxonomy';
import { newNoteId, seedCustomers } from '@/data/customers';
import { evaluateDiscountCode, newDiscountId, seedDiscountCodes, seedSiteOffers } from '@/data/promotions';
import { newShippingRateId, newTeamMemberId, seedIntegrations, seedPaymentMethods, seedShippingRates, seedStoreInfo, seedTeamMembers } from '@/data/settings';
import { seedHomePage } from '@/data/homePage';

let productSeq = PRODUCTS.length + 1;
function newProductId() {
  return `p${productSeq++}`;
}

// Global (in-memory, frontend-only) storefront + admin state: cart,
// favorites, and orders. Wrapping the whole app once (see app.jsx) keeps it
// alive across Inertia page navigations — including storefront -> admin —
// without needing a persistent layout or a backend of its own. An order
// placed at checkout, or created from the admin Unified Inbox, lands in the
// same `orders` list admin/Orders.jsx reads.

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [cartItems, setCartItems] = useState([]); // [{key, productId, color, size, qty}]
  const [cartOpen, setCartOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [orders, setOrders] = useState(() => seedOrders());
  const [orderSeq, setOrderSeq] = useState(10471 + seedOrders().length);
  const [returns, setReturns] = useState(() => seedReturns());
  const [returnSeq, setReturnSeq] = useState(3001 + seedReturns().length);
  const [lookbooks, setLookbooks] = useState(() => seedLookbooks());
  const [collections, setCollections] = useState(() => seedCollections());
  const [categories, setCategories] = useState(() => seedCategories());
  const [products, setProducts] = useState(() => PRODUCTS);
  const [colorHex, setColorHex] = useState(() => ({ ...COLOR_HEX }));
  const [customers, setCustomers] = useState(() => seedCustomers(orders));
  const [discountCodes, setDiscountCodes] = useState(() => seedDiscountCodes());
  const [siteOffers, setSiteOffers] = useState(() => seedSiteOffers());
  const [homePage, setHomePage] = useState(() => seedHomePage());
  const [storeInfo, setStoreInfo] = useState(() => seedStoreInfo());
  const [shippingRates, setShippingRates] = useState(() => seedShippingRates());
  const [paymentMethods, setPaymentMethods] = useState(() => seedPaymentMethods());
  const [teamMembers, setTeamMembers] = useState(() => seedTeamMembers());
  const [integrations, setIntegrations] = useState(() => seedIntegrations());

  function addToCart(productId, color, size) {
    const key = `${productId}|${color}|${size}`;
    setCartItems((items) => {
      const existing = items.find((ci) => ci.key === key);
      if (existing) return items.map((ci) => (ci.key === key ? { ...ci, qty: ci.qty + 1 } : ci));
      return [...items, { key, productId, color, size, qty: 1 }];
    });
    setCartOpen(true);
  }

  function setQty(key, qty) {
    setCartItems((items) => (qty <= 0 ? items.filter((ci) => ci.key !== key) : items.map((ci) => (ci.key === key ? { ...ci, qty } : ci))));
  }

  function removeItem(key) {
    setCartItems((items) => items.filter((ci) => ci.key !== key));
  }

  function clearCart() {
    setCartItems([]);
  }

  function toggleFavorite(id) {
    setFavoriteIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  // Shared by storefront checkout and the admin Unified Inbox's "Create
  // Order" — the only difference between the two is `channel` and which
  // items get passed in. Returns the new order's id.
  function placeOrder({ customerName, channel, items, payment, date, notes = '', shipping = null, status = 'New', deposit = null, discountCode = null, discountAmount = 0 }) {
    const id = `ORD-${orderSeq}`;
    setOrderSeq((n) => n + 1);
    const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);
    setOrders((cur) => [{ id, customerName, channel, items, total, payment, date, status, notes, shipping, deposit, discountCode, discountAmount }, ...cur]);
    if (discountCode) redeemDiscountCode(discountCode);
    return id;
  }

  function updateOrderStatus(orderId, status) {
    setOrders((cur) => cur.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }

  // Chat-channel orders (Instagram/WhatsApp/Messenger) start without a
  // shipping address on file — the admin confirms it with the customer
  // over that same conversation, then records it here. Every order still
  // needs one before it can actually ship.
  function updateOrderShipping(orderId, shipping) {
    setOrders((cur) => cur.map((o) => (o.id === orderId ? { ...o, shipping: { ...o.shipping, ...shipping } } : o)));
  }

  // A return/exchange request against a delivered order — filed from the
  // order detail panel, tracked by admin/Returns.jsx.
  function requestReturn({ orderId, customerName, type, reason, note = '', item = null, exchangeFor = null, settlement = null }) {
    const id = `RET-${returnSeq}`;
    setReturnSeq((n) => n + 1);
    setReturns((cur) => [{ id, orderId, customerName, type, reason, note, item, exchangeFor, settlement, status: 'Requested', date: new Date().toISOString().slice(0, 10) }, ...cur]);
    return id;
  }

  function updateReturnStatus(returnId, status) {
    setReturns((cur) => cur.map((r) => (r.id === returnId ? { ...r, status } : r)));
  }

  // Lookbook — capped at MAX_LOOKBOOKS entries / MAX_IMAGES_PER_LOOKBOOK
  // photos each, enforced here (not just in the UI) so it holds regardless
  // of which screen calls it. The public /lookbook pages read this same
  // list, so an edit here shows up there immediately.
  function addLookbook(name) {
    let id = null;
    setLookbooks((cur) => {
      if (cur.length >= MAX_LOOKBOOKS) return cur;
      id = newLookbookId();
      return [...cur, { id, name, images: [] }];
    });
    return id;
  }

  function renameLookbook(id, name) {
    setLookbooks((cur) => cur.map((lb) => (lb.id === id ? { ...lb, name } : lb)));
  }

  function deleteLookbook(id) {
    setLookbooks((cur) => cur.filter((lb) => lb.id !== id));
  }

  function addLookbookImage(id, url) {
    setLookbooks((cur) => cur.map((lb) => {
      if (lb.id !== id || lb.images.length >= MAX_IMAGES_PER_LOOKBOOK) return lb;
      return { ...lb, images: [...lb.images, newImageEntry(url)] };
    }));
  }

  function removeLookbookImage(id, imageId) {
    setLookbooks((cur) => cur.map((lb) => (lb.id === id ? { ...lb, images: lb.images.filter((im) => im.id !== imageId) } : lb)));
  }

  // Collections — a free-form label products can carry. Admin controls which
  // ones are open for browsing; the storefront (Footer, Catalog) only ever
  // shows/filters by the enabled ones. Renaming/deleting is blocked while
  // products still carry that exact name, so a live collection can never go
  // silently missing from a product's data.
  function addCollection(name) {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: 'Name is required.' };
    if (collections.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return { ok: false, error: 'That collection already exists.' };
    setCollections((cur) => [...cur, { id: newCollectionId(), name: trimmed, enabled: true }]);
    return { ok: true };
  }

  function renameCollection(id, name) {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: 'Name is required.' };
    const current = collections.find((c) => c.id === id);
    if (current && productCountByCollection(current.name, products) > 0) return { ok: false, error: 'Rename blocked — products still use this collection name.' };
    setCollections((cur) => cur.map((c) => (c.id === id ? { ...c, name: trimmed } : c)));
    return { ok: true };
  }

  function deleteCollection(id) {
    const current = collections.find((c) => c.id === id);
    if (current && productCountByCollection(current.name, products) > 0) return { ok: false, error: 'Delete blocked — products still use this collection.' };
    setCollections((cur) => cur.filter((c) => c.id !== id));
    return { ok: true };
  }

  function toggleCollectionEnabled(id) {
    setCollections((cur) => cur.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  }

  // Categories — the leaves of the real NAV_SECTIONS taxonomy that drive the
  // Shop/New In mega menus. Admin can only enable/disable and add new ones
  // here (never rename/delete a name products already reference), so the
  // structural taxonomy — size charts, category filtering — never breaks.
  function toggleCategoryEnabled(name) {
    setCategories((cur) => cur.map((c) => (c.name === name ? { ...c, enabled: !c.enabled } : c)));
  }

  function addCategory({ name, section, group = null }) {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: 'Name is required.' };
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return { ok: false, error: 'That category already exists.' };
    setCategories((cur) => [...cur, { name: trimmed, section, group, enabled: true }]);
    return { ok: true };
  }

  function deleteCategory(name) {
    if (productCountByCategory(name, products) > 0) return { ok: false, error: 'Delete blocked — products still use this category.' };
    setCategories((cur) => cur.filter((c) => c.name !== name));
    return { ok: true };
  }

  // Products — the admin-managed catalog. `stocks` is always kept as a
  // row-major colors × sizes matrix (see data/products.js `stockFor`), so
  // every existing storefront/order/cart lookup keeps working unchanged
  // for products added here, exactly like the seeded catalog.
  function registerColor(name, hex) {
    setColorHex((cur) => ({ ...cur, [name]: hex }));
  }

  function addProduct(input) {
    const id = newProductId();
    const stocks = input.variants.map((v) => v.stock);
    const product = {
      id,
      name: input.name.trim(),
      sku: input.sku.trim(),
      category: input.category,
      collection: input.collection,
      published: input.published,
      featured: input.featured,
      isNew: input.isNew,
      isLimited: input.isLimited,
      price: input.price,
      cost: input.cost,
      compareAtPrice: input.compareAtPrice || undefined,
      colors: input.colors,
      sizes: input.sizes,
      stocks,
      description: input.description || '',
      details: input.details || '',
      unitsSold: 0,
      revenue: 0,
      images: input.images,
    };
    setProducts((cur) => [product, ...cur]);
    return id;
  }

  function updateProduct(id, input) {
    setProducts((cur) => cur.map((p) => {
      if (p.id !== id) return p;
      const stocks = input.variants.map((v) => v.stock);
      return {
        ...p,
        name: input.name.trim(),
        sku: input.sku.trim(),
        category: input.category,
        collection: input.collection,
        published: input.published,
        featured: input.featured,
        isNew: input.isNew,
        isLimited: input.isLimited,
        price: input.price,
        cost: input.cost,
        compareAtPrice: input.compareAtPrice || undefined,
        colors: input.colors,
        sizes: input.sizes,
        stocks,
        description: input.description || '',
        details: input.details || '',
        images: input.images || p.images,
      };
    }));
  }

  function deleteProduct(id) {
    setProducts((cur) => cur.filter((p) => p.id !== id));
  }

  function setVariantStock(productId, colorIdx, sizeIdx, stock) {
    setProducts((cur) => cur.map((p) => {
      if (p.id !== productId) return p;
      const idx = colorIdx * p.sizes.length + sizeIdx;
      const stocks = [...p.stocks];
      stocks[idx] = Math.max(0, stock);
      return { ...p, stocks };
    }));
  }

  // Internal, admin-only notes on a customer profile — "prefers delivery
  // after 5pm", "frequent exchanger" — the kind of context that should
  // follow the customer, not live in one admin's memory.
  function addCustomerNote(customerId, text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setCustomers((cur) => cur.map((c) => (
      c.id === customerId
        ? { ...c, notes: [{ id: newNoteId(), text: trimmed, date: new Date().toISOString().slice(0, 10) }, ...c.notes] }
        : c
    )));
  }

  // Block/unblock — for repeat COD no-shows or spam DMs. Blocking never
  // deletes history; it's a flag the Inbox/Orders screens can read to warn
  // an admin before they fulfill another order for this person.
  function toggleCustomerBlocked(customerId) {
    setCustomers((cur) => cur.map((c) => (c.id === customerId ? { ...c, blocked: !c.blocked } : c)));
  }

  // Editing a customer's name has to stay in sync with every order/return
  // already filed under their old name (see data/customers.js — identity
  // is matched by exact `customerName`), or their order history would
  // silently vanish the moment the name changed. Phone/Instagram/email
  // have no such fan-out, so they just update in place.
  function updateCustomer(customerId, { name, phone, instagram, email }) {
    const current = customers.find((c) => c.id === customerId);
    if (!current) return;
    const trimmedName = name.trim();
    const renamed = trimmedName && trimmedName !== current.name;
    if (renamed) {
      setOrders((cur) => cur.map((o) => (o.customerName === current.name ? { ...o, customerName: trimmedName } : o)));
      setReturns((cur) => cur.map((r) => (r.customerName === current.name ? { ...r, customerName: trimmedName } : r)));
    }
    setCustomers((cur) => cur.map((c) => (
      c.id === customerId
        ? { ...c, name: renamed ? trimmedName : c.name, phone: phone ?? c.phone, instagram: instagram ?? c.instagram, email: email ?? c.email }
        : c
    )));
  }

  // Discount codes — validated the same way whether it's typed at
  // checkout or applied from the exit-intent popup, via
  // data/promotions.js `evaluateDiscountCode`. `redeemDiscountCode` is
  // the only thing that mutates usage count, called once an order
  // actually goes through (see `placeOrder`), so a code's "uses" always
  // matches real orders, not just attempts.
  function addDiscountCode(input) {
    const id = newDiscountId();
    setDiscountCodes((cur) => [{ id, usageCount: 0, ...input, code: input.code.trim().toUpperCase() }, ...cur]);
    return id;
  }

  function updateDiscountCode(id, input) {
    setDiscountCodes((cur) => cur.map((c) => (c.id === id ? { ...c, ...input, code: input.code.trim().toUpperCase() } : c)));
  }

  function toggleDiscountCodeEnabled(id) {
    setDiscountCodes((cur) => cur.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  }

  function redeemDiscountCode(codeStr) {
    setDiscountCodes((cur) => cur.map((c) => (c.code.toUpperCase() === codeStr.toUpperCase() ? { ...c, usageCount: c.usageCount + 1 } : c)));
  }

  function checkDiscountCode(codeStr, subtotal) {
    return evaluateDiscountCode(codeStr, subtotal, discountCodes);
  }

  // On-site offer placements (announcement bar, exit-intent popup, cart
  // free-shipping bar) — one merge-patch updater per section, same
  // pattern as everything else here: the storefront reads this same
  // state live, so a toggle in admin shows up immediately.
  function updateSiteOffer(section, patch) {
    setSiteOffers((cur) => ({ ...cur, [section]: { ...cur[section], ...patch } }));
  }

  // Home page content — the storefront reads this same state live, so the
  // admin editor commits a whole edited section at once (see
  // Admin/HomePage.jsx's draft/Save/Discard flow) rather than patching
  // field-by-field like the other settings above.
  function saveHomePageSection(section, value) {
    setHomePage((cur) => ({ ...cur, [section]: value }));
  }

  // Store settings — brand info, per-governorate shipping, payment
  // methods, team, and integrations. Checkout reads `shippingRates` and
  // `paymentMethods` live, so a change here is what a real customer sees
  // on their next visit, not just admin-side config.
  function updateStoreInfo(patch) {
    setStoreInfo((cur) => ({ ...cur, ...patch }));
  }

  function addShippingRate(governorate, fee) {
    setShippingRates((cur) => [...cur, { id: newShippingRateId(), governorate, fee }]);
  }

  function updateShippingRate(id, patch) {
    setShippingRates((cur) => cur.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeShippingRate(id) {
    setShippingRates((cur) => cur.filter((r) => r.id !== id));
  }

  function updatePaymentMethods(patch) {
    setPaymentMethods((cur) => ({ ...cur, ...patch }));
  }

  function addTeamMember(input) {
    setTeamMembers((cur) => [...cur, { id: newTeamMemberId(), ...input }]);
  }

  function updateTeamMember(id, patch) {
    setTeamMembers((cur) => cur.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function removeTeamMember(id) {
    setTeamMembers((cur) => cur.filter((m) => m.id !== id));
  }

  function toggleIntegration(id) {
    setIntegrations((cur) => cur.map((i) => (i.id === id ? { ...i, connected: !i.connected, lastSyncedMinutesAgo: !i.connected ? 0 : i.lastSyncedMinutesAgo } : i)));
  }

  const cartLines = useMemo(
    () =>
      cartItems.map((ci) => {
        const p = getProduct(ci.productId, products) || {};
        return {
          key: ci.key,
          productId: ci.productId,
          name: p.name,
          variantLabel: `${ci.color} / ${ci.size}`,
          image: p.images?.main || p.images?.card || null,
          qty: ci.qty,
          priceLabel: priceLabel(p.price || 0),
          compareAtLabel: p.compareAtPrice ? priceLabel(p.compareAtPrice) : null,
          hasCompareAt: !!p.compareAtPrice,
        };
      }),
    [cartItems, products],
  );

  const cartCount = cartItems.reduce((sum, ci) => sum + ci.qty, 0);
  const cartSubtotal = cartItems.reduce((sum, ci) => {
    const p = getProduct(ci.productId, products);
    return sum + (p ? p.price : 0) * ci.qty;
  }, 0);
  const cartSubtotalLabel = priceLabel(cartSubtotal);

  const value = {
    cartItems,
    cartLines,
    cartCount,
    cartSubtotal,
    cartSubtotalLabel,
    cartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    addToCart,
    setQty,
    removeItem,
    clearCart,
    favoriteIds,
    toggleFavorite,
    orders,
    placeOrder,
    updateOrderStatus,
    updateOrderShipping,
    returns,
    requestReturn,
    updateReturnStatus,
    lookbooks,
    addLookbook,
    renameLookbook,
    deleteLookbook,
    addLookbookImage,
    removeLookbookImage,
    collections,
    addCollection,
    renameCollection,
    deleteCollection,
    toggleCollectionEnabled,
    categories,
    toggleCategoryEnabled,
    addCategory,
    deleteCategory,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    setVariantStock,
    colorHex,
    registerColor,
    customers,
    addCustomerNote,
    toggleCustomerBlocked,
    updateCustomer,
    discountCodes,
    addDiscountCode,
    updateDiscountCode,
    toggleDiscountCodeEnabled,
    checkDiscountCode,
    siteOffers,
    updateSiteOffer,
    homePage,
    saveHomePageSection,
    storeInfo,
    updateStoreInfo,
    shippingRates,
    addShippingRate,
    updateShippingRate,
    removeShippingRate,
    paymentMethods,
    updatePaymentMethods,
    teamMembers,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    integrations,
    toggleIntegration,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
