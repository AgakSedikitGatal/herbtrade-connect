import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Box, ArrowRightLeft, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface Block {
  number: number;
  timestamp: string;
  transactions: number;
  hash: string;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  status: "success" | "pending";
}

// Mock data generator
const generateMockBlocks = (): Block[] => {
  const now = Date.now();
  return Array.from({ length: 5 }, (_, i) => ({
    number: 19847520 - i,
    timestamp: new Date(now - i * 12000).toLocaleTimeString(),
    transactions: Math.floor(Math.random() * 200) + 50,
    hash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
  }));
};

const generateMockTransactions = (): Transaction[] => {
  return Array.from({ length: 5 }, () => ({
    hash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    from: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`,
    to: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`,
    value: (Math.random() * 500 + 50).toFixed(2) + " USD",
    status: Math.random() > 0.2 ? "success" : "pending",
  }));
};

export const BlockchainStats = () => {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setBlocks(generateMockBlocks());
      setTransactions(generateMockTransactions());
      setLoading(false);
    }, 1500);

    // Update data periodically
    const interval = setInterval(() => {
      setBlocks(generateMockBlocks());
      setTransactions(generateMockTransactions());
    }, 12000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Latest Blocks */}
      <Card className="glass-card border-border/50">
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Box className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">Latest Blocks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            : blocks.map((block) => (
                <div
                  key={block.number}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <Box className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-mono text-sm text-primary">#{block.number}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {block.timestamp}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{block.transactions} txns</p>
                    <p className="text-xs text-muted-foreground font-mono">{block.hash}</p>
                  </div>
                </div>
              ))}
        </CardContent>
      </Card>

      {/* Latest Transactions */}
      <Card className="glass-card border-border/50">
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <div className="p-2 bg-secondary/20 rounded-lg">
            <ArrowRightLeft className="h-5 w-5 text-secondary" />
          </div>
          <CardTitle className="text-lg">Latest Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))
            : transactions.map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/transaction/${tx.hash.split('...')[0]}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded">
                      <ArrowRightLeft className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="font-mono text-sm text-primary hover:underline">{tx.hash}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.from} → {tx.to}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-sm font-semibold">{tx.value}</p>
                    <Badge
                      variant="outline"
                      className={
                        tx.status === "success"
                          ? "status-success text-xs"
                          : "status-pending text-xs"
                      }
                    >
                      {tx.status === "success" ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
        </CardContent>
      </Card>
    </div>
  );
};
