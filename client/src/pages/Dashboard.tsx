import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { GamificationWidget } from "@/components/crm/GamificationWidget";
import { ImportModal } from "@/components/crm/ImportModal";
import { MOCK_CONTACTS } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Play, Phone, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import mapBg from "@assets/generated_images/Subtle_abstract_map_background_for_CRM_7b808988.png";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/80 backdrop-blur z-10">
          <h1 className="text-xl font-heading font-semibold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search contacts..." className="pl-9 bg-muted/50 border-transparent focus:bg-card transition-all" />
            </div>
            <ImportModal />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          <div className="max-w-6xl mx-auto">
            <GamificationWidget />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Up Next List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-heading font-semibold">Up Next (Optimized Route)</h2>
                  <Link href="/dialer">
                    <Button className="gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                      <Play className="h-4 w-4 fill-current" />
                      Start Power Dialer
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  {MOCK_CONTACTS.map((contact, i) => (
                    <Card key={contact.id} className="group hover:shadow-md transition-all border-border/60">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">{contact.name}</p>
                            <Badge variant="secondary" className="text-[10px] h-5">{contact.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{contact.company} • {contact.address}</p>
                        </div>
                        <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Mini Map Widget */}
              <div className="lg:col-span-1">
                <Card className="h-full min-h-[300px] border-none shadow-sm overflow-hidden relative group">
                  <div className="absolute inset-0 bg-cover bg-center opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500" 
                       style={{ backgroundImage: `url(${mapBg})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  
                  <CardContent className="relative h-full flex flex-col justify-end p-6">
                    <h3 className="font-heading font-semibold text-lg mb-1">Territory Map</h3>
                    <p className="text-sm text-muted-foreground mb-4">Your route is optimized for the Seattle Metro area today.</p>
                    <Button variant="outline" className="w-full bg-card/80 backdrop-blur">
                      View Full Map
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
