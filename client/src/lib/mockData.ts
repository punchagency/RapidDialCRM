import { LucideIcon, Phone, Mail, User, CheckCircle, XCircle, Clock, Calendar, DollarSign, FileText, MapPin } from "lucide-react";

export type CallStatus = 
  | "New"
  | "Email Sent"
  | "Called - No Answer"
  | "Connected"
  | "Responded"
  | "Qualified"
  | "Meeting Scheduled"
  | "Visit Scheduled"
  | "Demo/Presentation Complete"
  | "Proposal Sent"
  | "Negotiating"
  | "Closed Won"
  | "Closed Lost"
  | "Nurture"
  | "Follow-up Needed"
  | "No Response"
  | "DNC";

export interface Contact {
  id: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  zip: string;
  timezone: string;
  lastNotes: string;
  dealSize?: string;
  drServed?: string; // For medical sales context
  status: CallStatus;
  location_lat?: number; // Mock for map
  location_lng?: number;
}

export const CALL_STATUSES: { label: string; value: CallStatus; color: string; icon: LucideIcon }[] = [
  { label: "No Answer", value: "Called - No Answer", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200", icon: Phone },
  { label: "Connected", value: "Connected", color: "bg-blue-500/10 text-blue-600 border-blue-200", icon: User },
  { label: "Meeting Set", value: "Meeting Scheduled", color: "bg-green-500/10 text-green-600 border-green-200", icon: Calendar },
  { label: "Follow Up", value: "Follow-up Needed", color: "bg-purple-500/10 text-purple-600 border-purple-200", icon: Clock },
  { label: "Not Interested", value: "Closed Lost", color: "bg-red-500/10 text-red-600 border-red-200", icon: XCircle },
  { label: "DNC", value: "DNC", color: "bg-gray-500/10 text-gray-600 border-gray-200", icon: XCircle },
];

export const MOCK_CONTACTS: Contact[] = [
  {
    id: "1",
    name: "Dr. Sarah Jenkins",
    title: "Chief of Surgery",
    company: "Mercy General Hospital",
    phone: "(555) 123-4567",
    email: "sjenkins@mercy.org",
    address: "123 Medical Center Dr, Seattle, WA",
    zip: "98101",
    timezone: "PST",
    lastNotes: "Spoke to gatekeeper last week. Interested in new surgical tools. Call back Tuesday morning.",
    dealSize: "$50k",
    drServed: "Orthopedics",
    status: "New"
  },
  {
    id: "2",
    name: "James Wilson",
    title: "Procurement Director",
    company: "Apex Health Systems",
    phone: "(555) 987-6543",
    email: "jwilson@apexhealth.com",
    address: "456 Corporate Blvd, Denver, CO",
    zip: "80202",
    timezone: "MST",
    lastNotes: "Left voicemail. Need to confirm budget cycle.",
    dealSize: "$120k",
    drServed: "General Practice",
    status: "New"
  },
  {
    id: "3",
    name: "Dr. Emily Chen",
    title: "Medical Director",
    company: "Chen Family Practice",
    phone: "(555) 456-7890",
    email: "echen@chenpractice.com",
    address: "789 Wellness Way, San Francisco, CA",
    zip: "94105",
    timezone: "PST",
    lastNotes: "Initial email sent. No response yet.",
    dealSize: "$25k",
    status: "Email Sent"
  },
  {
    id: "4",
    name: "Michael Ross",
    title: "Operations Manager",
    company: "Unity Care Clinics",
    phone: "(555) 222-3333",
    email: "mross@unitycare.com",
    address: "321 Health Ave, Portland, OR",
    zip: "97205",
    timezone: "PST",
    lastNotes: "Asked for brochure. Sent yesterday.",
    dealSize: "$75k",
    drServed: "Pediatrics",
    status: "New"
  },
  {
    id: "5",
    name: "Linda Martinez",
    title: "Office Manager",
    company: "Westside Cardiology",
    phone: "(555) 444-5555",
    email: "lmartinez@westsidecardio.com",
    address: "654 Heart Ln, Los Angeles, CA",
    zip: "90001",
    timezone: "PST",
    lastNotes: "Gatekeeper is tough. Try calling during lunch.",
    status: "Called - No Answer"
  }
];
