// Mock orders + conversations for the admin workspace. Same spirit as
// data/products.js — plain frontend data, no API. Orders created at
// checkout or from the Unified Inbox get pushed into this same shape at
// runtime (see StoreContext's placeOrder), so admin/Orders.jsx never has to
// know whether an order was seeded or just placed.

import { getProduct, priceLabel } from './products';

export const CHANNELS = ['Website', 'Instagram', 'WhatsApp', 'Facebook', 'Messenger'];
export const ORDER_STATUSES = ['New', 'Confirmed', 'Preparing', 'Shipped', 'Delivered', 'Cancelled'];
export const PAYMENT_METHODS = ['Card', 'Cash on Delivery', 'Instapay', 'Deposit + Cash on Delivery', 'Deposit + Card'];
export const RETURN_TYPES = ['Return', 'Exchange'];
export const RETURN_STATUSES = ['Requested', 'Approved', 'Rejected', 'Completed'];
export const RETURN_REASONS = ['Wrong size', 'Changed my mind', 'Item damaged/faulty', 'Not as described', 'Wrong item received', 'Other'];

export function isDepositPayment(payment) {
  return payment?.startsWith('Deposit');
}

const CUSTOMERS = [
  'Nour Ibrahim', 'Karim Samir', 'Sara Ali', 'Omar Khaled', 'Rana Adel', 'Mariam Fathy',
  'Dina Mahmoud', 'Ahmed Mohamed', 'Hana Tarek', 'Amr Sherif', 'Yasmin Adel', 'Mostafa Hassan',
];

function itemsFrom(spec) {
  return spec.map(([productId, color, size, qty]) => {
    const p = getProduct(productId);
    return {
      productId, name: p.name, variantLabel: `${color} / ${size}`, color, size, qty,
      price: p.price, image: p.images?.card || p.images?.main || null,
    };
  });
}

function orderTotal(items) {
  return items.reduce((sum, it) => sum + it.price * it.qty, 0);
}

