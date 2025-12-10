import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ZoomIn, ZoomOut, Maximize, Download, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import avatar1 from "@/assets/generated_images/Professional_user_avatar_1_a4d3e764.png";
import avatar2 from "@/assets/generated_images/Professional_user_avatar_2_9f00e114.png";
import { Badge } from "@/components/ui/badge";

// Mock Data for Org Chart
const orgData = {
  managers: [
    {
      id: "m1",
      name: "Sarah Miller",
      role: "Regional Manager",
      avatar: avatar2,
      color: "bg-blue-50 border-blue-200",
    },
    {
      id: "m2",
      name: "Robert Stone",
      role: "Territory Manager",
      avatar: null,
      color: "bg-blue-50 border-blue-200",
    },
  ],
  insideReps: [
    {
      id: "ir1",
      name: "Alex Johnson",
      role: "Inside Sales Lead",
      avatar: avatar1,
      manager: "m1",
      supports: ["fr1", "fr2"],
      color: "bg-purple-50 border-purple-200",
    },
    {
      id: "ir2",
      name: "Sam Wilson",
      role: "Inside Sales",
      avatar: null,
      manager: "m1",
      supports: ["fr3"],
      color: "bg-purple-50 border-purple-200",
    },
    {
      id: "ir3",
      name: "Emily Davis",
      role: "Inside Sales",
      avatar: null,
      manager: "m2",
      supports: ["fr4", "fr5"],
      color: "bg-purple-50 border-purple-200",
    },
  ],
  fieldReps: [
    {
      id: "fr1",
      name: "Mike Field",
      role: "Field Sales",
      territory: "North Seattle",
      avatar: null,
      color: "bg-green-50 border-green-200",
    },
    {
      id: "fr2",
      name: "Jessica Wong",
      role: "Field Sales",
      territory: "Bellevue",
      avatar: null,
      color: "bg-green-50 border-green-200",
    },
    {
      id: "fr3",
      name: "David Kim",
      role: "Field Sales",
      territory: "Downtown",
      avatar: null,
      color: "bg-green-50 border-green-200",
    },
    {
      id: "fr4",
      name: "Lisa Patel",
      role: "Field Sales",
      territory: "South Seattle",
      avatar: null,
      color: "bg-green-50 border-green-200",
    },
    {
      id: "fr5",
      name: "Tom Wilson",
      role: "Field Sales",
      territory: "Tacoma",
      avatar: null,
      color: "bg-green-50 border-green-200",
    },
  ],
};

