import AnnouncementBar from '@/Components/Storefront/AnnouncementBar';
import Navbar from '@/Components/Storefront/Navbar';
import Footer from '@/Components/Storefront/Footer';
import CartDrawer from '@/Components/Storefront/CartDrawer';
import ClaimedCodeBadge from '@/Components/Storefront/ClaimedCodeBadge';
import ExitIntentPopup from '@/Components/Storefront/ExitIntentPopup';
import WhatsAppButton from '@/Components/Storefront/WhatsAppButton';

// `minimal` strips everything but the wordmark — used for checkout, where
// every nav link, icon, or footer link is a way for the customer to leave
// before they've paid. Cart/WhatsApp/Footer/the exit popup are dropped
// too: none of them serve someone who is already mid-checkout (an
// exit-intent popup there would actively work against the sale).
export default function StorefrontLayout({ children, minimal = false }) {
  return (
    <div style={{ background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)', minHeight: '100vh' }}>
      {!minimal && <AnnouncementBar />}
      <Navbar minimal={minimal} />
      {children}
      {!minimal && (
        <>
          <Footer />
          <CartDrawer />
          <WhatsAppButton />
          <ExitIntentPopup />
          <ClaimedCodeBadge />
        </>
      )}
    </div>
  );
}
