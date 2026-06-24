import { CartItem, Product } from '../protocols';

export const cartService = {
  async addItem(items: CartItem[], product: Product, quantity = 1): Promise<CartItem[]> {
    const item = items.find((cartItem) => cartItem.product.id === product.id);
    const maxQuantity = Math.max(product.stock, 0);
    const quantityToAdd = Math.max(Math.floor(quantity), 1);

    if (maxQuantity <= 0) {
      return Promise.resolve(items);
    }

    if (!item) {
      return Promise.resolve([...items, { product, quantity: Math.min(quantityToAdd, maxQuantity) }]);
    }

    if (item.quantity >= maxQuantity) {
      return Promise.resolve(items);
    }

    return Promise.resolve(
      items.map((cartItem) =>
        cartItem.product.id === product.id
          ? { ...cartItem, quantity: Math.min(cartItem.quantity + quantityToAdd, maxQuantity) }
          : cartItem,
      ),
    );
  },

  async updateItemQuantity(items: CartItem[], productId: string, quantity: number): Promise<CartItem[]> {
    return Promise.resolve(
      items
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.min(Math.max(Math.floor(quantity), 0), Math.max(item.product.stock, 0)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  },

  async removeItem(items: CartItem[], productId: string): Promise<CartItem[]> {
    return Promise.resolve(items.filter((item) => item.product.id !== productId));
  },

  async decrementItem(items: CartItem[], productId: string): Promise<CartItem[]> {
    return Promise.resolve(
      items
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  },

  async clearCart(): Promise<CartItem[]> {
    return Promise.resolve([]);
  },
};
