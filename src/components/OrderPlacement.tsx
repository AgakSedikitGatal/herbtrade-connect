import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/contexts/OrderContext";
import { 
  Shield, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Lock,
  Zap,
  Building2,
  CreditCard,
  Smartphone,
  Wallet
} from "lucide-react";

interface OrderPlacementProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    supplier: {
      name: string;
    };
  };
  quantity: number;
  unit: string;
  totalPrice: number;
}

type OrderStep = 'review' | 'payment' | 'processing' | 'confirmation';

export const OrderPlacement = ({ 
  isOpen, 
  onClose, 
  product, 
  quantity, 
  unit, 
  totalPrice 
}: OrderPlacementProps) => {
  const [step, setStep] = useState<OrderStep>('review');
  const [paymentMethod, setPaymentMethod] = useState<string>('bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  const { toast } = useToast();
  const { addOrder } = useOrders();

  const paymentMethods = [
    { id: 'bank', name: 'Bank Transfer', icon: Building2, description: 'Direct bank transfer' },
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard' },
    { id: 'mobile', name: 'Mobile Payment', icon: Smartphone, description: 'E-wallet & mobile banking' },
  ];

  const handleProcessOrder = async () => {
    setStep('processing');
    setIsProcessing(true);

    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate mock transaction hash
    const mockTxHash = '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    setTxHash(mockTxHash);
    setIsProcessing(false);
    setStep('confirmation');

    // Add order to history
    addOrder({
      productName: product.name,
      productId: product.id,
      productImage: product.image,
      quantity: `${quantity} ${unit.toUpperCase()}`,
      pricePerUnit: product.price,
      totalAmount: totalPrice,
      supplier: product.supplier.name,
      paymentMethod: paymentMethods.find(m => m.id === paymentMethod)?.name || 'Unknown',
      status: 'success',
    });

    toast({
      title: "Order Confirmed!",
      description: "Your order has been placed on the blockchain.",
    });
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {['review', 'payment', 'processing', 'confirmation'].map((s, i) => (
        <div key={s} className="flex items-center">
          <div 
            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              step === s 
                ? 'bg-primary text-primary-foreground' 
                : ['review', 'payment', 'processing', 'confirmation'].indexOf(step) > i
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {i + 1}
          </div>
          {i < 3 && (
            <div className={`w-8 h-0.5 ${
              ['review', 'payment', 'processing', 'confirmation'].indexOf(step) > i
                ? 'bg-primary'
                : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <Card className="glass-card border-border/50">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-semibold">{product.name}</h4>
              <p className="text-sm text-muted-foreground">{product.supplier.name}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm">Quantity: <strong>{quantity} {unit}</strong></span>
                <span className="text-sm">Price: <strong>${product.price}/KG</strong></span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-border/50" />

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Platform Fee (2%)</span>
          <span>${(totalPrice * 0.02).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Gas Fee (Est.)</span>
          <span>~$2.50</span>
        </div>
        <Separator className="bg-border/50" />
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span className="text-primary">${(totalPrice * 1.02 + 2.5).toFixed(2)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
        <Shield className="h-5 w-5 text-primary flex-shrink-0" />
        <p className="text-sm">
          Your order is protected by smart contract escrow. Funds will be released to the supplier only after you confirm delivery.
        </p>
      </div>

      <Button 
        className="w-full btn-hero"
        onClick={() => setStep('payment')}
      >
        Continue to Payment
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>Select Payment Method</Label>
        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  paymentMethod === method.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border/50 bg-muted/30 hover:border-primary/50'
                }`}
              >
                <Icon className={`h-6 w-6 mb-2 ${paymentMethod === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="font-medium text-sm">{method.name}</p>
                <p className="text-xs text-muted-foreground">{method.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <Card className="glass-card border-border/50">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Amount to Pay</span>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">
                ${totalPrice.toFixed(2)} USD
              </div>
              <div className="text-sm text-muted-foreground">
                + ${(totalPrice * 0.02).toFixed(2)} processing fee
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3 text-center py-4">
        <div className="p-3 rounded-lg bg-muted/50">
          <Lock className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-xs text-muted-foreground">Secure Payment</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <Zap className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-xs text-muted-foreground">Fast Processing</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <Shield className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-xs text-muted-foreground">Buyer Protection</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1 glass border-border/50"
          onClick={() => setStep('review')}
        >
          Back
        </Button>
        <Button 
          className="flex-1 btn-hero"
          onClick={handleProcessOrder}
        >
          Place Order
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="py-8 text-center space-y-6">
      <div className="relative mx-auto w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-pulse" />
        <div className="absolute inset-2 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Wallet className="h-8 w-8 text-primary" />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Processing Your Order</h3>
        <p className="text-muted-foreground">
          Please confirm the transaction in your wallet...
        </p>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Creating smart contract escrow...</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Waiting for blockchain confirmation...</span>
        </div>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="py-6 text-center space-y-6">
      <div className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
        <CheckCircle2 className="h-10 w-10 text-primary" />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Order Confirmed!</h3>
        <p className="text-muted-foreground">
          Your order has been placed on the blockchain
        </p>
      </div>

      <Card className="glass-card border-border/50 text-left">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-mono">ORD-{Date.now().toString(36).toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Transaction Hash</span>
            <Link 
              to={`/transaction/${txHash}`}
              className="font-mono text-primary hover:underline"
            >
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </Link>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge className="status-success">Confirmed</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-semibold text-primary">
              ${totalPrice.toFixed(2)} USD
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="capitalize">{paymentMethods.find(m => m.id === paymentMethod)?.name}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30 text-left">
        <Shield className="h-5 w-5 text-primary flex-shrink-0" />
        <p className="text-sm">
          Funds are now held in escrow. They will be released to the supplier after you confirm delivery.
        </p>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1 glass border-border/50"
          onClick={onClose}
        >
          Close
        </Button>
        <Button 
          className="flex-1 btn-hero"
          onClick={() => window.location.href = '/buyer/orders'}
        >
          View Orders
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/50 max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'review' && 'Order Review'}
            {step === 'payment' && 'Payment'}
            {step === 'processing' && 'Processing'}
            {step === 'confirmation' && 'Confirmation'}
          </DialogTitle>
          <DialogDescription>
            {step === 'review' && 'Review your order details before proceeding'}
            {step === 'payment' && 'Select payment method and connect your wallet'}
            {step === 'processing' && 'Your transaction is being processed'}
            {step === 'confirmation' && 'Your order has been successfully placed'}
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        {step === 'review' && renderReviewStep()}
        {step === 'payment' && renderPaymentStep()}
        {step === 'processing' && renderProcessingStep()}
        {step === 'confirmation' && renderConfirmationStep()}
      </DialogContent>
    </Dialog>
  );
};
