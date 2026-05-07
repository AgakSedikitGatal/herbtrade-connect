import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Web3Header } from "@/components/Web3Header";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Background } from "@/components/Web3Background";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { products, categories } from "@/lib/products";
import { isProductInSeason, isProductInPeakSeason, getCurrentSeason, getSeasonalProductIds } from "@/lib/seasons";
import { ShoppingCart, TrendingUp, TrendingDown, Coins, Clock, BarChart3, Verified, Package, Store, Leaf, MapPin } from "lucide-react";
import { toast } from "sonner";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { SupplierTrendGraph } from "@/components/SupplierTrendGraph";
import { ProductCardSkeleton, StatCardSkeleton } from "@/components/ui/loading-spinner";
import { LivePriceTicker, LivePriceBadge } from "@/components/LivePriceTicker";
import { useCart } from "@/contexts/CartContext";
import { useCompliance } from "@/contexts/ComplianceContext";
import { authService } from "@/lib/auth";
import { getSellerProductGeotag } from "@/lib/productGeotag";

// Mock price data for blockchain display
const generateMockPriceChange = () => {
  const change = (Math.random() * 10 - 3).toFixed(2);
  return parseFloat(change);
};

const Shop = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { sellerProfile } = useCompliance();
  const sellerProductGeotag = getSellerProductGeotag(sellerProfile);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showInStock, setShowInStock] = useState(false);
  const [showOnSale, setShowOnSale] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = products.filter(product => {
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const stockMatch = !showInStock || product.inStock;
    const saleMatch = !showOnSale || product.onSale;
    const searchMatch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.location.toLowerCase().includes(searchQuery.toLowerCase());
    return priceMatch && categoryMatch && stockMatch && saleMatch && searchMatch;
  });

  const handleBuyerAction = (callback: () => void) => {
    const user = authService.getUser();

    if (!user) {
      toast.error("Please login first. General accounts can browse, but trading requires Buyer KYC.");
      navigate('/login');
      return;
    }

    if (!authService.canTransactAsBuyer()) {
      toast.error("Complete Buyer KYC to create purchase requests or add products to your cart.");
      navigate('/kyc?role=buyer');
      return;
    }

    callback();
  };

  // Generate mock blockchain data for each product
  const productsWithBlockchainData = filteredProducts.map(product => ({
    ...product,
    priceChange: generateMockPriceChange(),
    usdtPrice: product.price,
    volume24h: Math.floor(Math.random() * 1000) + 100,
    lastTrade: Math.floor(Math.random() * 60) + 1,
  }));

  return (
    <div className="min-h-screen flex flex-col gradient-bg relative overflow-hidden">
      <Web3Background />
      <Web3Header />

      <div className="flex-1 container mx-auto px-4 py-8 pt-24 relative z-10">
        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <SearchAutocomplete onSearch={setSearchQuery} />
        </div>

        {/* Live Price Ticker */}
        <LivePriceTicker productIds={['CL001', 'AP001', 'CV001', 'PN001', 'MF001']} />

        {/* Seasonal Banner */}
        {(() => {
          const currentSeason = getCurrentSeason();
          const seasonalIds = getSeasonalProductIds();
          const seasonalProducts = products.filter(p => seasonalIds.includes(p.id));
          if (seasonalProducts.length === 0) return null;
          return (
            <Card className="glass-card border-primary/30 mb-8 overflow-hidden">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Leaf className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">🌿 Currently In Season — {currentSeason.nameId}</h3>
                    <p className="text-xs text-muted-foreground">{currentSeason.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {seasonalProducts.map(p => (
                    <Link key={p.id} to={`/product/${p.id}`}>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm hover:bg-primary/20 transition-colors">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs text-muted-foreground">${p.price}/kg</span>
                        {isProductInPeakSeason(p.id) && <span className="text-xs text-primary font-semibold">🔥 Peak</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })()}
        {/* Market Stats Header */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '0ms' }}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <BarChart3 className="h-4 w-4" />
                    Total Volume
                  </div>
                  <p className="text-xl font-bold">$124,500 <span className="text-xs text-primary">USD</span></p>
                </CardContent>
              </Card>
              <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '50ms' }}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Coins className="h-4 w-4" />
                    Listed Items
                  </div>
                  <p className="text-xl font-bold">{products.length} <span className="text-xs text-muted-foreground">Products</span></p>
                </CardContent>
              </Card>
              <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    24h Change
                  </div>
                  <p className="text-xl font-bold text-green-500">+5.24%</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-border/50 animate-fade-in" style={{ animationDelay: '150ms' }}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Clock className="h-4 w-4" />
                    Last Updated
                  </div>
                  <p className="text-xl font-bold">2m ago</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <Card className="glass-card border-border/50">
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Coins className="h-4 w-4 text-primary" />
                    Price Filter (USD)
                  </h3>
                  <div className="space-y-4">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={500}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="font-mono text-primary">{priceRange[0]} USD</span>
                      <span className="font-mono text-primary">{priceRange[1]} USD</span>
                    </div>
                    <Button variant="outline" className="w-full glass border-border/50 hover:bg-primary/10">
                      Apply Filter
                    </Button>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-6">
                  <h3 className="font-semibold mb-4">Product Categories</h3>
                  <div className="space-y-3">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, category]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            }
                          }}
                        />
                        <Label htmlFor={category} className="text-sm cursor-pointer">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/50 pt-6">
                  <h3 className="font-semibold mb-4">Product Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="in-stock"
                        checked={showInStock}
                        onCheckedChange={(checked) => setShowInStock(!!checked)}
                      />
                      <Label htmlFor="in-stock" className="text-sm cursor-pointer">
                        In Stock
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="on-sale"
                        checked={showOnSale}
                        onCheckedChange={(checked) => setShowOnSale(!!checked)}
                      />
                      <Label htmlFor="on-sale" className="text-sm cursor-pointer">
                        On Sale
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                <span className="text-foreground font-semibold">{filteredProducts.length}</span> Items Listed
              </p>
              <Select defaultValue="latest">
                <SelectTrigger className="w-[180px] glass border-border/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectItem value="latest">Latest Listed</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="volume">Highest Volume</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading ? (
                <>
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                </>
              ) : (
                productsWithBlockchainData.map((product, index) => (
                  <Card 
                    key={product.id} 
                    className="glass-card border-border/50 card-hover animate-fade-in overflow-hidden"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="pt-0 px-0">
                      {/* Image with overlay */}
                      <div className="relative aspect-square bg-muted/50 flex items-center justify-center">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        
                        {/* Price change badge */}
                        <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                          product.priceChange >= 0 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {product.priceChange >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {product.priceChange >= 0 ? '+' : ''}{product.priceChange}%
                        </div>

                        {/* Verified badge */}
                        {product.inStock && (
                          <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 bg-primary/20 text-primary border border-primary/30">
                            <Verified className="h-3 w-3" />
                            Verified
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-sm text-muted-foreground italic">{product.scientificName}</p>
                        </div>

                        {/* Supplier Info */}
                        <Link 
                          to={`/supplier/${product.supplier.id}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <span>by</span>
                          <span className="text-foreground font-medium hover:text-primary">{product.supplier.name}</span>
                          {product.supplier.verified && (
                            <Verified className="h-3 w-3 text-primary" />
                          )}
                        </Link>

                        {/* Blockchain Price Display */}
                        <div className="glass p-3 rounded-lg border border-border/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">Current Price</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {product.lastTrade}m ago
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-primary font-mono">
                              {product.usdtPrice.toFixed(2)}
                            </span>
                            <span className="text-sm text-primary">USD</span>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                            <span className="text-xs text-muted-foreground">24h Vol</span>
                            <span className="text-xs font-mono">{product.volume24h} USD</span>
                          </div>
                        </div>

                        {/* Minimum Order */}
                        <div className="text-sm font-medium text-accent">
                          Min. Order: {product.minOrder.quantity.toLocaleString()} {product.minOrder.unit}
                        </div>

                        {/* Location */}
                        <div className="space-y-2 rounded-lg border border-border/40 bg-muted/20 p-3 text-xs">
                          <p className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            <span>{product.location}</span>
                          </p>
                          {sellerProductGeotag ? (
                            <div className="space-y-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-1.5">
                              <p className="text-muted-foreground">Seller farm: {sellerProductGeotag.farmLocation}</p>
                              <a
                                href={sellerProductGeotag.mapUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block font-mono text-primary transition-colors hover:underline"
                                aria-label={`Open seller geotag coordinates ${sellerProductGeotag.coordinateLabel} in Google Maps`}
                              >
                                Geotag: {sellerProductGeotag.coordinateLabel}
                              </a>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">Geotag: awaiting seller input</p>
                          )}
                        </div>

                        {product.onSale && (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/20 text-accent border border-accent/30">
                            🔥 Hot Deal
                          </div>
                        )}

                        {isProductInSeason(product.id) && (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/20 text-primary border border-primary/30">
                            🌿 In Season {isProductInPeakSeason(product.id) ? '(Peak)' : ''}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2 px-4 pb-4">
                      <Link to={`/product/${product.id}`} className="flex-1">
                        <Button variant="outline" className="w-full glass border-border/50 hover:bg-primary/10">
                          View Details
                        </Button>
                      </Link>
                      <Link to={`/supplier/${product.supplier.id}`}>
                        <Button variant="outline" size="icon" className="glass border-border/50 hover:bg-primary/10">
                          <Package className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button size="icon" className="btn-web3" onClick={() => handleBuyerAction(() => {
                        addToCart({
                          productId: product.id,
                          productName: product.name,
                          scientificName: product.scientificName,
                          quantity: "1 kg",
                          price: product.usdtPrice,
                          supplier: product.supplier.name,
                          supplierId: product.supplier.id,
                          image: product.image
                        });
                        toast.success(`Added ${product.name} to cart!`);
                        navigate('/buyer/requests');
                      })}>
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Supplier Trend Graph */}
        <SupplierTrendGraph />

        {/* Supplier Navigation */}
        <Card className="glass-card border-border/50 mt-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Explore Suppliers</h3>
                  <p className="text-sm text-muted-foreground">View all verified suppliers and their products</p>
                </div>
              </div>
              <Link to="/suppliers">
                <Button className="btn-web3">
                  <Store className="h-4 w-4 mr-2" />
                  View Suppliers
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Web3Footer />
    </div>
  );
};

export default Shop;
