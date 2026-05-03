import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Web3Header } from "@/components/Web3Header";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Background } from "@/components/Web3Background";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlockchainStats } from "@/components/BlockchainStats";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { PageTransition } from "@/components/PageTransition";
import { Package, ShoppingBag, Truck, Plus, Bot, FileText, SearchCheck, ShieldCheck, Sparkles } from "lucide-react";
import { authService, type BuyerKycProfile } from "@/lib/auth";

const BuyerDashboard = () => {
  const user = authService.getUser();
  const buyerProfile = user?.role === "buyer" ? (user.kycProfile as BuyerKycProfile | undefined) : undefined;
  const recommendedSimplisia = buyerProfile?.simplisiaNeeded?.length ? buyerProfile.simplisiaNeeded : ["Jahe", "Kunyit", "Temulawak"];
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

            <motion.div
              className="grid gap-4 md:grid-cols-[1.4fr_1fr] mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="glass border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <Badge className="mb-3 bg-primary/10 text-primary border-primary/30">
                        <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Buyer KYC Access
                      </Badge>
                      <h2 className="text-2xl font-semibold mb-2">{authService.getKycStatusLabel(user?.kycStatus)}</h2>
                      <p className="text-sm text-muted-foreground max-w-2xl">
                        {buyerProfile
                          ? `Legalitas ${buyerProfile.businessEntityName || buyerProfile.legalName} dengan NIB ${buyerProfile.nibNumber} sudah menjadi dasar transaksi dan preferensi sourcing.`
                          : "Lengkapi Buyer KYC agar transaksi aktif dan dashboard dapat memberi rekomendasi simplisia sesuai kebutuhan perusahaan."}
                      </p>
                    </div>
                    <Button asChild variant={buyerProfile ? "outline" : "default"}>
                      <Link to="/kyc?role=buyer">{buyerProfile ? "Update Buyer KYC" : "Start Buyer KYC"}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-border/50">
                <CardContent className="p-6">
                  <Badge className="mb-3 bg-secondary/10 text-secondary border-secondary/30">
                    <Sparkles className="h-3.5 w-3.5 mr-1" /> Recommended Sourcing
                  </Badge>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {recommendedSimplisia.map((item) => (
                      <Badge key={item} variant="outline">{item}</Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {buyerProfile
                      ? `${buyerProfile.purchaseVolumeKg.toLocaleString()} kg/month target, preferred origin: ${buyerProfile.preferredOrigin}.`
                      : "Rekomendasi awal akan dipersonalisasi setelah kebutuhan simplisia diisi pada Buyer KYC."}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { to: "/shop", icon: Plus, title: "Browse Products", desc: "Explore marketplace", color: "primary", glow: "glow-primary" },
                { to: "/buyer/requests", icon: ShoppingBag, title: "Buyer Requests", desc: "View your requests", color: "secondary", glow: "glow-secondary" },
                { to: "/buyer/orders", icon: Package, title: "Order History", desc: "Track your orders", color: "accent", glow: "" },
                { to: "/tracking", icon: Truck, title: "Track Shipment", desc: "Monitor deliveries", color: "info", glow: "" },
                { to: "/buyer/ai-assistant", icon: Bot, title: "AI Assistant", desc: "Get recommendations", color: "primary", glow: "glow-primary" },
                { to: "/buyer/product-request", icon: FileText, title: "Product Request", desc: "Request products", color: "secondary", glow: "glow-secondary" },
                { to: "/buyer/compliance-history", icon: SearchCheck, title: "Verification History", desc: "Review QR compliance scans", color: "info", glow: "" },
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
    </div>
  );
};

export default BuyerDashboard;