// Every order carries full shipping details, regardless of channel — a
// Website order gets them from checkout; a chat-channel order (Instagram/
// WhatsApp/Messenger/Facebook) gets them because the admin's "+ Create
// Order" in the Unified Inbox *requires* phone/address/city before it'll
// submit (see CreateOrderDialog). There's no path that produces an order
// without one — a chat that hasn't given an address yet is still just a
// conversation, not an order. Chat-created orders don't carry an email
// (that dialog never asks for one); Website ones do, since checkout does.
const SEED_SPECS = [
  { customerName: 'Nour Ibrahim', channel: 'Facebook', payment: 'Card', date: '2026-09-02', status: 'Delivered', spec: [['p1', 'Black', 'L', 1]], shipping: { phone: '+20 106 400 8871', address: '5 Al Nasr Rd, Nasr City', city: 'Cairo' } },
  { customerName: 'Karim Samir', channel: 'Instagram', payment: 'Instapay', date: '2026-09-01', status: 'Delivered', spec: [['p3', 'Khaki', 'M', 2]], shipping: { phone: '+20 100 556 7743', address: '18 El Merghany St, Heliopolis', city: 'Cairo' } },
  { customerName: 'Sara Ali', channel: 'WhatsApp', payment: 'Cash on Delivery', date: '2026-09-02', status: 'Shipped', spec: [['p4', 'Indigo', 'M', 1]], shipping: { phone: '+20 122 555 0912', address: '7 Talaat Harb St, Downtown', city: 'Cairo' } },
  { customerName: 'Omar Khaled', channel: 'Website', payment: 'Card', date: '2026-09-03', status: 'Preparing', spec: [['p6', 'Grey', 'L', 1]], shipping: { phone: '+20 100 222 3391', email: 'omar.khaled@gmail.com', address: '14 Mosadak St, Dokki', city: 'Giza' } },
  { customerName: 'Rana Adel', channel: 'WhatsApp', payment: 'Instapay', date: '2026-09-04', status: 'Delivered', spec: [['p5', 'Black', 'M', 1]], shipping: { phone: '+20 120 665 1187', address: '21 Gameat El Dewal St, Agouza', city: 'Giza' } },
  { customerName: 'Mariam Fathy', channel: 'Instagram', payment: 'Cash on Delivery', date: '2026-09-04', status: 'Confirmed', spec: [['p2', 'Beige', 'S', 2]], shipping: { phone: '+20 128 665 4498', address: '30 Abbas El Akkad St, Nasr City', city: 'Cairo' } },
  { customerName: 'Dina Mahmoud', channel: 'Instagram', payment: 'Card', date: '2026-09-05', status: 'New', spec: [['p8', 'Stone', 'M', 1]], shipping: { phone: '+20 118 220 4456', address: '4 Al Ahram St, Giza', city: 'Giza' } },
  { customerName: 'Ahmed Mohamed', channel: 'Instagram', payment: 'Cash on Delivery', date: '2026-08-28', status: 'Delivered', spec: [['p1', 'Black', 'M', 1]], shipping: { phone: '+20 100 123 4521', address: '11 Makram Ebeid St, Nasr City', city: 'Cairo' } },
  { customerName: 'Karim Samir', channel: 'Instagram', payment: 'Instapay', date: '2026-09-06', status: 'Shipped', spec: [['p7', 'Black', 'M', 3]], shipping: { phone: '+20 100 556 7743', address: '18 El Merghany St, Heliopolis', city: 'Cairo' } },
  { customerName: 'Hana Tarek', channel: 'WhatsApp', payment: 'Cash on Delivery', date: '2026-08-19', status: 'Delivered', spec: [['p2', 'White', 'M', 1]], shipping: { phone: '+20 115 342 9987', address: '9 Syria St, Mohandessin', city: 'Giza' } },
  { customerName: 'Amr Sherif', channel: 'Website', payment: 'Card', date: '2026-09-06', status: 'Preparing', spec: [['p3', 'Black', 'L', 1]], shipping: { phone: '+20 122 887 1120', email: 'amr.sherif@outlook.com', address: '9 Syria St, Mohandessin', city: 'Giza' } },
  { customerName: 'Yasmin Adel', channel: 'Website', payment: 'Card', date: '2026-09-07', status: 'New', spec: [['p9', 'Blush', 'One Size', 1]], shipping: { phone: '+20 111 093 4482', email: 'yasmin.adel@gmail.com', address: '3 Abbas El Akkad St, Nasr City', city: 'Cairo' } },
  { customerName: 'Mostafa Hassan', channel: 'Instagram', payment: 'Instapay', date: '2026-09-01', status: 'Delivered', spec: [['p10', 'Black', 'One Size', 1]], shipping: { phone: '+20 111 876 2200', address: '22 El Guish Rd, Stanley', city: 'Alexandria' } },
  { customerName: 'Nour Ibrahim', channel: 'Messenger', payment: 'Cash on Delivery', date: '2026-08-30', status: 'Delivered', spec: [['p11', 'Beige', 'One Size', 1]], shipping: { phone: '+20 106 400 8871', address: '5 Al Nasr Rd, Nasr City', city: 'Cairo' } },
  { customerName: 'Sara Ali', channel: 'WhatsApp', payment: 'Instapay', date: '2026-08-15', status: 'Delivered', spec: [['p5', 'Olive', 'M', 1]], shipping: { phone: '+20 122 555 0912', address: '7 Talaat Harb St, Downtown', city: 'Cairo' } },
  { customerName: 'Omar Khaled', channel: 'Website', payment: 'Card', date: '2026-09-08', status: 'Confirmed', spec: [['p10', 'Black', 'One Size', 1]], shipping: { phone: '+20 100 222 3391', email: 'omar.khaled@gmail.com', address: '14 Mosadak St, Dokki', city: 'Giza' } },
  { customerName: 'Rana Adel', channel: 'Website', payment: 'Card', date: '2026-09-08', status: 'New', spec: [['p11', 'Beige', 'One Size', 2]], shipping: { phone: '+20 106 774 5512', email: 'rana.adel@gmail.com', address: '21 Gameat El Dewal St, Agouza', city: 'Giza' } },
  { customerName: 'Dina Mahmoud', channel: 'Instagram', payment: 'Cash on Delivery', date: '2026-08-22', status: 'Cancelled', spec: [['p6', 'Black', 'M', 1]], shipping: { phone: '+20 118 220 4456', address: '4 Al Ahram St, Giza', city: 'Giza' } },
];

