import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Web3Header } from "@/components/Web3Header";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Background } from "@/components/Web3Background";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart, MapPin, Shield, Star, Package, LogIn, MessageCircle } from "lucide-react";
import { products } from "@/lib/products";
import { toast } from "sonner";
import { PriceChart } from "@/components/PriceChart";
import { TransactionHistory } from "@/components/TransactionHistory";
import { SupplierChat } from "@/components/SupplierChat";
import { OrderPlacement } from "@/components/OrderPlacement";
import { LivePriceDisplay } from "@/components/LivePriceTicker";
import { useCart } from "@/contexts/CartContext";
import { authService } from "@/lib/auth";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = products.find(p => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [quantityUnit, setQuantityUnit] = useState("kg");
  const [purchaseType, setPurchaseType] = useState("one-time");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const isLoggedIn = authService.isAuthenticated();

  // Unit conversion multipliers
  const unitMultipliers: Record<string, number> = {
    kg: 1,
    kwintal: 100,
    ton: 1000,
  };

  const calculatePrice = () => {
    if (!product) return 0;
    return product.price * quantity * unitMultipliers[quantityUnit];
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col gradient-bg relative overflow-hidden">
        <Web3Background />
        <Web3Header />
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
            <Link to="/shop">
              <Button className="btn-hero">Back to Marketplace</Button>
            </Link>
          </div>
        </div>
        <Web3Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast.error("Please login to add items to cart", {
        action: {
          label: "Login",
          onClick: () => navigate('/login'),
        },
      });
      return;
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      scientificName: product.scientificName,
      quantity: `${quantity} ${quantityUnit.toUpperCase()}`,
      price: calculatePrice(),
      supplier: product.supplier.name,
      supplierId: product.supplier.id,
      image: product.image
    });
    toast.success(`Added ${quantity} ${quantityUnit.toUpperCase()} of ${product.name} to cart!`);
    navigate('/buyer/requests');
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      toast.error("Please login to make a purchase", {
        action: {
          label: "Login",
          onClick: () => navigate('/login'),
        },
      });
      return;
    }
    setShowOrderModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col gradient-bg relative overflow-hidden">
      <Web3Background />
      <Web3Header />

      <div className="flex-1 container mx-auto px-4 py-8 pt-24 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary">Marketplace</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Image */}
          <div>
            <div className="aspect-square bg-muted/30 rounded-2xl overflow-hidden border border-border/50 glass-card">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified Product
                </Badge>
                {product.onSale && (
                  <Badge className="bg-accent/20 text-accent border-accent/30">🔥 On Sale</Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-xl text-muted-foreground italic">{product.scientificName}</p>
            </div>

            {/* Supplier Info */}
            <Link to={`/supplier/${product.supplier.id}`}>
              <Card className="glass-card border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold hover:text-primary transition-colors">{product.supplier.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{product.supplier.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-semibold">{product.supplier.rating}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{product.supplier.totalSales} sales</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Price Display */}
            <div className="glass-card border-border/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Price per KG</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                  +2.5% (24h)
                </Badge>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-primary font-mono">${product.price.toFixed(2)}</span>
                <span className="text-lg text-primary">USDT</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Total: <span className="text-foreground font-semibold">${calculatePrice().toFixed(2)} USDT</span>
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Quantity & Unit</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="glass border-border/50"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-semibold w-16 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="glass border-border/50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Select value={quantityUnit} onValueChange={setQuantityUnit}>
                  <SelectTrigger className="w-[140px] glass border-border/50">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    <SelectItem value="kg">Kilogram (KG)</SelectItem>
                    <SelectItem value="kwintal">Kwintal (100 KG)</SelectItem>
                    <SelectItem value="ton">Ton (1000 KG)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Available stock: <span className="text-foreground font-medium">{product.supplier.stock.toLocaleString()} KG</span>
              </p>
              <p className="text-sm font-medium text-accent">
                Min. Order: {product.minOrder.quantity.toLocaleString()} {product.minOrder.unit}
              </p>
            </div>

            {/* Purchase Options */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Purchase Options</Label>
              <RadioGroup value={purchaseType} onValueChange={setPurchaseType}>
                <div className="flex items-center space-x-2 border border-border/50 rounded-lg p-4 cursor-pointer hover:bg-muted/30 glass">
                  <RadioGroupItem value="one-time" id="one-time" />
                  <Label htmlFor="one-time" className="cursor-pointer flex-1">
                    One time purchase
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border border-border/50 rounded-lg p-4 cursor-pointer hover:bg-muted/30 glass">
                  <RadioGroupItem value="subscribe" id="subscribe" />
                  <div className="flex-1">
                    <Label htmlFor="subscribe" className="cursor-pointer block">
                      Subscribe and delivery every 4 weeks
                    </Label>
                    <p className="text-sm text-accent mt-1">Save 10%</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-3">
              <Button size="lg" className="flex-1 btn-hero" onClick={handleAddToCart}>
                {isLoggedIn ? <ShoppingCart className="mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />}
                {isLoggedIn ? 'Add to Cart' : 'Login to Add'}
              </Button>
              <Button size="lg" className="flex-1 btn-web3" onClick={handleBuyNow}>
                Buy Now - ${calculatePrice().toFixed(2)} USDT
              </Button>
            </div>

            {/* Contact Supplier Button */}
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full glass border-border/50 hover:bg-primary/10 gap-2"
              onClick={() => setShowChat(true)}
            >
              <MessageCircle className="h-5 w-5" />
              Contact Supplier
            </Button>

            {/* Specifications */}
            <Card className="glass-card border-border/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4">Product Description</h3>
                <p className="text-muted-foreground mb-4">{product.description}</p>

                <h3 className="font-semibold text-lg mb-4 mt-6">Specifications</h3>
                <div className="space-y-2 text-sm">
                  {product.specifications.essentialOil && (
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Essential Oil:</span>
                      <span>{product.specifications.essentialOil}</span>
                    </div>
                  )}
                  {product.specifications.curcumin && (
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Curcumin:</span>
                      <span>{product.specifications.curcumin}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Packing:</span>
                    <span>{product.specifications.packing}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Effective Ingredients:</span>
                    <span>{product.specifications.effectiveIngredients}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span>{product.specifications.certificate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Model:</span>
                    <span>{product.specifications.model}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">CAS No:</span>
                    <span>{product.specifications.casNo}</span>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-2 mt-6">Cultivation Area</h3>
                <p className="text-sm">{product.cultivationArea}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Price Chart & Transaction History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <PriceChart productName={product.name} currentPrice={product.price} />
          <TransactionHistory productId={product.id} />
        </div>
      </div>

      {/* Supplier Chat */}
      <SupplierChat 
        supplierName={product.supplier.name} 
        productName={product.name}
        isOpen={showChat}
        onOpenChange={setShowChat}
      />

      <OrderPlacement
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        product={product}
        quantity={quantity}
        unit={quantityUnit}
        totalPrice={calculatePrice()}
      />

      <Web3Footer />
    </div>
  );
};

export default Product;
