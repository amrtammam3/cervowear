import { Head, router } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import ImageSlot from '@/Components/ImageSlot';
import Reveal from '@/Components/Reveal';
import IntroOverlay from '@/Components/Storefront/IntroOverlay';
import ProductCard from '@/Components/Storefront/ProductCard';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { SHOP_GROUPS, SITE_IMAGES, bestSellers, featuredProducts } from '@/data/products';
import { useStore } from '@/lib/StoreContext';

export default function Home() {
  const { categories, products: allProducts, homePage } = useStore();
  const { hero, categories: categoriesContent, newArrivals, ourStory, bestSellers: bestSellersContent } = homePage;
  const products = featuredProducts(allProducts, 7);
  const bestSellerProducts = bestSellers(allProducts, 4);
  const enabledNames = new Set(categories.filter((c) => c.enabled).map((c) => c.name));
  const categoryTiles = [
    ...SHOP_GROUPS.filter((g) => g.items.some((i) => enabledNames.has(i))).map((g) => ({ label: g.label, category: g.label })),
    ...(enabledNames.has('Bags') ? [{ label: 'Bags', category: 'Bags' }] : []),
    ...(categories.some((c) => c.section === 'Accessoires' && c.enabled) ? [{ label: 'Accessoires', category: 'Accessoires' }] : []),
  ];

  function shopAll(e) {
    e.preventDefault();
    router.get('/shop', { category: 'All' });
  }

  function shopCategory(category) {
    return (e) => {
      e.preventDefault();
      router.get('/shop', { category });
    };
  }

  function goShop() {
    router.get('/shop', { category: hero.linkCategory });
  }

  return (
    <StorefrontLayout>
      <Head title="CERVOWEAR" />
      <IntroOverlay />

      {/* HERO — a single image, nothing else */}
      <div className="cw-hero" style={{ position: 'relative', height: '82vh', minHeight: 420, maxHeight: 760, overflow: 'hidden', cursor: 'pointer' }} onClick={goShop}>
        <ImageSlot src={hero.image || SITE_IMAGES.heroMain} placeholder="Drop hero lookbook photo" style={{ objectPosition: 'center 20%' }} />
      </div>

      {/* OVERSIZED WORDMARK DIVIDER */}
      <div style={{ overflow: 'hidden', padding: '10px 0', borderTop: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)' }}>
        <Reveal direction="down" className="cw-store-wordmark" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '11vw', lineHeight: 1, letterSpacing: '-0.02em', whiteSpace: 'nowrap', textAlign: 'center', color: 'var(--color-text)' }}>CERVOWEAR</Reveal>
      </div>

      {/* FEATURED GRID */}
      <div id="new-in" style={{ maxWidth: 1400, margin: '0 auto', padding: 32, scrollMarginTop: 80 }}>
        <Reveal direction="up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <div className="card-kicker">{newArrivals.kicker}</div>
          <a href="#" onClick={shopAll} style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Shop All →</a>
        </Reveal>
        <div className="cw-store-feat-grid cw-home-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14 }}>
          <Blueprint className="cw-store-feat-text-tile" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, minHeight: 260, overflow: 'hidden' }}>
            {newArrivals.photo && <ImageSlot src={newArrivals.photo} />}
            <div style={{ position: newArrivals.photo ? 'relative' : 'static', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20, textAlign: 'center', letterSpacing: '0.02em', textTransform: 'uppercase', whiteSpace: 'pre-line', color: newArrivals.photo ? '#fff' : 'var(--color-text)', textShadow: newArrivals.photo ? '0 1px 8px rgba(0,0,0,0.45)' : 'none' }}>{newArrivals.tileHeading}</div>
          </Blueprint>
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>

      {/* SHOP BY CATEGORY */}
      <div style={{ maxWidth: 1400, margin: '40px auto 0', padding: 32 }}>
        <div className="cw-store-category-grid" style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.3fr', gap: 32 }}>
          <Reveal direction="up" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-kicker" style={{ marginBottom: 10 }}>{categoriesContent.eyebrow}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(28px,3vw,40px)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              {categoriesContent.heading}
            </div>
            <div className="text-muted" style={{ fontSize: 14, marginTop: 12, lineHeight: 1.6, maxWidth: 340 }}>
              {categoriesContent.description}
            </div>
            <Blueprint style={{ position: 'relative', minHeight: 200, marginTop: 20, flex: 1, overflow: 'hidden' }}>
              <ImageSlot src={categoriesContent.photo || SITE_IMAGES.splitClothing} className="duotone" placeholder="Category photo" />
            </Blueprint>
            <a href="#" onClick={shopAll} className="btn btn-secondary btn-block" style={{ marginTop: 16, textAlign: 'center' }}>Shop All →</a>
          </Reveal>

          <div className="cw-store-category-tiles" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 14 }}>
            {categoryTiles.map((t) => {
              const photo = categoriesContent.tilePhotos?.[t.label];
              return (
                <Blueprint key={t.label} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: 'clamp(280px, 26vw, 380px)' }} onClick={shopCategory(t.category)}>
                  <div style={{ position: 'relative', height: '90%', overflow: 'hidden' }}>
                    <ImageSlot src={photo} placeholder={t.label} />
                  </div>
                  <div style={{ height: '10%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid var(--color-divider)' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13, letterSpacing: '0.02em' }}>{t.label}</span>
                  </div>
                </Blueprint>
              );
            })}
          </div>
        </div>
      </div>

      {/* OUR STORY — split portrait + detail photo, with brand copy */}
      {ourStory.enabled && (
        <div style={{ maxWidth: 1400, margin: '64px auto 0', padding: 32 }}>
          <div className="cw-store-category-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            <Reveal direction="left" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14 }}>
              <Blueprint style={{ position: 'relative', minHeight: 360, overflow: 'hidden' }}>
                <ImageSlot src={ourStory.mainPhoto} placeholder="Main portrait photo" />
              </Blueprint>
              <Blueprint style={{ position: 'relative', minHeight: 200, marginTop: 40, overflow: 'hidden' }}>
                <ImageSlot src={ourStory.detailPhoto} placeholder="Detail photo" />
              </Blueprint>
            </Reveal>
            <Reveal direction="right">
              <div className="card-kicker" style={{ marginBottom: 10 }}>{ourStory.eyebrow}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(26px,2.8vw,36px)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                {ourStory.leadIn}
              </div>
              <div className="text-muted" style={{ fontSize: 14, marginTop: 14, lineHeight: 1.7, maxWidth: 440 }}>
                {ourStory.paragraph}
              </div>
            </Reveal>
          </div>
        </div>
      )}

      {/* BEST SELLERS */}
      {bestSellersContent.enabled && bestSellerProducts.length > 0 && (
        <div style={{ maxWidth: 1400, margin: '64px auto 0', padding: 32 }}>
          <Reveal direction="up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <div>
              <div className="card-kicker">{bestSellersContent.eyebrow}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(24px,2.6vw,32px)', letterSpacing: '-0.01em', marginTop: 6 }}>{bestSellersContent.heading}</div>
            </div>
            <a href="#" onClick={shopAll} style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Shop All →</a>
          </Reveal>
          <div className="cw-store-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14 }}>
            {bestSellerProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </StorefrontLayout>
  );
}
