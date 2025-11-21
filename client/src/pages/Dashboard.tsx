import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { GamificationWidget } from "@/components/crm/GamificationWidget";
import { MOCK_CONTACTS } from "@/lib/mockData";
import { getStatuses } from "@/lib/statusUtils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Play, Phone, Map as MapIcon, TrendingUp, AlertCircle, CheckCircle, Upload, FileText, Database } from "lucide-react";
import { Link } from "wouter";
import mapBg from "@assets/generated_images/Subtle_abstract_map_background_for_CRM_7b808988.png";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/lib/UserRoleContext";
import { FileUploadModal } from "@/components/crm/FileUploadModal";
import { GeocodingStatus } from "@/components/crm/GeocodingStatus";
import { useToast } from "@/hooks/use-toast";
import { startBackgroundGeocoding } from "@/lib/backgroundGeocoder";

export default function Dashboard() {
  const { userRole } = useUserRole();
  const statuses = getStatuses();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { toast } = useToast();

  // Start background geocoding on mount if needed
  useEffect(() => {
    const hasUngeocoded = MOCK_CONTACTS.some(c => (!c.location_lat || c.location_lat === 0) && c.address);
    if (hasUngeocoded) {
      startBackgroundGeocoding();
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    // Parse CSV file
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const recordCount = lines.length - 1;
      
      toast({
        title: "Import Successful",
        description: `Loaded ${recordCount} records from ${file.name}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse CSV file",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (statusValue: string) => {
    const status = statuses.find(s => s.value === statusValue);
    return status ? status.color : "bg-secondary text-secondary-foreground";
  };

  // Filter contacts to only show "New" ones for "Up Next"
  const upNextContacts = MOCK_CONTACTS.filter(contact => contact.status === "New");

  // --- Role Specific Content Components ---

  const InsideRepDashboard = () => (
    <div className="max-w-[1600px] mx-auto h-full flex flex-col">
      <GamificationWidget />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-base font-heading font-bold text-gray-900">Up Next (Power Dialer Queue)</h2>
            <Link href="/dialer">
              <Button className="gap-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-600/20 px-6">
                <Play className="h-3 w-3 fill-current" />
                Start Power Dialer
              </Button>
            </Link>
          </div>
          <div className="space-y-3 overflow-y-auto pr-2 pb-4">
            {upNextContacts.length > 0 ? (
              upNextContacts.map((contact, i) => (
                <Link key={contact.id} href={`/dialer?contactId=${contact.id}`}>
                  <Card className="group hover:shadow-lg transition-all border-none shadow-sm rounded-xl bg-white overflow-hidden cursor-pointer mb-3">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center text-sm font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold text-gray-900 truncate">{contact.name}</p>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-[10px] h-5 px-2 rounded-full font-semibold border-none", 
                              getStatusColor(contact.status)
                            )}
                          >
                            {contact.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 font-medium truncate flex items-center gap-1.5">
                          {contact.company}
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          {contact.address}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full h-9 w-9 p-0 shrink-0">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm">
                No new contacts remaining for today. Great job!
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-1 h-full min-h-[500px] pb-4">
           <Card className="h-full border-none shadow-sm p-6 bg-white flex flex-col">
              <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">Daily Goals</h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-sm mb-2">
                       <span className="text-gray-500">Calls Made</span>
                       <span className="font-bold">45 / 60</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 w-3/4" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-sm mb-2">
                       <span className="text-gray-500">Appointments Set</span>
                       <span className="font-bold">3 / 5</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-3/5" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-sm mb-2">
                       <span className="text-gray-500">Talk Time</span>
                       <span className="font-bold">2h 15m / 3h</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-purple-500 w-3/4" />
                    </div>
                 </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                 <h4 className="font-semibold text-sm mb-3">Recent Activity</h4>
                 <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                       <CheckCircle className="h-4 w-4 text-green-500" />
                       <span>Booked meeting with Dr. Smith</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                       <Phone className="h-4 w-4 text-blue-500" />
                       <span>Called Swedish Medical Center</span>
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );

  const FieldRepDashboard = () => (
    <div className="max-w-[1600px] mx-auto h-full flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col min-h-0 h-full">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-base font-heading font-bold text-gray-900">My Route (Optimized)</h2>
             <div className="flex gap-2">
                <Button variant="outline" size="sm">List View</Button>
                <Button size="sm">Start Route</Button>
             </div>
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden relative shadow-sm border border-gray-200 group">
             {/* Map Background Layer */}
             <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                  style={{ backgroundImage: `url(${mapBg})`, opacity: 0.9 }} />
             <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/60" />
             
             <div className="relative z-10 p-6 h-full flex flex-col justify-between pointer-events-none">
                <div className="flex justify-end pointer-events-auto">
                   <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm">
                      <MapIcon className="h-5 w-5 text-gray-700" />
                   </div>
                </div>
                <div className="bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-gray-100 w-full max-w-md pointer-events-auto">
                   <h3 className="font-bold text-gray-900 mb-1">Current Stop: Swedish Medical Center</h3>
                   <p className="text-sm text-gray-500 mb-3">747 Broadway, Seattle, WA</p>
                   <div className="flex gap-2">
                      <Button size="sm" className="flex-1">Check In</Button>
                      <Button size="sm" variant="outline" className="flex-1">Navigate</Button>
                   </div>
                </div>
             </div>
          </div>
        </div>
        
        <div className="lg:col-span-1 h-full pb-4 flex flex-col gap-4">
           <Card className="border-none shadow-sm p-6 bg-white">
              <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">Territory Stats</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-semibold uppercase">Visits Today</p>
                    <p className="text-2xl font-bold text-blue-900">5/8</p>
                 </div>
                 <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 font-semibold uppercase">Miles Driven</p>
                    <p className="text-2xl font-bold text-green-900">42</p>
                 </div>
              </div>
           </Card>
           
           <Card className="flex-1 border-none shadow-sm p-6 bg-white overflow-y-auto">
              <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">Upcoming Visits</h3>
              <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
                       <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-600 shrink-0">
                          {i + 1}
                       </div>
                       <div>
                          <p className="font-semibold text-sm">Overlake Hospital</p>
                          <p className="text-xs text-gray-500">10:30 AM - Follow Up</p>
                       </div>
                    </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );

  const ManagerDashboard = () => (
    <div className="max-w-[1600px] mx-auto h-full flex flex-col">
      <div className="grid grid-cols-4 gap-4 mb-8">
         <Card className="bg-white shadow-sm border-none">
            <CardContent className="p-4 flex items-center gap-4">
               <div className="p-3 bg-blue-100 text-blue-700 rounded-full">
                  <TrendingUp className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">$124,500</p>
               </div>
            </CardContent>
         </Card>
         <Card className="bg-white shadow-sm border-none">
            <CardContent className="p-4 flex items-center gap-4">
               <div className="p-3 bg-purple-100 text-purple-700 rounded-full">
                  <Phone className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-sm text-gray-500 font-medium">Active Calls</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
               </div>
            </CardContent>
         </Card>
         <Card className="bg-white shadow-sm border-none">
            <CardContent className="p-4 flex items-center gap-4">
               <div className="p-3 bg-green-100 text-green-700 rounded-full">
                  <CheckCircle className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-sm text-gray-500 font-medium">Deals Closed</p>
                  <p className="text-2xl font-bold text-gray-900">28</p>
               </div>
            </CardContent>
         </Card>
         <Card className="bg-white shadow-sm border-none">
            <CardContent className="p-4 flex items-center gap-4">
               <div className="p-3 bg-orange-100 text-orange-700 rounded-full">
                  <AlertCircle className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-sm text-gray-500 font-medium">At Risk</p>
                  <p className="text-2xl font-bold text-gray-900">5</p>
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
         <Card className="border-none shadow-sm p-6 bg-white">
            <CardHeader className="p-0 mb-6">
               <CardTitle>Leaderboard</CardTitle>
               <CardDescription>Real-time activity monitoring</CardDescription>
            </CardHeader>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700">AJ</div>
                     <div>
                        <p className="font-semibold">Alex Johnson</p>
                        <p className="text-xs text-gray-500">Inside Sales • On Call</p>
                     </div>
                  </div>
                  <Badge className="bg-green-500">High Performer</Badge>
               </div>
               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center font-bold text-green-700">MF</div>
                     <div>
                        <p className="font-semibold">Mike Field</p>
                        <p className="text-xs text-gray-500">Field Sales • Traveling</p>
                     </div>
                  </div>
                  <Badge variant="outline">On Track</Badge>
               </div>
            </div>
         </Card>

         <Card className="border-none shadow-sm p-6 bg-white">
            <CardHeader className="p-0 mb-6">
               <CardTitle>Recent Alerts</CardTitle>
               <CardDescription>Issues requiring attention</CardDescription>
            </CardHeader>
            <div className="space-y-4">
               <div className="flex gap-3 items-start p-3 border border-red-100 bg-red-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                     <p className="text-sm font-semibold text-red-900">Missed Target: North Territory</p>
                     <p className="text-xs text-red-700">Visits down 20% this week.</p>
                  </div>
               </div>
               <div className="flex gap-3 items-start p-3 border border-yellow-100 bg-yellow-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                     <p className="text-sm font-semibold text-yellow-900">Pipeline Review Due</p>
                     <p className="text-xs text-yellow-700">Quarterly review for West Coast team.</p>
                  </div>
               </div>
            </div>
         </Card>
      </div>
    </div>
  );

  const LoaderDashboard = () => (
    <div className="max-w-[1600px] mx-auto h-full flex flex-col">
       <GeocodingStatus />
       <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm border-none">
             <CardContent className="p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <h3 className="font-bold text-lg">Upload Leads</h3>
                <p className="text-sm text-gray-500 mb-4">Import CSV/Excel files</p>
                <Button className="w-full" onClick={() => setIsUploadModalOpen(true)}>Select File</Button>
             </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border-none">
             <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <h3 className="font-bold text-lg">Data Quality</h3>
                <p className="text-sm text-gray-500 mb-4">98% Accuracy Score</p>
                <Button variant="outline" className="w-full">View Report</Button>
             </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border-none">
             <CardContent className="p-6 text-center">
                <Database className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <h3 className="font-bold text-lg">Total Records</h3>
                <p className="text-sm text-gray-500 mb-4">{MOCK_CONTACTS.length.toLocaleString()} Leads</p>
                <Button variant="ghost" className="w-full">Manage Database</Button>
             </CardContent>
          </Card>
       </div>

       <Card className="flex-1 border-none shadow-sm bg-white p-6">
          <CardHeader className="p-0 mb-6">
             <CardTitle>Recent Imports</CardTitle>
          </CardHeader>
          <div className="space-y-4">
             {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                         CSV
                      </div>
                      <div>
                         <p className="font-semibold text-gray-900">Q3_Leads_Batch_{i}.csv</p>
                         <p className="text-xs text-gray-500">Imported 2 hours ago • 450 records</p>
                      </div>
                   </div>
                   <Badge className="bg-green-500">Completed</Badge>
                </div>
             ))}
          </div>
       </Card>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-slate-50 z-10 shrink-0">
          <h1 className="text-2xl font-heading font-bold text-gray-900">
             {userRole === 'manager' ? 'Manager Overview' : 
              userRole === 'loader' ? 'Data Management' : 
              userRole === 'sales_rep' ? 'Sales Dashboard' : 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
             <Badge variant="outline" className="capitalize bg-white px-3 py-1">
                {userRole.replace(/_/g, ' ')}
             </Badge>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 relative">
           {userRole === 'sales_rep' && <InsideRepDashboard />}
           {userRole === 'manager' && <ManagerDashboard />}
           {userRole === 'loader' && <LoaderDashboard />}
           {userRole === 'admin' && <ManagerDashboard />}
        </div>
      </main>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFileSelect={handleFileUpload}
      />
    </div>
  );
}
