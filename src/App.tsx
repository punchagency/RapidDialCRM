import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Dialer from "@/pages/Dialer";
import Settings from "@/pages/Settings";
import Contacts from "@/pages/Contacts";
import CallReview from "@/pages/CallReview";
import FieldSales from "@/pages/FieldSales";
import FieldReps from "@/pages/FieldReps";
import OrgChart from "@/pages/OrgChart";
import LeadLoader from "@/pages/LeadLoader";
import DataImporter from "@/pages/DataImporter";
import Login from "@/pages/Login";
import HipaaCompliance from "@/pages/HipaaCompliance";
import ScriptsManagement from "@/pages/ScriptsManagement";
import PermissionsSummary from "@/pages/PermissionsSummary";
import UserProfile from "@/pages/UserProfile";
import Issues from "@/pages/Issues";
import { UserRoleProvider } from "@/lib/UserRoleContext";
import { IssueTrackerButton } from "@/components/crm/IssueTracker";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={Login} />

      {/* Protected Routes */}
      <Route path="/" component={Dashboard} />
      <Route path="/dialer" component={Dialer} />
      <Route path="/settings" component={Settings} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/call-review" component={CallReview} />
      <Route path="/map" component={FieldSales} />
      <Route path="/field-reps" component={FieldReps} />
      <Route path="/org-chart" component={OrgChart} />
      <Route path="/lead-loader" component={LeadLoader} />
      <Route path="/data-import" component={DataImporter} />
      <Route path="/analytics" component={Dashboard} />
      <Route path="/hipaa" component={HipaaCompliance} />
      <Route path="/scripts" component={ScriptsManagement} />
      <Route path="/permissions" component={PermissionsSummary} />
      <Route path="/users/:id" component={UserProfile} />
      <Route path="/issues" component={Issues} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserRoleProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <IssueTrackerButton />
        </TooltipProvider>
      </UserRoleProvider>
    </QueryClientProvider>
  );
}

export default App;
