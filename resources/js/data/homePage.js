// Home Page content — the editable copy/photos behind each section of the
// storefront home page (top banner, hero, category teaser, new-arrivals
// tile, "Our Story", best sellers). Same spirit as data/promotions.js'
// `seedSiteOffers`: a plain seed object, one key per section, kept live in
// StoreContext so an admin edit shows up on the storefront immediately.

export function seedHomePage() {
  return {
    hero: {
      image: '/images/products/hero.jpg',
      linkCategory: 'New In',
    },
    categories: {
      eyebrow: 'Shop by Category',
      heading: 'Find your fit, faster.',
      description: 'Every category, one tap away — browse by piece instead of scrolling the whole catalog.',
      photo: '/images/products/Section%20photo%20(the%20large%20photo%20next%20to%20the%20heading).jpg',
      // One photo per tile (no hover swap here) — tiles for a category
      // that's currently disabled simply won't show up on the storefront.
      tilePhotos: {
        Tops: '/images/products/topcat.png',
        Bottoms: '/images/products/Bottoms.jpg',
        Outerwear: '/images/products/Outerwear.jpg',
        'Dresses & Sets': '/images/products/Dresses%20&%20Sets.jpg',
        Bags: '/images/products/Bags.jpg',
        Accessoires: '/images/products/Accessoires.webp',
      },
    },
    newArrivals: {
      kicker: 'New In',
      tileHeading: 'New\nArrivals',
      photo: null,
    },
    ourStory: {
      enabled: true,
      mainPhoto: '/images/products/Main%20portrait%20photo.jpg',
      detailPhoto: '/images/products/Detail%20photo.jpg',
      eyebrow: 'The art of modern elegance',
      leadIn: 'This is more than clothing.',
      paragraph: "It's an expression of modern femininity in all its depth. We create more than wardrobe pieces — we create tools of self-expression for women who move the world while staying true to themselves.",
    },
    bestSellers: {
      enabled: true,
      eyebrow: 'Best Sellers',
      heading: 'Loved, worn, sold out.',
    },
  };
}
