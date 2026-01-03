import { useParams, useNavigate } from "react-router-dom";
import { Web3Header } from "@/components/Web3Header";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Background } from "@/components/Web3Background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Box,
  ArrowRightLeft,
  Fuel,
  Package,
  User,
  Building2
} from "lucide-react";
import { getTransactionByHash, formatAddress, Transaction } from "@/lib/transactions";
import { useOrders, Order } from "@/contexts/OrderContext";
import { useCart, CartItem } from "@/contexts/CartContext";
import { hashFromSeed, addressFromSeed, numberFromSeed, decimalFromSeed, statusFromSeed } from "@/lib/mockChain";
import { toast } from "sonner";

// Helper to generate deterministic blockchain data from txHash
const generateDeterministicData = (txHash: string) => {
  let seed = 0;
  for (let i = 0; i < txHash.length; i++) {
    seed = ((seed << 5) - seed) + txHash.charCodeAt(i);
    seed = seed & seed;
  }
  const blockNumber = 19000000 + Math.abs(seed % 500000);
  const gasUsed = 21000 + Math.abs((seed >> 8) % 50000);
  const gasPrice = 20 + Math.abs((seed >> 16) % 30);
  
  // Generate addresses from seed
  const generateAddr = (offset: number) => {
    let addr = '0x';
    for (let i = 0; i < 40; i++) {
      const char = Math.abs((seed + offset + i) % 16);
      addr += char.toString(16);
    }
    return addr;
  };
  
  return { blockNumber, gasUsed, gasPrice, from: generateAddr(100), to: generateAddr(200), buyer: generateAddr(300) };
};

// Convert Order to Transaction format
const orderToTransaction = (order: Order): Transaction => ({
  txHash: order.txHash,
  blockNumber: order.blockNumber,
  timestamp: order.timestamp,
  from: order.from,
  to: order.to,
  product: order.productName,
  quantity: order.quantity,
  pricePerUnit: order.pricePerUnit,
  totalAmount: order.totalAmount,
  gasUsed: parseInt(order.gasUsed),
  gasPrice: parseInt(order.gasPrice),
  status: order.status === 'success' ? 'success' : 'pending',
  method: order.paymentMethod,
  supplier: order.supplier,
  buyer: order.buyer.slice(0, 6) + '...' + order.buyer.slice(-4),
});

// Convert CartItem to Transaction format
const cartItemToTransaction = (item: CartItem): Transaction => {
  const data = generateDeterministicData(item.txHash || item.id);
  return {
    txHash: item.txHash || item.id,
    blockNumber: data.blockNumber,
    timestamp: item.requestDate,
    from: data.from,
    to: data.to,
    product: item.productName,
    quantity: item.quantity,
    pricePerUnit: item.price,
    totalAmount: item.price,
    gasUsed: data.gasUsed,
    gasPrice: data.gasPrice,
    status: item.status === 'completed' ? 'success' : 'pending',
    method: 'Purchase Request',
    supplier: item.supplier,
    buyer: data.buyer.slice(0, 6) + '...' + data.buyer.slice(-4),
  };
};

