// Fills a frame with a real photo when one exists, otherwise renders the
// same dashed empty-state the design prototype used for unfilled photo
// slots — so pages missing a product shot still read as intentional,
// not broken.
export default function ImageSlot({ src, alt = '', placeholder = 'Photo', className = '', style }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        color: 'color-mix(in srgb, var(--color-text) 45%, transparent)',
        border: '1.5px dashed var(--color-divider)',
        ...style,
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.45 }}>
        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <path d="M21 15l-5-5L5 21"></path>
      </svg>
      <span style={{ fontSize: 11, letterSpacing: '0.02em', textAlign: 'center', maxWidth: '90%' }}>{placeholder}</span>
    </div>
  );
}
