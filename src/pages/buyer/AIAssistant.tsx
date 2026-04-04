import { useState, useRef, useEffect, useCallback } from "react";
import { Web3Header } from "@/components/Web3Header";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Background } from "@/components/Web3Background";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Sparkles, ShoppingBag, DollarSign, Users, Leaf, ArrowLeft, Star, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { products, categories } from "@/lib/products";
import { getCurrentSeason, getSeasonalProductIds, getUpcomingHarvestProducts, getProductSeasonInfo, getMonthName, getCurrentMonth } from "@/lib/seasons";
import { motion } from "framer-motion";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

function generateBuyerResponse(input: string): string {
  const lower = input.toLowerCase();
  const matchedProduct = products.find(
    (p) => lower.includes(p.name.toLowerCase()) || lower.includes(p.scientificName.toLowerCase())
  );

  if (matchedProduct) {
    const avgRating = matchedProduct.reviews.length > 0
      ? (matchedProduct.reviews.reduce((s, r) => s + r.rating, 0) / matchedProduct.reviews.length).toFixed(1)
      : "N/A";
    const seasonInfo = getProductSeasonInfo(matchedProduct.id);
    const seasonText = seasonInfo
      ? `\n- **Musim Panen:** ${seasonInfo.harvestMonths.map(m => getMonthName(m)).join(', ')}\n- **Status:** ${seasonInfo.harvestMonths.includes(getCurrentMonth()) ? '🌿 Sedang musim panen!' : '⏳ Belum musim panen'}`
      : '';
    return `📦 **${matchedProduct.name}** (${matchedProduct.scientificName})\n\n` +
      `- **Price:** $${matchedProduct.price}/kg\n` +
      `- **Supplier:** ${matchedProduct.supplier.name} (⭐ ${matchedProduct.supplier.rating})\n` +
      `- **Review Rating:** ⭐ ${avgRating} (${matchedProduct.reviews.length} reviews)\n` +
      `- **Stock:** ${matchedProduct.supplier.stock.toLocaleString()} kg available\n` +
      `- **Location:** ${matchedProduct.location}\n` +
      `- **Min Order:** ${matchedProduct.minOrder.quantity} ${matchedProduct.minOrder.unit}\n` +
      `- **Certificate:** ${matchedProduct.specifications.certificate}${seasonText}\n\n` +
      `💡 ${matchedProduct.supplier.totalSales.toLocaleString()} total sales. ${matchedProduct.onSale ? "🔥 Currently on sale!" : ""}`;
  }

  // Review/testimoni handler
  if (lower.includes("review") || lower.includes("testimoni") || lower.includes("ulasan") || lower.includes("feedback")) {
    const sorted = [...products].sort((a, b) => {
      const avgA = a.reviews.reduce((s, r) => s + r.rating, 0) / (a.reviews.length || 1);
      const avgB = b.reviews.reduce((s, r) => s + r.rating, 0) / (b.reviews.length || 1);
      return avgB - avgA;
    });
    return `⭐ **Top Reviewed Suppliers:**\n\n` +
      sorted.map((p, i) => {
        const avg = (p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length).toFixed(1);
        const bestReview = p.reviews.sort((a, b) => b.rating - a.rating)[0];
        return `${i + 1}. **${p.supplier.name}** — ⭐ ${avg} avg (${p.reviews.length} reviews)\n   📦 ${p.name} — $${p.price}/kg\n   💬 "${bestReview.comment}" — ${bestReview.user}`;
      }).join("\n\n") +
      `\n\n💡 Rekomendasi berdasarkan rating dan testimoni pembeli sebelumnya.`;
  }

  // Season handler
  if (lower.includes("musim") || lower.includes("season") || lower.includes("seasonal") || lower.includes("panen") || lower.includes("harvest")) {
    const currentSeason = getCurrentSeason();
    const inSeasonIds = getSeasonalProductIds();
    const inSeasonProducts = products.filter(p => inSeasonIds.includes(p.id));
    const upcoming = getUpcomingHarvestProducts();
    const upcomingProducts = upcoming.map(u => {
      const prod = products.find(p => p.id === u.productId);
      return prod ? `- **${prod.name}** — mulai panen ${u.nextMonth}` : '';
    }).filter(Boolean);

    return `🌿 **Info Musim Saat Ini**\n\n` +
      `📅 **${currentSeason.nameId}** (${currentSeason.name})\n${currentSeason.description}\n\n` +
      `**Produk Sedang Musim Panen:**\n` +
      (inSeasonProducts.length > 0
        ? inSeasonProducts.map(p => {
            const si = getProductSeasonInfo(p.id);
            return `- 🌿 **${p.name}** — $${p.price}/kg (${p.supplier.name})\n  ${si?.notes || ''}`;
          }).join("\n")
        : "Tidak ada produk yang sedang musim panen saat ini.") +
      (upcomingProducts.length > 0
        ? `\n\n**Akan Segera Panen:**\n${upcomingProducts.join("\n")}`
        : '') +
      `\n\n💡 Beli saat musim panen untuk harga terbaik dan kualitas optimal!`;
  }

  if (lower.includes("recommend") || lower.includes("rekomendasi") || lower.includes("stock")) {
    const sorted = [...products].sort((a, b) => b.supplier.rating - a.supplier.rating);
    const top3 = sorted.slice(0, 3);
    return `🌿 **Top 3 Recommended Herbal Products:**\n\n` +
      top3.map((p, i) => {
        const avg = (p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length).toFixed(1);
        return `${i + 1}. **${p.name}** - $${p.price}/kg\n   Supplier: ${p.supplier.name} (⭐ ${p.supplier.rating})\n   Reviews: ⭐ ${avg} (${p.reviews.length} reviews)\n   Stock: ${p.supplier.stock.toLocaleString()} kg`;
      }).join("\n\n") +
      `\n\n💡 Rankings based on supplier rating, reviews, and stock availability.`;
  }

  if (lower.includes("price") || lower.includes("harga") || lower.includes("comparison")) {
    const sorted = [...products].sort((a, b) => a.price - b.price);
    return `💰 **Price Comparison (Low to High):**\n\n` +
      sorted.map((p, i) =>
        `${i + 1}. **${p.name}** — $${p.price}/kg (${p.supplier.name})`
      ).join("\n") +
      `\n\n📊 Average market price: $${(products.reduce((s, p) => s + p.price, 0) / products.length).toFixed(2)}/kg`;
  }

  if (lower.includes("supplier")) {
    const sorted = [...products].sort((a, b) => b.supplier.rating - a.supplier.rating);
    return `🏆 **Supplier Rankings:**\n\n` +
      sorted.map((p, i) => {
        const avg = (p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length).toFixed(1);
        return `${i + 1}. **${p.supplier.name}** — ⭐ ${p.supplier.rating} (Review: ${avg})\n   📍 ${p.supplier.location} | 📦 ${p.supplier.totalSales.toLocaleString()} sales | ${p.supplier.verified ? "✅ Verified" : "⚠️ Unverified"}`;
      }).join("\n\n");
  }

  if (lower.includes("category") || lower.includes("kategori")) {
    return `📂 **Available Categories:**\n\n` +
      categories.map((c, i) => `${i + 1}. ${c}`).join("\n") +
      `\n\n💡 Type a category or product name to get detailed information!`;
  }

  return `👋 Hi! I'm your AI purchasing assistant. I can help you with:\n\n` +
    `- **Product recommendations** — type "recommend"\n` +
    `- **Price comparison** — type "price"\n` +
    `- **Supplier rankings** — type "supplier"\n` +
    `- **Top reviewed** — type "review"\n` +
    `- **Seasonal info** — type "musim"\n` +
    `- **Categories** — type "category"\n` +
    `- **Product details** — type a product name (e.g., "Turmeric")\n\n` +
    `Try one of the quick actions on the left! 👈`;
}

