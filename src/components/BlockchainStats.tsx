import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Box, ArrowRightLeft, Clock, CheckCircle, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { hashFromSeed, shortenHash, numberFromSeed } from "@/lib/mockChain";
import { useRealtimeTransactions } from "@/hooks/useRealtimeTransactions";

interface Block {
  number: number;
  timestamp: string;
  transactions: number;
  hash: string;
}

// Get a stable time slot (changes every 12 seconds)
const getTimeSlot = () => Math.floor(Date.now() / 12000);

// Mock data generator with deterministic hashes
const generateMockBlocks = (): Block[] => {
  const now = Date.now();
  const slot = getTimeSlot();
  return Array.from({ length: 5 }, (_, i) => ({
    number: 19847520 - i,
    timestamp: new Date(now - i * 12000).toLocaleTimeString(),
    transactions: numberFromSeed(`block-${slot}-${i}-txcount`, 50, 250),
    hash: shortenHash(hashFromSeed(`block-${slot}-${i}`)),
  }));
};

export const BlockchainStats = () => {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use real-time transaction simulation
  const { transactions, isConnected, lastUpdate } = useRealtimeTransactions({
    maxTransactions: 5,
    updateInterval: 6000, // New transaction every 6 seconds
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setBlocks(generateMockBlocks());
      setLoading(false);
    }, 1500);

    // Update blocks periodically
    const interval = setInterval(() => {
      setBlocks(generateMockBlocks());
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

      {/* Latest Transactions - Real-time */}
      <Card className="glass-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/20 rounded-lg">
              <ArrowRightLeft className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-lg">Live Transactions</CardTitle>
              {lastUpdate && (
                <p className="text-xs text-muted-foreground">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="outline" className="status-success text-xs animate-pulse">
                <Wifi className="h-3 w-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-muted/50 text-muted-foreground text-xs">
                <WifiOff className="h-3 w-3 mr-1" />
                Connecting...
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isConnected || transactions.length === 0
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))
            : transactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer ${
                    tx.isNew 
                      ? 'animate-pulse ring-2 ring-primary/50 bg-primary/10' 
                      : ''
                  }`}
                  onClick={() => navigate(`/transaction/${tx.hashFull}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded transition-colors ${
                      tx.isNew ? 'bg-primary/30' : 'bg-secondary/10'
                    }`}>
                      <ArrowRightLeft className={`h-4 w-4 ${
                        tx.isNew ? 'text-primary' : 'text-secondary'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm text-primary hover:underline">{tx.hashDisplay}</p>
                        {tx.isNew && (
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tx.fromDisplay} → {tx.toDisplay}
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
