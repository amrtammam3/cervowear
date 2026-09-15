// A real confirmation modal for destructive admin actions — replaces the
// browser's native confirm() popup, which looks broken next to the rest of
// this design system and gives no room to explain consequences.
export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div className="dialog" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title">{title}</div>
        <div className="dialog-body">{message}</div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? '' : 'btn-primary'}`} style={danger ? { background: '#a13333', borderColor: '#a13333', color: '#fff' } : undefined} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
