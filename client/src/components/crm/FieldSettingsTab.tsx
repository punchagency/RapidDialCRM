import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MapPin, Coffee, Clock, Car, Heart } from "lucide-react";

export function FieldSettingsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            <CardTitle>Wellbeing & Workload Balance</CardTitle>
          </div>
          <CardDescription>
            Configure settings to prevent burnout and ensure manageable daily routes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Daily Visit Cap</Label>
                <p className="text-sm text-muted-foreground">
                  Limit the number of stops per day to ensure quality interactions.
                </p>
              </div>
              <div className="w-[120px]">
                <Select defaultValue="6">
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 Visits (Light)</SelectItem>
                    <SelectItem value="6">6 Visits (Balanced)</SelectItem>
                    <SelectItem value="8">8 Visits (High)</SelectItem>
                    <SelectItem value="10">10+ Visits (Aggressive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Mandatory Lunch Block</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically reserve 60 minutes for lunch between 12PM - 2PM.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Travel Buffer</Label>
                <p className="text-sm text-muted-foreground">
                  Add extra cushion time between appointments to reduce rushing.
                </p>
              </div>
              <div className="w-[120px]">
                <Select defaultValue="15">
                  <SelectTrigger>
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="10">10 mins</SelectItem>
                    <SelectItem value="15">15 mins</SelectItem>
                    <SelectItem value="30">30 mins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-blue-500" />
            <CardTitle>Territory & Routing</CardTitle>
          </div>
          <CardDescription>
            Define geographic boundaries and starting points for route optimization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Home Base (Start Location)</Label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Address or Zip Code" defaultValue="98101" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Max Daily Drive Time</Label>
              <Select defaultValue="2">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="2">2 Hours</SelectItem>
                  <SelectItem value="3">3 Hours</SelectItem>
                  <SelectItem value="4">4+ Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-2">
             <Label>Max Radius from Home Base (miles)</Label>
             <div className="flex items-center gap-4">
               <Slider defaultValue={[25]} max={100} step={5} className="flex-1" />
               <span className="w-12 text-sm font-medium text-right">25 mi</span>
             </div>
          </div>

        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Reset Defaults</Button>
        <Button>Save Preferences</Button>
      </div>
    </div>
  );
}
