import { useState } from 'react';
import { Head } from '@inertiajs/react';
import Blueprint from '@/Components/Blueprint';
import ConfirmDialog from '@/Components/Admin/ConfirmDialog';
import Toast from '@/Components/Admin/Toast';
import AdminLayout from '@/Layouts/AdminLayout';
import { ROLE_DESCRIPTIONS, TEAM_ROLES } from '@/data/settings';
import { useStore } from '@/lib/StoreContext';

const TABS = ['Store Information', 'Shipping Rates', 'Payment Methods', 'Team & Roles'];

function Toggle({ on, onClick }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} onClick={onClick}
      style={{ width: 38, height: 22, flex: 'none', border: '1px solid var(--color-divider)', borderRadius: 999, position: 'relative', cursor: 'pointer', background: on ? 'var(--color-accent-700)' : 'var(--color-surface)', transition: 'background 0.15s' }}
    >
      <span style={{ position: 'absolute', top: 1, left: on ? 17 : 1, width: 18, height: 18, borderRadius: '50%', background: 'var(--color-bg)', transition: 'left 0.15s' }}></span>
    </button>
  );
}

function StoreInfoTab() {
  const { storeInfo, updateStoreInfo } = useStore();
  const [toast, setToast] = useState(null);

  function addLogo(e) {
    const file = e.target.files?.[0];
    if (file) updateStoreInfo({ logo: URL.createObjectURL(file) });
    e.target.value = '';
  }

  return (
    <Blueprint className="card elev-sm" style={{ padding: 20, maxWidth: 520 }}>
      <div className="card-kicker" style={{ marginBottom: 4 }}>Shown on the storefront and order invoices</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '10px 0 16px' }}>
        <div style={{ width: 64, height: 64, flex: 'none', border: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--color-surface)' }}>
          {storeInfo.logo ? <img src={storeInfo.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span className="text-muted" style={{ fontSize: 10 }}>Logo</span>}
        </div>
        <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
          Upload Logo
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={addLogo} />
        </label>
      </div>
      <div className="field">
        <label>Brand Name</label>
        <input className="input" value={storeInfo.brandName} onChange={(e) => updateStoreInfo({ brandName: e.target.value })} />
      </div>
      <div className="field">
        <label>Support Phone (shown on invoices)</label>
        <input className="input" value={storeInfo.supportPhone} onChange={(e) => updateStoreInfo({ supportPhone: e.target.value })} />
      </div>
      <div className="field" style={{ margin: 0 }}>
        <label>Support Email</label>
        <input className="input" type="email" value={storeInfo.supportEmail} onChange={(e) => updateStoreInfo({ supportEmail: e.target.value })} />
      </div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setToast({ message: 'Store information saved.', tone: 'success' })}>Save Changes</button>
      {toast && <Toast message={toast.message} tone={toast.tone} onDone={() => setToast(null)} />}
    </Blueprint>
  );
}

