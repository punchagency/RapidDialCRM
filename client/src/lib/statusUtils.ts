import { 
  Phone, Mail, User, CheckCircle, XCircle, Clock, Calendar, DollarSign, 
  FileText, MapPin, Star, PhoneOff, MessageSquare, MonitorPlay, Briefcase, 
  Trophy, Heart, Bell, Ghost, Ban, Scale, AlertTriangle, Flag, ThumbsUp, ThumbsDown
} from "lucide-react";
import { CALL_STATUSES, CallStatus } from "./mockData";

export const ICON_MAP: Record<string, any> = {
  Phone, Mail, User, CheckCircle, XCircle, Clock, Calendar, DollarSign, 
  FileText, MapPin, Star, PhoneOff, MessageSquare, MonitorPlay, Briefcase, 
  Trophy, Heart, Bell, Ghost, Ban, Scale, AlertTriangle, Flag, ThumbsUp, ThumbsDown
};

export const AVAILABLE_COLORS = [
  { label: "Slate", value: "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200" },
  { label: "Red", value: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200" },
  { label: "Orange", value: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200" },
  { label: "Amber", value: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200" },
  { label: "Yellow", value: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200" },
  { label: "Lime", value: "bg-lime-100 text-lime-800 border-lime-200 hover:bg-lime-200" },
  { label: "Green", value: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200" },
  { label: "Emerald", value: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200" },
  { label: "Teal", value: "bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200" },
  { label: "Cyan", value: "bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200" },
  { label: "Sky", value: "bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200" },
  { label: "Blue", value: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200" },
  { label: "Indigo", value: "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200" },
  { label: "Violet", value: "bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200" },
  { label: "Purple", value: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200" },
  { label: "Fuchsia", value: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 hover:bg-fuchsia-200" },
  { label: "Pink", value: "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200" },
  { label: "Rose", value: "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200" },
];

export interface StatusConfig {
  label: string;
  value: string;
  color: string;
  iconName: string;
}

export function getStatuses(): { label: string; value: string; color: string; icon: any }[] {
  const saved = localStorage.getItem("custom_statuses");
  if (saved) {
    try {
      const parsed: StatusConfig[] = JSON.parse(saved);
      return parsed.map(s => ({
        ...s,
        icon: ICON_MAP[s.iconName] || Star // Fallback icon
      }));
    } catch (e) {
      console.error("Failed to parse statuses", e);
    }
  }
  
  // Fallback to default if nothing saved or error
  return CALL_STATUSES;
}

export function saveStatuses(statuses: StatusConfig[]) {
  localStorage.setItem("custom_statuses", JSON.stringify(statuses));
  // Force a custom event so components can listen if they want (optional for this prototype)
  window.dispatchEvent(new Event("statuses-updated"));
}

// Helper to convert default statuses to config format (for initial load/reset)
export function getDefaultStatusConfig(): StatusConfig[] {
  return CALL_STATUSES.map(s => {
    // Find icon name from map
    const iconEntry = Object.entries(ICON_MAP).find(([_, icon]) => icon === s.icon);
    return {
      label: s.label,
      value: s.value,
      color: s.color,
      iconName: iconEntry ? iconEntry[0] : "Star"
    };
  });
}
