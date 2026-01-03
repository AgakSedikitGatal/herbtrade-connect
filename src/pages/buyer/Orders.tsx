import { useNavigate } from "react-router-dom";
import { Web3Header } from "@/components/Web3Header";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Background } from "@/components/Web3Background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, CheckCircle, Clock, AlertCircle, Package } from "lucide-react";
import { useOrders } from "@/contexts/OrderContext";

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
    case "delivered":
      return "status-success";
    case "shipped":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "processing":
      return "status-pending";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const BuyerOrders = () => {
  const { orders } = useOrders();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col gradient-bg relative overflow-hidden">
      <Web3Background />
      <Web3Header />

      <main className="flex-1 container mx-auto px-4 py-8 pt-24 relative z-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 text-gradient-hero">Order History</h1>
          <p className="text-muted-foreground text-lg">
            Track and review your blockchain-verified transactions
          </p>
        </div>

        {orders.length > 0 ? (
          <Card className="glass-card border-border/50 animate-fade-in">
            <CardHeader className="flex flex-row items-center gap-3 pb-4">
              <div className="p-2 bg-primary/20 rounded-lg glow-primary">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Transaction History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {orders.map((order, index) => (
                <div
                  key={order.id + index}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3 mb-3 md:mb-0">
                    <div className="p-2 bg-primary/10 rounded">
                      <ArrowRightLeft className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                    <div>
                      <button 
                        onClick={() => navigate(`/transaction/${order.txHash}`)}
                        className="font-mono text-sm text-primary hover:underline cursor-pointer"
                      >
                        {order.txHash.slice(0, 10)}...{order.txHash.slice(-8)}
                      </button>
                      <p className="text-xs text-muted-foreground">
                        {order.from.slice(0, 6)}...{order.from.slice(-4)} → {order.to.slice(0, 6)}...{order.to.slice(-4)}
                      </p>
                    </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                    <div>
                      <p className="text-sm font-medium">{order.productName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(order.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    
                    <div className="text-right flex flex-row md:flex-col items-center md:items-end gap-2">
                      <p className="text-sm font-semibold text-primary">${order.totalAmount.toFixed(2)} USD</p>
                      <Badge
                        variant="outline"
                        className={getStatusColor(order.status)}
                      >
                      {order.status === "success" || order.status === "delivered" ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : order.status === "shipped" ? (
                          <Package className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card border-border/50">
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground">
                Your order history will appear here once you make a purchase.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Web3Footer />
    </div>
  );
};

export default BuyerOrders;