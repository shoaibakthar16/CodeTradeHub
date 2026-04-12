import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Chrome, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user } = useAuth();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setLocation("/dashboard");
  }, [user]);

  if (user) return null;

  const getFirebaseErrorMessage = (err: unknown): string => {
    const code = (err as { code?: string })?.code || "";
    if (code === "auth/unauthorized-domain") return "This domain is not authorized in Firebase. Add it to Firebase Console → Authentication → Settings → Authorized domains.";
    if (code === "auth/popup-blocked") return "Popup was blocked. Allow popups for this site and try again.";
    if (code === "auth/popup-closed-by-user") return "Sign-in was cancelled.";
    if (code === "auth/cancelled-popup-request") return "Another sign-in is already in progress.";
    if (code === "auth/wrong-password" || code === "auth/user-not-found" || code === "auth/invalid-credential") return "Invalid email or password.";
    if (code === "auth/email-already-in-use") return "An account with this email already exists.";
    if (code === "auth/weak-password") return "Password should be at least 6 characters.";
    if (code === "auth/too-many-requests") return "Too many attempts. Please wait before trying again.";
    if (code === "auth/operation-not-allowed") return "This sign-in method is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.";
    if ((err as { message?: string })?.message) return (err as { message: string }).message;
    return "Authentication failed. Check the browser console for details.";
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      setLocation("/dashboard");
    } catch (err) {
      toast({ title: "Sign in failed", description: getFirebaseErrorMessage(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(loginEmail, loginPassword);
      setLocation("/dashboard");
    } catch (err) {
      toast({ title: "Sign in failed", description: getFirebaseErrorMessage(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(regEmail, regPassword, regName);
      setLocation("/dashboard");
    } catch (err) {
      toast({ title: "Registration failed", description: getFirebaseErrorMessage(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-primary/20 to-accent/10 border-r border-border">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="CodeTradeHub" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-bold tracking-tight">CodeTradeHub</span>
        </Link>
        <div>
          <blockquote className="text-2xl font-medium leading-relaxed mb-6">
            "Stop building from scratch. Buy production-ready code and ship in days, not months."
          </blockquote>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CodeTradeHub" className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <div className="text-sm font-medium">CodeTradeHub</div>
              <div className="text-xs text-muted-foreground">Premium Source Code Marketplace</div>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} CodeTradeHub. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="CodeTradeHub" className="w-7 h-7 rounded-lg object-cover" />
              <span className="font-bold">CodeTradeHub</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in to access your purchased source code and dashboard.</p>


          <Button
            variant="outline"
            className="w-full mb-6 gap-2"
            onClick={handleGoogle}
            disabled={loading}
            data-testid="button-google-signin"
          >
            <Chrome className="w-4 h-4" />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <Tabs defaultValue="login">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="login" className="flex-1" data-testid="tab-login">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="flex-1" data-testid="tab-register">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="mt-1"
                    data-testid="input-login-email"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="login-password"
                      type={showPass ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      data-testid="input-login-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="button-login-submit">
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input
                    id="reg-name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="mt-1"
                    data-testid="input-register-name"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="mt-1"
                    data-testid="input-register-email"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                    className="mt-1"
                    data-testid="input-register-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="button-register-submit">
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
