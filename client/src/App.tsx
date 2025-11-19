import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Dialer from "@/pages/Dialer";
import Settings from "@/pages/Settings";
import Contacts from "@/pages/Contacts"; // Placeholder, we'll just reuse dashboard or similar if needed, but let's stick to what we have

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dialer" component={Dialer} />
      <Route path="/settings" component={Settings} />
      {/* Map other sidebar links to existing pages for prototype feel */}
      <Route path="/contacts" component={Dashboard} />
      <Route path="/map" component={Dashboard} />
      <Route path="/analytics" component={Dashboard} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
