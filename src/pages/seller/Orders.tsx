import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Web3Header } from "@/components/Web3Header";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Background } from "@/components/Web3Background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft } from "lucide-react";

interface Order {
  id: string;
  product: string;
  customer: string;
  date: string;
  amount: string;
  payment: string;
  status: 'Delivered' | 'Canceled' | 'Process';
}

const ordersData: Order[] = [
  { id: '0x8f4e...3a2b', product: 'Jahe', customer: 'Matt Dickerson', date: '13/05/2022', amount: '90 USD', payment: 'Crypto', status: 'Delivered' },
  { id: '0x2c7a...8d1f', product: 'Kunyit', customer: 'Wiktoria', date: '22/05/2022', amount: '150 USD', payment: 'Crypto', status: 'Delivered' },
  { id: '0x5b9d...1e4a', product: 'Jahe', customer: 'Trixia Raya', date: '15/06/2022', amount: '200 USD', payment: 'E-Wallet', status: 'Process' },
  { id: '0x9e3c...7f2b', product: 'Kayu Manis', customer: 'Jamie Morrison', date: '08/05/2022', amount: '80 USD', payment: 'Crypto', status: 'Delivered' },
  { id: '0x1a7f...4c9e', product: 'Lada Hitam', customer: 'Robert Levy', date: '30/04/2022', amount: '120 USD', payment: 'Crypto', status: 'Canceled' },
  { id: '0x3d8b...2f5c', product: 'Pala', customer: 'Noel Baldwin', date: '15/04/2022', amount: '95 USD', payment: 'E-Wallet', status: 'Delivered' },
  { id: '0x6e2a...9c4d', product: 'Jahe', customer: 'Zaire Saris', date: '22/03/2022', amount: '110 USD', payment: 'Crypto', status: 'Delivered' },
  { id: '0x7f1c...3a8e', product: 'Kunyit', customer: 'Michael Jenkins', date: '03/03/2022', amount: '75 USD', payment: 'Crypto', status: 'Delivered' },
  { id: '0x4b9e...1d7f', product: 'Kayu Manis', customer: 'Tyler Moran', date: '01/02/2022', amount: '140 USD', payment: 'Crypto', status: 'Delivered' },
  { id: '0x2c8d...5a6b', product: 'Lada Hitam', customer: 'Liam Melon', date: '19/01/2022', amount: '160 USD', payment: 'E-Wallet', status: 'Delivered' }
];

const SellerOrders = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState('10');

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'status-success';
      case 'Canceled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Process':
        return 'status-pending';
    }
  };

  const filteredOrders = ordersData.filter(order =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col gradient-bg relative overflow-hidden">
      <Web3Background />
      <Web3Header />

      <div className="flex-1 container mx-auto px-4 py-8 pt-24 relative z-10">
        <div className="animate-fade-in mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gradient-hero">Orders Tracking</h1>
          <p className="text-muted-foreground">View Your Orders Tracking!</p>
        </div>

        <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="p-2 bg-primary/20 rounded-lg glow-primary">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Transaction Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                  <SelectTrigger className="w-[100px] bg-muted/30 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">entries</span>
              </div>

              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="md:w-[300px] bg-muted/30 border-border/50"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">TX Hash</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Payment</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr 
                      key={order.id} 
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors animate-fade-in"
                      style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                    >
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => navigate(`/transaction/${order.id.split('...')[0]}`)}
                          className="font-mono text-sm text-primary hover:underline cursor-pointer"
                        >
                          {order.id}
                        </button>
                      </td>
                      <td className="py-3 px-4">{order.product}</td>
                      <td className="py-3 px-4">{order.customer}</td>
                      <td className="py-3 px-4 text-muted-foreground">{order.date}</td>
                      <td className="py-3 px-4 font-semibold">{order.amount}</td>
                      <td className="py-3 px-4">{order.payment}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-muted-foreground">
                Showing 1 to {filteredOrders.length} of {ordersData.length} entries
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-border/50 bg-muted/30">Previous</Button>
                <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
                <Button variant="outline" size="sm" className="border-border/50 bg-muted/30">2</Button>
                <Button variant="outline" size="sm" className="border-border/50 bg-muted/30">3</Button>
                <Button variant="outline" size="sm" className="border-border/50 bg-muted/30">Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Web3Footer />
    </div>
  );
};

export default SellerOrders;