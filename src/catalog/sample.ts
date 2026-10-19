import { Catalog, CatalogService, CategoryId, Product } from './types';

function product(
  id: string,
  title: string,
  category: CategoryId,
  price: number,
  compareAtPrice?: number,
): Product {
  return {
    id,
    variantId: `sample-variant-${id}`,
    handle: id,
    title,
    category,
    price,
    compareAtPrice,
    currency: 'AUD',
    available: true,
    createdAt: `2026-01-${id.slice(-2)}T00:00:00Z`,
    description:
      'An illustrative washroom essential for your next project. This is sample catalogue content; specifications, availability and pricing must be confirmed with Ozwashroom before purchase.',
  };
}
export const sampleCatalog: Catalog = {
  source: 'sample',
  dealIds: ['dryer-01', 'soap-02', 'towel-03', 'rail-04'],
  products: [
    product('dryer-01', 'Airflow Compact Hand Dryer', 'hand-dryers', 249, 329),
    product('soap-02', 'Touch-free Soap Dispenser', 'soap-dispensers', 89, 119),
    product('towel-03', 'Stainless Paper Towel Dispenser', 'paper-towel-dispensers', 129, 169),
    product('rail-04', 'Stainless Steel Grab Rail', 'grab-rails', 59, 79),
    product('baby-05', 'Fold-down Baby Change Station', 'baby-change-stations', 349),
    product('bin-06', 'Slimline Sanitary Bin', 'sanitary-bins', 79),
    product('dryer-07', 'Airflow Pro Hand Dryer', 'hand-dryers', 399),
    product('soap-08', 'Minimal Wall Soap Dispenser', 'soap-dispensers', 69),
    product('towel-09', 'Compact Paper Towel Dispenser', 'paper-towel-dispensers', 99, 139),
    product('rail-10', 'Accessible Angled Grab Rail', 'grab-rails', 109),
  ],
};
export const sampleService: CatalogService = {
  async load() {
    return sampleCatalog;
  },
};
