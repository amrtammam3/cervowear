import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import ProductCard from '@/Components/Storefront/ProductCard';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { CATEGORY_GROUP, CATEGORY_SECTION, publishedProducts } from '@/data/products';
import { useStore } from '@/lib/StoreContext';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'bestseller', label: 'Best Seller' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

export default function Catalog({ category: initialCategory, onlyNew, collection }) {
  const { products: allProducts, colorHex } = useStore();
  const pubAll = publishedProducts(allProducts);
  const pub = useMemo(() => (collection ? pubAll.filter((p) => p.collection === collection) : pubAll), [pubAll, collection]);
  const [category, setCategory] = useState(initialCategory || 'All');
  const [sort, setSort] = useState('featured');
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(pub.map((p) => p.category))];
    return cats.map((c) => ({
      label: c,
      count: c === 'All' ? pub.length : pub.filter((p) => p.category === c).length,
      active: c === category,
    }));
  }, [category]);

  const byCategory = useMemo(() => {
    let list = pub;
    if (onlyNew || category === 'New In') list = list.filter((p) => p.isNew);
    if (category !== 'All' && category !== 'New In') {
      list = list.filter((p) => p.category === category || CATEGORY_SECTION[p.category] === category || CATEGORY_GROUP[p.category] === category);
    }
    return list;
  }, [category, onlyNew]);

  const pageTitle = collection
    ? collection
    : onlyNew && category !== 'All' && category !== 'New In'
      ? `New In — ${category}`
      : category === 'All' ? 'All Products' : category === 'New In' ? 'New In' : category;

  const allSizes = useMemo(() => {
    const list = [...new Set(byCategory.flatMap((p) => p.sizes))];
    list.sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));
    return list;
  }, [byCategory]);

  // A size filter is only useful when there's more than one size to choose
  // between — a section offering just "One Size" doesn't help anyone narrow
  // anything down, it just adds noise.
  const sizeFilterUseful = allSizes.length > 1;

  const allColors = useMemo(() => [...new Set(byCategory.flatMap((p) => p.colors))], [byCategory]);
  const colorFilterUseful = allColors.length > 1;

  const filtered = useMemo(() => {
    let list = byCategory;
    if (sizeFilterUseful && sizes.length) list = list.filter((p) => p.sizes.some((sz) => sizes.includes(sz)));
    if (colorFilterUseful && colors.length) list = list.filter((p) => p.colors.some((c) => colors.includes(c)));
    if (sort === 'bestseller') list = [...list].sort((a, b) => (b.unitsSold || 0) - (a.unitsSold || 0));
    else if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return list;
  }, [byCategory, sizes, colors, sort, sizeFilterUseful, colorFilterUseful]);

  const activeFilterCount = (sizeFilterUseful ? sizes.length : 0) + (colorFilterUseful ? colors.length : 0);

  function toggleSize(sz) {
    setSizes((cur) => (cur.includes(sz) ? cur.filter((x) => x !== sz) : [...cur, sz]));
  }

  function toggleColor(c) {
    setColors((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));
  }

  function clearAllFilters() {
    setSizes([]);
    setColors([]);
  }

  return (
    <StorefrontLayout>
      <Head title={`${pageTitle} — CERVOWEAR`} />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(26px,3.4vw,40px)', letterSpacing: '-0.01em' }}>{pageTitle}</div>
            <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{filtered.length} items</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-secondary" style={{ display: 'flex', gap: 8, alignItems: 'center' }} onClick={() => setFiltersOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M7 12h10M10 18h4"></path></svg>
              Filters &amp; Sort{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 20, marginBottom: 24, borderBottom: '1px solid var(--color-divider)' }}>
          {categories.map((cc) => (
            <button key={cc.label} className={`tag ${cc.active ? 'tag-accent' : 'tag-outline'}`} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'baseline', gap: 5 }} onClick={() => setCategory(cc.label)}>
              <span>{cc.label}</span><span style={{ opacity: 0.6, fontSize: '0.9em' }}>{cc.count}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-muted" style={{ padding: '60px 0', textAlign: 'center', fontSize: 14 }}>No products match these filters.</div>
        ) : (
          <div className="cw-store-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14 }}>
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>

      {filtersOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'color-mix(in srgb, var(--color-text) 30%, transparent)' }} onClick={() => setFiltersOpen(false)}></div>
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(380px,100vw)', zIndex: 151, background: 'var(--color-bg)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottom: '1px solid var(--color-divider)' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em' }}>Filters &amp; Sort</div>
              <button className="btn btn-icon btn-secondary" aria-label="Close" onClick={() => setFiltersOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              {activeFilterCount > 0 && (
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, textDecoration: 'underline', color: 'var(--color-accent-700)', marginBottom: 20 }} onClick={clearAllFilters}>Clear all filters ({activeFilterCount})</button>
              )}

              {colorFilterUseful && (
                <>
                  <div className="card-kicker" style={{ marginBottom: 12 }}>Color</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingBottom: 24, borderBottom: '1px solid var(--color-divider)' }}>
                    {allColors.map((c) => {
                      const selected = colors.includes(c);
                      return (
                        <button key={c} title={c} aria-label={c} onClick={() => toggleColor(c)} style={{ cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', background: colorHex[c] || '#999', border: `2px solid ${selected ? 'var(--color-accent-700)' : 'transparent'}`, boxShadow: '0 0 0 1px var(--color-divider) inset', padding: 0 }}></button>
                      );
                    })}
                  </div>
                </>
              )}

              {sizeFilterUseful && (
                <>
                  <div className="card-kicker" style={{ margin: colorFilterUseful ? '20px 0 12px' : '0 0 12px' }}>Size</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 24, borderBottom: '1px solid var(--color-divider)' }}>
                    {allSizes.map((sz) => (
                      <button key={sz} className={`tag ${sizes.includes(sz) ? 'tag-accent' : 'tag-outline'}`} style={{ cursor: 'pointer', minWidth: 38, textAlign: 'center' }} onClick={() => toggleSize(sz)}>{sz}</button>
                    ))}
                  </div>
                </>
              )}

              <div className="card-kicker" style={{ margin: '20px 0 12px' }}>Sort By</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {SORT_OPTIONS.map((so) => {
                  const selected = so.value === sort;
                  return (
                    <button key={so.value} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: '12px 0', borderTop: '1px solid var(--color-divider)', cursor: 'pointer', fontSize: 14, color: 'var(--color-text)', textAlign: 'left' }} onClick={() => setSort(so.value)}>
                      <span style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${selected ? 'var(--color-accent-700)' : 'var(--color-divider)'}`, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent-700)' }}></span>}
                      </span>
                      {so.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: 20, borderTop: '1px solid var(--color-divider)' }}>
              <button className="btn btn-primary btn-block" onClick={() => setFiltersOpen(false)}>Apply</button>
            </div>
          </div>
        </>
      )}
    </StorefrontLayout>
  );
}
