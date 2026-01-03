import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Order {
  id: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  productName: string;
  productId: string;
  productImage: string;
  quantity: string;
  pricePerUnit: number;
  totalAmount: number;
  supplier: string;
  buyer: string;
  paymentMethod: string;
  status: 'processing' | 'shipped' | 'delivered' | 'success';
  date: string;
  from: string;
  to: string;
  gasUsed: string;
  gasPrice: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date' | 'from' | 'to' | 'txHash' | 'blockNumber' | 'timestamp' | 'gasUsed' | 'gasPrice' | 'buyer'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  clearOrders: () => void;
  getOrderByTxHash: (txHash: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const generateWalletAddress = () => {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
};

const generateTxHash = () => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

const generateBlockNumber = () => {
  return 19000000 + Math.floor(Math.random() * 500000);
};

// Migration function to update old orders with missing fields
const migrateOrders = (oldOrders: any[]): Order[] => {
  return oldOrders.map(order => ({
    ...order,
    txHash: order.txHash || generateTxHash(),
    blockNumber: order.blockNumber || generateBlockNumber(),
    timestamp: order.timestamp || order.date || new Date().toISOString(),
    pricePerUnit: order.pricePerUnit || 0,
    totalAmount: order.totalAmount || order.price || 0,
    buyer: order.buyer || generateWalletAddress(),
    from: order.from || generateWalletAddress(),
    to: order.to || generateWalletAddress(),
    gasUsed: order.gasUsed || (21000 + Math.floor(Math.random() * 50000)).toString(),
    gasPrice: order.gasPrice || (20 + Math.floor(Math.random() * 30)).toString(),
  }));
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('herbal-orders');
    if (saved) {
      const parsed = JSON.parse(saved);
      return migrateOrders(parsed);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('herbal-orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order: Omit<Order, 'id' | 'date' | 'from' | 'to' | 'txHash' | 'blockNumber' | 'timestamp' | 'gasUsed' | 'gasPrice' | 'buyer'>) => {
    const txHash = generateTxHash();
    const fromAddr = generateWalletAddress();
    const toAddr = generateWalletAddress();
    const buyerAddr = generateWalletAddress();
    
    const newOrder: Order = {
      ...order,
      id: txHash.slice(0, 10) + '...' + txHash.slice(-8),
      txHash: txHash,
      blockNumber: generateBlockNumber(),
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      from: fromAddr,
      to: toAddr,
      buyer: buyerAddr,
      gasUsed: (21000 + Math.floor(Math.random() * 50000)).toString(),
      gasPrice: (20 + Math.floor(Math.random() * 30)).toString(),
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status } : order
    ));
  };

  const clearOrders = () => {
    setOrders([]);
  };

  const getOrderByTxHash = (txHash: string): Order | undefined => {
    return orders.find(order => {
      if (order.txHash === txHash) return true;
      if (order.txHash.toLowerCase().startsWith(txHash.toLowerCase().replace('...', ''))) return true;
      if (txHash.includes('...')) {
        const [start, end] = txHash.split('...');
        return order.txHash.toLowerCase().startsWith(start.toLowerCase()) && 
               order.txHash.toLowerCase().endsWith(end.toLowerCase());
      }
      return false;
    });
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, clearOrders, getOrderByTxHash }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