export default function OrgChart() {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <h1 className="text-xl font-heading font-semibold text-foreground">
            Organization Chart
          </h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" /> Filter View
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative p-8">
          {/* Interactive Controls */}
          <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-20">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setZoom((z) => Math.min(z + 0.1, 1.5))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={() => setZoom(1)}>
              <Maximize className="h-4 w-4" />
            </Button>
          </div>

          {/* Org Chart Canvas */}
          <div
            className="w-full h-full flex items-center justify-center overflow-auto"
            style={{
              transform: `scale(${zoom})`,
              transition: "transform 0.2s ease-in-out",
            }}
          >
            <div className="flex items-start gap-24 min-w-[1000px]">
              {/* Level 1: Managers Loop */}
              {orgData.managers.map((mgr) => {
                const myInsideReps = orgData.insideReps.filter(
                  (r) => r.manager === mgr.id
                );

                return (
                  <div key={mgr.id} className="flex flex-col items-center">
                    {/* Level 1: Manager Card */}
                    <div className="relative mb-16 z-20">
                      <Card
                        className={cn(
                          "w-64 border shadow-sm transition-all hover:shadow-md cursor-pointer relative z-10",
                          mgr.color
                        )}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            <AvatarImage src={mgr.avatar || ""} />
                            <AvatarFallback>
                              {mgr.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{mgr.name}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                              {mgr.role}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Connector down if has children */}
                      {myInsideReps.length > 0 && (
                        <div className="absolute left-1/2 top-full h-16 w-px bg-border/60 -translate-x-1/2" />
                      )}
                    </div>

                    {/* Level 2: Inside Reps (Nested under Manager) */}
                    {myInsideReps.length > 0 && (
                      <div className="relative flex gap-12 pt-8">
                        {/* Horizontal Bar connecting children */}
                        {myInsideReps.length > 1 && (
                          <div className="absolute top-0 left-1/2 right-1/2 h-px bg-border/60 w-[calc(100%-2rem)] -translate-x-1/2" />
                        )}

                        {myInsideReps.map((rep, idx) => (
                          <div
                            key={rep.id}
                            className="flex flex-col items-center relative"
                          >
                            {/* Connector up to horizontal bar */}
                            <div
                              className={cn(
                                "absolute top-[-32px] left-1/2 w-px h-8 bg-border/60 -translate-x-1/2",
                                myInsideReps.length === 1 && "h-16 top-[-64px]" // Direct line if single child
                              )}
                            />

                            {/* Horizontal connector logic adjustment for tree structure */}
                            {myInsideReps.length > 1 && (
                              <div
                                className={cn(
                                  "absolute top-[-32px] h-px bg-border/60",
                                  idx === 0
                                    ? "left-1/2 right-[-1rem]"
                                    : idx === myInsideReps.length - 1
                                    ? "left-[-1rem] right-1/2"
                                    : "left-[-1rem] right-[-1rem]"
                                )}
                              />
                            )}

                            <Card
                              className={cn(
                                "w-60 border shadow-sm transition-all hover:shadow-md cursor-pointer z-10",
                                rep.color
                              )}
                            >
                              <CardContent className="p-3 flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                  <AvatarImage src={rep.avatar || ""} />
                                  <AvatarFallback>
                                    {rep.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-sm">
                                    {rep.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {rep.role}
                                  </p>
                                </div>
                              </CardContent>
                              {/* Connector Line Down */}
                              <div className="absolute left-1/2 top-full h-12 w-px bg-border/60 -translate-x-1/2" />
                            </Card>

                            {/* Level 3: Field Reps */}
                            <div className="flex gap-4 mt-12 relative">
                              {/* Horizontal Connector for Field Reps under this Inside Rep */}
                              {rep.supports.length > 1 && (
                                <div className="absolute top-0 left-1/2 right-1/2 h-px bg-border/60 -mt-6 w-[calc(100%-2rem)] -translate-x-1/2" />
                              )}

                              {rep.supports.map((fieldId, fIdx) => {
                                const fieldRep = orgData.fieldReps.find(
                                  (fr) => fr.id === fieldId
                                );
                                if (!fieldRep) return null;
                                return (
                                  <div key={fieldId} className="relative pt-6">
                                    {/* Connector from horizontal line */}
                                    <div
                                      className={cn(
                                        "absolute top-[-24px] left-1/2 w-px h-6 bg-border/60 -translate-x-1/2",
                                        // Adjust for single child vs multiple
                                        rep.supports.length === 1 &&
                                          "h-12 top-[-48px]"
                                      )}
                                    />

                                    {rep.supports.length > 1 && (
                                      <div
                                        className={cn(
                                          "absolute top-[-24px] h-px bg-border/60",
                                          fIdx === 0
                                            ? "left-1/2 right-[-1rem]"
                                            : fIdx === rep.supports.length - 1
                                            ? "left-[-1rem] right-1/2"
                                            : "left-[-1rem] right-[-1rem]"
                                        )}
                                      />
                                    )}

                                    <Card
                                      className={cn(
                                        "w-48 border shadow-sm transition-all hover:shadow-md cursor-pointer group/card",
                                        fieldRep.color
                                      )}
                                    >
                                      <CardContent className="p-3 text-center">
                                        <div className="flex justify-center mb-2">
                                          <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                                            <AvatarImage
                                              src={fieldRep.avatar || ""}
                                            />
                                            <AvatarFallback className="text-xs">
                                              {fieldRep.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                            </AvatarFallback>
                                          </Avatar>
                                        </div>
                                        <p className="font-semibold text-sm truncate">
                                          {fieldRep.name}
                                        </p>
                                        <Badge
                                          variant="secondary"
                                          className="mt-1 text-[10px] px-1.5 py-0 h-5 font-normal bg-white/50 hover:bg-white/60"
                                        >
                                          {fieldRep.territory}
                                        </Badge>
                                      </CardContent>
                                    </Card>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
