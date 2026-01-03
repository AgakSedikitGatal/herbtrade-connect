import { useParams, Link } from "react-router-dom";
import { Web3Header } from "@/components/Web3Header";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Background } from "@/components/Web3Background";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  CheckCircle, 
  Clock, 
  MapPin, 
  ArrowRightLeft, 
  ExternalLink,
  Truck,
  Box,
  Ship,
  Warehouse,
  Shield,
  RefreshCw
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState, useEffect } from "react";

const generateBlockchainEvents = (txHash: string) => [
  {
    event: "Order Created",
    blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    gasUsed: "0.0012 ETH",
    status: "confirmed"
  },
  {
    event: "Payment Escrowed",
    blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 300000).toISOString(),
    gasUsed: "0.0008 ETH",
    status: "confirmed"
  },
  {
    event: "Supplier Confirmed",
    blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    gasUsed: "0.0005 ETH",
    status: "confirmed"
  },
  {
    event: "Shipment Started",
    blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    gasUsed: "0.0006 ETH",
    status: "confirmed"
  },
  {
    event: "In Transit",
    blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    gasUsed: "0.0004 ETH",
    status: "pending"
  }
];

const deliveryTimeline = [
  { step: "Order Confirmed", icon: CheckCircle, completed: true, date: "4 days ago" },
  { step: "Payment Secured", icon: Shield, completed: true, date: "4 days ago" },
  { step: "Packaging", icon: Box, completed: true, date: "3 days ago" },
  { step: "Shipped", icon: Truck, completed: true, date: "2 days ago" },
  { step: "In Transit", icon: Ship, completed: false, date: "Expected in 2 days" },
  { step: "Delivered", icon: Warehouse, completed: false, date: "Pending" }
];

const Tracking = () => {
  const { orderId } = useParams();
  const { cartItems } = useCart();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const cartOrder = cartItems.find(item => item.id === orderId);
  
  // Generate consistent txHash based on orderId for demo orders
  const generateConsistentTxHash = (id: string) => {
    const seed = id || 'demo';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      const charCode = seed.charCodeAt(i % seed.length) + i;
      hash += (charCode % 16).toString(16);
    }
    return hash;
  };

  const order = cartOrder || {
    id: orderId || "demo-order",
    productName: "Curcuma longa (Turmeric)",
    scientificName: "Curcuma longa",
    price: 125.50,
    quantity: "50 kg",
    supplier: "Java Herbs Co.",
    supplierId: "SUP001",
    txHash: generateConsistentTxHash(orderId || "demo-order"),
    status: "processing",
    requestDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    image: "/turmeric.jpg"
  };

  const blockchainEvents = generateBlockchainEvents(order.txHash || "");

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col gradient-bg relative overflow-hidden">
      <Web3Background />
      <Web3Header />

      <div className="flex-1 container mx-auto px-4 py-8 pt-24 relative z-10">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-gradient-hero">Order Tracking</h1>
            <p className="text-muted-foreground mt-2">Real-time blockchain verification</p>
          </div>
          <Button 
            variant="outline" 
            className="glass border-border/50"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Order Summary Card */}
        <Card className="mb-8 glass-card border-border/50 animate-fade-in overflow-hidden" style={{ animationDelay: "0.1s" }}>
          <CardContent className="pt-0 px-0">
            <div className="flex flex-col md:flex-row">
              {/* Product Image */}
              <div className="md:w-1/3 aspect-video md:aspect-auto">
                <img 
                  src={order.image} 
                  alt={order.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Order Details */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{order.productName}</h2>
                    <p className="text-muted-foreground italic">{order.scientificName}</p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Ship className="h-3 w-3 mr-1" />
                    In Transit
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="glass p-3 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Price</p>
                    <p className="font-mono font-bold text-primary">{order.price} USDT</p>
                  </div>
                  <div className="glass p-3 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                    <p className="font-mono font-bold">{order.quantity}</p>
                  </div>
                  <div className="glass p-3 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Supplier</p>
                    <Link to={`/supplier/${order.supplierId}`} className="font-bold text-primary hover:underline">
                      {order.supplier}
                    </Link>
                  </div>
                  <div className="glass p-3 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">ETA</p>
                    <p className="font-mono font-bold">2 Days</p>
                  </div>
                </div>

                {/* Transaction Hash */}
                <div className="glass p-3 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Transaction Hash</span>
                    <Link 
                      to={`/transaction/${order.txHash}`}
                      className="text-sm font-mono text-primary hover:underline flex items-center gap-1"
                    >
                      {order.txHash?.slice(0, 16)}...{order.txHash?.slice(-12)}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Delivery Timeline */}
          <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Delivery Progress
              </h3>
              <div className="space-y-6">
                {deliveryTimeline.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={index} 
                      className="flex items-center gap-4 animate-fade-in" 
                      style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                    >
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          item.completed 
                            ? 'bg-green-500/20 text-green-400 glow-primary' 
                            : 'bg-muted/50 text-muted-foreground'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        {index < deliveryTimeline.length - 1 && (
                          <div className={`absolute left-1/2 top-12 w-0.5 h-6 -translate-x-1/2 ${
                            item.completed ? 'bg-green-500/50' : 'bg-muted/30'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {item.step}
                        </p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                      {item.completed && (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Events */}
          <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                  Blockchain Events
                </h3>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Updated {Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago
                </span>
              </div>
              <div className="space-y-4">
                {blockchainEvents.map((event, index) => (
                  <div 
                    key={index}
                    className="glass p-4 rounded-lg border border-border/50 animate-fade-in"
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{event.event}</span>
                      <Badge 
                        variant="outline" 
                        className={event.status === 'confirmed' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }
                      >
                        {event.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Block</span>
                        <p className="font-mono text-primary">#{event.blockNumber}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gas</span>
                        <p className="font-mono">{event.gasUsed}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time</span>
                        <p className="font-mono">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Tracking */}
        <Card className="mt-8 glass-card border-border/50 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Shipment Route
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { location: "Jakarta Port, Indonesia", status: "Departed", date: "2 days ago", verified: true },
                    { location: "Singapore Hub", status: "In Transit", date: "1 day ago", verified: true },
                    { location: "Hong Kong Port", status: "Expected", date: "Tomorrow", verified: false },
                    { location: "Destination Port", status: "Pending", date: "In 2 days", verified: false },
                  ].map((item, index) => (
                    <tr key={index} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          {item.location}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={
                          item.status === 'Departed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          item.status === 'In Transit' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          'bg-muted/50 text-muted-foreground border-muted'
                        }>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{item.date}</td>
                      <td className="py-3 px-4">
                        {item.verified ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Back to Requests */}
        <div className="mt-8 flex justify-center">
          <Link to="/buyer/requests">
            <Button variant="outline" className="glass border-border/50">
              <Package className="h-4 w-4 mr-2" />
              Back to Requests
            </Button>
          </Link>
        </div>
      </div>

      <Web3Footer />
    </div>
  );
};

export default Tracking;
