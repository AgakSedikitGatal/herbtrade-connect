import { useState, useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { CartProvider } from "@/contexts/CartContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { CommunityProvider } from "@/contexts/CommunityContext";
import { BuyerRequestProvider } from "@/contexts/BuyerRequestContext";
import { ComplianceProvider } from "@/contexts/ComplianceContext";
import { InitialLoader } from "@/components/InitialLoader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PageTransition } from "@/components/PageTransition";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Supplier from "./pages/Supplier";
import Suppliers from "./pages/Suppliers";
import Community from "./pages/Community";

import Tracking from "./pages/Tracking";
import BuyerDashboard from "./pages/buyer/Dashboard";
import BuyerRequests from "./pages/buyer/Requests";
import BuyerOrders from "./pages/buyer/Orders";
import SellerDashboard from "./pages/seller/Dashboard";
import SellerProducts from "./pages/seller/Products";
import AddProduct from "./pages/seller/AddProduct";
import SellerOrders from "./pages/seller/Orders";
import SellerAnalytics from "./pages/seller/Analytics";
import SellerWithdraw from "./pages/seller/Withdraw";
import BuyerAIAssistant from "./pages/buyer/AIAssistant";
import SellerAIAssistant from "./pages/seller/AIAssistant";
import ComplianceOnboarding from "./pages/seller/ComplianceOnboarding";
import QRCompliance from "./pages/seller/QRCompliance";
import ComplianceHistory from "./pages/buyer/ComplianceHistory";
import ProductJourney from "./pages/ProductJourney";
import KYCOnboarding from "./pages/KYCOnboarding";
import TransactionDetail from "./pages/TransactionDetail";
import ProductRequest from "./pages/buyer/ProductRequest";
import NotFound from "./pages/NotFound";
import { authService, type TradeRole } from "@/lib/auth";

const queryClient = new QueryClient();

const RequireRole = ({ role, children }: { role: TradeRole; children: ReactNode }) => {
  const user = authService.getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role || !["pending", "verified"].includes(user.kycStatus)) {
    return <Navigate to={`/kyc?role=${role}`} replace />;
  }

  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/kyc" element={<PageTransition><KYCOnboarding /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition><Product /></PageTransition>} />
        <Route path="/supplier/:id" element={<PageTransition><Supplier /></PageTransition>} />
        <Route path="/suppliers" element={<PageTransition><Suppliers /></PageTransition>} />
        <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/cart" element={<RequireRole role="buyer"><PageTransition><BuyerRequests /></PageTransition></RequireRole>} />
        <Route path="/tracking/:orderId" element={<PageTransition><Tracking /></PageTransition>} />
        <Route path="/tracking" element={<PageTransition><Tracking /></PageTransition>} />
        <Route path="/buyer/dashboard" element={<RequireRole role="buyer"><BuyerDashboard /></RequireRole>} />
        <Route path="/buyer/requests" element={<RequireRole role="buyer"><PageTransition><BuyerRequests /></PageTransition></RequireRole>} />
        <Route path="/buyer/orders" element={<RequireRole role="buyer"><PageTransition><BuyerOrders /></PageTransition></RequireRole>} />
        <Route path="/buyer/ai-assistant" element={<RequireRole role="buyer"><PageTransition><BuyerAIAssistant /></PageTransition></RequireRole>} />
        <Route path="/buyer/product-request" element={<RequireRole role="buyer"><PageTransition><ProductRequest /></PageTransition></RequireRole>} />
        <Route path="/buyer/compliance-history" element={<RequireRole role="buyer"><PageTransition><ComplianceHistory /></PageTransition></RequireRole>} />
        <Route path="/seller/dashboard" element={<RequireRole role="seller"><SellerDashboard /></RequireRole>} />
        <Route path="/seller/products" element={<RequireRole role="seller"><PageTransition><SellerProducts /></PageTransition></RequireRole>} />
        <Route path="/seller/add-product" element={<RequireRole role="seller"><PageTransition><AddProduct /></PageTransition></RequireRole>} />
        <Route path="/seller/orders" element={<RequireRole role="seller"><PageTransition><SellerOrders /></PageTransition></RequireRole>} />
        <Route path="/seller/analytics" element={<RequireRole role="seller"><PageTransition><SellerAnalytics /></PageTransition></RequireRole>} />
        <Route path="/seller/withdraw" element={<RequireRole role="seller"><PageTransition><SellerWithdraw /></PageTransition></RequireRole>} />
        <Route path="/seller/ai-assistant" element={<RequireRole role="seller"><PageTransition><SellerAIAssistant /></PageTransition></RequireRole>} />
        <Route path="/seller/compliance-onboarding" element={<RequireRole role="seller"><PageTransition><ComplianceOnboarding /></PageTransition></RequireRole>} />
        <Route path="/seller/qr-compliance" element={<RequireRole role="seller"><PageTransition><QRCompliance /></PageTransition></RequireRole>} />
        <Route path="/journey/:batchCode" element={<PageTransition><ProductJourney /></PageTransition>} />
        <Route path="/transaction/:txHash" element={<PageTransition><TransactionDetail /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Check if this is the first load of the session
    const hasLoaded = sessionStorage.getItem("hasLoaded");
    if (hasLoaded) {
      setShowLoader(false);
    }
  }, []);

  const handleLoaderComplete = () => {
    setShowLoader(false);
    sessionStorage.setItem("hasLoaded", "true");
  };

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
      <OrderProvider>
        <CartProvider>
          <BuyerRequestProvider>
            <ComplianceProvider>
              <CommunityProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
              {showLoader && <InitialLoader onComplete={handleLoaderComplete} />}
              <BrowserRouter>
                <ScrollToTop />
                <AnimatedRoutes />
              </BrowserRouter>
              </TooltipProvider>
            </CommunityProvider>
            </ComplianceProvider>
          </BuyerRequestProvider>
        </CartProvider>
      </OrderProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
