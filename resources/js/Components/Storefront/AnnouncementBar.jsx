import { useStore } from '@/lib/StoreContext';

// A thin, non-sticky strip above the navbar — scrolls away with the page
// like most brands run theirs, so it never competes with the sticky nav
// for attention once someone starts browsing.
export default function AnnouncementBar() {
  const { siteOffers } = useStore();
  const { announcementBar } = siteOffers;

  if (!announcementBar.enabled || !announcementBar.message.trim()) return null;

  return (
    <div style={{ padding: '9px 16px', textAlign: 'center', fontSize: 12.5, fontWeight: 600, letterSpacing: '0.02em', background: announcementBar.bgColor, color: announcementBar.textColor }}>
      {announcementBar.message}
      {announcementBar.discountCode && <span style={{ marginLeft: 8, textDecoration: 'underline' }}>Code: {announcementBar.discountCode}</span>}
    </div>
  );
}
