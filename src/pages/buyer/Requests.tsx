import { Web3Header } from "@/components/Web3Header";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Background } from "@/components/Web3Background";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ExternalLink, Clock, Verified, TrendingUp, Coins, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-500/20 text-green-400 border border-green-500/30";
    case "processing":
      return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    case "pending":
      return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    case "completed":
      return "bg-primary/20 text-primary border border-primary/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <Verified className="h-3 w-3" />;
    case "processing":
      return <TrendingUp className="h-3 w-3" />;
    case "pending":
      return <Clock className="h-3 w-3" />;
    default:
      return <Package className="h-3 w-3" />;
  }
};

const BuyerRequests = () => {
  const { cartItems, removeFromCart } = useCart();

  const totalValue = cartItems.reduce((acc, item) => acc + item.price, 0);
  const pendingCount = cartItems.filter(item => item.status === 'pending').length;
  const processingCount = cartItems.filter(item => item.status === 'processing').length;

  return (
    <div className="min-h-screen flex flex-col gradient-bg relative overflow-hidden">
      <Web3Background />
      <Web3Header />

      <main className="flex-1 container mx-auto px-4 py-8 pt-24 relative z-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 text-gradient-hero">Purchase Requests</h1>
          <p className="text-muted-foreground text-lg">
            Track your blockchain-verified purchase requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '0ms' }}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <ShoppingCart className="h-4 w-4" />
                Total Requests
              </div>
              <p className="text-2xl font-bold">{cartItems.length}</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '50ms' }}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Coins className="h-4 w-4" />
                Total Value
              </div>
              <p className="text-2xl font-bold font-mono">{totalValue.toFixed(2)} <span className="text-xs text-primary">USD</span></p>
            </CardContent>
          </Card>
          <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Clock className="h-4 w-4 text-yellow-400" />
                Pending
              </div>
              <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Processing
              </div>
              <p className="text-2xl font-bold text-blue-400">{processingCount}</p>
            </CardContent>
          </Card>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cartItems.map((request, index) => (
              <Card
                key={request.id}
                className="glass-card border-border/50 card-hover animate-fade-in overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="pt-0 px-0">
                  {/* Product Image */}
                  <div className="relative aspect-video bg-muted/50">
                    <img 
                      src={request.image} 
                      alt={request.productName} 
                      className="w-full h-full object-cover"
                    />
                    <Badge 
                      variant="outline" 
                      className={`absolute top-3 right-3 ${getStatusColor(request.status)} flex items-center gap-1`}
                    >
                      {getStatusIcon(request.status)}
                      {request.status}
                    </Badge>
                  </div>

                  <div className="p-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {request.productName}
                      </h3>
                      <p className="text-sm text-muted-foreground italic">{request.scientificName}</p>
                    </div>

                    {/* Supplier */}
                    <Link 
                      to={`/supplier/${request.supplierId}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <span>by</span>
                      <span className="text-foreground font-medium hover:text-primary">{request.supplier}</span>
                      <Verified className="h-3 w-3 text-primary" />
                    </Link>

                    {/* Blockchain Info */}
                    <div className="glass p-3 rounded-lg border border-border/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Price</span>
                        <span className="font-mono font-bold text-primary">{request.price.toFixed(2)} USD</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Quantity</span>
                        <span className="font-mono">{request.quantity}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">TX Hash</span>
                        <a 
                          href={`https://etherscan.io/tx/${request.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
                        >
                          {request.txHash?.slice(0, 8)}...{request.txHash?.slice(-6)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    {/* Date */}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(request.requestDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link to={`/tracking/${request.id}`} className="flex-1">
                        <Button className="w-full btn-web3-outline">
                          Track Order
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="glass border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => removeFromCart(request.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card border-border/50">
            <CardContent className="py-12 text-center">
              <div className="p-4 bg-primary/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Package className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Requests Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start browsing our marketplace to add products to your cart
              </p>
              <Link to="/shop">
                <Button className="btn-web3">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Browse Marketplace
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>

      <Web3Footer />
    </div>
  );
};

export default BuyerRequests;
