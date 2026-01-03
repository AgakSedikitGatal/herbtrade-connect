import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Web3Header } from "@/components/Web3Header";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Background } from "@/components/Web3Background";
import { authService, UserRole } from "@/lib/auth";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'buyer' as UserRole
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    const user = {
      name: formData.email.split('@')[0],
      email: formData.email,
      company: "HerBlocX User",
      country: "Indonesia",
      role: formData.role
    };

    authService.login(user);
    toast.success("Login successful!");

    if (formData.role === 'seller') {
      navigate('/seller/dashboard');
    } else {
      navigate('/buyer/dashboard');
    }
  };

  const handleGoogleLogin = () => {
    toast.info("Google login coming soon!");
  };

  return (
    <div className="min-h-screen gradient-bg relative flex flex-col">
      <Web3Background />
      <Web3Header />

      <div className="flex-1 flex items-center justify-center p-4 pt-24 pb-12 relative z-10">
        <Card className="w-full max-w-md glass-card border-border/50 animate-fade-in">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/icon.png" alt="HerBlocX logo" className="h-12 w-12 object-contain" />
            </div>
            <CardTitle className="text-3xl font-bold text-gradient-hero">Welcome to HerBlocX</CardTitle>
            <CardDescription className="text-muted-foreground">Log in to your account to start trading</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass border-border/50 focus:border-primary/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="glass border-border/50 focus:border-primary/50"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>I'm primarily a...</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <div className="flex items-center space-x-2 glass border border-border/50 rounded-lg p-3 hover:bg-primary/10 cursor-pointer transition-all">
                    <RadioGroupItem value="buyer" id="buyer" />
                    <Label htmlFor="buyer" className="cursor-pointer flex-1">Buyer</Label>
                  </div>
                  <div className="flex items-center space-x-2 glass border border-border/50 rounded-lg p-3 hover:bg-primary/10 cursor-pointer transition-all">
                    <RadioGroupItem value="seller" id="seller" />
                    <Label htmlFor="seller" className="cursor-pointer flex-1">Seller</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full btn-web3" size="lg">
                Log In
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="glass px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full glass border-border/50 hover:bg-primary/10 transition-all"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-primary font-medium hover:underline">
                    Sign up here
                  </Link>
                </p>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our{" "}
                <a href="#" className="underline hover:text-primary">Terms of Use</a> and{" "}
                <a href="#" className="underline hover:text-primary">Privacy Policy</a>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      <Web3Footer />
    </div>
  );
};

export default Login;
