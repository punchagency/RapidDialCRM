import React, { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
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
import EmailReview from "@/pages/EmailReview";
import FieldSales from "@/pages/FieldSales";
import FieldReps from "@/pages/FieldReps";
import OrgChart from "@/pages/OrgChart";
import LeadLoader from "@/pages/LeadLoader";
import LeadLoaderWithGoogleMap from "@/pages/LeadLoaderWithGoogleMap";
import DataImporter from "@/pages/DataImporter";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import TeamMembers from "@/pages/TeamMembers";
import PasswordReset from "@/pages/PasswordReset";
import HipaaCompliance from "@/pages/HipaaCompliance";
import ScriptsManagement from "@/pages/ScriptsManagement";
import PermissionsSummary from "@/pages/PermissionsSummary";
import UserProfile from "@/pages/UserProfile";
import Issues from "@/pages/Issues";
import Calendar from "@/pages/Calendar";
import GoogleCalendarCallback from "@/pages/GoogleCalendarCallback";
import { UserRoleProvider } from "@/lib/UserRoleContext";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { IssueTrackerButton } from "@/components/crm/IssueTracker";

function ProtectedRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/auth");
    }
  }, [loading, user, setLocation]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-muted-foreground">
        Loading your workspace...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // @ts-ignore - Component can be any React component
  return <Component />;
}

const withProtection = (Component: React.ComponentType) => () =>
  <ProtectedRoute component={Component} />;

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={Login} />
      <Route path="/auth/google/callback" component={GoogleCalendarCallback} />
      <Route path="/register" component={Register} />
      <Route path="/password-reset" component={PasswordReset} />

      {/* Protected Routes */}
      <Route path="/" component={withProtection(Dashboard)} />
      <Route path="/dialer" component={withProtection(Dialer)} />
      <Route path="/settings" component={withProtection(Settings)} />
      <Route path="/contacts" component={withProtection(Contacts)} />
      <Route path="/call-review" component={withProtection(CallReview)} />
      <Route path="/email-review" component={withProtection(EmailReview)} />
      <Route path="/map" component={withProtection(FieldSales)} />
      <Route path="/field-reps" component={withProtection(FieldReps)} />
      <Route path="/org-chart" component={withProtection(OrgChart)} />
      <Route
        path="/lead-loader"
        component={withProtection(LeadLoaderWithGoogleMap)}
      />
      <Route path="/data-import" component={withProtection(DataImporter)} />
      <Route path="/analytics" component={withProtection(Dashboard)} />
      <Route path="/team-members" component={withProtection(TeamMembers)} />
      <Route path="/hipaa" component={withProtection(HipaaCompliance)} />
      <Route path="/scripts" component={withProtection(ScriptsManagement)} />
      <Route path="/calendar" component={withProtection(Calendar)} />
      <Route
        path="/permissions"
        component={withProtection(PermissionsSummary)}
      />
      <Route path="/users/:id" component={withProtection(UserProfile)} />
      <Route path="/issues" component={withProtection(Issues)} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserRoleProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            {/* <IssueTrackerButton /> */}
          </TooltipProvider>
        </UserRoleProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