const TransactionDetail = () => {
  const { txHash } = useParams();
  const navigate = useNavigate();
  const { getOrderByTxHash } = useOrders();
  const { cartItems } = useCart();
  
  // Helper to find cart item by txHash
  const getCartItemByTxHash = (hash: string): CartItem | undefined => {
    return cartItems.find(item => {
      if (item.txHash === hash) return true;
      if (item.txHash?.toLowerCase().startsWith(hash.toLowerCase().replace('...', ''))) return true;
      if (hash.includes('...')) {
        const [start, end] = hash.split('...');
        return item.txHash?.toLowerCase().startsWith(start.toLowerCase()) && 
               item.txHash?.toLowerCase().endsWith(end.toLowerCase());
      }
      return false;
    });
  };
  
  // Check sources in order: OrderContext -> CartContext -> Static transactions -> Synthetic fallback
  const orderFromContext = txHash ? getOrderByTxHash(txHash) : undefined;
  const cartItemFromContext = txHash && !orderFromContext ? getCartItemByTxHash(txHash) : undefined;
  const staticTransaction = txHash && !orderFromContext && !cartItemFromContext ? getTransactionByHash(txHash) : undefined;
  
  // Generate synthetic transaction as fallback (for dashboard mock transactions)
  const generateSyntheticTransaction = (hash: string): Transaction => {
    const data = generateDeterministicData(hash);
    const products = ['Network Activity', 'Marketplace Transaction', 'Herbal Trade', 'Supply Chain Transfer'];
    const suppliers = ['HerBlocX Network', 'PT Herbal Nusantara', 'CV Rempah Sejahtera', 'Toko Rempah Tradisional'];
    const methods = ['Bank Transfer', 'Credit/Debit Card', 'E-Wallet', 'Mobile Payment'];
    
    const productIdx = numberFromSeed(hash + '-product', 0, products.length - 1);
    const supplierIdx = numberFromSeed(hash + '-supplier', 0, suppliers.length - 1);
    const methodIdx = numberFromSeed(hash + '-method', 0, methods.length - 1);
    
    return {
      txHash: hash,
      blockNumber: data.blockNumber,
      timestamp: new Date(Date.now() - numberFromSeed(hash + '-time', 0, 86400000 * 7)).toISOString(),
      from: data.from,
      to: data.to,
      product: products[productIdx],
      quantity: `${numberFromSeed(hash + '-qty', 10, 200)} KG`,
      pricePerUnit: decimalFromSeed(hash + '-price', 5, 25),
      totalAmount: decimalFromSeed(hash + '-total', 100, 800),
      gasUsed: data.gasUsed,
      gasPrice: data.gasPrice,
      status: statusFromSeed(hash),
      method: methods[methodIdx],
      supplier: suppliers[supplierIdx],
      buyer: data.buyer.slice(0, 6) + '...' + data.buyer.slice(-4),
    };
  };
  
  const transaction = orderFromContext 
    ? orderToTransaction(orderFromContext)
    : cartItemFromContext
      ? cartItemToTransaction(cartItemFromContext)
      : staticTransaction
        ? staticTransaction
        : txHash
          ? generateSyntheticTransaction(txHash)
          : undefined;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-400 animate-pulse" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'status-success';
      case 'pending':
        return 'status-pending';
      default:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  if (!transaction) {
    return (
      <div className="min-h-screen flex flex-col gradient-bg relative overflow-hidden">
        <Web3Background />
        <Web3Header />
        <main className="flex-1 container mx-auto px-4 py-8 pt-24 relative z-10 flex items-center justify-center">
          <Card className="glass-card border-border/50 max-w-md w-full">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Transaction Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The transaction hash you're looking for doesn't exist or has expired.
              </p>
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </main>
        <Web3Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col gradient-bg relative overflow-hidden">
      <Web3Background />
      <Web3Header />

      <main className="flex-1 container mx-auto px-4 py-8 pt-24 relative z-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-muted/30"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-lg glow-primary">
              <ArrowRightLeft className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient-hero">Transaction Details</h1>
              <p className="text-muted-foreground">Blockchain verified transaction record</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card border-border/50 animate-fade-in">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Box className="h-5 w-5 text-primary" />
                    Transaction Information
                  </CardTitle>
                  <Badge variant="outline" className={getStatusColor(transaction.status)}>
                    {getStatusIcon(transaction.status)}
                    <span className="ml-1 capitalize">{transaction.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* TX Hash */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground text-sm mb-1 sm:mb-0">Transaction Hash:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-primary break-all">{transaction.txHash}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(transaction.txHash, 'Transaction hash')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Block Number */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground text-sm mb-1 sm:mb-0">Block Number:</span>
                  <span className="font-mono text-sm">#{transaction.blockNumber}</span>
                </div>

                {/* Timestamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground text-sm mb-1 sm:mb-0">Timestamp:</span>
                  <span className="text-sm">
                    {new Date(transaction.timestamp).toLocaleString('id-ID', {
                      dateStyle: 'full',
                      timeStyle: 'medium'
                    })}
                  </span>
                </div>

                <Separator className="bg-border/50" />

                {/* From Address */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground text-sm mb-1 sm:mb-0">From:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm break-all">{formatAddress(transaction.from)}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(transaction.from, 'Address')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* To Address */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground text-sm mb-1 sm:mb-0">To:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm break-all">{formatAddress(transaction.to)}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(transaction.to, 'Address')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-secondary" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground text-sm mb-1 sm:mb-0">Product:</span>
                  <span className="font-semibold">{transaction.product}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground text-sm mb-1 sm:mb-0">Quantity:</span>
                  <span className="font-semibold">{transaction.quantity}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground text-sm mb-1 sm:mb-0">Price per Unit:</span>
                  <span className="font-semibold text-primary">${transaction.pricePerUnit.toFixed(2)} USD</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground text-sm mb-1 sm:mb-0">Payment Method:</span>
                  <Badge variant="outline" className="bg-muted/50">{transaction.method}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Value Card */}
            <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-2">Total Value</p>
                  <p className="text-4xl font-bold text-primary mb-1">
                    ${transaction.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-muted-foreground text-sm">USD</p>
                </div>
              </CardContent>
            </Card>

            {/* Parties Card */}
            <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Transaction Parties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Buyer</span>
                  </div>
                  <p className="font-semibold">{transaction.buyer}</p>
                </div>

                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Supplier</span>
                  </div>
                  <p className="font-semibold">{transaction.supplier}</p>
                </div>
              </CardContent>
            </Card>

            {/* Gas Info Card */}
            <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '0.25s' }}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-orange-400" />
                  Gas Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Gas Used:</span>
                  <span className="font-mono text-sm">{transaction.gasUsed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Gas Price:</span>
                  <span className="font-mono text-sm">{transaction.gasPrice} Gwei</span>
                </div>
                <Separator className="bg-border/50" />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Transaction Fee:</span>
                  <span className="font-mono text-sm text-orange-400">
                    ${((transaction.gasUsed * transaction.gasPrice) / 1e9 * 2000).toFixed(4)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Web3Footer />
    </div>
  );
};

export default TransactionDetail;