export function seedOrders() {
  return SEED_SPECS.map((s, i) => {
    const items = itemsFrom(s.spec);
    return {
      id: `ORD-${10471 + i}`,
      customerName: s.customerName,
      channel: s.channel,
      items,
      total: orderTotal(items),
      payment: s.payment,
      date: s.date,
      status: s.status,
      notes: '',
      shipping: s.shipping || null,
    };
  }).reverse();
}

export function orderTotalLabel(order) {
  return priceLabel(order.total);
}

export function itemsSummary(order) {
  return order.items.map((it) => `${it.qty}× ${it.name}`).join(', ');
}

// A couple of seeded return/exchange requests against already-delivered
// seed orders, so admin/Returns.jsx has real rows to show instead of an
// empty state on first load. New requests (from the order detail panel)
// get pushed into this same shape at runtime.
export function seedReturns() {
  return [
    {
      id: 'RET-3001', orderId: 'ORD-10478', customerName: 'Ahmed Mohamed', type: 'Exchange', reason: 'Wrong size', note: 'Needs L instead of M.', status: 'Requested', date: '2026-08-30',
      item: { name: 'Oversized Satin Shirt', variantLabel: 'Black / M', qty: 1, price: 850 },
      exchangeFor: { name: 'Oversized Satin Shirt', variantLabel: 'Black / L', price: 850 },
      settlement: { direction: 'Even swap', amount: 0 },
    },
    {
      id: 'RET-3002', orderId: 'ORD-10480', customerName: 'Hana Tarek', type: 'Return', reason: 'Changed my mind', note: '', status: 'Approved', date: '2026-08-21',
      item: { name: 'Essential Ribbed Top', variantLabel: 'White / M', qty: 1, price: 450 },
      exchangeFor: null,
      settlement: { direction: 'Refund to customer', amount: 450 },
    },
  ];
}

// Unified Inbox — mock conversations, cross-referenced to the customers
// above so "Recent Orders" in the Customer 360 panel is real.
export const CONVERSATIONS = [
  {
    id: 'c1', customerName: 'Ahmed Mohamed', channel: 'Instagram', time: '2m ago', unread: true,
    lastMessage: 'Is the black hoodie available in XL?',
    messages: [
      { from: 'customer', text: 'Hi! I saw your ad for the Winter Collection ❤️' },
      { from: 'customer', text: 'Is the black hoodie available in XL?' },
    ],
    customer: { phone: '+20 100 123 4521', instagram: '@ahmed.mh', status: 'Active', since: '2026-06-12', orders: 1, totalSpentLabel: 'EGP 850', lastOrder: '2026-08-28', source: 'Instagram Ad' },
  },
  {
    id: 'c2', customerName: 'Sara Ali', channel: 'WhatsApp', time: '8m ago', unread: true,
    lastMessage: 'XL please, order #10473',
    messages: [
      { from: 'customer', text: 'Hi, I want to exchange my jeans for a bigger size' },
      { from: 'customer', text: 'XL please, order #10473' },
    ],
    customer: { phone: '+20 122 555 0912', instagram: null, status: 'Active', since: '2026-05-02', orders: 2, totalSpentLabel: 'EGP 2,270', lastOrder: '2026-09-02', source: 'WhatsApp' },
  },
  {
    id: 'c3', customerName: 'Mostafa Hassan', channel: 'Instagram', time: '25m ago', unread: false,
    lastMessage: 'Yes! Delivery takes 2-3 business days to Alex.',
    messages: [
      { from: 'customer', text: 'Do you deliver to Alexandria?' },
      { from: 'admin', text: 'Yes! Delivery takes 2-3 business days to Alex.' },
    ],
    customer: { phone: '+20 111 876 2200', instagram: '@mostafa.h', status: 'Active', since: '2026-07-20', orders: 1, totalSpentLabel: 'EGP 1,650', lastOrder: '2026-09-01', source: 'Instagram DM' },
  },
  {
    id: 'c4', customerName: 'Nour Ibrahim', channel: 'Messenger', time: '1h ago', unread: false,
    lastMessage: 'So happy to hear that, Nour! 🎉',
    messages: [
      { from: 'customer', text: 'Just got my order, the shirt is gorgeous!' },
      { from: 'admin', text: 'So happy to hear that, Nour! 🎉' },
    ],
    customer: { phone: '+20 106 400 8871', instagram: null, status: 'Active', since: '2026-04-11', orders: 2, totalSpentLabel: 'EGP 1,170', lastOrder: '2026-09-02', source: 'Facebook Ad' },
  },
];
