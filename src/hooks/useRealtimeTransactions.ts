import { useState, useEffect, useCallback, useRef } from 'react';
import { hashFromSeed, addressFromSeed, shortenHash, shortenAddress, decimalFromSeed, statusFromSeed } from '@/lib/mockChain';

export interface RealtimeTransaction {
  id: string;
  hashFull: string;
  hashDisplay: string;
  fromDisplay: string;
  toDisplay: string;
  value: string;
  status: 'success' | 'pending';
  timestamp: Date;
  isNew?: boolean;
}

interface UseRealtimeTransactionsOptions {
  maxTransactions?: number;
  updateInterval?: number; // ms between new transactions
  enabled?: boolean;
}

export const useRealtimeTransactions = (options: UseRealtimeTransactionsOptions = {}) => {
  const { 
    maxTransactions = 5, 
    updateInterval = 8000, // New transaction every 8 seconds
    enabled = true 
  } = options;

  const [transactions, setTransactions] = useState<RealtimeTransaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const transactionCounterRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate a new transaction
  const generateTransaction = useCallback((): RealtimeTransaction => {
    const counter = transactionCounterRef.current++;
    const timestamp = Date.now();
    const seed = `realtime-tx-${timestamp}-${counter}`;
    const hashFull = hashFromSeed(seed);
    
    return {
      id: `rt-${timestamp}-${counter}`,
      hashFull,
      hashDisplay: shortenHash(hashFull),
      fromDisplay: shortenAddress(addressFromSeed(seed, 0)),
      toDisplay: shortenAddress(addressFromSeed(seed, 1)),
      value: decimalFromSeed(seed, 50, 500).toFixed(2) + ' USD',
      status: statusFromSeed(seed),
      timestamp: new Date(),
      isNew: true,
    };
  }, []);

  // Initialize with some transactions
  const initializeTransactions = useCallback(() => {
    const initialTxs: RealtimeTransaction[] = [];
    for (let i = 0; i < maxTransactions; i++) {
      const tx = generateTransaction();
      tx.isNew = false;
      tx.timestamp = new Date(Date.now() - i * 5000);
      initialTxs.push(tx);
    }
    setTransactions(initialTxs);
  }, [generateTransaction, maxTransactions]);

  // Simulate WebSocket connection
  const connect = useCallback(() => {
    console.log('[WebSocket Simulation] Connecting to transaction stream...');
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true);
      console.log('[WebSocket Simulation] Connected successfully');
      initializeTransactions();
      
      // Start receiving "live" transactions
      intervalRef.current = setInterval(() => {
        const newTx = generateTransaction();
        console.log('[WebSocket Simulation] New transaction received:', newTx.hashDisplay);
        
        setTransactions(prev => {
          // Add new transaction at the beginning, remove oldest if over limit
          const updated = [newTx, ...prev.slice(0, maxTransactions - 1)];
          // Clear isNew flag from older transactions
          return updated.map((tx, idx) => ({
            ...tx,
            isNew: idx === 0,
          }));
        });
        
        setLastUpdate(new Date());
      }, updateInterval);
    }, 1000);
  }, [generateTransaction, initializeTransactions, maxTransactions, updateInterval]);

  // Disconnect simulation
  const disconnect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsConnected(false);
    console.log('[WebSocket Simulation] Disconnected');
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (enabled) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Clear isNew flag after animation
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTransactions(prev => prev.map(tx => ({ ...tx, isNew: false })));
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [transactions]);

  return {
    transactions,
    isConnected,
    lastUpdate,
    connect,
    disconnect,
  };
};
