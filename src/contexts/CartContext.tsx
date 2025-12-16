// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string;         // product id from database
  cartItemId: string; // unique id for this specific cart entry (variant)
  name_ar: string;
  price: number;
  quantity: number;
  image_url?: string;
  color?: string | null;
  size?: string | null;
  // optional: product_owner (supplier username) if you want per-store
  ownerId?: string | null;
  // free delivery flag
  is_free_delivery?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity" | "cartItemId"> & { quantity?: number }) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  // optional: for checkout owner id (if cart single store)
  ownerId?: string | null;
  setOwnerId?: (id: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("bazzarna-cart");
      if (!saved) return [];

      const parsedItems = JSON.parse(saved);
      // Migration: Add cartItemId to existing items if missing
      return parsedItems.map((item: any) => ({
        ...item,
        cartItemId: item.cartItemId || `${item.id}-${Math.random().toString(36).substr(2, 9)}`
      }));
    } catch {
      return [];
    }
  });

  const [ownerId, setOwnerId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem("bazzarna-cart-owner");
      return saved ?? null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem("bazzarna-cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (ownerId) localStorage.setItem("bazzarna-cart-owner", ownerId);
    else localStorage.removeItem("bazzarna-cart-owner");
  }, [ownerId]);

  const addItem = (payload: Omit<CartItem, "quantity" | "cartItemId"> & { quantity?: number }) => {
    setItems((prev) => {
      // Find exact match (same product + same variants)
      const existing = prev.find((i) =>
        i.id === payload.id &&
        (i.color ?? "") === (payload.color ?? "") &&
        (i.size ?? "") === (payload.size ?? "")
      );

      if (existing) {
        toast.success("تم تحديث الكمية");
        return prev.map((i) =>
          i.cartItemId === existing.cartItemId ? { ...i, quantity: i.quantity + (payload.quantity ?? 1) } : i
        );
      }

      toast.success("تم إضافة المنتج إلى السلة");
      // Create new item with unique cartItemId
      const newItem: CartItem = {
        ...payload,
        quantity: payload.quantity ?? 1,
        cartItemId: `${payload.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      return [...prev, newItem];
    });

    // If cart ownerId is not set and item has ownerId, set it (helps multi-store)
    if (!ownerId && (payload as any).ownerId) {
      setOwnerId((payload as any).ownerId);
    }
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
    toast.success("تم حذف المنتج من السلة");
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    setItems((prev) => prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity } : i)));
  };

  const clearCart = () => {
    setItems([]);
    setOwnerId(null);
    localStorage.removeItem("bazzarna-cart");
    localStorage.removeItem("bazzarna-cart-owner");
  };

  const totalItems = items.reduce((s, it) => s + it.quantity, 0);
  const totalPrice = items.reduce((s, it) => s + it.price * it.quantity, 0);

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
        ownerId,
        setOwnerId
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