function ShippingRatesTab() {
  const { shippingRates, addShippingRate, updateShippingRate, removeShippingRate } = useStore();
  const [newGov, setNewGov] = useState('');
  const [newFee, setNewFee] = useState('');

  function add() {
    if (!newGov.trim() || !newFee) return;
    addShippingRate(newGov.trim(), Number(newFee));
    setNewGov('');
    setNewFee('');
  }

  return (
    <>
      <div className="text-muted" style={{ fontSize: 13, marginBottom: 16, maxWidth: 640 }}>
        Egypt shipping isn't a flat fee — Cairo/Giza runs cheaper than the rest of the country. This is exactly what Checkout looks up by the governorate a customer selects.
      </div>
      <Blueprint className="card elev-sm" style={{ padding: 0, marginBottom: 20, maxWidth: 520 }}>
        <table className="table">
          <thead><tr><th>Governorate</th><th>Fee</th><th></th></tr></thead>
          <tbody>
            {shippingRates.map((r) => (
              <tr key={r.id}>
                <td><input className="input" style={{ minHeight: 32, padding: '4px 8px' }} value={r.governorate} onChange={(e) => updateShippingRate(r.id, { governorate: e.target.value })} /></td>
                <td style={{ width: 140 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="text-muted" style={{ fontSize: 12 }}>EGP</span>
                    <input className="input" type="number" min="0" style={{ minHeight: 32, padding: '4px 8px', width: 80 }} value={r.fee} onChange={(e) => updateShippingRate(r.id, { fee: Number(e.target.value) || 0 })} />
                  </div>
                </td>
                <td style={{ width: 40 }}>
                  <button className="btn btn-ghost" style={{ padding: 0, fontSize: 12, color: '#a13333' }} onClick={() => removeShippingRate(r.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Blueprint>

      <Blueprint className="card elev-sm" style={{ padding: 16, maxWidth: 520 }}>
        <div className="card-kicker" style={{ marginBottom: 10 }}>Add Governorate</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder="e.g. Luxor" value={newGov} onChange={(e) => setNewGov(e.target.value)} />
          <input className="input" type="number" min="0" placeholder="Fee (EGP)" style={{ width: 120 }} value={newFee} onChange={(e) => setNewFee(e.target.value)} />
          <button className="btn btn-primary" onClick={add} disabled={!newGov.trim() || !newFee}>+ Add</button>
        </div>
      </Blueprint>
    </>
  );
}

function PaymentMethodsTab() {
  const { paymentMethods, updatePaymentMethods } = useStore();
  return (
    <Blueprint className="card elev-sm" style={{ padding: 20, maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Cash on Delivery</span>
        <Toggle on={paymentMethods.codEnabled} onClick={() => updatePaymentMethods({ codEnabled: !paymentMethods.codEnabled })} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Credit / Debit Card</span>
        <Toggle on={paymentMethods.cardEnabled} onClick={() => updatePaymentMethods({ cardEnabled: !paymentMethods.cardEnabled })} />
      </div>

      <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Vodafone Cash</span>
          <Toggle on={paymentMethods.vodafoneCashEnabled} onClick={() => updatePaymentMethods({ vodafoneCashEnabled: !paymentMethods.vodafoneCashEnabled })} />
        </div>
        <input className="input" placeholder="Wallet number" value={paymentMethods.vodafoneCashNumber} onChange={(e) => updatePaymentMethods({ vodafoneCashNumber: e.target.value })} />
      </div>

      <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>InstaPay</span>
          <Toggle on={paymentMethods.instapayEnabled} onClick={() => updatePaymentMethods({ instapayEnabled: !paymentMethods.instapayEnabled })} />
        </div>
        <input className="input" placeholder="InstaPay handle or number" value={paymentMethods.instapayNumber} onChange={(e) => updatePaymentMethods({ instapayNumber: e.target.value })} />
      </div>

      <div className="card-meta">Only enabled methods (with a number on file, for wallets) show up at checkout.</div>
    </Blueprint>
  );
}

function TeamRolesTab() {
  const { teamMembers, addTeamMember, updateTeamMember, removeTeamMember } = useStore();
  const [form, setForm] = useState({ name: '', email: '', role: TEAM_ROLES[0] });
  const [confirmRemove, setConfirmRemove] = useState(null);

  function add() {
    if (!form.name.trim() || !form.email.trim()) return;
    addTeamMember(form);
    setForm({ name: '', email: '', role: TEAM_ROLES[0] });
  }

  return (
    <>
      <Blueprint className="card elev-sm" style={{ padding: 0, marginBottom: 20, maxWidth: 640 }}>
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead>
          <tbody>
            {teamMembers.map((m) => (
              <tr key={m.id}>
                <td style={{ fontWeight: 600 }}>{m.name}</td>
                <td className="text-muted">{m.email}</td>
                <td>
                  <select className="input" style={{ minHeight: 32, padding: '4px 8px', width: 150 }} value={m.role} onChange={(e) => updateTeamMember(m.id, { role: e.target.value })}>
                    {TEAM_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td style={{ width: 60 }}>
                  <button className="btn btn-ghost" style={{ padding: 0, fontSize: 12, color: '#a13333' }} onClick={() => setConfirmRemove(m)}>Remove</button>
                </td>
              </tr>
            ))}
            {teamMembers.length === 0 && <tr><td colSpan={4} className="text-muted" style={{ textAlign: 'center', padding: '24px 0' }}>No team members yet.</td></tr>}
          </tbody>
        </table>
      </Blueprint>

      <Blueprint className="card elev-sm" style={{ padding: 16, marginBottom: 20, maxWidth: 640 }}>
        <div className="card-kicker" style={{ marginBottom: 10 }}>Add Team Member</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px auto', gap: 8, alignItems: 'end' }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              {TEAM_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={add} disabled={!form.name.trim() || !form.email.trim()}>+ Add</button>
        </div>
      </Blueprint>

      <Blueprint className="card elev-sm" style={{ padding: 16, maxWidth: 640 }}>
        <div className="card-kicker" style={{ marginBottom: 10 }}>What Each Role Sees</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TEAM_ROLES.map((r) => (
            <div key={r} style={{ fontSize: 12.5 }}>
              <strong>{r}</strong> — <span className="text-muted">{ROLE_DESCRIPTIONS[r]}</span>
            </div>
          ))}
        </div>
      </Blueprint>

      {confirmRemove && (
        <ConfirmDialog
          title="Remove team member?"
          message={`${confirmRemove.name} will lose access to the admin.`}
          confirmLabel="Remove"
          danger
          onConfirm={() => { removeTeamMember(confirmRemove.id); setConfirmRemove(null); }}
          onCancel={() => setConfirmRemove(null)}
        />
      )}
    </>
  );
}

export default function Settings() {
  const [tab, setTab] = useState(TABS[0]);

  return (
    <AdminLayout title="Settings">
      <Head title="Settings — Admin — CERVOWEAR" />

      <div className="seg" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <label key={t} className="seg-opt"><input type="radio" checked={tab === t} onChange={() => setTab(t)} /><span>{t}</span></label>
        ))}
      </div>

      {tab === 'Store Information' && <StoreInfoTab />}
      {tab === 'Shipping Rates' && <ShippingRatesTab />}
      {tab === 'Payment Methods' && <PaymentMethodsTab />}
      {tab === 'Team & Roles' && <TeamRolesTab />}
    </AdminLayout>
  );
}
