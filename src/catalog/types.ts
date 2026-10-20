export type CategoryId =
  | 'hand-dryers'
  | 'paper-towel-dispensers'
  | 'soap-dispensers'
  | 'sanitary-bins'
  | 'baby-change-stations'
  | 'grab-rails';
export type Product = {
  id: string;
  variantId: string;
  handle: string;
  title: string;
  description: string;
  category: CategoryId | null;
  price: number;
  compareAtPrice?: number;
  currency: 'AUD';
  available: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  imageAlt?: string;
  createdAt: string;
};
export type CollectionId = 'deals' | 'new' | 'discounted';
export type Catalog = {
  products: Product[];
  dealIds: string[];
  source: 'sample' | 'shopify';
  truncated?: boolean;
};
export type CatalogService = { load(signal?: AbortSignal): Promise<Catalog> };
export const categories: {
  id: CategoryId;
  title: string;
  shortTitle: string;
  collectionHandle: string;
}[] = [
  {
    id: 'hand-dryers',
    title: 'Hand Dryers',
    shortTitle: 'Hand dryers',
    collectionHandle: 'hand-dryers',
  },
  {
    id: 'paper-towel-dispensers',
    title: 'Paper Towel Dispensers',
    shortTitle: 'Paper towel',
    collectionHandle: 'paper-towel-dispensers',
  },
  {
    id: 'soap-dispensers',
    title: 'Soap Dispensers',
    shortTitle: 'Soap dispensers',
    collectionHandle: 'soap-dispensers',
  },
  {
    id: 'sanitary-bins',
    title: 'Sanitary Bins',
    shortTitle: 'Sanitary bins',
    collectionHandle: 'sanitary-bins',
  },
  {
    id: 'baby-change-stations',
    title: 'Baby Change Stations',
    shortTitle: 'Baby change',
    collectionHandle: 'baby-change-stations',
  },
  {
    id: 'grab-rails',
    title: 'Grab Rails',
    shortTitle: 'Grab rails',
    collectionHandle: 'grab-rails',
  },
];
export const collectionTitles: Record<CollectionId, string> = {
  deals: 'Special Deals',
  new: 'New Arrivals',
  discounted: 'Discounted Products',
};
export function savingsPercent(product: Product): number {
  return product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;
}
export function money(value: number): string {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(value);
}
export function selectCollection(catalog: Catalog, collection: CollectionId): Product[] {
  if (collection === 'deals') return catalog.products.filter((p) => catalog.dealIds.includes(p.id));
  if (collection === 'discounted') return catalog.products.filter((p) => savingsPercent(p) > 0);
  return [...catalog.products].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
