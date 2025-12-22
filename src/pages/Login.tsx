import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Shield, ArrowRight, Loader2, Eye, EyeOff, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";

declare global {
  interface Window {
    google?: any;
  }
}

export default function Login() {
  const { login, googleLogin, user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && user) {
      setLocation("/");
    }
  }, [authLoading, user, setLocation]);

  useEffect(() => {
    if (!googleClientId) return;
    if (window.google) {
      setGoogleReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleReady(true);
    };
    script.onerror = () => setGoogleReady(false);
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [googleClientId]);

  const initializeGoogleSignIn = React.useCallback(() => {
    if (!googleClientId || !window.google || !googleButtonRef.current) {
      if (!googleClientId) {
        console.warn("Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in your .env file");
      }
      return;
    }

    // Log current origin for debugging
    const currentOrigin = window.location.origin;
    console.log("Google Sign-In: Current origin:", currentOrigin);
    console.log("Google Sign-In: Make sure this origin is registered in Google Cloud Console");

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: any) => {
          try {
            const credential = response?.credential;
            if (!credential) throw new Error("No Google credential received");
            setIsGoogleLoading(true);
            await googleLogin(credential);
            toast({ title: "Signed in with Google" });
            setLocation("/");
          } catch (err: any) {
            console.error("Google login callback error:", err);
            toast({
              title: "Google login failed",
              description: err?.message || "Unable to sign in with Google.",
              variant: "destructive",
            });
          } finally {
            setIsGoogleLoading(false);
          }
        },
        use_fedcm_for_prompt: false, // Disable FedCM to avoid CORS issues
      });

      // Render the button instead of using prompt()
      if (googleButtonRef.current && !googleButtonRef.current.hasChildNodes()) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          type: 'standard',
        });
      }
    } catch (err: any) {
      console.error("Failed to initialize Google Sign-In:", err);
      const errorMessage = err?.message || String(err);
      if (errorMessage.includes('origin') || errorMessage.includes('invalid_client')) {
        toast({
          title: "Google Sign-In Configuration Error",
          description: `Origin ${window.location.origin} not registered. Add it in Google Cloud Console under OAuth 2.0 Client settings.`,
          variant: "destructive",
        });
      }
    }
  }, [googleClientId, googleLogin, toast, setLocation]);

  useEffect(() => {
    if (googleReady && googleButtonRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initializeGoogleSignIn();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [googleReady, initializeGoogleSignIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast({ title: "Welcome back!", description: "You are now signed in." });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error?.message || "Unable to sign in. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      <div className="w-full max-w-md z-10 px-4">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 bg-primary rounded-xl items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <Phone className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">QuantumPunch</h1>
          <p className="text-muted-foreground mt-2">High-velocity sales CRM for healthcare.</p>
        </div>

        <Card className="border-border/50 shadow-2xl shadow-primary/5 backdrop-blur-md bg-card/80">
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>Use your work email and password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@quantumpunch.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <span className="text-xs text-muted-foreground">••••••••</span>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" defaultChecked />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me for 30 days
                </label>
              </div>

              <Button type="submit" className="w-full shadow-lg shadow-primary/20" disabled={isSubmitting || authLoading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            {googleClientId && googleReady ? (
              <div ref={googleButtonRef} className="w-full mt-4 flex justify-center" />
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-4"
                disabled={true}
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Google Sign-In...
              </Button>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-border/60 bg-muted/30 p-6">
            <p className="text-sm text-center text-muted-foreground hidden">
              New to QuantumPunch?{" "}
              <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
                Create an account
              </Link>
            </p>
            <p className="text-xs text-center text-muted-foreground">
              <Link href="/password-reset" className="text-primary hover:text-primary/80 font-medium">
                Forgot your password?
              </Link>
            </p>
            <div className="text-xs text-center text-muted-foreground">
              <p className="flex items-center justify-center gap-1.5 mb-2">
                <Shield className="h-3 w-3 text-secondary" />
                <span className="font-medium text-secondary">HIPAA Compliant Environment</span>
              </p>
              <p>Protected Health Information (PHI) is monitored and audited.</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
