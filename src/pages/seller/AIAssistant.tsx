import { useState, useRef, useEffect, useCallback } from "react";
import { Web3Header } from "@/components/Web3Header";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Background } from "@/components/Web3Background";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Sparkles, TrendingUp, DollarSign, Package, BarChart3, ArrowLeft, Star, Calendar } from "lucide-react";
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

function generateSellerResponse(input: string): string {
  const lower = input.toLowerCase();
  const avgPrice = products.reduce((s, p) => s + p.price, 0) / products.length;

  const matchedProduct = products.find(
    (p) => lower.includes(p.name.toLowerCase()) || lower.includes(p.scientificName.toLowerCase())
  );

  if (matchedProduct) {
    const margin = matchedProduct.price * 0.15;
    const avgRating = (matchedProduct.reviews.reduce((s, r) => s + r.rating, 0) / matchedProduct.reviews.length).toFixed(1);
    const seasonInfo = getProductSeasonInfo(matchedProduct.id);
    const seasonText = seasonInfo
      ? `\n- **Musim Panen:** ${seasonInfo.harvestMonths.map(m => getMonthName(m)).join(', ')}\n- **Saran:** ${seasonInfo.harvestMonths.includes(getCurrentMonth()) ? 'Sedang musim panen — stok supply tinggi, kompetisi harga ketat' : 'Di luar musim — supply terbatas, bisa markup harga 10-15%'}`
      : '';
    return `📊 **Market Insight: ${matchedProduct.name}**\n\n` +
      `- **Current Price:** $${matchedProduct.price}/kg\n` +
      `- **Market Average:** $${avgPrice.toFixed(2)}/kg\n` +
      `- **Suggested Range:** $${(matchedProduct.price - margin).toFixed(2)} - $${(matchedProduct.price + margin).toFixed(2)}/kg\n` +
      `- **Review Score:** ⭐ ${avgRating} (${matchedProduct.reviews.length} reviews)\n` +
      `- **Demand Level:** ${matchedProduct.supplier.totalSales > 1000 ? "🔥 High" : matchedProduct.supplier.totalSales > 700 ? "📈 Medium" : "📉 Low"}\n` +
      `- **Total Market Sales:** ${matchedProduct.supplier.totalSales.toLocaleString()} units${seasonText}\n\n` +
      `💡 ${matchedProduct.price > avgPrice ? "Price above market avg. Consider competitive pricing." : "Price below avg. Room to increase margins."}`;
  }

  // Review/feedback handler
  if (lower.includes("review") || lower.includes("feedback") || lower.includes("testimoni") || lower.includes("ulasan")) {
    return `⭐ **Review Analysis & Insights:**\n\n` +
      products.map(p => {
        const avg = (p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length).toFixed(1);
        const lowReviews = p.reviews.filter(r => r.rating < 4);
        const positiveRate = ((p.reviews.filter(r => r.rating >= 4).length / p.reviews.length) * 100).toFixed(0);
        return `**${p.name}** — ⭐ ${avg} avg | ${positiveRate}% positive\n` +
          (lowReviews.length > 0
            ? `  ⚠️ Area improvement: "${lowReviews[0].comment}"\n`
            : `  ✅ Semua review positif!\n`) +
          `  📊 ${p.reviews.length} total reviews`;
      }).join("\n\n") +
      `\n\n💡 **Tips:** Respon cepat terhadap feedback negatif dapat meningkatkan rating hingga 20%.`;
  }

  // Season handler
  if (lower.includes("musim") || lower.includes("season") || lower.includes("seasonal") || lower.includes("panen")) {
    const currentSeason = getCurrentSeason();
    const inSeasonIds = getSeasonalProductIds();
    const inSeasonProducts = products.filter(p => inSeasonIds.includes(p.id));
    const upcoming = getUpcomingHarvestProducts();

    return `🌿 **Seasonal Market Strategy**\n\n` +
      `📅 **${currentSeason.nameId}** (${currentSeason.name})\n\n` +
      `**Produk Sedang Musim Panen:**\n` +
      (inSeasonProducts.length > 0
        ? inSeasonProducts.map(p => {
            const si = getProductSeasonInfo(p.id);
            return `- **${p.name}** — Supply tinggi, harga kompetitif\n  💡 Saran: Jual cepat di harga pasar, fokus volume`;
          }).join("\n")
        : "Tidak ada produk musim panen saat ini.") +
      `\n\n**Produk Di Luar Musim (Peluang Markup):**\n` +
      products.filter(p => !inSeasonIds.includes(p.id)).map(p =>
        `- **${p.name}** — Supply terbatas, bisa markup 10-20%`
      ).join("\n") +
      (upcoming.length > 0
        ? `\n\n**Segera Panen:**\n` + upcoming.map(u => {
            const prod = products.find(p => p.id === u.productId);
            return prod ? `- **${prod.name}** — mulai ${u.nextMonth}, stok up sekarang!` : '';
          }).filter(Boolean).join("\n")
        : '') +
      `\n\n💡 Beli stok saat musim panen (harga rendah), jual saat off-season (harga premium)!`;
  }

  if (lower.includes("pricing") || lower.includes("harga") || lower.includes("strategy")) {
    return `💰 **Pricing Strategy Recommendations:**\n\n` +
      products.map(p => {
        const position = p.price > avgPrice ? "Above avg" : "Below avg";
        const avgRating = (p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length).toFixed(1);
        return `- **${p.name}:** $${p.price}/kg (${position}) — ⭐ ${avgRating}\n  Suggested: $${(p.price * 0.95).toFixed(2)} - $${(p.price * 1.10).toFixed(2)}/kg`;
      }).join("\n\n") +
      `\n\n📊 **Market Average:** $${avgPrice.toFixed(2)}/kg\n` +
      `💡 Products with ⭐ 4.5+ reviews can be priced 10-15% above market.`;
  }

  if (lower.includes("stock") || lower.includes("stok") || lower.includes("optimization")) {
    const sorted = [...products].sort((a, b) => b.supplier.totalSales - a.supplier.totalSales);
    return `📦 **Stock Optimization Tips:**\n\n` +
      sorted.map((p, i) =>
        `${i + 1}. **${p.name}** — ${p.supplier.stock.toLocaleString()} kg in stock\n   Sales velocity: ${p.supplier.totalSales.toLocaleString()} units\n   ${p.supplier.stock > p.supplier.totalSales * 3 ? "⚠️ Overstocked — consider promotions" : "✅ Stock level healthy"}`
      ).join("\n\n") +
      `\n\n💡 Maintain stock at 2-3x your monthly sales volume for optimal inventory.`;
  }

  if (lower.includes("trend") || lower.includes("tren") || lower.includes("demand") || lower.includes("market")) {
    const highDemand = products.filter(p => p.supplier.totalSales > 900);
    const onSale = products.filter(p => p.onSale);
    return `📈 **Market Trends Analysis:**\n\n` +
      `**High Demand Products:**\n` +
      highDemand.map(p => `- ${p.name}: ${p.supplier.totalSales.toLocaleString()} sales (⭐ ${p.supplier.rating})`).join("\n") +
      `\n\n**Currently on Sale:** ${onSale.length} products\n` +
      onSale.map(p => `- ${p.name} at $${p.price}/kg`).join("\n") +
      `\n\n**Category Demand:**\n` +
      [...new Set(products.map(p => p.category))].map(cat => {
        const catProducts = products.filter(p => p.category === cat);
        const totalSales = catProducts.reduce((s, p) => s + p.supplier.totalSales, 0);
        return `- ${cat}: ${totalSales.toLocaleString()} total sales`;
      }).join("\n") +
      `\n\n💡 Focus on high-demand categories and products with strong sales velocity.`;
  }

  return `👋 Hi! I'm your AI business assistant. I can help you with:\n\n` +
    `- **Pricing strategy** — type "pricing"\n` +
    `- **Stock optimization** — type "stock"\n` +
    `- **Market trends** — type "trend"\n` +
    `- **Review insights** — type "review"\n` +
    `- **Seasonal strategy** — type "musim"\n` +
    `- **Product insights** — type a product name (e.g., "Turmeric")\n\n` +
    `Try one of the quick actions on the left! 👈`;
}

