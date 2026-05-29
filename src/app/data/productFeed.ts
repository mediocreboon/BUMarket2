// Bridges DB products + mock products into a single Product[] feed for the UI.
// The marketplace UI is built around the legacy `Product` shape, so we adapt
// `DbProduct` -> `Product` here and merge with the static mock catalogue.

import { Product, mockProducts } from './mockProducts';
import { DbProduct } from '../../lib/db';

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80';

export function dbProductToUiProduct(p: DbProduct): Product {
  const image = p.image_url || PLACEHOLDER_IMG;
  return {
    id: p.id,
    title: p.title,
    description: p.description || '',
    price: Number(p.price) || 0,
    category: p.category || 'Other',
    seller: p.seller_name || 'Student Seller',
    sellerId: p.seller_id,
    sellerDept: 'Campus',
    image,
    images: [image],
    verified: p.seller_verified === true,
    location: p.location || 'Campus',
    rating: 0,
    reviewCount: 0,
    soldCount: 0,
    stock: p.stock ?? 1,
    tags: [],
    condition: 'new',
    isPopular: false,
    isFeatured: false,
    createdAt: p.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    isLiveListing: true,
  };
}

// Merge DB products + static mock catalog. DB products go first so freshly
// added seller products appear at the top of every list.
export function mergeProducts(dbProducts: DbProduct[]): Product[] {
  const mapped = dbProducts.map(dbProductToUiProduct);
  const dbKeys = new Set(mapped.map((p) => `${p.title.toLowerCase()}::${p.category.toLowerCase()}`));
  const fallbackProducts = mockProducts.filter(
    (p) => !dbKeys.has(`${p.title.toLowerCase()}::${p.category.toLowerCase()}`)
  );
  return [...mapped, ...fallbackProducts];
}
