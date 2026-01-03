// Deterministic hash generation utilities for consistent mock blockchain data

// Simple hash function that produces consistent output for a given input
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Generate a deterministic hex string from a seed
const hexFromSeed = (seed: string, length: number): string => {
  let result = '';
  let currentSeed = seed;
  while (result.length < length) {
    const hash = simpleHash(currentSeed);
    result += hash.toString(16).padStart(8, '0');
    currentSeed = currentSeed + hash.toString();
  }
  return result.slice(0, length);
};

// Generate a full 66-character transaction hash (0x + 64 hex chars)
export const hashFromSeed = (seed: string): string => {
  return '0x' + hexFromSeed(seed, 64);
};

// Generate a full 42-character address (0x + 40 hex chars)
export const addressFromSeed = (seed: string, offset: number = 0): string => {
  return '0x' + hexFromSeed(seed + '-addr-' + offset, 40);
};

// Generate a deterministic number within a range
export const numberFromSeed = (seed: string, min: number, max: number): number => {
  const hash = simpleHash(seed);
  return min + (hash % (max - min + 1));
};

// Generate a deterministic decimal number
export const decimalFromSeed = (seed: string, min: number, max: number, decimals: number = 2): number => {
  const hash = simpleHash(seed);
  const range = max - min;
  const value = min + (hash % (range * Math.pow(10, decimals))) / Math.pow(10, decimals);
  return parseFloat(value.toFixed(decimals));
};

// Shorten a hash for display (0x1234...abcd)
export const shortenHash = (hash: string): string => {
  if (hash.length <= 13) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

// Shorten an address for display
export const shortenAddress = (address: string): string => {
  if (address.length <= 13) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Generate a deterministic status
export const statusFromSeed = (seed: string): 'success' | 'pending' => {
  const hash = simpleHash(seed);
  return hash % 10 > 1 ? 'success' : 'pending'; // 80% success, 20% pending
};
