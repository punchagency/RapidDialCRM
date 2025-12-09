import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, Shield, Map, Headphones, ArrowRight, Loader2, User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import avatar from "@assets/generated_images/Professional_user_avatar_1_a4d3e764.png";
import managerAvatar from "@assets/generated_images/Professional_user_avatar_2_9f00e114.png";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleAccounts, setShowGoogleAccounts] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [role, setRole] = useState<"rep" | "field" | "manager" | "loader">("rep");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      localStorage.setItem("user_role", role);
      setIsLoading(false);
      setLocation(role === "loader" ? "/lead-loader" : "/");
      toast({
        title: "Welcome back!",
        description: `Signed in successfully as ${
          role === "manager" ? "Manager" : 
          role === "field" ? "Field Rep" : 
          role === "loader" ? "Lead Loader" : "Sales Rep"
        }.`,
      });
    }, 1000);
  };

  const handleGoogleLoginClick = () => {
    setIsGoogleLoading(true);
    // Simulate initial connection delay before showing accounts
    setTimeout(() => {
      setIsGoogleLoading(false);
      setShowGoogleAccounts(true);
    }, 800);
  };

  const completeGoogleLogin = (selectedEmail: string) => {
    setShowGoogleAccounts(false);
    setIsLoading(true); // Show main loader while redirecting

    setTimeout(() => {
      localStorage.setItem("user_role", role);
      setIsLoading(false);
      setLocation(role === "loader" ? "/lead-loader" : "/");
      toast({
        title: "Welcome back!",
        description: `Signed in via Google (${selectedEmail})`,
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Pattern */}
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
            <CardDescription>Select your role to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="rep" value={role} onValueChange={(v) => setRole(v as any)} className="mb-6">
              <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                <TabsTrigger value="rep" className="text-xs">Inside</TabsTrigger>
                <TabsTrigger value="field" className="text-xs">Field</TabsTrigger>
                <TabsTrigger value="manager" className="text-xs">Mgr</TabsTrigger>
                <TabsTrigger value="loader" className="text-xs">Loader</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-4">
              <Button variant="outline" className="w-full hover:bg-muted/50 border-border/60" onClick={handleGoogleLoginClick} disabled={isGoogleLoading || isLoading}>
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
                  <span className="w-full border-t border-border/60" />
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
                    <a href="#" className="text-xs text-primary hover:text-primary/80 hover:underline">Forgot password?</a>
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

                <Button type="submit" className="w-full shadow-lg shadow-primary/20" disabled={isLoading || isGoogleLoading}>
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
          <CardFooter className="flex flex-col space-y-4 border-t border-border/60 bg-muted/30 p-6">
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

      {/* Google Account Selection Modal */}
      <Dialog open={showGoogleAccounts} onOpenChange={setShowGoogleAccounts}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden gap-0">
          <DialogHeader className="px-6 pt-6 pb-2">
             <div className="flex justify-center mb-2">
                <svg className="h-8 w-8" viewBox="0 0 24 24">
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
             </div>
             <DialogTitle className="text-center text-lg font-medium">Choose an account</DialogTitle>
             <DialogDescription className="text-center text-sm">
               to continue to QuantumPunch CRM
             </DialogDescription>
          </DialogHeader>
          
          <div className="py-2">
            {/* Account 1 - Professional */}
            <div 
              className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/40"
              onClick={() => completeGoogleLogin("alex@quantumpunch.com")}
            >
               <img 
                 src={role === "manager" ? managerAvatar : avatar} 
                 alt="User" 
                 className="h-8 w-8 rounded-full object-cover"
               />
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-foreground">
                    {role === "manager" ? "Sarah Miller" : "Alex Johnson"}
                 </p>
                 <p className="text-xs text-muted-foreground">
                    {role === "manager" ? "sarah@quantumpunch.com" : "alex@quantumpunch.com"}
                 </p>
               </div>
            </div>

            {/* Account 2 - Personal */}
            <div 
              className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/40"
              onClick={() => completeGoogleLogin("alex.johnson@gmail.com")}
            >
               <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-medium text-sm">
                 {role === "manager" ? "S" : "A"}
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-foreground">
                    {role === "manager" ? "Sarah Miller" : "Alex Johnson"}
                 </p>
                 <p className="text-xs text-muted-foreground">
                    {role === "manager" ? "sarah.miller@gmail.com" : "alex.johnson@gmail.com"}
                 </p>
               </div>
            </div>

            {/* Use another account */}
            <div 
              className="flex items-center gap-3 px-6 py-4 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => toast({ title: "Not implemented", description: "This is a prototype mockup." })}
            >
               <div className="h-8 w-8 rounded-full flex items-center justify-center">
                 <User className="h-5 w-5 text-muted-foreground" />
               </div>
               <p className="text-sm font-medium text-foreground">Use another account</p>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-border/50 bg-muted/10">
             <p className="text-[10px] text-muted-foreground text-center">
                To continue, Google will share your name, email address, and language preference with QuantumPunch.
             </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
