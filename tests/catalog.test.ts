import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleCatalog } from '../src/catalog/sample';
import { money, savingsPercent, selectCollection } from '../src/catalog/types';
import { changeQuantity } from '../src/state/cart';

test('promotional sections use deal membership, newest-first dates and real savings', () => {
  assert.deepEqual(
    selectCollection(sampleCatalog, 'deals').map((p) => p.id),
    sampleCatalog.dealIds,
  );
  assert.equal(selectCollection(sampleCatalog, 'new')[0]?.id, 'rail-10');
  assert.equal(sampleCatalog.products[0]?.id, 'dryer-01', 'sorting must not mutate the source');
  const discounted = selectCollection(sampleCatalog, 'discounted');
  assert.equal(discounted.length, 5);
  assert.ok(discounted.every((p) => p.compareAtPrice! > p.price));
  assert.equal(savingsPercent(sampleCatalog.products[0]!), 24);
  assert.equal(savingsPercent({ ...sampleCatalog.products[0]!, compareAtPrice: 100 }), 0);
  assert.equal(money(249), '$249.00');
});
test('each of the six categories has sample products with unique IDs and variant IDs', () => {
  assert.equal(new Set(sampleCatalog.products.map((p) => p.category)).size, 6);
  assert.equal(
    new Set(sampleCatalog.products.map((p) => p.id)).size,
    sampleCatalog.products.length,
  );
  assert.equal(
    new Set(sampleCatalog.products.map((p) => p.variantId)).size,
    sampleCatalog.products.length,
  );
});
test('cart quantity changes remove zero lines, cap quantities and preserve other lines', () => {
  const first = sampleCatalog.products[0]!;
  const second = sampleCatalog.products[1]!;
  const lines = [
    { product: first, quantity: 1 },
    { product: second, quantity: 99 },
  ];
  assert.deepEqual(changeQuantity(lines, first.variantId, -1), [lines[1]]);
  assert.equal(changeQuantity(lines, second.variantId, 1)[1]?.quantity, 99);
  assert.equal(changeQuantity(lines, first.variantId, 1)[0]?.quantity, 2);
  assert.equal(lines[0]?.quantity, 1);
});
