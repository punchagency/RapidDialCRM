import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Map, Filter, Download, Search, MoreHorizontal, Phone, User, Briefcase, TrendingUp, AlertCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import avatar1 from "@assets/generated_images/Professional_user_avatar_1_a4d3e764.png";

// Mock Data for Field Reps
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

export default function FieldReps() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredReps = mockFieldReps.filter(rep => {
    const matchesSearch = rep.name.toLowerCase().includes(searchTerm.toLowerCase()) || rep.territory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || rep.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <h1 className="text-xl font-heading font-semibold text-foreground">Field Rep Management</h1>
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Export Report
             </Button>
             <Button size="sm" className="gap-2">
                <User className="h-4 w-4" /> Add New Rep
             </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
             <Card>
                <CardContent className="p-4 flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <User className="h-5 w-5" />
                   </div>
                   <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Total Reps</p>
                      <p className="text-2xl font-bold">12</p>
                   </div>
                </CardContent>
             </Card>
             <Card>
                <CardContent className="p-4 flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Map className="h-5 w-5" />
                   </div>
                   <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Active Now</p>
                      <p className="text-2xl font-bold">8</p>
                   </div>
                </CardContent>
             </Card>
             <Card>
                <CardContent className="p-4 flex items-center gap-4">
                   <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <Briefcase className="h-5 w-5" />
                   </div>
                   <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Visits Today</p>
                      <p className="text-2xl font-bold">45</p>
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
                      <p className="text-2xl font-bold">89%</p>
                   </div>
                </CardContent>
             </Card>
          </div>

          <Card>
             <CardHeader className="pb-3">
                <CardTitle>Field Sales Representatives</CardTitle>
                <CardDescription>Monitor real-time status, territory coverage, and daily performance.</CardDescription>
             </CardHeader>
             <div className="px-6 pb-4 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input 
                      placeholder="Search reps or territories..." 
                      className="pl-9" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
                <div className="flex items-center gap-2">
                   <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]">
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
                      {filteredReps.map((rep) => (
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
                               <Badge variant={
                                  rep.status === "active" ? "default" : 
                                  rep.status === "break" ? "secondary" : "outline"
                               } className={cn(
                                  "capitalize",
                                  rep.status === "active" && "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
                                  rep.status === "break" && "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200",
                                  rep.status === "offline" && "bg-gray-100 text-gray-600 hover:bg-gray-100"
                               )}>
                                  {rep.status}
                               </Badge>
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
                               <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                     </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                     <DropdownMenuSeparator />
                                     <DropdownMenuItem className="gap-2"><Map className="h-4 w-4" /> View on Map</DropdownMenuItem>
                                     <DropdownMenuItem className="gap-2"><Phone className="h-4 w-4" /> Call Rep</DropdownMenuItem>
                                     <DropdownMenuItem className="gap-2"><AlertCircle className="h-4 w-4" /> Send Alert</DropdownMenuItem>
                                  </DropdownMenuContent>
                               </DropdownMenu>
                            </TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
