import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Wallet, LogOut, User, Copy, ExternalLink, Coins } from "lucide-react";
import { authService } from "@/lib/auth";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "@/hooks/use-toast";
import { WalletConnectModal } from "@/components/WalletConnectModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export const Web3Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getUser();
  const { 
    address, 
    isConnected, 
    isConnecting, 
    connectWallet, 
    disconnectWallet, 
    shortenAddress,
    ethBalance,
    tokenBalances
  } = useWallet();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsOpen(false);
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard.",
      });
    }
  };

  const viewOnExplorer = () => {
    if (address) {
      window.open(`https://etherscan.io/address/${address}`, "_blank");
    }
  };

  const handleWalletConnect = (walletId: string) => {
    if (walletId === "metamask") {
      connectWallet();
    }
  };

  const navLinks = [
    { href: "/shop", label: "Marketplace", isScroll: false },
    { href: "/community", label: "Community", isScroll: false },
    { id: "about", label: "About", isScroll: true },
    { id: "contact", label: "Contact", isScroll: true },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src="/icon.png" alt="HerBlocX" className="h-8 w-6" />
              <span className="text-xl font-bold text-gradient-hero">HerBlocX</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) =>
                link.isScroll ? (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id!)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href!}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="btn-web3-outline gap-2">
                      <User className="h-4 w-4" />
                      {user.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass">
                    <DropdownMenuItem asChild>
                      <Link
                        to={user.role === "seller" ? "/seller/dashboard" : "/buyer/dashboard"}
                      >
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Login
                  </Button>
                </Link>
              )}

              {/* Wallet Connection */}
              {isConnected && address ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="btn-web3 gap-2 py-2 px-4">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                      {shortenAddress(address)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass min-w-[240px]">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Connected Wallet
                    </DropdownMenuLabel>
                    
                    {/* Balance Display */}
                    <div className="px-2 py-3 border-b border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">ETH Balance</span>
                        <span className="font-mono font-semibold">{ethBalance || "0.0000"} ETH</span>
                      </div>
                      {tokenBalances.length > 0 && (
                        <div className="space-y-1">
                          {tokenBalances.map((token) => (
                            <div key={token.symbol} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Coins className="h-3 w-3" />
                                {token.symbol}
                              </span>
                              <span className="font-mono">{token.balance}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <DropdownMenuItem onClick={copyAddress}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Address
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={viewOnExplorer}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Etherscan
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={disconnectWallet} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  className="btn-web3 gap-2 py-2 px-4" 
                  onClick={() => setShowWalletModal(true)}
                  disabled={isConnecting}
                >
                  <Wallet className="h-4 w-4" />
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="glass w-[300px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) =>
                    link.isScroll ? (
                      <button
                        key={link.id}
                        onClick={() => scrollToSection(link.id!)}
                        className="text-lg hover:text-primary transition-colors text-left"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        key={link.href}
                        to={link.href!}
                        onClick={() => setIsOpen(false)}
                        className="text-lg hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    )
                  )}
                  <div className="border-t border-border pt-4 mt-4">
                    {user ? (
                      <>
                        <Link
                          to={user.role === "seller" ? "/seller/dashboard" : "/buyer/dashboard"}
                          onClick={() => setIsOpen(false)}
                          className="block text-lg hover:text-primary transition-colors mb-4"
                        >
                          Dashboard
                        </Link>
                        <Button onClick={handleLogout} variant="destructive" className="w-full mb-4">
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Link to="/login" onClick={() => setIsOpen(false)} className="block mb-4">
                        <Button variant="outline" className="w-full">
                          Login
                        </Button>
                      </Link>
                    )}
                    
                    {/* Mobile Wallet */}
                    {isConnected && address ? (
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg glass border border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-mono">{shortenAddress(address)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>ETH: {ethBalance || "0.0000"}</p>
                            {tokenBalances.slice(0, 2).map((token) => (
                              <p key={token.symbol}>{token.symbol}: {token.balance}</p>
                            ))}
                          </div>
                        </div>
                        <Button 
                          onClick={disconnectWallet} 
                          variant="outline" 
                          className="w-full text-destructive"
                        >
                          Disconnect Wallet
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="btn-web3 w-full gap-2" 
                        onClick={() => {
                          setIsOpen(false);
                          setShowWalletModal(true);
                        }}
                        disabled={isConnecting}
                      >
                        <Wallet className="h-4 w-4" />
                        {isConnecting ? "Connecting..." : "Connect Wallet"}
                      </Button>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={handleWalletConnect}
      />
    </>
  );
};
