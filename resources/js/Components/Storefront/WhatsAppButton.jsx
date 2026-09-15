// Direct-contact channel for shoppers who'd rather message than browse —
// a WhatsApp deep link needs no backend, just the brand's number and an
// optional prewritten message.
const WHATSAPP_NUMBER = '201000001234';
const WHATSAPP_MESSAGE = "Hi CERVOWEAR, I'd like to ask about ";

export function whatsappHref(context = '') {
  const text = WHATSAPP_MESSAGE + context;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export default function WhatsAppButton() {
  return (
    <a
      href={whatsappHref('an order')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
      style={{
        position: 'fixed', right: 20, bottom: 20, zIndex: 90,
        width: 52, height: 52, borderRadius: '50%',
        background: '#25D366', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.14-1.35A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm0 18.2c-1.6 0-3.16-.43-4.52-1.24l-.32-.19-3.05.8.82-2.97-.21-.31a8.18 8.18 0 0 1-1.26-4.29c0-4.53 3.69-8.2 8.24-8.2 4.53 0 8.2 3.67 8.2 8.2 0 4.53-3.67 8.2-8.9 8.2zm4.5-6.14c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.41 1.02 2.58.12.17 1.75 2.67 4.24 3.74.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z"></path>
      </svg>
    </a>
  );
}
