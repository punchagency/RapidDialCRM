import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { GamificationWidget } from "@/components/crm/GamificationWidget";
import { ImportModal } from "@/components/crm/ImportModal";
import { MOCK_CONTACTS } from "@/lib/mockData";
import { getStatuses } from "@/lib/statusUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Play, Phone, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import mapBg from "@assets/generated_images/Subtle_abstract_map_background_for_CRM_7b808988.png";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const statuses = getStatuses();

  const getStatusColor = (statusValue: string) => {
    const status = statuses.find(s => s.value === statusValue);
    return status ? status.color : "bg-secondary text-secondary-foreground";
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header - Simplified */}
        <header className="h-20 flex items-center justify-between px-8 bg-slate-50 z-10 shrink-0">
          <h1 className="text-2xl font-heading font-bold text-gray-900">Dashboard</h1>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 relative">
          <div className="max-w-[1600px] mx-auto h-full flex flex-col">
            <GamificationWidget />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
              {/* Up Next List */}
              <div className="lg:col-span-2 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h2 className="text-base font-heading font-bold text-gray-900">Up Next (Optimized Route)</h2>
                  <Link href="/dialer">
                    <Button className="gap-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-600/20 px-6">
                      <Play className="h-3 w-3 fill-current" />
                      Start Power Dialer
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3 overflow-y-auto pr-2 pb-4">
                  {MOCK_CONTACTS.map((contact, i) => (
                    <Card key={contact.id} className="group hover:shadow-lg transition-all border-none shadow-sm rounded-xl bg-white overflow-hidden">
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
                  ))}
                </div>
              </div>

              {/* Map Widget - Full Height */}
              <div className="lg:col-span-1 h-full min-h-[500px] pb-4">
                <Card className="h-full border-none shadow-sm overflow-hidden relative group rounded-2xl bg-white">
                  {/* Map Background Layer */}
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                       style={{ backgroundImage: `url(${mapBg})`, opacity: 0.8 }} />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/90" />
                  
                  {/* Content Overlay */}
                  <div className="relative h-full flex flex-col p-6 z-10">
                    {/* Top Floating Elements */}
                    <div className="flex justify-between items-start">
                       <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                          <p className="text-xs font-bold text-gray-900">Seattle Metro</p>
                       </div>
                       <div className="bg-white/90 backdrop-blur p-2 rounded-full shadow-sm border border-gray-100">
                          <Filter className="h-4 w-4 text-gray-500" />
                       </div>
                    </div>

                    {/* Bottom Content */}
                    <div className="mt-auto bg-white/80 backdrop-blur p-6 rounded-xl border border-white/50 shadow-lg">
                       <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">Territory Map</h3>
                       <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                          Your route is optimized for efficiency. 
                          Estimated travel time: <span className="font-bold text-gray-900">2h 15m</span>
                       </p>
                       <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg shadow-lg shadow-gray-900/20 h-11 font-medium">
                         View Full Route
                       </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
