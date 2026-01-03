import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, Phone, Video, MoreVertical, CheckCheck } from "lucide-react";

interface Message {
  id: string;
  sender: 'user' | 'supplier';
  text: string;
  timestamp: Date;
  read: boolean;
}

interface SupplierChatProps {
  supplierName: string;
  supplierAvatar?: string;
  productName: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const SupplierChat = ({ supplierName, supplierAvatar, productName, isOpen: controlledOpen, onOpenChange }: SupplierChatProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'supplier',
      text: `Hello! Thank you for your interest in our ${productName}. How can I help you today?`,
      timestamp: new Date(Date.now() - 60000),
      read: true,
    },
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: message,
      timestamp: new Date(),
      read: false,
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Simulate supplier response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'supplier',
        text: getAutoResponse(message),
        timestamp: new Date(),
        read: false,
      };
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  const getAutoResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return "Our prices are very competitive. For bulk orders over 100kg, we offer special discounts. Would you like me to prepare a custom quote?";
    }
    if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping')) {
      return "We offer worldwide shipping. Delivery typically takes 7-14 business days depending on your location. Express shipping is also available.";
    }
    if (lowerMessage.includes('quality') || lowerMessage.includes('certificate')) {
      return "All our products are certified with ISO9001 and GMP standards. We can provide detailed quality reports and certificates upon request.";
    }
    return "Thank you for your message! Our team will review your inquiry and get back to you shortly. Is there anything specific you'd like to know about the product?";
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg btn-hero z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] h-[500px] glass-card border-border/50 shadow-2xl z-50 flex flex-col">
      <CardHeader className="pb-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/30">
              <AvatarImage src={supplierAvatar} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {supplierName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{supplierName}</CardTitle>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted/50 border border-border/30 rounded-bl-md'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <div className={`flex items-center justify-end gap-1 mt-1 ${
                msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
              }`}>
                <span className="text-xs">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.sender === 'user' && (
                  <CheckCheck className="h-3 w-3" />
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>

      <div className="p-4 border-t border-border/30">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-muted/30 border-border/50"
          />
          <Button size="icon" onClick={handleSendMessage} className="btn-hero">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
