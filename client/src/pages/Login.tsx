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

              <Button type="submit" className="w-full" disabled={isLoading}>
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
