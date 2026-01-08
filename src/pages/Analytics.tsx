import React, { useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useProspects } from "@/hooks/useProspects";
import { useCallHistory } from "@/hooks/useCallHistory";
import { useCallOutcomes } from "@/hooks/useCallOutcomes";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/lib/AuthContext";
import { useUserRole } from "@/lib/UserRoleContext";
import { PermissionGuard } from "@/components/ui/PermissionGuard";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
 CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
 BarChart3,
 Phone,
 Users,
 TrendingUp,
 TrendingDown,
 Clock,
 CheckCircle,
 XCircle,
 Activity,
 Target,
 Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Analytics() {
 const { user } = useAuth();
 const { userRole, canAccess } = useUserRole();
 const canViewAll = canAccess("analytics_view_all");

 // Fetch ALL data based on permissions (no limits for analytics)
 const { data: allProspects = [], isLoading: prospectsLoading } = useProspects(
  canViewAll ? {} : { userId: user?.id, role: user?.role }
 );

 const {
  callHistory = [],
  loading: callsLoading,
  total: totalCallsFromAPI,
 } = useCallHistory(canViewAll ? {} : { callerId: user?.id });

 const { data: callOutcomes = [], isLoading: outcomesLoading } = useCallOutcomes();
 const { data: allUsers = [], isLoading: usersLoading } = useUsers();

 // Calculate metrics from real-time data
 const metrics = useMemo(() => {
  // Use actual total from API if available, otherwise use array length
  const totalCalls = totalCallsFromAPI > 0 ? totalCallsFromAPI : callHistory.length;

  const totalProspects = allProspects.length;
  // A prospect is considered "called" if:
  // 1. They have a lastCallOutcome or lastContactDate, OR
  // 2. There's a call history record for them
  const prospectIdsWithCalls = new Set(callHistory.map((c) => c.prospectId).filter(Boolean));
  const calledProspects = allProspects.filter(
   (p) =>
    p.lastCallOutcome !== null ||
    p.lastContactDate !== null ||
    prospectIdsWithCalls.has(p.id)
  ).length;
  const uncalledProspects = totalProspects - calledProspects;
  const callRate = totalProspects > 0 ? (calledProspects / totalProspects) * 100 : 0;

  // Call statistics - using real call history data
  const successfulCalls = callHistory.filter(
   (c) => c.status === "completed" || c.status === "answered" || c.outcome?.toLowerCase().includes("success")
  ).length;
  const failedCalls = callHistory.filter(
   (c) => c.status === "failed" || c.status === "no-answer" || c.status === "busy" || c.outcome?.toLowerCase().includes("no answer") || c.outcome?.toLowerCase().includes("failed")
  ).length;
  const totalCallDuration = callHistory.reduce(
   (sum, c) => sum + (c.callDuration || 0),
   0
  );
  const avgCallDuration = callHistory.length > 0 ? totalCallDuration / callHistory.length : 0;

  // Conversion metrics - using real call outcomes
  const appointments = callHistory.filter(
   (c) => c.outcome?.toLowerCase().includes("booked")
  ).length;
  const conversionRate = totalCalls > 0 ? (appointments / totalCalls) * 100 : 0;

  // Appointment status distribution - from real prospect data
  const statusCounts = allProspects.reduce((acc, p) => {
   if (p.appointmentStatus?.isBooked) {
    acc["appointment_booked"] = (acc["appointment_booked"] || 0) + 1;
   }
   if (p.lastCallOutcome) {
    acc["contacted"] = (acc["contacted"] || 0) + 1;
   }
   if (!p.lastCallOutcome && !p.lastContactDate) {
    acc["not_contacted"] = (acc["not_contacted"] || 0) + 1;
   }
   return acc;
  }, {} as Record<string, number>);

  // Outcome distribution - from real call history data
  const outcomeCounts = callHistory.reduce((acc, c) => {
   if (c.outcome) {
    acc[c.outcome] = (acc[c.outcome] || 0) + 1;
   }
   return acc;
  }, {} as Record<string, number>);

  // User performance (if viewing all)
  const userPerformance = canViewAll
   ? allUsers.map((u) => {
    const userCalls = callHistory.filter((c) => c.callerId === u.id);
    const userProspects = allProspects.filter(
     (p) => p.assignedInsideSalesRepId === u.id
    );
    return {
     user: u,
     calls: userCalls.length,
     prospects: userProspects.length,
     successRate:
      userCalls.length > 0
       ? (userCalls.filter((c) => c.status === "completed" || c.status === "answered").length / userCalls.length) * 100
       : 0,
    };
   })
   : [];

  return {
   totalProspects,
   calledProspects,
   uncalledProspects,
   callRate,
   totalCalls,
   successfulCalls,
   failedCalls,
   avgCallDuration,
   appointments,
   conversionRate,
   statusCounts,
   outcomeCounts,
   userPerformance,
  };
 }, [allProspects, callHistory, allUsers, canViewAll, totalCallsFromAPI]);

 const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
 };

 const isLoading = prospectsLoading || callsLoading || outcomesLoading || usersLoading;

 return (
  <PermissionGuard permission="analytics_view">
   <div className="flex h-screen bg-slate-50 overflow-hidden">
    <Sidebar />

    <main className="flex-1 flex flex-col overflow-hidden relative">
     {/* Header */}
     <header className="h-20 flex items-center justify-between px-8 bg-slate-50 z-10 shrink-0">
      <div>
       <h1 className="text-2xl font-heading font-bold text-gray-900">
        Analytics Dashboard
       </h1>
       <p className="text-sm text-muted-foreground mt-1">
        {canViewAll
         ? "Organization-wide analytics and insights"
         : "Your personal performance metrics"}
       </p>
      </div>
      <div className="flex items-center gap-3">
       <Badge variant="outline" className="capitalize bg-white px-3 py-1">
        {userRole.replace(/_/g, " ")}
       </Badge>
      </div>
     </header>

     {/* Content */}
     <div className="flex-1 overflow-y-auto px-8 pb-8">
      {isLoading ? (
       <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics...</div>
       </div>
      ) : (
       <div className="space-y-6 mt-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
           <CardTitle className="text-sm font-medium">
            Total Prospects
           </CardTitle>
           <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
           <div className="text-2xl font-bold">{metrics.totalProspects}</div>
           <p className="text-xs text-muted-foreground mt-1">
            {metrics.calledProspects} called, {metrics.uncalledProspects} remaining
           </p>
          </CardContent>
         </Card>

         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
           <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
           <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
           <div className="text-2xl font-bold">{metrics.totalCalls}</div>
           <p className="text-xs text-muted-foreground mt-1">
            {metrics.successfulCalls} successful, {metrics.failedCalls} failed
           </p>
          </CardContent>
         </Card>

         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
           <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
           <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
           <div className="text-2xl font-bold">
            {metrics.conversionRate.toFixed(1)}%
           </div>
           <p className="text-xs text-muted-foreground mt-1">
            {metrics.appointments} appointments scheduled
           </p>
          </CardContent>
         </Card>

         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
           <CardTitle className="text-sm font-medium">Avg Call Duration</CardTitle>
           <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
           <div className="text-2xl font-bold">
            {formatDuration(metrics.avgCallDuration)}
           </div>
           <p className="text-xs text-muted-foreground mt-1">
            Average time per call
           </p>
          </CardContent>
         </Card>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Call Rate */}
         <Card>
          <CardHeader>
           <CardTitle>Call Coverage</CardTitle>
           <CardDescription>
            Percentage of prospects that have been called
           </CardDescription>
          </CardHeader>
          <CardContent>
           <div className="space-y-2">
            <div className="flex items-center justify-between">
             <span className="text-sm text-muted-foreground">Call Rate</span>
             <span className="text-2xl font-bold">{metrics.callRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
             <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${metrics.callRate}%` }}
             />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
             <span>{metrics.calledProspects} called</span>
             <span>{metrics.uncalledProspects} remaining</span>
            </div>
           </div>
          </CardContent>
         </Card>

         {/* Call Outcomes Distribution */}
         <Card>
          <CardHeader>
           <CardTitle>Call Outcomes</CardTitle>
           <CardDescription>Distribution of call results</CardDescription>
          </CardHeader>
          <CardContent>
           <div className="space-y-3">
            {Object.entries(metrics.outcomeCounts)
             .sort(([, a], [, b]) => b - a)
             .slice(0, 5)
             .map(([outcome, count]) => {
              const percentage =
               metrics.totalCalls > 0
                ? (count / metrics.totalCalls) * 100
                : 0;
              return (
               <div key={outcome} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                 <span className="capitalize">{outcome}</span>
                 <span className="font-medium">
                  {count} ({percentage.toFixed(1)}%)
                 </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                 <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                 />
                </div>
               </div>
              );
             })}
            {Object.keys(metrics.outcomeCounts).length === 0 && (
             <p className="text-sm text-muted-foreground text-center py-4">
              No call outcomes recorded yet
             </p>
            )}
           </div>
          </CardContent>
         </Card>
        </div>

        {/* Status Distribution */}
        <Card>
         <CardHeader>
          <CardTitle>Prospect Status Distribution</CardTitle>
          <CardDescription>
           Breakdown of prospects by contact and appointment status
          </CardDescription>
         </CardHeader>
         <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
           {Object.entries(metrics.statusCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([status, count]) => {
             const percentage =
              metrics.totalProspects > 0
               ? (count / metrics.totalProspects) * 100
               : 0;
             return (
              <div
               key={status}
               className="flex flex-col items-center p-3 rounded-lg border bg-card"
              >
               <div className="text-2xl font-bold">{count}</div>
               <div className="text-xs text-muted-foreground mt-1 capitalize text-center">
                {status}
               </div>
               <div className="text-xs text-muted-foreground mt-1">
                {percentage.toFixed(1)}%
               </div>
              </div>
             );
            })}
           {Object.keys(metrics.statusCounts).length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-4">
             No status data available
            </p>
           )}
          </div>
         </CardContent>
        </Card>

        {/* User Performance (only for admin/manager) */}
        {canViewAll && metrics.userPerformance.length > 0 && (
         <Card>
          <CardHeader>
           <CardTitle>Team Performance</CardTitle>
           <CardDescription>
            Individual performance metrics by team member
           </CardDescription>
          </CardHeader>
          <CardContent>
           <div className="space-y-4">
            {metrics.userPerformance
             .sort((a, b) => b.calls - a.calls)
             .map((perf) => (
              <div
               key={perf.user.id}
               className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
               <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                 <span className="text-sm font-medium text-primary">
                  {perf.user.name
                   .split(" ")
                   .map((n) => n[0])
                   .join("")
                   .toUpperCase()
                   .slice(0, 2)}
                 </span>
                </div>
                <div>
                 <div className="font-medium">{perf.user.name}</div>
                 <div className="text-xs text-muted-foreground capitalize">
                  {perf.user.role.replace(/_/g, " ")}
                 </div>
                </div>
               </div>
               <div className="flex items-center gap-6">
                <div className="text-center">
                 <div className="text-sm font-medium">{perf.calls}</div>
                 <div className="text-xs text-muted-foreground">Calls</div>
                </div>
                <div className="text-center">
                 <div className="text-sm font-medium">{perf.prospects}</div>
                 <div className="text-xs text-muted-foreground">Prospects</div>
                </div>
                <div className="text-center">
                 <div className="text-sm font-medium">
                  {perf.successRate.toFixed(1)}%
                 </div>
                 <div className="text-xs text-muted-foreground">Success</div>
                </div>
               </div>
              </div>
             ))}
           </div>
          </CardContent>
         </Card>
        )}

        {/* Activity Summary */}
        <Card>
         <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>Quick overview of recent activity</CardDescription>
         </CardHeader>
         <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
             <div className="font-medium">Successful Calls</div>
             <div className="text-sm text-muted-foreground">
              {metrics.successfulCalls} completed
             </div>
            </div>
           </div>
           <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
             <div className="font-medium">Appointments</div>
             <div className="text-sm text-muted-foreground">
              {metrics.appointments} scheduled
             </div>
            </div>
           </div>
           <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <Activity className="h-5 w-5 text-purple-600" />
            <div>
             <div className="font-medium">Total Activity</div>
             <div className="text-sm text-muted-foreground">
              {metrics.totalCalls} calls made
             </div>
            </div>
           </div>
          </div>
         </CardContent>
        </Card>
       </div>
      )}
     </div>
    </main>
   </div>
  </PermissionGuard>
 );
}

