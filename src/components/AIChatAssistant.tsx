import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { products } from "@/lib/products";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface AIChatAssistantProps {
  role: "buyer" | "seller";
}

const getBuyerQuickActions = () => [
  "Best suppliers?",
  "Price comparison",
  "Stock recommendations",
];

const getSellerQuickActions = () => [
  "Pricing strategy",
  "Stock optimization",
  "Market trends",
];

function generateBuyerResponse(input: string): string {
  const lower = input.toLowerCase();

  const matchedProduct = products.find(
    (p) =>
      lower.includes(p.name.toLowerCase()) ||
      lower.includes(p.scientificName.toLowerCase())
  );

  if (matchedProduct) {
    return `📦 **${matchedProduct.name}** (${matchedProduct.scientificName})\n\n` +
      `- **Price:** $${matchedProduct.price}/kg\n` +
      `- **Supplier:** ${matchedProduct.supplier.name} (⭐ ${matchedProduct.supplier.rating})\n` +
      `- **Stock:** ${matchedProduct.supplier.stock.toLocaleString()} kg available\n` +
      `- **Location:** ${matchedProduct.location}\n` +
      `- **Min Order:** ${matchedProduct.minOrder.quantity} ${matchedProduct.minOrder.unit}\n` +
      `- **Certificate:** ${matchedProduct.specifications.certificate}\n\n` +
      `💡 This product has ${matchedProduct.supplier.totalSales.toLocaleString()} total sales. ${matchedProduct.onSale ? "🔥 Currently on sale!" : ""}`;
  }

  if (lower.includes("recommend") || lower.includes("rekomendasi") || lower.includes("stock")) {
    const sorted = [...products].sort((a, b) => b.supplier.rating - a.supplier.rating);
    const top3 = sorted.slice(0, 3);
    return `🌿 **Top 3 Recommended Herbal Products:**\n\n` +
      top3.map((p, i) =>
        `${i + 1}. **${p.name}** - $${p.price}/kg\n   Supplier: ${p.supplier.name} (⭐ ${p.supplier.rating})\n   Stock: ${p.supplier.stock.toLocaleString()} kg`
      ).join("\n\n") +
      `\n\n💡 Rankings are based on supplier rating, stock availability, and sales volume.`;
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
      sorted.map((p, i) =>
        `${i + 1}. **${p.supplier.name}** — ⭐ ${p.supplier.rating}\n   📍 ${p.supplier.location} | 📦 ${p.supplier.totalSales.toLocaleString()} sales | ${p.supplier.verified ? "✅ Verified" : "⚠️ Unverified"}`
      ).join("\n\n");
  }

  return `👋 Hi! I'm your AI assistant. I can help you with:\n\n` +
    `- **Product recommendations** — type "recommend"\n` +
    `- **Price comparison** — type "price"\n` +
    `- **Supplier rankings** — type "supplier"\n` +
    `- **Product details** — type a product name (e.g., "Turmeric")\n\n` +
    `Try one of the quick actions below! 👇`;
}

function generateSellerResponse(input: string): string {
  const lower = input.toLowerCase();
  const avgPrice = products.reduce((s, p) => s + p.price, 0) / products.length;

  const matchedProduct = products.find(
    (p) =>
      lower.includes(p.name.toLowerCase()) ||
      lower.includes(p.scientificName.toLowerCase())
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
      `\n\n**Regional Demand:**\n` +
      [...new Set(products.map(p => p.category))].map(cat => {
        const catProducts = products.filter(p => p.category === cat);
        const totalSales = catProducts.reduce((s, p) => s + p.supplier.totalSales, 0);
        return `- ${cat}: ${totalSales.toLocaleString()} total sales`;
      }).join("\n") +
      `\n\n💡 Focus on high-demand regions and products with strong sales velocity.`;
  }

  return `👋 Hi! I'm your AI business assistant. I can help you with:\n\n` +
    `- **Pricing strategy** — type "pricing"\n` +
    `- **Stock optimization** — type "stock"\n` +
    `- **Market trends** — type "trend"\n` +
    `- **Product insights** — type a product name (e.g., "Turmeric")\n\n` +
    `Try one of the quick actions below! 👇`;
}

export const AIChatAssistant = ({ role }: AIChatAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: role === "buyer"
        ? "👋 Welcome! I'm your AI herbal market assistant. Ask me about products, suppliers, or pricing!"
        : "👋 Welcome! I'm your AI business assistant. Ask me about pricing strategy, stock optimization, or market trends!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions = role === "buyer" ? getBuyerQuickActions() : getSellerQuickActions();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = useCallback((text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: msg,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = role === "buyer" ? generateBuyerResponse(msg) : generateSellerResponse(msg);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  }, [input, role]);

  const renderText = (text: string) => {
    return text.split("\n").map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-xs">$1</code>');
      return <p key={i} className="min-h-[1.2em]" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/30"
              size="icon"
            >
              <Bot className="h-6 w-6 text-white" />
            </Button>
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
              AI
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[520px] flex flex-col rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                </div>
                <div>
                  <p className="font-semibold text-sm">AI Assistant</p>
                  <p className="text-xs text-muted-foreground">
                    {role === "buyer" ? "Herbal Market Advisor" : "Business Strategy Advisor"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 max-h-[340px]" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-gradient-to-br from-emerald-500 to-cyan-500 text-white rounded-br-md"
                          : "bg-muted/60 text-foreground rounded-bl-md"
                      }`}
                    >
                      {renderText(msg.text)}
                      <p className={`text-[10px] mt-1.5 ${msg.sender === "user" ? "text-white/60" : "text-muted-foreground"}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted/60 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]" />
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-border/30">
              {quickActions.map((action) => (
                <Badge
                  key={action}
                  variant="outline"
                  className="cursor-pointer hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-colors text-xs"
                  onClick={() => handleSend(action)}
                >
                  {action}
                </Badge>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border/50 flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 bg-muted/40 border-border/50 text-sm"
              />
              <Button
                onClick={() => handleSend()}
                size="icon"
                className="bg-gradient-to-br from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shrink-0"
                disabled={!input.trim() || isTyping}
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
