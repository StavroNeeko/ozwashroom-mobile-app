import { Product } from '../catalog/types';
export type CartLine = { product: Product; quantity: number };
export function changeQuantity(lines: CartLine[], variantId: string, delta: number): CartLine[] {
  return lines
    .map((line) =>
      line.product.variantId === variantId
        ? { ...line, quantity: Math.min(99, line.quantity + delta) }
        : line,
    )
    .filter((line) => line.quantity > 0);
}
