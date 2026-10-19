import { Catalog, CatalogService, CategoryId, Product } from './types';
import sources from '../../assets/sources.json';

function product(
  id: string,
  title: string,
  category: CategoryId,
  price: number,
  compareAtPrice?: number,
): Product {
  const photo = sources.products.find((photo) => photo.id === id);
  return {
    id,
    variantId: `sample-variant-${id}`,
    handle: id,
    title: photo?.title || title,
    imageUrl: photo?.imageUrl,
    imageAlt: photo?.title || title,
    category,
    price,
    compareAtPrice,
    currency: 'AUD',
    available: true,
    createdAt: `2026-01-${id.slice(-2)}T00:00:00Z`,
    description:
      'Official Ozwashroom product photography and name shown in a sample catalogue. Prices, discounts, availability and arrival dates are illustrative. Confirm current specifications and offers with Ozwashroom before purchase.',
  };
}
export const sampleCatalog: Catalog = {
  source: 'sample',
  dealIds: ['dryer-01', 'soap-02', 'towel-03', 'rail-04'],
  products: [
    product(
      'dryer-01',
      'Vortex Hand Dryer \u2013 Super Quiet Motor | 3-Year Warranty',
      'hand-dryers',
      249,
      329,
    ),
    product('soap-02', 'Automatic Sanitiser/Soap Dispenser Black', 'soap-dispensers', 89, 119),
    product(
      'towel-03',
      'Stainless Steel Slim Paper Towel Dispenser',
      'paper-towel-dispensers',
      129,
      169,
    ),
    product('rail-04', 'JD Macdonald Straight Grab Rail JDM-GSN', 'grab-rails', 59, 79),
    product(
      'baby-05',
      'Kanga Kare Baby Change Station Grey with Braille',
      'baby-change-stations',
      349,
    ),
    product(
      'bin-06',
      'Grey Slim Sanitary Bin 18L Female Hygiene Waste Disposal Unit',
      'sanitary-bins',
      79,
    ),
    product(
      'dryer-07',
      'Vortex Stainless Steel Compact Hand Dryer Matte Black',
      'hand-dryers',
      399,
    ),
    product(
      'soap-08',
      "Soap Dispenser Satin Finish S'Steel Refillable Lockable 1L",
      'soap-dispensers',
      69,
    ),
    product('towel-09', 'Compact paper towel dispenser T501', 'paper-towel-dispensers', 99, 139),
    product('rail-10', 'JD Macdonald Ambulant Grab Rail 1 Pair', 'grab-rails', 109),
  ],
};
export const sampleService: CatalogService = {
  async load() {
    return sampleCatalog;
  },
};