const quickActions = [
  { label: "Pricing Strategy", icon: DollarSign, query: "Pricing strategy" },
  { label: "Stock Optimization", icon: Package, query: "Stock optimization" },
  { label: "Market Trends", icon: TrendingUp, query: "Market trends" },
  { label: "Review Insights", icon: Star, query: "Review analysis" },
  { label: "Seasonal Strategy", icon: Calendar, query: "Musim saat ini" },
  { label: "Demand Analysis", icon: BarChart3, query: "Demand analysis and market overview" },
];

const SellerAIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "👋 Welcome to the AI Business Assistant! I can help you optimize pricing, manage stock, analyze reviews, and plan around seasonal trends. What would you like to know?",
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
      const response = generateSellerResponse(msg);
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
  const totalSales = products.reduce((s, p) => s + p.supplier.totalSales, 0);
  const highDemandCount = products.filter(p => p.supplier.totalSales > 900).length;
  const currentSeason = getCurrentSeason();

  return (
    <div className="min-h-screen gradient-bg relative">
      <Web3Background />
      <Web3Header />
      <PageTransition>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/seller/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary/20 rounded-xl glow-secondary">
                <Bot className="h-7 w-7 text-secondary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Business Assistant</h1>
                <p className="text-sm text-muted-foreground">Smart insights for pricing, stock & market trends</p>
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
                      <action.icon className="h-4 w-4 text-secondary" />
                      {action.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-card border-border/50">
                <CardContent className="pt-5 space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Market Overview</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Avg Price</span><span className="font-medium">${avgPrice}/kg</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Products</span><span className="font-medium">{totalProducts}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Sales</span><span className="font-medium">{totalSales.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">High Demand</span><span className="font-medium text-primary">{highDemandCount} products</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Season</span><span className="font-medium text-secondary">{currentSeason.nameId}</span></div>
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
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.sender === "user" ? "bg-secondary text-secondary-foreground" : "bg-muted/60 border border-border/50"}`}>
                        {msg.sender === "ai" && (
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-3.5 w-3.5 text-secondary" />
                            <span className="text-xs font-medium text-secondary">AI Assistant</span>
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
                          <Sparkles className="h-3.5 w-3.5 text-secondary animate-pulse" />
                          <span className="text-muted-foreground">Analyzing market data...</span>
                          <span className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-border/50 p-4">
                  <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                    <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about pricing, reviews, seasons, or market trends..." className="flex-1 bg-background/50" />
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

export default SellerAIAssistant;
