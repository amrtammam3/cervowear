import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import ImageSlot from '@/Components/ImageSlot';
import { SHOP_GROUPS, SITE_IMAGES, newArrivals, priceLabel } from '@/data/products';
import { useStore } from '@/lib/StoreContext';

const POPULAR_SEARCHES = ['Dress', 'Blazer', 'Set', 'Blouse', 'Top & Bodysuit'];
const SEARCH_SUGGESTED_CATEGORIES = ['Bags', 'Accessoires', 'Sale'];

export default function Navbar({ minimal = false }) {
  const { cartCount, openCart, favoriteIds, categories, products } = useStore();
  const NEW_ARRIVALS = newArrivals(products, 3);
  const enabledNames = new Set(categories.filter((c) => c.enabled).map((c) => c.name));
  const shopGroups = SHOP_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => enabledNames.has(i)) })).filter((g) => g.items.length > 0);
  const accessoireItems = (categories.filter((c) => c.section === 'Accessoires' && c.enabled).map((c) => c.name));
  const bagsEnabled = enabledNames.has('Bags');
  const [navMenu, setNavMenu] = useState(null); // null | shop | newin
  const [navSearchOpen, setNavSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileScreen, setMobileScreen] = useState('root'); // root | shop | newin | accessoires

  function toggleNavMenu(key) {
    setNavMenu((cur) => (cur === key ? null : key));
    setNavSearchOpen(false);
  }
  function toggleNavSearch() {
    setNavSearchOpen((v) => !v);
    setNavMenu(null);
  }
  function closeOverlays() {
    setNavMenu(null);
    setNavSearchOpen(false);
  }
  function goCatalog(category) {
    closeOverlays();
    router.get('/shop', { category });
  }
  function goCatalogNew(category) {
    closeOverlays();
    router.get('/shop', { category, new: 1 });
  }
  function openMobileMenu() {
    setMobileMenuOpen(true);
    setMobileScreen('root');
  }
  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }
  function goMobileCatalog(category) {
    setMobileMenuOpen(false);
    setMobileScreen('root');
    router.get('/shop', { category });
  }
  function goMobileCatalogNew(category) {
    setMobileMenuOpen(false);
    setMobileScreen('root');
    router.get('/shop', { category, new: 1 });
  }

  const navMenuOpen = !!navMenu;

  if (minimal) {
    return (
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--color-bg)', borderBottom: '1px solid var(--color-divider)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '18px 32px', display: 'flex', justifyContent: 'center' }}>
          <Link
            href="/"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 24, letterSpacing: '-0.01em', whiteSpace: 'nowrap', color: 'var(--color-text)' }}
          >
            CERVOWEAR
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--color-bg)', borderBottom: '1px solid var(--color-divider)' }}>
      <div className="cw-store-navbar-inner" style={{ position: 'relative', maxWidth: 1400, margin: '0 auto', padding: '16px 32px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, minWidth: 0 }}>
          <button className="btn btn-icon btn-secondary cw-store-hamburger" aria-label="Menu" onClick={openMobileMenu}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18"></path></svg>
          </button>

          <div className="cw-store-navlinks" style={{ gap: 30, alignItems: 'center', position: 'relative' }}>
            <button className="cw-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => toggleNavMenu('shop')}>
              Shop
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: navMenu === 'shop' ? 'rotate(180deg)' : 'none' }}><path d="M6 9l6 6 6-6"></path></svg>
            </button>
            <button className="cw-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => toggleNavMenu('newin')}>
              New In
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: navMenu === 'newin' ? 'rotate(180deg)' : 'none' }}><path d="M6 9l6 6 6-6"></path></svg>
            </button>
            <Link href="/lookbook" className="cw-nav-link">Lookbook</Link>
            <Link href="/contact" className="cw-nav-link">Contact Us</Link>
          </div>
        </div>

        <Link
          href="/"
          className="cw-store-logo"
          style={{
            justifySelf: 'center',
            fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 24, letterSpacing: '-0.01em',
            whiteSpace: 'nowrap', color: 'var(--color-text)',
          }}
        >
          CERVOWEAR
        </Link>

        <div className="cw-store-icons" style={{ display: 'flex', alignItems: 'center', gap: 6, justifySelf: 'end' }}>
          <button className="btn btn-icon btn-secondary" aria-label="Search" onClick={toggleNavSearch}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3"></path></svg>
          </button>
          <Link href="/admin" className="btn btn-icon btn-secondary cw-store-admin-icon" aria-label="Admin Login" title="Admin">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"></path></svg>
          </Link>
          <Link href="/wishlist" className="btn btn-icon btn-secondary" aria-label="Wishlist" title="Wishlist" style={{ position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-9.3a5 5 0 0 0 0-7.1z"></path></svg>
            {favoriteIds.length > 0 && (
              <span style={{ position: 'absolute', top: 2, right: 2, background: 'var(--color-accent)', color: 'var(--color-bg)', fontSize: 9, lineHeight: 1, padding: '2px 4px' }}>{favoriteIds.length}</span>
            )}
          </Link>
          <button className="btn btn-icon btn-secondary" aria-label="Bag" style={{ position: 'relative' }} onClick={openCart}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8h12l-1 12H7L6 8z"></path><path d="M9 8V6a3 3 0 0 1 6 0v2"></path></svg>
            <span style={{ position: 'absolute', top: 2, right: 2, background: 'var(--color-accent)', color: 'var(--color-bg)', fontSize: 9, lineHeight: 1, padding: '2px 4px' }}>{cartCount}</span>
          </button>
        </div>

        {navMenu === 'shop' && (
          <div className="cw-mega-panel">
            <div className="cw-mega-shop-grid" style={{ maxWidth: 1400, margin: '0 auto', padding: '36px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1.2fr', gap: 24 }}>
              {shopGroups.map((group) => (
                <div key={group.label}>
                  <div className="card-kicker" style={{ marginBottom: 14 }}>{group.label}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                    {group.items.map((l) => (
                      <a key={l} href="#" onClick={(e) => { e.preventDefault(); goCatalog(l); }}>{l}</a>
                    ))}
                  </div>
                </div>
              ))}
              <div>
                {accessoireItems.length > 0 && (
                  <>
                    <div className="card-kicker" style={{ marginBottom: 14 }}>Accessoires</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                      {accessoireItems.map((l) => (
                        <a key={l} href="#" onClick={(e) => { e.preventDefault(); goCatalog(l); }}>{l}</a>
                      ))}
                    </div>
                  </>
                )}
                {bagsEnabled && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-divider)' }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); goCatalog('Bags'); }}>Bags</a>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-divider)' }}>
                  <a href="#" onClick={(e) => { e.preventDefault(); goCatalog('All'); }} style={{ fontWeight: 600 }}>Shop All</a>
                  <Link href="/sale" style={{ fontWeight: 600, color: 'var(--color-accent-700)' }}>Sale</Link>
                </div>
              </div>
              <Blueprint className="cw-mega-shop-image" style={{ position: 'relative', minHeight: 280 }}>
                <ImageSlot src={SITE_IMAGES.megaShopCampaign} className="duotone" placeholder="Campaign photo" />
                <div style={{ position: 'absolute', left: 18, bottom: 18, pointerEvents: 'none' }}>
                  <div style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20, letterSpacing: '0.01em', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>THE NEW SEASON</div>
                  <a href="#" onClick={(e) => { e.preventDefault(); goCatalog('All'); }} style={{ pointerEvents: 'auto', color: '#fff', fontSize: 13, textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>Explore the latest collection →</a>
                </div>
              </Blueprint>
            </div>
          </div>
        )}

        {navMenu === 'newin' && (
          <div className="cw-mega-panel">
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '36px 32px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32 }}>
              <div>
                <div className="card-kicker" style={{ marginBottom: 14 }}>New In</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                  <a href="#" onClick={(e) => { e.preventDefault(); goCatalog('New In'); }} style={{ fontWeight: 600, color: 'var(--color-accent-700)' }}>Just Dropped</a>
                  {shopGroups.map((group) => (
                    <a key={group.label} href="#" onClick={(e) => { e.preventDefault(); goCatalogNew(group.label); }}>{group.label}</a>
                  ))}
                </div>
              </div>
              {NEW_ARRIVALS.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${NEW_ARRIVALS.length}, minmax(0,1fr))`, gap: 16 }}>
                  {NEW_ARRIVALS.map((p) => (
                    <button key={p.id} onClick={() => { closeOverlays(); router.get(`/products/${p.id}`); }} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}>
                      <Blueprint style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
                        <ImageSlot src={p.images?.card || p.images?.main} placeholder="New arrival" />
                      </Blueprint>
                      <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 10 }}>{p.name}</div>
                      <div className="text-muted" style={{ fontSize: 12.5, marginTop: 2 }}>{priceLabel(p.price)}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-muted" style={{ fontSize: 14, alignSelf: 'center' }}>No new arrivals just yet — check back soon.</div>
              )}
            </div>
          </div>
        )}

        {navSearchOpen && (
          <div className="cw-search-panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0 }}>
            <div style={{ maxWidth: 800, margin: '0 auto', padding: 32 }}>
              <div className="field" style={{ margin: 0 }}>
                <input className="input" style={{ fontSize: 18, padding: '14px 16px' }} type="text" placeholder="Search products…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
                <div>
                  <div className="card-kicker" style={{ marginBottom: 10 }}>Popular Searches</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {POPULAR_SEARCHES.map((ps) => <span key={ps} className="tag tag-outline">{ps}</span>)}
                  </div>
                </div>
                <div>
                  <div className="card-kicker" style={{ marginBottom: 10 }}>Suggested Categories</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SEARCH_SUGGESTED_CATEGORIES.map((sc) => (
                      <button key={sc} className="tag tag-accent" style={{ cursor: 'pointer' }} onClick={() => (sc === 'Sale' ? router.get('/sale') : goCatalog(sc))}>{sc}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {navMenuOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 45, background: 'color-mix(in srgb, var(--color-text) 15%, transparent)' }} onClick={closeOverlays}></div>}
      {navSearchOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 45, background: 'color-mix(in srgb, var(--color-text) 15%, transparent)' }} onClick={closeOverlays}></div>}

      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'var(--color-bg)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--color-divider)' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.01em' }}>CERVOWEAR</div>
            <button className="btn btn-icon btn-secondary" aria-label="Close" onClick={closeMobileMenu}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>
            </button>
          </div>

          {mobileScreen === 'root' && (
            <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 20px' }}>
              <button className="cw-nav-link" style={{ justifyContent: 'space-between', display: 'flex', fontSize: 22, padding: '18px 0', borderBottom: '1px solid var(--color-divider)' }} onClick={() => setMobileScreen('shop')}><span>Shop</span><span>+</span></button>
              <button className="cw-nav-link" style={{ justifyContent: 'space-between', display: 'flex', fontSize: 22, padding: '18px 0', borderBottom: '1px solid var(--color-divider)' }} onClick={() => setMobileScreen('newin')}><span>New In</span><span>+</span></button>
              <Link href="/lookbook" style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 22, padding: '18px 0', borderBottom: '1px solid var(--color-divider)', color: 'var(--color-text)' }} onClick={closeMobileMenu}>Lookbook</Link>
              <Link href="/contact" style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 22, padding: '18px 0', borderBottom: '1px solid var(--color-divider)', color: 'var(--color-text)' }} onClick={closeMobileMenu}>Contact Us</Link>

              <Link href="/wishlist" style={{ fontSize: 14, marginTop: 20, color: 'var(--color-text)' }} onClick={closeMobileMenu}>Wishlist {favoriteIds.length > 0 ? `(${favoriteIds.length})` : ''}</Link>
              <Link href="/admin" style={{ fontSize: 14, marginTop: 12, color: 'var(--color-text)' }} onClick={closeMobileMenu}>Admin</Link>

              <div style={{ display: 'flex', gap: 20, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--color-divider)', fontSize: 13 }}>
                <a href="#">Instagram</a><a href="#">TikTok</a>
              </div>
            </div>
          )}

          {mobileScreen === 'newin' && (
            <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 20px' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '14px 0', cursor: 'pointer', color: 'var(--color-text)' }} onClick={() => setMobileScreen('root')}>← New In</button>
              <a href="#" onClick={(e) => { e.preventDefault(); goMobileCatalog('New In'); }} style={{ fontSize: 18, fontWeight: 600, padding: '14px 0', borderBottom: '1px solid var(--color-divider)' }}>Just Dropped</a>
              {shopGroups.map((group) => (
                <a key={group.label} href="#" onClick={(e) => { e.preventDefault(); goMobileCatalogNew(group.label); }} style={{ fontSize: 18, padding: '14px 0', borderBottom: '1px solid var(--color-divider)' }}>{group.label}</a>
              ))}
            </div>
          )}

          {mobileScreen === 'shop' && (
            <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 20px' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '14px 0', cursor: 'pointer', color: 'var(--color-text)' }} onClick={() => setMobileScreen('root')}>← Shop</button>
              <a href="#" onClick={(e) => { e.preventDefault(); goMobileCatalog('All'); }} style={{ fontSize: 18, fontWeight: 600, padding: '14px 0', borderBottom: '1px solid var(--color-divider)' }}>Shop All</a>
              {shopGroups.map((group) => (
                <div key={group.label} style={{ marginTop: 6 }}>
                  <div className="card-kicker" style={{ padding: '10px 0 4px' }}>{group.label}</div>
                  {group.items.map((l) => (
                    <a key={l} href="#" onClick={(e) => { e.preventDefault(); goMobileCatalog(l); }} style={{ display: 'block', fontSize: 18, padding: '12px 0', borderBottom: '1px solid var(--color-divider)' }}>{l}</a>
                  ))}
                </div>
              ))}
              {accessoireItems.length > 0 && (
                <button style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', width: '100%', textAlign: 'left', fontSize: 18, padding: '12px 0', marginTop: 6, cursor: 'pointer', color: 'var(--color-text)' }} onClick={() => setMobileScreen('accessoires')}>
                  <span className="card-kicker" style={{ padding: 0 }}>Accessoires</span><span>›</span>
                </button>
              )}
              {bagsEnabled && (
                <a href="#" onClick={(e) => { e.preventDefault(); goMobileCatalog('Bags'); }} style={{ fontSize: 18, padding: '12px 0', borderBottom: '1px solid var(--color-divider)' }}>Bags</a>
              )}
            </div>
          )}

          {mobileScreen === 'accessoires' && (
            <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 20px' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '14px 0', cursor: 'pointer', color: 'var(--color-text)' }} onClick={() => setMobileScreen('shop')}>← Accessoires</button>
              {accessoireItems.map((l) => (
                <a key={l} href="#" onClick={(e) => { e.preventDefault(); goMobileCatalog(l); }} style={{ fontSize: 18, padding: '14px 0', borderBottom: '1px solid var(--color-divider)' }}>{l}</a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
