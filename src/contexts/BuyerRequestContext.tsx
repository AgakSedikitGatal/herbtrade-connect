import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface BuyerRequest {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  budgetMin: number;
  budgetMax: number;
  description: string;
  category: string;
  status: 'open' | 'matched' | 'closed';
  createdAt: string;
  matchedSuppliers: { supplierId: string; supplierName: string; price: number }[];
}

interface BuyerRequestContextType {
  requests: BuyerRequest[];
  addRequest: (req: Omit<BuyerRequest, 'id' | 'status' | 'createdAt' | 'matchedSuppliers'>) => void;
  removeRequest: (id: string) => void;
  updateRequestStatus: (id: string, status: BuyerRequest['status']) => void;
}

const BuyerRequestContext = createContext<BuyerRequestContextType | undefined>(undefined);

const STORAGE_KEY = 'herblocx_buyer_requests';

export function BuyerRequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<BuyerRequest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  }, [requests]);

  const addRequest = (req: Omit<BuyerRequest, 'id' | 'status' | 'createdAt' | 'matchedSuppliers'>) => {
    const newReq: BuyerRequest = {
      ...req,
      id: `REQ-${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString(),
      matchedSuppliers: [],
    };
    setRequests(prev => [newReq, ...prev]);
  };

  const removeRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const updateRequestStatus = (id: string, status: BuyerRequest['status']) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <BuyerRequestContext.Provider value={{ requests, addRequest, removeRequest, updateRequestStatus }}>
      {children}
    </BuyerRequestContext.Provider>
  );
}

export function useBuyerRequests() {
  const ctx = useContext(BuyerRequestContext);
  if (!ctx) throw new Error("useBuyerRequests must be used within BuyerRequestProvider");
  return ctx;
}
