import React, { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Map, Filter, Download, Search, MoreHorizontal, Phone, User, Briefcase, TrendingUp, AlertCircle, Headset, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import avatar1 from "@/assets/generated_images/Professional_user_avatar_1_a4d3e764.png";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useFieldReps } from "@/hooks/useFieldReps";
import { useUsers } from "@/hooks/useUsers";
import type { FieldRep } from "@/lib/types";

// Helper to transform FieldRep to display format
const transformFieldRep = (rep: FieldRep) => ({
  id: rep.id,
  name: rep.name,
  status: "active" as const, // TODO: Add status field to backend
  territory: rep.territory,
  visitsToday: 0, // TODO: Calculate from appointments
  visitsTarget: 10, // TODO: Get from work schedule
  lastCheckIn: "N/A", // TODO: Add last check-in tracking
  performance: 85, // TODO: Calculate performance
  avatar: null,
});

// Mock Data for Field Reps (fallback)
const mockFieldReps = [
  {
    id: "fr1",
    name: "Mike Field",
    status: "active",
    territory: "North Seattle (Everett/Lynnwood)",
    visitsToday: 8,
    visitsTarget: 12,
    lastCheckIn: "10 mins ago",
    performance: 92,
    avatar: null,
  },
  {
    id: "fr2",
    name: "Jessica Wong",
    status: "active",
    territory: "Bellevue / Redmond",
    visitsToday: 5,
    visitsTarget: 10,
    lastCheckIn: "25 mins ago",
    performance: 88,
    avatar: null,
  },
  {
    id: "fr3",
    name: "David Kim",
    status: "break",
    territory: "Downtown / Capitol Hill",
    visitsToday: 4,
    visitsTarget: 10,
    lastCheckIn: "1 hour ago",
    performance: 75,
    avatar: null,
  },
  {
    id: "fr4",
    name: "Lisa Patel",
    status: "offline",
    territory: "South Seattle / Renton",
    visitsToday: 0,
    visitsTarget: 10,
    lastCheckIn: "Yesterday",
    performance: 95,
    avatar: null,
  },
  {
    id: "fr5",
    name: "Tom Wilson",
    status: "active",
    territory: "Tacoma Area",
    visitsToday: 9,
    visitsTarget: 12,
    lastCheckIn: "5 mins ago",
    performance: 82,
    avatar: null,
  },
];

// Mock Data for Inside Reps
const mockInsideReps = [
  {
    id: "ir1",
    name: "Alex Johnson",
    status: "active",
    role: "Inside Sales Lead",
    callsToday: 45,
    callsTarget: 60,
    avgCallTime: "3m 20s",
    performance: 94,
    avatar: avatar1,
  },
  {
    id: "ir2",
    name: "Sam Wilson",
    status: "active",
    role: "Inside Sales",
    callsToday: 32,
    callsTarget: 60,
    avgCallTime: "4m 10s",
    performance: 88,
    avatar: null,
  },
  {
    id: "ir3",
    name: "Emily Davis",
    status: "break",
    role: "Inside Sales",
    callsToday: 28,
    callsTarget: 60,
    avgCallTime: "3m 45s",
    performance: 91,
    avatar: null,
  },
];

