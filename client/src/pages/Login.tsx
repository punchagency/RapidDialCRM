import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Shield, Map, Headphones, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [role, setRole] = useState<"rep" | "field" | "manager">("rep");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      localStorage.setItem("user_role", role);
      setIsLoading(false);
      setLocation("/");
      toast({
        title: "Welcome back!",
        description: `Signed in successfully as ${role === "manager" ? "Manager" : role === "field" ? "Field Rep" : "Sales Rep"}.`,
      });
    }, 1000);
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    
    // Simulate Google OAuth Redirect/Popup flow
    setTimeout(() => {
      localStorage.setItem("user_role", role);
      setIsGoogleLoading(false);
      setLocation("/");
      toast({
        title: "Welcome back!",
        description: `Signed in via Google as ${role === "manager" ? "Manager" : role === "field" ? "Field Rep" : "Sales Rep"}.`,
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <div className="w-full max-w-md z-10 px-4">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 bg-primary rounded-xl items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <Phone className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">QuantumPunch</h1>
          <p className="text-muted-foreground mt-2">High-velocity sales CRM for healthcare.</p>
        </div>

        <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>Select your role to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="rep" value={role} onValueChange={(v) => setRole(v as any)} className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="rep">Inside</TabsTrigger>
                <TabsTrigger value="field">Field</TabsTrigger>
                <TabsTrigger value="manager">Manager</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-4">
              <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isGoogleLoading || isLoading}>
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Sign in with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@quantumpunch.com" 
                    defaultValue={role === "manager" ? "sarah@quantumpunch.com" : "alex@quantumpunch.com"}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                  </div>
                  <Input id="password" type="password" defaultValue="password123" required />
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

                <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                  {isLoading ? (
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
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t bg-muted/20 p-6">
            <div className="text-xs text-center text-muted-foreground">
              <p className="flex items-center justify-center gap-1.5 mb-2">
                <Shield className="h-3 w-3 text-green-600" />
                <span className="font-medium text-green-600">HIPAA Compliant Environment</span>
              </p>
              <p>Protected Health Information (PHI) is monitored and audited.</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
