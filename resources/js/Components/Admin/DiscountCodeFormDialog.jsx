import { useState } from 'react';
import { DISCOUNT_SEGMENTS, DISCOUNT_TYPES } from '@/data/promotions';
import { useStore } from '@/lib/StoreContext';

export default function DiscountCodeFormDialog({ code = null, onClose, onSaved }) {
  const { discountCodes, addDiscountCode, updateDiscountCode } = useStore();
  const isEdit = !!code;

  const [form, setForm] = useState(() => ({
    code: code?.code || '',
    type: code?.type || DISCOUNT_TYPES[0],
    value: code?.value ?? '',
    maxDiscount: code?.maxDiscount ?? '',
    influencer: code?.influencer || '',
    segment: code?.segment || DISCOUNT_SEGMENTS[0],
    minOrderAmount: code?.minOrderAmount ?? 0,
    usageLimit: code?.usageLimit ?? '',
    oncePerCustomer: code?.oncePerCustomer ?? true,
    startDate: code?.startDate || new Date().toISOString().slice(0, 10),
    endDate: code?.endDate || '',
    enabled: code?.enabled ?? true,
  }));
  const [error, setError] = useState('');

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function submit() {
    const trimmedCode = form.code.trim().toUpperCase();
    if (!trimmedCode) { setError('Code is required.'); return; }
    const dupe = discountCodes.find((c) => c.code.toUpperCase() === trimmedCode && c.id !== code?.id);
    if (dupe) { setError('That code already exists.'); return; }
    if (form.type !== 'Free Shipping' && (!form.value || Number(form.value) <= 0)) { setError('Enter a discount value.'); return; }
    if (!form.startDate || !form.endDate) { setError('Set a start and end date.'); return; }
    if (form.endDate < form.startDate) { setError('End date must be after the start date.'); return; }

    const input = {
      code: trimmedCode,
      type: form.type,
      value: form.type === 'Free Shipping' ? 0 : Number(form.value),
      maxDiscount: form.type === 'Percentage' && form.maxDiscount ? Number(form.maxDiscount) : null,
      influencer: form.influencer.trim() || null,
      segment: form.segment,
      minOrderAmount: Number(form.minOrderAmount) || 0,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      oncePerCustomer: form.oncePerCustomer,
      startDate: form.startDate,
      endDate: form.endDate,
      enabled: form.enabled,
    };

    const id = isEdit ? (updateDiscountCode(code.id, input), code.id) : addDiscountCode(input);
    onSaved(id);
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" style={{ width: 'min(560px, 94vw)', maxHeight: '92vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{isEdit ? `Edit — ${code.code}` : 'Add Discount Code'}</span>
          <button className="btn btn-icon btn-secondary" aria-label="Close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>
          </button>
        </div>

        <div className="dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div className="card-kicker" style={{ marginBottom: 8 }}>Basics</div>
            <div className="field" style={{ margin: 0 }}>
              <label>Code</label>
              <input className="input" style={{ textTransform: 'uppercase' }} placeholder="e.g. SARAH15" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: form.type === 'Free Shipping' ? '1fr' : '1fr 1fr 1fr', gap: 10, marginTop: 10 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Discount Type</label>
                <select className="input" value={form.type} onChange={set('type')}>
                  {DISCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {form.type !== 'Free Shipping' && (
                <>
                  <div className="field" style={{ margin: 0 }}>
                    <label>{form.type === 'Percentage' ? 'Percent (%)' : 'Amount (EGP)'}</label>
                    <input className="input" type="number" min="0" value={form.value} onChange={set('value')} />
                  </div>
                  {form.type === 'Percentage' && (
                    <div className="field" style={{ margin: 0 }}>
                      <label>Max Discount (EGP)</label>
                      <input className="input" type="number" min="0" placeholder="No cap" value={form.maxDiscount} onChange={set('maxDiscount')} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div>
            <div className="card-kicker" style={{ marginBottom: 8 }}>Tracking &amp; Segment</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Influencer (optional)</label>
                <input className="input" placeholder="e.g. @sarah" value={form.influencer} onChange={set('influencer')} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Customer Segment</label>
                <select className="input" value={form.segment} onChange={set('segment')}>
                  {DISCOUNT_SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="card-kicker" style={{ marginBottom: 8 }}>Usage Rules</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Min. Order Amount (EGP)</label>
                <input className="input" type="number" min="0" value={form.minOrderAmount} onChange={set('minOrderAmount')} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Usage Limit</label>
                <input className="input" type="number" min="0" placeholder="Unlimited" value={form.usageLimit} onChange={set('usageLimit')} />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginTop: 10 }}>
              <input type="checkbox" checked={form.oncePerCustomer} onChange={(e) => setForm((f) => ({ ...f, oncePerCustomer: e.target.checked }))} /> One use per customer
            </label>
          </div>

          <div>
            <div className="card-kicker" style={{ marginBottom: 8 }}>Schedule</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Start Date</label>
                <input className="input" type="date" value={form.startDate} onChange={set('startDate')} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>End Date</label>
                <input className="input" type="date" value={form.endDate} onChange={set('endDate')} />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginTop: 10 }}>
              <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))} /> Enabled
            </label>
          </div>

          {error && <div style={{ fontSize: 12.5, color: '#a13333' }}>{error}</div>}
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>{isEdit ? 'Save Changes' : 'Create Code'}</button>
        </div>
      </div>
    </div>
  );
}
