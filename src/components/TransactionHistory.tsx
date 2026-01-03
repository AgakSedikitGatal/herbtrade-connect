import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, ArrowRightLeft } from "lucide-react";
import { hashFromSeed, shortenHash, shortenAddress, addressFromSeed, numberFromSeed, decimalFromSeed, statusFromSeed } from "@/lib/mockChain";

interface Transaction {
  id: string;
  amount: number;
  price: number;
  date: string;
  status: 'completed' | 'pending';
  txHashFull: string;
  txHashDisplay: string;
  buyer: string;
  seller: string;
}

// Generate deterministic mock transaction history based on productId
const generateTransactions = (productId: string): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  for (let i = 0; i < 10; i++) {
    const seed = `product-${productId}-tx-${i}`;
    const txHashFull = hashFromSeed(seed);
    const date = new Date(now);
    // Use deterministic hour offset
    date.setHours(date.getHours() - i * numberFromSeed(seed + '-hours', 1, 24));
    
    const status = statusFromSeed(seed);
    
    transactions.push({
      id: `TX${productId}${i}`,
      amount: numberFromSeed(seed + '-amount', 1, 50),
      price: decimalFromSeed(seed + '-price', 5, 25),
      date: date.toISOString(),
      status: status === 'success' ? 'completed' : 'pending',
      txHashFull,
      txHashDisplay: shortenHash(txHashFull),
      buyer: shortenAddress(addressFromSeed(seed, 0)),
      seller: shortenAddress(addressFromSeed(seed, 1)),
    });
  }
  
  return transactions;
};

interface TransactionHistoryProps {
  productId: string;
}

export const TransactionHistory = ({ productId }: TransactionHistoryProps) => {
  const navigate = useNavigate();
  const transactions = generateTransactions(productId);

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
          Blockchain Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30 hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/transaction/${tx.txHashFull}`)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/20">
                  <ArrowRightLeft className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Transaction</span>
                    <Badge variant="outline" className="text-xs">
                      {tx.amount} KG
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(tx.date).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-sm">${(tx.amount * tx.price).toFixed(2)} USD</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <span className="font-mono text-primary hover:underline">{tx.txHashDisplay}</span>
                </div>
              </div>
              
              <div className="ml-3">
                {tx.status === 'completed' ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-400 animate-pulse" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
