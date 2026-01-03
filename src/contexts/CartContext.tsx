import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  scientificName: string;
  quantity: string;
  price: number;
  supplier: string;
  supplierId: string;
  status: 'pending' | 'approved' | 'processing' | 'completed';
  requestDate: string;
  txHash?: string;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'status' | 'requestDate' | 'txHash'>) => void;
  removeFromCart: (id: string) => void;
  updateItemStatus: (id: string, status: CartItem['status']) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const generateTxHash = () => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

// Migration function to ensure old cart items have txHash
const migrateCartItems = (items: any[]): CartItem[] => {
  return items.map(item => ({
    ...item,
    txHash: item.txHash || generateTxHash(),
    requestDate: item.requestDate || new Date().toISOString(),
    status: item.status || 'pending',
  }));
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('herbal-cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      return migrateCartItems(parsed);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('herbal-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'id' | 'status' | 'requestDate' | 'txHash'>) => {
    const newItem: CartItem = {
      ...item,
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      requestDate: new Date().toISOString(),
      txHash: generateTxHash(),
    };
    setCartItems(prev => [...prev, newItem]);
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItemStatus = (id: string, status: CartItem['status']) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, status } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateItemStatus, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
