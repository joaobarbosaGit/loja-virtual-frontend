import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';

import { CartItem, Product } from '../../protocols';
import { cartService } from '../../services';

interface CartContextValue {
  items: CartItem[];
  itemsCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateItemQuantity: (productId: string, quantity: number) => Promise<void>;
  decrementItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('store.cart') ?? '[]') as CartItem[]; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('store.cart', JSON.stringify(items)); }, [items]);

  const addItem = async (product: Product, quantity = 1) => {
    setItems(await cartService.addItem(items, product, quantity));
  };

  const updateItemQuantity = async (productId: string, quantity: number) => {
    setItems(await cartService.updateItemQuantity(items, productId, quantity));
  };

  const removeItem = async (productId: string) => {
    setItems(await cartService.removeItem(items, productId));
  };

  const decrementItem = async (productId: string) => {
    setItems(await cartService.decrementItem(items, productId));
  };

  const clearCart = async () => {
    setItems(await cartService.clearCart());
  };

  const value = useMemo(
    () => ({
      items,
      itemsCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.product.price * item.quantity, 0),
      addItem,
      updateItemQuantity,
      decrementItem,
      removeItem,
      clearCart,
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
