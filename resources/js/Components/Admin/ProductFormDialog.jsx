import { useMemo, useState } from 'react';
import { SIZE_PRESETS, buildVariantMatrix, isOneSize, sizeChartFor, suggestColorName, variantSku } from '@/data/products';
import { useStore } from '@/lib/StoreContext';

function suggestSku(name, category) {
  const catCode = (category || 'GEN').replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'GE';
  const nameCode = name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 3).toUpperCase() || 'XXX';
  return `CRV-${catCode}-${nameCode}`;
}

function ImageUploadTile({ onFile }) {
  return (
    <label className="blueprint" style={{ width: 84, height: 100, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none', color: 'var(--color-accent-700)' }}>
      <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onFile(URL.createObjectURL(file));
        e.target.value = '';
      }} />
    </label>
  );
}

// Add/Edit — the one form both admin/Products.jsx entry points use. Every
// choice here is deliberately constrained to what the rest of the app
// already understands: category/collection only ever come from the
// Collections & Categories admin (so a product can never reference a
// taxonomy leaf nothing else knows about), sizing is either the brand's
// real one-size categories, a standard ladder, or free-form (lingerie,
// cosmetics, anything that doesn't fit XS–XXL), and colors are named from
// an actual palette pick instead of typed blind.
export default function ProductFormDialog({ product = null, onClose, onSaved }) {
  const { categories, collections, colorHex, registerColor, addProduct, updateProduct, products } = useStore();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [category, setCategory] = useState(product?.category || categories[0]?.name || '');
  const [collection, setCollection] = useState(product?.collection || collections[0]?.name || 'General');
  const [price, setPrice] = useState(product?.price ?? '');
  const [cost, setCost] = useState(product?.cost ?? '');
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compareAtPrice ?? '');
  const [description, setDescription] = useState(product?.description || '');
  const [details, setDetails] = useState(product?.details || '');
  const [published, setPublished] = useState(product?.published ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [isNew, setIsNewFlag] = useState(product?.isNew ?? true);
  const [isLimited, setIsLimited] = useState(product?.isLimited ?? false);

  const [colors, setColors] = useState(product?.colors || []);
  const [pickerHex, setPickerHex] = useState('#1d1f20');
  const [pickerName, setPickerName] = useState(suggestColorName('#1d1f20', colorHex));

  const initialSizing = isEdit ? (isOneSize(product) ? 'oneSize' : (Object.values(SIZE_PRESETS).some((p) => p.join() === product.sizes.join()) ? 'standard' : 'custom')) : 'standard';
  const [sizingMode, setSizingMode] = useState(initialSizing);
  const chart = sizeChartFor({ category });
  const defaultPreset = chart ? Object.keys(SIZE_PRESETS).find((k) => SIZE_PRESETS[k].join().includes(Object.keys(chart.rows).join())) || Object.keys(SIZE_PRESETS)[0] : Object.keys(SIZE_PRESETS)[0];
  const [standardSizes, setStandardSizes] = useState(isEdit && initialSizing === 'standard' ? product.sizes : SIZE_PRESETS[defaultPreset]);
  const [customSizes, setCustomSizes] = useState(isEdit && initialSizing === 'custom' ? product.sizes : []);
  const [customSizeInput, setCustomSizeInput] = useState('');

  const [images, setImages] = useState(() => {
    if (!product?.images) return [];
    const list = [product.images.card, ...(product.images.thumbs || [])].filter(Boolean);
    return [...new Set(list)].map((url, i) => ({ id: `img-${i}`, url }));
  });

  const [error, setError] = useState('');

  const sizes = sizingMode === 'oneSize' ? ['One Size'] : sizingMode === 'standard' ? standardSizes : customSizes;

  const variants = useMemo(
    () => buildVariantMatrix(colors, sizes, isEdit ? { colors: product.colors, sizes: product.sizes, stocks: product.stocks } : null),
    [colors, sizes], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const [stockOverrides, setStockOverrides] = useState({});

  function stockFor(ci, si) {
    const key = `${ci}-${si}`;
    if (key in stockOverrides) return stockOverrides[key];
    const v = variants.find((x) => x.colorIdx === ci && x.sizeIdx === si);
    return v ? v.stock : 0;
  }

  function setStock(ci, si, val) {
    setStockOverrides((cur) => ({ ...cur, [`${ci}-${si}`]: Math.max(0, Number(val) || 0) }));
  }

  function toggleStandardSize(sz) {
    setStandardSizes((cur) => (cur.includes(sz) ? cur.filter((s) => s !== sz) : [...cur, sz].sort((a, b) => (SIZE_PRESETS['Extended (XS–XXXL)'].indexOf(a)) - (SIZE_PRESETS['Extended (XS–XXXL)'].indexOf(b)))));
  }

  function addCustomSize() {
    const v = customSizeInput.trim();
    if (!v || customSizes.includes(v)) return;
    setCustomSizes((cur) => [...cur, v]);
    setCustomSizeInput('');
  }

  function pickPaletteColor(hex) {
    setPickerHex(hex);
    setPickerName(suggestColorName(hex, colorHex));
  }

  function addColor() {
    const trimmed = pickerName.trim();
    if (!trimmed || colors.includes(trimmed)) return;
    registerColor(trimmed, pickerHex);
    setColors((cur) => [...cur, trimmed]);
    setPickerName('');
  }

  function removeColor(c) {
    setColors((cur) => cur.filter((x) => x !== c));
  }

  function addImage(url) {
    setImages((cur) => [...cur, { id: `img-${Date.now()}-${cur.length}`, url }].slice(0, 8));
  }

  function removeImage(id) {
    setImages((cur) => cur.filter((im) => im.id !== id));
  }

  function submit() {
    if (!name.trim()) { setError('Product name is required.'); return; }
    if (!sku.trim()) { setError('SKU is required.'); return; }
    if (!category) { setError('Choose a category.'); return; }
    if (!price || Number(price) <= 0) { setError('Enter a selling price.'); return; }
    if (colors.length === 0) { setError('Add at least one color.'); return; }
    if (sizes.length === 0) { setError('Pick at least one size.'); return; }
    const dupe = products.find((p) => p.sku.toLowerCase() === sku.trim().toLowerCase() && p.id !== product?.id);
    if (dupe) { setError(`SKU already used by "${dupe.name}".`); return; }

    const finalVariants = colors.flatMap((color, ci) => sizes.map((size, si) => ({ color, size, stock: stockFor(ci, si) })));
    const cardImage = images[0]?.url || null;
    const input = {
      name, sku, category, collection, price: Number(price), cost: Number(cost) || 0,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      description, details, published, featured, isNew, isLimited,
      colors, sizes, variants: finalVariants,
      images: { card: cardImage, main: cardImage, thumbs: images.slice(1).map((im) => im.url), hover: images[1]?.url || null },
    };

    const id = isEdit ? (updateProduct(product.id, input), product.id) : addProduct(input);
    onSaved(id);
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" style={{ width: 'min(920px, 94vw)', maxHeight: '92vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{isEdit ? `Edit — ${product.name}` : 'Add New Product'}</span>
          <button className="btn btn-icon btn-secondary" aria-label="Close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>
          </button>
        </div>

        <div className="dialog-body cw-product-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div className="card-kicker" style={{ marginBottom: 8 }}>Basic Information</div>
              <div className="field" style={{ margin: 0 }}>
                <label>Product Name</label>
                <input className="input" placeholder="e.g. Oversized Satin Shirt" value={name} onChange={(e) => { setName(e.target.value); if (!isEdit && !sku) setSku(suggestSku(e.target.value, category)); }} />
              </div>
              <div className="field">
                <label>SKU</label>
                <input className="input" placeholder="e.g. CRV-SH-015" value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field" style={{ margin: 0 }}>
                  <label>Category</label>
                  <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {['Women\'s Wear', 'Bags', 'Accessoires'].map((section) => (
                      <optgroup key={section} label={section}>
                        {categories.filter((c) => c.section === section).map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Collection</label>
                  <select className="input" value={collection} onChange={(e) => setCollection(e.target.value)}>
                    {collections.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <div className="card-kicker" style={{ marginBottom: 8 }}>Pricing</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div className="field" style={{ margin: 0 }}>
                  <label>Price (EGP)</label>
                  <input className="input" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Cost (EGP)</label>
                  <input className="input" type="number" min="0" value={cost} onChange={(e) => setCost(e.target.value)} />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Compare-at</label>
                  <input className="input" type="number" min="0" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} />
                </div>
              </div>
              <div className="card-meta" style={{ marginTop: 6 }}>Cost is internal only — never shown to customers.</div>
            </div>

            <div>
              <div className="card-kicker" style={{ marginBottom: 8 }}>Description</div>
              <textarea className="input" rows={2} placeholder="Short line shown in admin listings…" value={description} onChange={(e) => setDescription(e.target.value)} />
              <div className="field">
                <label>Details (product page — optional, overrides the category default)</label>
                <textarea className="input" rows={3} placeholder="Fabric, fit, construction…" value={details} onChange={(e) => setDetails(e.target.value)} />
              </div>
            </div>

            <div>
              <div className="card-kicker" style={{ marginBottom: 8 }}>Visibility</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published — visible in the storefront catalog</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Featured — appears in New In / homepage</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><input type="checkbox" checked={isNew} onChange={(e) => setIsNewFlag(e.target.checked)} /> "New" badge</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><input type="checkbox" checked={isLimited} onChange={(e) => setIsLimited(e.target.checked)} /> "Limited" badge</label>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div className="card-kicker" style={{ marginBottom: 8 }}>Colors</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {colors.map((c) => (
                  <span key={c} className="tag tag-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: colorHex[c] || '#999', display: 'inline-block' }}></span>
                    {c}
                    <button type="button" onClick={() => removeColor(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, fontSize: 13, lineHeight: 1 }}>×</button>
                  </span>
                ))}
                {colors.length === 0 && <span className="text-muted" style={{ fontSize: 12.5 }}>No colors added yet — add at least one to generate variants.</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={pickerHex} onChange={(e) => pickPaletteColor(e.target.value)} style={{ width: 40, height: 36, padding: 2, border: '1px solid var(--color-divider)', background: 'none', cursor: 'pointer' }} />
                <input className="input" style={{ flex: 1 }} placeholder="Color name (suggested from swatch)" value={pickerName} onChange={(e) => setPickerName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addColor()} />
                <button type="button" className="btn btn-secondary" onClick={addColor} disabled={!pickerName.trim()}>+ Add Color</button>
              </div>
            </div>

            <div>
              <div className="card-kicker" style={{ marginBottom: 8 }}>Sizing</div>
              <div className="seg" style={{ marginBottom: 10 }}>
                <label className="seg-opt"><input type="radio" checked={sizingMode === 'standard'} onChange={() => setSizingMode('standard')} /><span>Standard Sizes</span></label>
                <label className="seg-opt"><input type="radio" checked={sizingMode === 'oneSize'} onChange={() => setSizingMode('oneSize')} /><span>One Size</span></label>
                <label className="seg-opt"><input type="radio" checked={sizingMode === 'custom'} onChange={() => setSizingMode('custom')} /><span>Custom</span></label>
              </div>

              {sizingMode === 'standard' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {SIZE_PRESETS['Extended (XS–XXXL)'].map((sz) => (
                    <button type="button" key={sz} className={`tag ${standardSizes.includes(sz) ? 'tag-accent' : 'tag-outline'}`} style={{ cursor: 'pointer' }} onClick={() => toggleStandardSize(sz)}>{sz}</button>
                  ))}
                </div>
              )}
              {sizingMode === 'oneSize' && (
                <div className="card-meta">Single SKU per color — fits most body types. Used for bags, belts, toks, socks, and relaxed one-size cuts.</div>
              )}
              {sizingMode === 'custom' && (
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    {customSizes.map((sz) => (
                      <span key={sz} className="tag tag-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {sz}
                        <button type="button" onClick={() => setCustomSizes((cur) => cur.filter((s) => s !== sz))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13 }}>×</button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input" placeholder="e.g. 50ml, M/L, Newborn…" value={customSizeInput} onChange={(e) => setCustomSizeInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustomSize()} />
                    <button type="button" className="btn btn-secondary" onClick={addCustomSize}>+ Add</button>
                  </div>
                  <div className="card-meta" style={{ marginTop: 6 }}>For products that don't fit standard apparel sizing — underwear, cosmetics, one-off runs.</div>
                </div>
              )}
            </div>

            {colors.length > 0 && sizes.length > 0 && (
              <div>
                <div className="card-kicker" style={{ marginBottom: 8 }}>Stock by Variant</div>
                <div style={{ overflowX: 'auto', border: '1px solid var(--color-divider)' }}>
                  <table className="table" style={{ minWidth: 'max-content' }}>
                    <thead>
                      <tr>
                        <th>Color</th>
                        {sizes.map((sz) => <th key={sz} style={{ textAlign: 'center' }}>{sz}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {colors.map((c, ci) => (
                        <tr key={c}>
                          <td style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: colorHex[c] || '#999', display: 'inline-block' }}></span>
                            {c}
                          </td>
                          {sizes.map((sz, si) => (
                            <td key={sz} style={{ padding: 4 }}>
                              <input
                                className="input"
                                type="number"
                                min="0"
                                style={{ width: 60, textAlign: 'center', padding: '4px 6px', minHeight: 30 }}
                                value={stockFor(ci, si)}
                                onChange={(e) => setStock(ci, si, e.target.value)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card-meta" style={{ marginTop: 6 }}>{colors.length * sizes.length} variant SKU{colors.length * sizes.length === 1 ? '' : 's'} — e.g. {variantSku({ sku: sku || 'CRV-XX-000' }, colors[0], sizes[0])}</div>
              </div>
            )}

            <div>
              <div className="card-kicker" style={{ marginBottom: 8 }}>Product Images ({images.length}/8)</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {images.map((im) => (
                  <div key={im.id} style={{ position: 'relative', width: 84, height: 100, flex: 'none', overflow: 'hidden' }}>
                    <img src={im.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <button type="button" aria-label="Remove photo" onClick={() => removeImage(im.id)} style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, background: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', cursor: 'pointer', fontSize: 12, lineHeight: 1 }}>×</button>
                  </div>
                ))}
                {images.length < 8 && <ImageUploadTile onFile={addImage} />}
              </div>
            </div>
          </div>
        </div>

        {error && <div style={{ padding: '0 var(--space-4)', fontSize: 12.5, color: '#a13333' }}>{error}</div>}
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>{isEdit ? 'Save Changes' : 'Create Product'}</button>
        </div>
      </div>
    </div>
  );
}
