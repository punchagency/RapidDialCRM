import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";

const ROLE_OPTIONS = [
 { value: "data_loader", label: "Data Loader" },
 { value: "inside_sales_rep", label: "Inside Sales" },
 { value: "field_sales_rep", label: "Field Sales" },
 { value: "manager", label: "Manager" },
 { value: "admin", label: "Admin" },
];

export default function Register() {
 const { register, user, loading: authLoading } = useAuth();
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [role, setRole] = useState("data_loader");
 const [territory, setTerritory] = useState("");
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [, setLocation] = useLocation();
 const { toast } = useToast();

 useEffect(() => {
  if (!authLoading && user) {
   setLocation("/");
  }
 }, [authLoading, user, setLocation]);

 const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  return; //blocked
  setIsSubmitting(true);
  try {
   await register({ name, email, password, role, territory: territory || undefined });
   toast({ title: "Account created", description: "Welcome to QuantumPunch!" });
   setLocation("/");
  } catch (error: any) {
   toast({
    title: "Registration failed",
    description: error?.message || "Unable to create your account. Please try again.",
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
      <UserPlus className="h-6 w-6 text-primary-foreground" />
     </div>
     <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Create your account</h1>
     <p className="text-muted-foreground mt-2">Join the QuantumPunch team and start dialing.</p>
    </div>

    <Card className="border-border/50 shadow-2xl shadow-primary/5 backdrop-blur-md bg-card/80">
     <CardHeader>
      <CardTitle>Register</CardTitle>
      <CardDescription>Set your credentials to access the CRM</CardDescription>
     </CardHeader>
     <CardContent>
      <form className="space-y-4" onSubmit={handleRegister}>
       <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
         id="name"
         placeholder="Alex Johnson"
         value={name}
         onChange={(e) => setName(e.target.value)}
         required
        />
       </div>
       <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
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
        <Label htmlFor="password">Password</Label>
        <div className="relative">
         <Input
          id="password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
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
       <div className="space-y-2">
        <Label>Role</Label>
        <Select value={role} onValueChange={setRole}>
         <SelectTrigger>
          <SelectValue placeholder="Select role" />
         </SelectTrigger>
         <SelectContent>
          {ROLE_OPTIONS.map((option) => (
           <SelectItem key={option.value} value={option.value}>
            {option.label}
           </SelectItem>
          ))}
         </SelectContent>
        </Select>
       </div>
       <div className="space-y-2">
        <Label htmlFor="territory">Territory (optional)</Label>
        <Input
         id="territory"
         placeholder="Los Angeles"
         value={territory}
         onChange={(e) => setTerritory(e.target.value)}
        />
       </div>

       <Button type="submit" className="w-full shadow-lg shadow-primary/20" disabled={isSubmitting || authLoading}>
        {isSubmitting ? (
         <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating account...
         </>
        ) : (
         "Create account"
        )}
       </Button>
      </form>
     </CardContent>
     <CardFooter className="flex flex-col space-y-4 border-t border-border/60 bg-muted/30 p-6">
      <p className="text-sm text-center text-muted-foreground">
       Already have an account?{" "}
       <Link href="/auth" className="text-primary hover:text-primary/80 font-medium">
        Sign in
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

