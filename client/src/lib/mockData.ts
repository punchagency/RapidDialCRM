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

export interface EmailLog {
  id: string;
  subject: string;
  date: string;
  status: "sent" | "opened" | "replied";
}

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
  drServed?: string; // This corresponds to the Profession Type
  status: CallStatus;
  location_lat?: number; // Mock for map
  location_lng?: number;
  emailHistory?: EmailLog[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  specialty?: string; // If set, this is the default for this specialty/profession
}

export const DEFAULT_PROFESSIONS = [
  "Dentist",
  "Aesthetic Doctor",
  "Plastic Surgeon",
  "Med Spa Owner",
  "Orthopedics",
  "General Practice",
  "Pediatrics",
  "Cardiology",
  "Dermatology"
];

export const CALL_STATUSES: { label: string; value: CallStatus; color: string; icon: LucideIcon }[] = [
  { label: "No Answer", value: "Called - No Answer", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200", icon: Phone },
  { label: "Connected", value: "Connected", color: "bg-blue-500/10 text-blue-600 border-blue-200", icon: User },
  { label: "Meeting Set", value: "Meeting Scheduled", color: "bg-green-500/10 text-green-600 border-green-200", icon: Calendar },
  { label: "Follow Up", value: "Follow-up Needed", color: "bg-purple-500/10 text-purple-600 border-purple-200", icon: Clock },
  { label: "Not Interested", value: "Closed Lost", color: "bg-red-500/10 text-red-600 border-red-200", icon: XCircle },
  { label: "DNC", value: "DNC", color: "bg-gray-500/10 text-gray-600 border-gray-200", icon: XCircle },
];

export const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: "t1",
    name: "General Introduction",
    subject: "Introduction: Quo x {{company}}",
    body: "Hi {{firstName}},\n\nI noticed your work at {{company}} and wanted to reach out.\n\nWe help teams like yours streamline their sales calls. Would you be open to a 10-minute chat next week?\n\nBest,\nAlex"
  },
  {
    id: "t2",
    name: "Orthopedics Intro",
    subject: "Better surgical tool tracking for {{company}}",
    body: "Hi {{firstName}},\n\nI know running an orthopedics practice comes with unique inventory challenges.\n\nOur new module helps track surgical kits specifically for orthopedic procedures. Worth a quick look?\n\nBest,\nAlex",
    specialty: "Orthopedics"
  },
  {
    id: "t3",
    name: "Pediatrics Follow-up",
    subject: "Following up: Patient family communication",
    body: "Hi {{firstName}},\n\nGreat speaking with you. As we discussed, improving communication with parents is key for pediatric clinics.\n\nHere's that case study I mentioned.\n\nBest,\nAlex",
    specialty: "Pediatrics"
  },
  {
    id: "t4",
    name: "General Practice Check-in",
    subject: "Checking in on your practice volume",
    body: "Hi {{firstName}},\n\nHope you're having a great week. I know general practices are seeing high volume right now.\n\nAre you still looking for ways to reduce admin time?\n\nBest,\nAlex",
    specialty: "General Practice"
  },
   {
    id: "t5",
    name: "Dentist Special Offer",
    subject: "Exclusive offer for dental partners",
    body: "Hi {{firstName}},\n\nWe have a special partnership program for dental clinics this month.\n\nWould love to share the details if you have 5 minutes.\n\nBest,\nAlex",
    specialty: "Dentist"
  }
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
    status: "New",
    emailHistory: [
      { id: "e1", subject: "Intro to Quo for Surgeons", date: "2 days ago", status: "opened" }
    ]
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
    status: "New",
    emailHistory: []
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
    status: "Email Sent",
    emailHistory: [
      { id: "e2", subject: "Quo: Better Patient Management", date: "Yesterday", status: "sent" }
    ]
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
    status: "New",
    emailHistory: [
      { id: "e3", subject: "Requested Brochure", date: "Yesterday", status: "opened" },
      { id: "e4", subject: "Meeting Follow up", date: "Last Week", status: "replied" }
    ]
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
    status: "Called - No Answer",
    emailHistory: []
  }
];