const quickActions = [
  { label: "Best Suppliers", icon: Users, query: "Best suppliers?" },
  { label: "Price Comparison", icon: DollarSign, query: "Price comparison" },
  { label: "Top Reviewed", icon: Star, query: "Top reviewed suppliers" },
  { label: "Current Season", icon: Calendar, query: "Musim saat ini" },
  { label: "Recommendations", icon: ShoppingBag, query: "Stock recommendations" },
  { label: "Browse Categories", icon: Leaf, query: "Show categories" },
];

const BuyerAIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "👋 Welcome to the AI Purchasing Assistant! I can help you find the best herbal products, compare prices, check reviews, and see seasonal availability. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = useCallback((text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: msg,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateBuyerResponse(msg);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  }, [input]);

  const renderText = (text: string) => {
    return text.split("\n").map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  };

  const avgPrice = (products.reduce((s, p) => s + p.price, 0) / products.length).toFixed(2);
  const totalProducts = products.length;
  const totalSuppliers = new Set(products.map(p => p.supplier.name)).size;
  const currentSeason = getCurrentSeason();

  return (
    <div className="min-h-screen gradient-bg relative">
      <Web3Background />
      <Web3Header />
      <PageTransition>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/buyer/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl glow-primary">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Purchasing Assistant</h1>
                <p className="text-sm text-muted-foreground">Smart recommendations for herbal sourcing</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" style={{ minHeight: "65vh" }}>
            <div className="lg:col-span-1 space-y-4">
              <Card className="glass-card border-border/50">
                <CardContent className="pt-5 space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h3>
                  {quickActions.map((action) => (
                    <Button key={action.label} variant="ghost" className="w-full justify-start gap-2 text-left" onClick={() => handleSend(action.query)}>
                      <action.icon className="h-4 w-4 text-primary" />
                      {action.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-card border-border/50">
                <CardContent className="pt-5 space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Market Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Avg Price</span><span className="font-medium">${avgPrice}/kg</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Products</span><span className="font-medium">{totalProducts}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Suppliers</span><span className="font-medium">{totalSuppliers}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Season</span><span className="font-medium text-primary">{currentSeason.nameId}</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/50">
                <CardContent className="pt-5">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Button key={cat} variant="outline" size="sm" className="text-xs" onClick={() => handleSend(cat)}>
                        {cat}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="lg:col-span-3 glass-card border-border/50 flex flex-col">
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg) => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted/60 border border-border/50"}`}>
                        {msg.sender === "ai" && (
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-medium text-primary">AI Assistant</span>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{renderText(msg.text)}</div>
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted/60 border border-border/50 rounded-2xl px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                          <span className="text-muted-foreground">Analyzing data...</span>
                          <span className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-border/50 p-4">
                  <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                    <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about products, reviews, seasons, or suppliers..." className="flex-1 bg-background/50" />
                    <Button type="submit" size="icon" disabled={!input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
      <Web3Footer />
    </div>
  );
};

export default BuyerAIAssistant;
