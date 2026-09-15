import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { CONVERSATIONS } from '@/data/orders';

const UNREAD_COUNT = CONVERSATIONS.filter((c) => c.unread).length;

const NAV = [
  {
    section: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: 'home' }],
  },
  {
    section: 'Website',
    items: [{ href: '/admin/home-page', label: 'Home Page', icon: 'layout' }],
  },
  {
    section: 'Commerce',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: 'bag' },
      { href: '/admin/products', label: 'Products', icon: 'tag' },
      { href: '/admin/inventory', label: 'Inventory', icon: 'layers' },
      { href: '/admin/customers', label: 'Customers', icon: 'users' },
      { href: '/admin/collections', label: 'Collections', icon: 'grid' },
    ],
  },
  {
    section: 'Social Commerce',
    items: [{ href: '/admin/inbox', label: 'Unified Inbox', icon: 'inbox' }],
  },
  {
    section: 'Marketing',
    items: [
      { href: '/admin/marketing', label: 'Meta Ads & Attribution', icon: 'megaphone' },
      { href: '/admin/promotions', label: 'Promotions', icon: 'percent' },
      { href: '/admin/lookbook', label: 'Lookbook', icon: 'image' },
    ],
  },
  {
    section: 'Operations',
    items: [
      { href: '/admin/returns', label: 'Returns & Exchanges', icon: 'refresh' },
      { href: '/admin/purchasing', label: 'Purchasing', icon: 'truck', soon: true },
      { href: '/admin/expenses', label: 'Expenses', icon: 'card', soon: true },
    ],
  },
  {
    section: 'System',
    items: [
      { href: '/admin/integrations', label: 'Integrations', icon: 'plug' },
      { href: '/admin/settings', label: 'Settings', icon: 'gear' },
    ],
  },
];

const ICONS = {
  home: <path d="M3 11l9-7 9 7M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />,
  bag: <path d="M6 8h12l-1 12H7L6 8zM9 8V6a3 3 0 0 1 6 0v2" />,
  tag: <><path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.17 3H4a1 1 0 0 0-1 1v5.17a2 2 0 0 0 .59 1.41l9.58 9.59a2 2 0 0 0 2.83 0l5.59-5.59a2 2 0 0 0 0-2.83z" /><circle cx="7.5" cy="7.5" r="1.3" /></>,
  layers: <path d="M12 2 2 7l10 5 10-5-10-5zM2 12l10 5 10-5M2 17l10 5 10-5" />,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><circle cx="17" cy="9" r="2.4" /><path d="M15 14.2c2.4.2 4 1.9 4 4.8" /></>,
  grid: <><rect x="3" y="4" width="7" height="7" /><rect x="14" y="4" width="7" height="7" /><rect x="3" y="15" width="7" height="7" /><rect x="14" y="15" width="7" height="7" /></>,
  inbox: <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />,
  megaphone: <path d="M3 10v4h3l6 4V6L6 10H3zM14 8a4 4 0 0 1 0 8M17 6a7 7 0 0 1 0 12" />,
  percent: <><path d="M20.6 12.6 12.6 20.6a2 2 0 0 1-2.83 0l-6.37-6.37a2 2 0 0 1 0-2.83L11.4 3.4A2 2 0 0 1 12.83 2.8H19a2 2 0 0 1 2 2v6.17a2 2 0 0 1-.4 1.43z" /><circle cx="15.5" cy="8.5" r="1.3" /></>,
  refresh: <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" />,
  truck: <><rect x="1" y="7" width="13" height="9" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="6" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /></>,
  card: <><rect x="2" y="6" width="20" height="14" rx="1" /><path d="M2 10h20" /><circle cx="17" cy="15" r="1.1" /></>,
  plug: <path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0V8zM12 18v4" />,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>,
  layout: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 9v12" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h0a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v0a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" /></>,
};

function NavIcon({ name }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

export default function AdminLayout({ title, children }) {
  const { url } = usePage();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function isActive(href) {
    return href === '/admin' ? url === '/admin' : url.startsWith(href);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: 15, overflow: 'hidden' }}>
      {mobileNavOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--color-text) 40%, transparent)', zIndex: 99 }} onClick={() => setMobileNavOpen(false)}></div>
      )}

      <div className={`cw-admin-sidebar ${mobileNavOpen ? 'open' : ''}`} style={{ flex: 'none', borderRight: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', overflowY: 'auto', width: 240, background: 'var(--color-bg)' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--color-divider)' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em' }}>CERVOWEAR</div>
          <div className="cw-admin-nav-section" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-accent-700)', marginTop: 2 }}>Admin</div>
        </div>
        <div style={{ padding: '12px 12px 24px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map((group) => (
            <div key={group.section}>
              <div className="cw-admin-nav-section" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'color-mix(in srgb, var(--color-text) 50%, transparent)', padding: '14px 10px 4px' }}>{group.section}</div>
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', fontSize: 14, minHeight: 40,
                      color: item.soon ? 'color-mix(in srgb, var(--color-text) 40%, transparent)' : active ? 'var(--color-accent-800)' : 'var(--color-text)',
                      background: active && !item.soon ? 'var(--color-accent-100)' : 'transparent',
                      textDecoration: 'none',
                    }}
                  >
                    <NavIcon name={item.icon} />
                    <span className="cw-admin-nav-label">{item.label}</span>
                    {item.soon && (
                      <span className="cw-admin-nav-label" style={{ marginLeft: 'auto', fontSize: 9.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'color-mix(in srgb, var(--color-text) 40%, transparent)', border: '1px solid var(--color-divider)', padding: '2px 6px' }}>Soon</span>
                    )}
                    {item.href === '/admin/inbox' && UNREAD_COUNT > 0 && (
                      <span className="cw-admin-nav-label" style={{ marginLeft: 'auto', background: 'var(--color-accent)', color: 'var(--color-bg)', fontSize: 11, lineHeight: 1, padding: '2px 6px' }}>{UNREAD_COUNT}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto', padding: '14px 20px', borderTop: '1px solid var(--color-divider)', fontSize: 11, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>v0 — Admin Preview</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <div className="nav" style={{ borderBottom: '1px solid var(--color-divider)', flex: 'none' }}>
          <button className="btn btn-icon btn-secondary cw-admin-hamburger" aria-label="Open menu" onClick={() => setMobileNavOpen(true)} style={{ display: 'none' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18"></path></svg>
          </button>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 19 }}>{title}</div>
          <div style={{ flex: 1 }}></div>
          <div className="input cw-admin-search" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)', minWidth: 0, width: 260 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3"></path></svg>
            <span style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>Search orders, customers, products…</span>
          </div>
          <Link href="/" className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>View Store ↗</Link>
          <button className="btn btn-icon btn-secondary" aria-label="Notifications">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 4-2 5-2 7h16c0-2-2-3-2-7z"></path><path d="M10 20a2 2 0 0 0 4 0"></path></svg>
          </button>
          <div style={{ width: 34, height: 34, border: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 600, color: 'var(--color-accent-800)' }}>A</div>
        </div>

        <div className="cw-admin-main" style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', minWidth: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
