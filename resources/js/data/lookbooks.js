// Admin-managed Lookbook entries — name + up to 10 photos each, up to 5
// entries total. Independent of the product catalog (unlike the old
// collection-derived groups this replaces): the admin uploads whatever
// photos tell the story, not necessarily tied to a specific SKU.
export const MAX_LOOKBOOKS = 5;
export const MAX_IMAGES_PER_LOOKBOOK = 10;

let uid = 1;
function nextId(prefix) {
  return `${prefix}-${uid++}`;
}

function img(url) {
  return { id: nextId('img'), url };
}

export function seedLookbooks() {
  return [
    { id: nextId('lb'), name: 'Winter Collection', images: [img('/images/products/p1-card.webp'), img('/images/products/p1-alt.webp'), img('/images/products/p1-thumb0.webp')] },
    { id: nextId('lb'), name: 'Core Essentials', images: [img('/images/products/p2-card.webp'), img('/images/products/p2-alt.webp'), img('/images/products/p2-thumb1.webp'), img('/images/products/p4-main.webp'), img('/images/products/p4-alt.webp')] },
    { id: nextId('lb'), name: 'Ramadan Essentials', images: [img('/images/products/p3-main.webp')] },
    { id: nextId('lb'), name: 'New Arrivals Teaser', images: [img('/images/products/p9-main.webp'), img('/images/products/p9-alt.webp')] },
  ];
}

export function newImageEntry(url) {
  return img(url);
}

export function newLookbookId() {
  return nextId('lb');
}
