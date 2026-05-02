import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, User } from "lucide-react";
import { authService } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Web3Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getUser();

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
                    {user.role === "seller" ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/seller/compliance-onboarding">Compliance Onboarding</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/seller/qr-compliance">QR Compliance</Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link to="/buyer/compliance-history">Verification History</Link>
                      </DropdownMenuItem>
                    )}
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
                        {user.role === "seller" ? (
                          <>
                            <Link
                              to="/seller/compliance-onboarding"
                              onClick={() => setIsOpen(false)}
                              className="block text-lg hover:text-primary transition-colors mb-4"
                            >
                              Compliance Onboarding
                            </Link>
                            <Link
                              to="/seller/qr-compliance"
                              onClick={() => setIsOpen(false)}
                              className="block text-lg hover:text-primary transition-colors mb-4"
                            >
                              QR Compliance
                            </Link>
                          </>
                        ) : (
                          <Link
                            to="/buyer/compliance-history"
                            onClick={() => setIsOpen(false)}
                            className="block text-lg hover:text-primary transition-colors mb-4"
                          >
                            Verification History
                          </Link>
                        )}
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
                    
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
};
