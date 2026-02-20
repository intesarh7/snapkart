import { createContext, useState, useEffect, ReactNode } from "react";


export interface CartItem {
  id: number;
  name: string;
  image?: string;

  price: number;
  finalPrice?: number;

  quantity: number;
  restaurantId: number;
  
  variantId?: number | null;
  variantName?: string | null;
  variantPrice?: number | null; 

  extras?: any[];
  hasVariants?: boolean;
  variants?: any[];
  availableExtras?: any[];
  cartKey?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (cartKey: string) => void;
  increaseQty: (cartKey: string) => void;
  decreaseQty: (cartKey: string) => void;
  clearCart: () => void;
  updateCartItem: (cartKey: string, data: any) => void;
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  increaseQty: () => {},
  decreaseQty: () => {},
  clearCart: () => {},
  updateCartItem: (_cartKey: string, _data: any) => {},
  isCartOpen: false,
  setIsCartOpen: () => {},
  
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  /* ---------------- LOAD FROM LOCALSTORAGE ---------------- */

  useEffect(() => {
    const stored = localStorage.getItem("snapkart_cart");
    if (stored) {
      setCartItems(JSON.parse(stored));
    }
    setHydrated(true);
  }, []);

  /* ---------------- SAVE TO LOCALSTORAGE ---------------- */

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(
        "snapkart_cart",
        JSON.stringify(cartItems)
      );
    }
  }, [cartItems, hydrated]);

  /* ---------------- CART FUNCTIONS ---------------- */
const addToCart = (item: Omit<CartItem, "quantity">) => {
  // 🔥 NORMALIZE DATA (VERY IMPORTANT)
const normalizedExtras = (item.extras || [])
  .map((e: any) => ({
    id: Number(e.id),
    name: e.name,
    price: Number(e.price),
  }))
  .sort((a: any, b: any) => a.id - b.id);

const normalizedVariantId = item.variantId || null;

const extrasKey = normalizedExtras
  .map((e: any) => e.id)
  .join("-");

const cartKey =
  item.id +
  "_" +
  (normalizedVariantId || "noVariant") +
  "_" +
  (extrasKey || "noExtra");


  setCartItems((prev) => {
    const existing = prev.find(
      (p) => p.cartKey === cartKey
    );

    if (existing) {
      return prev.map((p) =>
        p.cartKey === cartKey
          ? { ...p, quantity: p.quantity + 1 }
          : p
      );
    }

    return [
  ...prev,
  {
    ...item,
    quantity: 1,
    cartKey,
    variantId: normalizedVariantId,
    variantPrice: item.variantPrice || null,
    variantName: item.variantName || null,
    extras: normalizedExtras,
  },
];
  });
};



  const removeFromCart = (cartKey: string) => {
  setCartItems((prev) =>
    prev.filter((p) => p.cartKey !== cartKey)
  );
};

const increaseQty = (cartKey: string) => {
  setCartItems((prev) =>
    prev.map((p) =>
      p.cartKey === cartKey
        ? { ...p, quantity: p.quantity + 1 }
        : p
    )
  );
};

const decreaseQty = (cartKey: string) => {
  setCartItems((prev) =>
    prev.map((p) =>
      p.cartKey === cartKey && p.quantity > 1
        ? { ...p, quantity: p.quantity - 1 }
        : p
    )
  );
};

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("snapkart_cart"); // ✅ FIXED key (was "cart")
  };

  /* ---------------- UPDATE ITEM (VARIANT / EXTRAS CHANGE) ---------------- */

const updateCartItem = (cartKey: string, data: any) => {
  setCartItems((prev) => {
    const currentItem = prev.find((i) => i.cartKey === cartKey);
    if (!currentItem) return prev;

    const updatedItem = { ...currentItem, ...data };

    // 🔥 Normalize extras
    const normalizedExtras = (updatedItem.extras || [])
      .map((e: any) => ({
        id: Number(e.id),
        name: e.name,
        price: Number(e.price),
      }))
      .sort((a: any, b: any) => a.id - b.id);

    updatedItem.extras = normalizedExtras;
    updatedItem.variantId = updatedItem.variantId || null;

    const extrasKey = normalizedExtras.map((e: any) => e.id).join("-");

    const newCartKey =
      updatedItem.id +
      "_" +
      (updatedItem.variantId || "noVariant") +
      "_" +
      (extrasKey || "noExtra");

    // 🔥 IF SAME KEY EXISTS → MERGE QUANTITY
    const existingItem = prev.find((i) => i.cartKey === newCartKey);

    if (existingItem && existingItem.cartKey !== cartKey) {
      return prev
        .filter((i) => i.cartKey !== cartKey)
        .map((i) =>
          i.cartKey === newCartKey
            ? { ...i, quantity: i.quantity + currentItem.quantity }
            : i
        );
    }

    // Otherwise normal update
    return prev.map((i) =>
      i.cartKey === cartKey
        ? { ...updatedItem, cartKey: newCartKey }
        : i
    );
  });
};



  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        updateCartItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
