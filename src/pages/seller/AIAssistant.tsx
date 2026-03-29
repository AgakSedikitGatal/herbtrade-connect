import { useState, useRef, useEffect, useCallback } from "react";
import { Web3Header } from "@/components/Web3Header";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Background } from "@/components/Web3Background";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Sparkles, TrendingUp, DollarSign, Package, BarChart3, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { products, categories } from "@/lib/products";
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
    return `📊 **Market Insight: ${matchedProduct.name}**\n\n` +
      `- **Current Price:** $${matchedProduct.price}/kg\n` +
      `- **Market Average:** $${avgPrice.toFixed(2)}/kg\n` +
      `- **Suggested Range:** $${(matchedProduct.price - margin).toFixed(2)} - $${(matchedProduct.price + margin).toFixed(2)}/kg\n` +
      `- **Demand Level:** ${matchedProduct.supplier.totalSales > 1000 ? "🔥 High" : matchedProduct.supplier.totalSales > 700 ? "📈 Medium" : "📉 Low"}\n` +
      `- **Total Market Sales:** ${matchedProduct.supplier.totalSales.toLocaleString()} units\n` +
      `- **Competition:** ${products.filter(p => p.category === matchedProduct.category).length} sellers in ${matchedProduct.category}\n\n` +
      `💡 ${matchedProduct.price > avgPrice ? "Your price is above market average. Consider competitive pricing to increase volume." : "Your price is below market average. You have room to increase margins."}`;
  }

  if (lower.includes("pricing") || lower.includes("harga") || lower.includes("strategy")) {
    return `💰 **Pricing Strategy Recommendations:**\n\n` +
      products.map(p => {
        const position = p.price > avgPrice ? "Above avg" : "Below avg";
        return `- **${p.name}:** $${p.price}/kg (${position})\n  Suggested: $${(p.price * 0.95).toFixed(2)} - $${(p.price * 1.10).toFixed(2)}/kg`;
      }).join("\n\n") +
      `\n\n📊 **Market Average:** $${avgPrice.toFixed(2)}/kg\n` +
      `💡 Price 5-10% below competitors for volume, or 10-15% above for premium positioning.`;
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
    `- **Product insights** — type a product name (e.g., "Turmeric")\n\n` +
    `Try one of the quick actions on the left! 👈`;
}

const quickActions = [
  { label: "Pricing Strategy", icon: DollarSign, query: "Pricing strategy" },
  { label: "Stock Optimization", icon: Package, query: "Stock optimization" },
  { label: "Market Trends", icon: TrendingUp, query: "Market trends" },
  { label: "Demand Analysis", icon: BarChart3, query: "Demand analysis and market overview" },
];

const SellerAIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "👋 Welcome to the AI Business Assistant! I can help you optimize pricing, manage stock levels, and analyze market trends. What would you like to know?",
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

  return (
    <div className="min-h-screen gradient-bg relative">
      <Web3Background />
      <Web3Header />
      <PageTransition>
        <div className="container mx-auto px-4 py-24 relative z-10">
          {/* Header */}
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
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Quick Actions */}
              <Card className="glass-card border-border/50">
                <CardContent className="pt-5 space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h3>
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="ghost"
                      className="w-full justify-start gap-2 text-left"
                      onClick={() => handleSend(action.query)}
                    >
                      <action.icon className="h-4 w-4 text-secondary" />
                      {action.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Market Stats */}
              <Card className="glass-card border-border/50">
                <CardContent className="pt-5 space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Market Overview</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Avg Price</span><span className="font-medium">${avgPrice}/kg</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Products</span><span className="font-medium">{totalProducts}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Sales</span><span className="font-medium">{totalSales.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">High Demand</span><span className="font-medium text-primary">{highDemandCount} products</span></div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Categories */}
              <Card className="glass-card border-border/50">
                <CardContent className="pt-5">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleSend(cat)}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <Card className="lg:col-span-3 glass-card border-border/50 flex flex-col">
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-muted/60 border border-border/50"
                      }`}>
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
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about pricing, stock, or market trends..."
                      className="flex-1 bg-background/50"
                    />
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
