import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  name_ar: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bazzarna-cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bazzarna-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        toast.success('تم تحديث الكمية');
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      toast.success('تم إضافة المنتج إلى السلة');
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success('تم حذف المنتج من السلة');
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('bazzarna-cart');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
