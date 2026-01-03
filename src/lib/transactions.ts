export interface Transaction {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  product: string;
  quantity: string;
  pricePerUnit: number;
  totalAmount: number;
  gasUsed: number;
  gasPrice: number;
  status: 'success' | 'pending' | 'failed';
  method: string;
  supplier: string;
  buyer: string;
}

// Sample transaction data based on Excel structure
export const transactions: Transaction[] = [
  {
    txHash: '0x8f4e3a2b',
    blockNumber: 19847520,
    timestamp: '2024-01-15T10:30:00Z',
    from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    to: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
    product: 'Jahe Kering Premium',
    quantity: '100 KG',
    pricePerUnit: 5.50,
    totalAmount: 550.00,
    gasUsed: 21000,
    gasPrice: 25,
    status: 'success',
    method: 'Crypto Wallet',
    supplier: 'PT Herbal Nusantara',
    buyer: 'Matt Dickerson'
  },
  {
    txHash: '0x2c7a8d1f',
    blockNumber: 19847485,
    timestamp: '2024-01-14T14:22:00Z',
    from: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    product: 'Kunyit Bubuk',
    quantity: '50 KG',
    pricePerUnit: 8.00,
    totalAmount: 400.00,
    gasUsed: 21000,
    gasPrice: 22,
    status: 'success',
    method: 'Bank Transfer',
    supplier: 'CV Rempah Sejahtera',
    buyer: 'Wiktoria'
  },
  {
    txHash: '0x5b9d1e4a',
    blockNumber: 19847450,
    timestamp: '2024-01-13T09:15:00Z',
    from: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    to: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    product: 'Kayu Manis Ceylon',
    quantity: '75 KG',
    pricePerUnit: 12.00,
    totalAmount: 900.00,
    gasUsed: 21000,
    gasPrice: 28,
    status: 'success',
    method: 'Crypto Wallet',
    supplier: 'Toko Rempah Tradisional',
    buyer: 'Trixia Raya'
  },
  {
    txHash: '0x9e3c7f2b',
    blockNumber: 19847380,
    timestamp: '2024-01-12T16:45:00Z',
    from: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    to: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    product: 'Lada Hitam Lampung',
    quantity: '200 KG',
    pricePerUnit: 7.50,
    totalAmount: 1500.00,
    gasUsed: 21000,
    gasPrice: 24,
    status: 'success',
    method: 'E-Wallet',
    supplier: 'PT Herbal Nusantara',
    buyer: 'Jamie Morrison'
  },
  {
    txHash: '0x1a7f4c9e',
    blockNumber: 19847320,
    timestamp: '2024-01-11T11:30:00Z',
    from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    to: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
    product: 'Pala Utuh',
    quantity: '30 KG',
    pricePerUnit: 25.00,
    totalAmount: 750.00,
    gasUsed: 21000,
    gasPrice: 26,
    status: 'pending',
    method: 'Crypto Wallet',
    supplier: 'CV Rempah Sejahtera',
    buyer: 'Robert Levy'
  },
  {
    txHash: '0x3d8b2f5c',
    blockNumber: 19847280,
    timestamp: '2024-01-10T08:20:00Z',
    from: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
    to: '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
    product: 'Cengkeh Kering',
    quantity: '40 KG',
    pricePerUnit: 18.00,
    totalAmount: 720.00,
    gasUsed: 21000,
    gasPrice: 23,
    status: 'success',
    method: 'Bank Transfer',
    supplier: 'Toko Rempah Tradisional',
    buyer: 'Noel Baldwin'
  },
  {
    txHash: '0x6e2a9c4d',
    blockNumber: 19847220,
    timestamp: '2024-01-09T15:10:00Z',
    from: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
    to: '0xcd3B766CCDd6AE721141F452C550Ca635964ce71',
    product: 'Temulawak Slice',
    quantity: '60 KG',
    pricePerUnit: 6.00,
    totalAmount: 360.00,
    gasUsed: 21000,
    gasPrice: 21,
    status: 'success',
    method: 'Crypto Wallet',
    supplier: 'PT Herbal Nusantara',
    buyer: 'Zaire Saris'
  },
  {
    txHash: '0x7f1c3a8e',
    blockNumber: 19847150,
    timestamp: '2024-01-08T12:00:00Z',
    from: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    to: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
    product: 'Kencur Bubuk',
    quantity: '45 KG',
    pricePerUnit: 9.00,
    totalAmount: 405.00,
    gasUsed: 21000,
    gasPrice: 27,
    status: 'success',
    method: 'E-Wallet',
    supplier: 'CV Rempah Sejahtera',
    buyer: 'Michael Jenkins'
  },
  {
    txHash: '0x4b9e1d7f',
    blockNumber: 19847080,
    timestamp: '2024-01-07T09:45:00Z',
    from: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
    to: '0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097',
    product: 'Serai Kering',
    quantity: '80 KG',
    pricePerUnit: 4.50,
    totalAmount: 360.00,
    gasUsed: 21000,
    gasPrice: 20,
    status: 'success',
    method: 'Crypto Wallet',
    supplier: 'Toko Rempah Tradisional',
    buyer: 'Tyler Moran'
  },
  {
    txHash: '0x2c8d5a6b',
    blockNumber: 19847010,
    timestamp: '2024-01-06T14:30:00Z',
    from: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    to: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
    product: 'Lengkuas Slice',
    quantity: '55 KG',
    pricePerUnit: 5.00,
    totalAmount: 275.00,
    gasUsed: 21000,
    gasPrice: 25,
    status: 'success',
    method: 'Bank Transfer',
    supplier: 'PT Herbal Nusantara',
    buyer: 'Liam Melon'
  }
];

export const getTransactionByHash = (hash: string): Transaction | undefined => {
  // Support both short and full hash formats
  const shortHash = hash.includes('...') ? hash.split('...')[0] : hash;
  return transactions.find(tx => 
    tx.txHash.toLowerCase().includes(shortHash.toLowerCase().replace('0x', ''))
  );
};

export const formatAddress = (address: string): string => {
  if (address.length <= 13) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
