import { Product } from './product.protocol';

export interface CartItem {
  product: Product;
  quantity: number;
}