export default function FieldReps() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("field");
  const [location] = useLocation();

  // Fetch data from API
  const { data: fieldRepsData = [], isLoading: fieldRepsLoading } = useFieldReps();
  const { data: usersData = [], isLoading: usersLoading } = useUsers();

  // Transform field reps data
  const fieldReps = useMemo(() => {
    return fieldRepsData.map(transformFieldRep);
  }, [fieldRepsData]);

  // Filter inside sales reps from users (role: inside_sales_rep)
  const insideReps = useMemo(() => {
    return usersData
      .filter(user => user.role === 'inside_sales_rep' || user.role === 'manager')
      .map(user => ({
        id: user.id,
        name: user.name,
        status: user.isActive ? "active" as const : "offline" as const,
        role: user.role === 'manager' ? 'Inside Sales Lead' : 'Inside Sales',
        callsToday: 0, // TODO: Calculate from call history
        callsTarget: 60, // TODO: Get from settings
        avgCallTime: "0m 0s", // TODO: Calculate from call history
        performance: 85, // TODO: Calculate performance
        avatar: null,
      }));
  }, [usersData]);

  // Sync active tab with URL query parameter instantly
  useEffect(() => {
    const checkTab = () => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        if (tab && (tab === "field" || tab === "inside")) {
            setActiveTab(tab);
        }
    };

    checkTab(); // Check immediately on mount

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', checkTab);
    
    // Patch history methods to detect pushState/replaceState (for in-app navigation)
    // This ensures instant updates when Sidebar links are clicked
    const originalPush = history.pushState;
    const originalReplace = history.replaceState;

    history.pushState = function(...args) {
        const res = originalPush.apply(this, args);
        checkTab();
        return res;
    };
    
    history.replaceState = function(...args) {
        const res = originalReplace.apply(this, args);
        checkTab();
        return res;
    };

    return () => {
        window.removeEventListener('popstate', checkTab);
        history.pushState = originalPush;
        history.replaceState = originalReplace;
    };
  }, []);

  const filteredFieldReps = useMemo(() => {
    return fieldReps.filter(rep => {
      const matchesSearch = rep.name.toLowerCase().includes(searchTerm.toLowerCase()) || rep.territory.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || rep.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [fieldReps, searchTerm, statusFilter]);

  const filteredInsideReps = useMemo(() => {
    return insideReps.filter(rep => {
      const matchesSearch = rep.name.toLowerCase().includes(searchTerm.toLowerCase()) || rep.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || rep.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [insideReps, searchTerm, statusFilter]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
      setActiveTab(value);
      const newUrl = `${window.location.pathname}?tab=${value}`;
      window.history.pushState({}, '', newUrl);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <h1 className="text-xl font-heading font-semibold text-foreground">Team Management</h1>
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Export Report
             </Button>
             <Button size="sm" className="gap-2">
                <User className="h-4 w-4" /> Add Team Member
             </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards - Dynamic based on tab */}
          <div className="grid grid-cols-4 gap-4 mb-6">
             <Card>
                <CardContent className="p-4 flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Users className="h-5 w-5" />
                   </div>
                   <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">
                          {activeTab === 'field' ? 'Total Field Reps' : 'Total Inside Reps'}
                      </p>
                      <p className="text-2xl font-bold">
                          {activeTab === 'field' ? fieldReps.length : insideReps.length}
                      </p>
                   </div>
                </CardContent>
             </Card>
             <Card>
                <CardContent className="p-4 flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Headset className="h-5 w-5" />
                   </div>
                   <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Active Now</p>
                      <p className="text-2xl font-bold">
                        {activeTab === 'field' 
                            ? fieldReps.filter(r => r.status === 'active').length 
                            : insideReps.filter(r => r.status === 'active').length}
                      </p>
                   </div>
                </CardContent>
             </Card>
             <Card>
                <CardContent className="p-4 flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <Briefcase className="h-5 w-5" />
                   </div>
                   <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Total Activities</p>
                      <p className="text-2xl font-bold">{activeTab === 'field' ? '89' : '142'}</p>
                   </div>
                </CardContent>
             </Card>
             <Card>
                <CardContent className="p-4 flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <TrendingUp className="h-5 w-5" />
                   </div>
                   <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Avg Performance</p>
                      <p className="text-2xl font-bold">{activeTab === 'field' ? '89%' : '92%'}</p>
                   </div>
                </CardContent>
             </Card>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <div className="flex items-center justify-between">
                <TabsList>
                    <TabsTrigger value="field" className="gap-2">
                        <Map className="h-4 w-4" /> Field Sales
                    </TabsTrigger>
                    <TabsTrigger value="inside" className="gap-2">
                        <Headset className="h-4 w-4" /> Inside Sales
                    </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                   <div className="relative w-[250px]">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                         placeholder={activeTab === "field" ? "Search reps or territories..." : "Search reps or roles..."}
                         className="pl-9 h-9" 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                      />
                   </div>
                   <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px] h-9">
                         <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Filter Status" />
                         </div>
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="all">All Statuses</SelectItem>
                         <SelectItem value="active">Active</SelectItem>
                         <SelectItem value="break">On Break</SelectItem>
                         <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
            </div>

            <TabsContent value="field" className="m-0">
              <Card>
                 <CardHeader className="pb-3">
                    <CardTitle>Field Sales Representatives</CardTitle>
                    <CardDescription>Monitor real-time status, territory coverage, and daily performance.</CardDescription>
                 </CardHeader>
                 <CardContent className="p-0">
                    <Table>
                       <TableHeader>
                          <TableRow>
                             <TableHead>Representative</TableHead>
                             <TableHead>Status</TableHead>
                             <TableHead>Territory</TableHead>
                             <TableHead>Visits (Today)</TableHead>
                             <TableHead>Performance</TableHead>
                             <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {filteredFieldReps.map((rep) => (
                             <TableRow key={rep.id}>
                                <TableCell>
                                   <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8">
                                         <AvatarImage src={rep.avatar || ""} />
                                         <AvatarFallback className="text-xs">{rep.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                         <p className="font-medium text-sm">{rep.name}</p>
                                         <p className="text-xs text-muted-foreground">Last check-in: {rep.lastCheckIn}</p>
                                      </div>
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <StatusBadge status={rep.status} />
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                   {rep.territory}
                                </TableCell>
                                <TableCell>
                                   <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{rep.visitsToday}</span>
                                      <span className="text-xs text-muted-foreground">/ {rep.visitsTarget}</span>
                                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                         <div 
                                            className="h-full bg-primary rounded-full" 
                                            style={{ width: `${(rep.visitsToday / rep.visitsTarget) * 100}%` }}
                                         />
                                      </div>
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <div className="flex items-center gap-2">
                                      <span className={cn(
                                         "text-sm font-bold",
                                         rep.performance >= 90 ? "text-green-600" : 
                                         rep.performance >= 80 ? "text-blue-600" : "text-orange-600"
                                      )}>
                                         {rep.performance}%
                                      </span>
                                   </div>
                                </TableCell>
                                <TableCell className="text-right">
                                   <ActionMenu />
                                </TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inside" className="m-0">
              <Card>
                 <CardHeader className="pb-3">
                    <CardTitle>Inside Sales Representatives</CardTitle>
                    <CardDescription>Monitor dialer activity, call volume, and conversion rates.</CardDescription>
                 </CardHeader>
                 <CardContent className="p-0">
                    <Table>
                       <TableHeader>
                          <TableRow>
                             <TableHead>Representative</TableHead>
                             <TableHead>Status</TableHead>
                             <TableHead>Role</TableHead>
                             <TableHead>Calls (Today)</TableHead>
                             <TableHead>Avg Call Time</TableHead>
                             <TableHead>Performance</TableHead>
                             <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {filteredInsideReps.map((rep) => (
                             <TableRow key={rep.id}>
                                <TableCell>
                                   <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8">
                                         <AvatarImage src={rep.avatar || ""} />
                                         <AvatarFallback className="text-xs">{rep.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                         <p className="font-medium text-sm">{rep.name}</p>
                                         <p className="text-xs text-muted-foreground">{rep.role}</p>
                                      </div>
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <StatusBadge status={rep.status} />
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                   {rep.role}
                                </TableCell>
                                <TableCell>
                                   <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{rep.callsToday}</span>
                                      <span className="text-xs text-muted-foreground">/ {rep.callsTarget}</span>
                                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                         <div 
                                            className="h-full bg-primary rounded-full" 
                                            style={{ width: `${(rep.callsToday / rep.callsTarget) * 100}%` }}
                                         />
                                      </div>
                                   </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                   {rep.avgCallTime}
                                </TableCell>
                                <TableCell>
                                   <div className="flex items-center gap-2">
                                      <span className={cn(
                                         "text-sm font-bold",
                                         rep.performance >= 90 ? "text-green-600" : 
                                         rep.performance >= 80 ? "text-blue-600" : "text-orange-600"
                                      )}>
                                         {rep.performance}%
                                      </span>
                                   </div>
                                </TableCell>
                                <TableCell className="text-right">
                                   <ActionMenu />
                                </TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <Badge variant={
            status === "active" ? "default" : 
            status === "break" ? "secondary" : "outline"
        } className={cn(
            "capitalize",
            status === "active" && "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
            status === "break" && "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200",
            status === "offline" && "bg-gray-100 text-gray-600 hover:bg-gray-100"
        )}>
            {status}
        </Badge>
    );
}

function ActionMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2"><User className="h-4 w-4" /> View Profile</DropdownMenuItem>
                <DropdownMenuItem className="gap-2"><Phone className="h-4 w-4" /> Call Rep</DropdownMenuItem>
                <DropdownMenuItem className="gap-2"><AlertCircle className="h-4 w-4" /> Send Alert</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

