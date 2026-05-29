/** True when the product id is a Supabase UUID (purchasable in the database). */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isPurchasableProduct(productId: string): boolean {
  return UUID_RE.test(productId);
}
