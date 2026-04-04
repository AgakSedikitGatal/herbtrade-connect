import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { CartProvider } from "@/contexts/CartContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { CommunityProvider } from "@/contexts/CommunityContext";
import { BuyerRequestProvider } from "@/contexts/BuyerRequestContext";
import { InitialLoader } from "@/components/InitialLoader";
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
import TransactionDetail from "./pages/TransactionDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition><Product /></PageTransition>} />
        <Route path="/supplier/:id" element={<PageTransition><Supplier /></PageTransition>} />
        <Route path="/suppliers" element={<PageTransition><Suppliers /></PageTransition>} />
        <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><BuyerRequests /></PageTransition>} />
        <Route path="/tracking/:orderId" element={<PageTransition><Tracking /></PageTransition>} />
        <Route path="/tracking" element={<PageTransition><Tracking /></PageTransition>} />
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
        <Route path="/buyer/requests" element={<PageTransition><BuyerRequests /></PageTransition>} />
        <Route path="/buyer/orders" element={<PageTransition><BuyerOrders /></PageTransition>} />
        <Route path="/buyer/ai-assistant" element={<PageTransition><BuyerAIAssistant /></PageTransition>} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/products" element={<PageTransition><SellerProducts /></PageTransition>} />
        <Route path="/seller/add-product" element={<PageTransition><AddProduct /></PageTransition>} />
        <Route path="/seller/orders" element={<PageTransition><SellerOrders /></PageTransition>} />
        <Route path="/seller/analytics" element={<PageTransition><SellerAnalytics /></PageTransition>} />
        <Route path="/seller/withdraw" element={<PageTransition><SellerWithdraw /></PageTransition>} />
        <Route path="/seller/ai-assistant" element={<PageTransition><SellerAIAssistant /></PageTransition>} />
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
    <QueryClientProvider client={queryClient}>
      <OrderProvider>
        <CartProvider>
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
        </CartProvider>
      </OrderProvider>
    </QueryClientProvider>
  );
};

export default App;
