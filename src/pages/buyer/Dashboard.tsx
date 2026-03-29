import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Web3Header } from "@/components/Web3Header";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Background } from "@/components/Web3Background";
import { Card, CardContent } from "@/components/ui/card";
import { BlockchainStats } from "@/components/BlockchainStats";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { PageTransition } from "@/components/PageTransition";
import { Package, ShoppingBag, Truck, Plus, Bot } from "lucide-react";
import { authService } from "@/lib/auth";
import { AIChatAssistant } from "@/components/AIChatAssistant";

const BuyerDashboard = () => {
  const user = authService.getUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen gradient-bg relative">
      <Web3Background />
      <Web3Header />

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <PageTransition>
          <div className="container mx-auto px-4 py-24 relative z-10">
            {/* Welcome Section */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl font-bold mb-2">
                Welcome Back, <span className="text-gradient-hero">{user?.name}</span>!
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your portfolio, track transactions, and explore the marketplace.
              </p>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { to: "/shop", icon: Plus, title: "Browse Products", desc: "Explore marketplace", color: "primary", glow: "glow-primary" },
                { to: "/buyer/requests", icon: ShoppingBag, title: "Buyer Requests", desc: "View your requests", color: "secondary", glow: "glow-secondary" },
                { to: "/buyer/orders", icon: Package, title: "Order History", desc: "Track your orders", color: "accent", glow: "" },
                { to: "/tracking", icon: Truck, title: "Track Shipment", desc: "Monitor deliveries", color: "info", glow: "" },
                { to: "/buyer/ai-assistant", icon: Bot, title: "AI Assistant", desc: "Smart recommendations", color: "primary", glow: "glow-primary" },
              ].map((item, index) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Link to={item.to}>
                    <Card className="glass-card border-border/50 card-hover cursor-pointer h-full">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className={`p-4 bg-${item.color}/20 rounded-xl ${item.glow}`}>
                            <item.icon className={`h-8 w-8 text-${item.color}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>


            {/* Blockchain Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-2xl font-bold mb-6">Network Activity</h2>
              <BlockchainStats />
            </motion.div>
          </div>
        </PageTransition>
      )}

      <Web3Footer />
      <AIChatAssistant role="buyer" />
    </div>
  );
};

export default BuyerDashboard;
