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

// Updated with real Seattle addresses and coordinates for realistic mapping
export const MOCK_CONTACTS: Contact[] = [
  // SEATTLE - TODAY'S ROUTE
  {
    id: "1",
    name: "Dr. Sarah Jenkins",
    title: "Chief of Surgery",
    company: "Swedish First Hill",
    phone: "(555) 123-4567",
    email: "sjenkins@swedish.org",
    address: "747 Broadway, Seattle, WA",
    zip: "98122",
    timezone: "PST",
    lastNotes: "Spoke to gatekeeper last week. Interested in new surgical tools. Call back Tuesday morning.",
    dealSize: "$50k",
    drServed: "Orthopedics",
    status: "New",
    location_lat: 47.6099,
    location_lng: -122.3223,
    emailHistory: [
      { id: "e1", subject: "Intro to Quo for Surgeons", date: "2 days ago", status: "opened" }
    ]
  },
  {
    id: "2",
    name: "James Wilson",
    title: "Procurement Director",
    company: "Harborview Medical",
    phone: "(555) 987-6543",
    email: "jwilson@uw.edu",
    address: "325 9th Ave, Seattle, WA",
    zip: "98104",
    timezone: "PST",
    lastNotes: "Left voicemail. Need to confirm budget cycle.",
    dealSize: "$120k",
    drServed: "General Practice",
    status: "New",
    location_lat: 47.6023,
    location_lng: -122.3242,
    emailHistory: []
  },
  {
    id: "3",
    name: "Dr. Emily Chen",
    title: "Medical Director",
    company: "UW Medical Center",
    phone: "(555) 456-7890",
    email: "echen@uw.edu",
    address: "1959 NE Pacific St, Seattle, WA",
    zip: "98195",
    timezone: "PST",
    lastNotes: "Initial email sent. No response yet.",
    dealSize: "$25k",
    status: "Email Sent",
    location_lat: 47.6506,
    location_lng: -122.3095,
    emailHistory: [
      { id: "e2", subject: "Quo: Better Patient Management", date: "Yesterday", status: "sent" }
    ]
  },
  {
    id: "4",
    name: "Michael Ross",
    title: "Operations Manager",
    company: "Seattle Children's",
    phone: "(555) 222-3333",
    email: "mross@seattlechildrens.org",
    address: "4800 Sand Point Way NE, Seattle, WA",
    zip: "98105",
    timezone: "PST",
    lastNotes: "Asked for brochure. Sent yesterday.",
    dealSize: "$75k",
    drServed: "Pediatrics",
    status: "New",
    location_lat: 47.6626,
    location_lng: -122.2824,
    emailHistory: [
      { id: "e3", subject: "Requested Brochure", date: "Yesterday", status: "opened" },
      { id: "e4", subject: "Meeting Follow up", date: "Last Week", status: "replied" }
    ]
  },
  {
    id: "5",
    name: "Linda Martinez",
    title: "Office Manager",
    company: "Virginia Mason",
    phone: "(555) 444-5555",
    email: "lmartinez@virginiamason.org",
    address: "1100 9th Ave, Seattle, WA",
    zip: "98101",
    timezone: "PST",
    lastNotes: "Gatekeeper is tough. Try calling during lunch.",
    status: "Called - No Answer",
    location_lat: 47.6093,
    location_lng: -122.3275,
    emailHistory: []
  },
  
  // EVERETT/NORTH SEATTLE - TOMORROW'S ROUTE (Approx 20-25 miles north)
  {
    id: "6",
    name: "Dr. Robert Lee",
    title: "Director of Cardiology",
    company: "Providence Regional",
    phone: "(425) 261-2000",
    email: "rlee@providence.org",
    address: "1700 13th St, Everett, WA",
    zip: "98201",
    timezone: "PST",
    lastNotes: "Scheduled visit for product demo.",
    dealSize: "$200k",
    drServed: "Cardiology",
    status: "Visit Scheduled",
    location_lat: 48.0032,
    location_lng: -122.2087
  },
  {
    id: "7",
    name: "Jennifer Wu",
    title: "Clinic Manager",
    company: "The Everett Clinic",
    phone: "(425) 259-0966",
    email: "jwu@everettclinic.com",
    address: "3901 Hoyt Ave, Everett, WA",
    zip: "98201",
    timezone: "PST",
    lastNotes: "Following up on proposal sent last week.",
    dealSize: "$80k",
    drServed: "General Practice",
    status: "Meeting Scheduled",
    location_lat: 47.9789,
    location_lng: -122.2020
  },
  {
    id: "8",
    name: "Dr. Alan Grant",
    title: "Orthopedic Surgeon",
    company: "Swedish Edmonds",
    phone: "(425) 640-4000",
    email: "agrant@swedish.org",
    address: "21601 76th Ave W, Edmonds, WA",
    zip: "98026",
    timezone: "PST",
    lastNotes: "Interested in joint replacement inventory tracking.",
    dealSize: "$150k",
    drServed: "Orthopedics",
    status: "Visit Scheduled",
    location_lat: 47.8037,
    location_lng: -122.3376
  },
  {
    id: "9",
    name: "Susan Miller",
    title: "Practice Administrator",
    company: "Virginia Mason Lynnwood",
    phone: "(425) 712-7900",
    email: "smiller@virginiamason.org",
    address: "19116 33rd Ave W, Lynnwood, WA",
    zip: "98036",
    timezone: "PST",
    lastNotes: "Needs to reschedule.",
    dealSize: "$45k",
    drServed: "General Practice",
    status: "Follow-up Needed",
    location_lat: 47.8256,
    location_lng: -122.2831
  },
  {
    id: "10",
    name: "Dr. Lisa Chang",
    title: "Dermatologist",
    company: "Pacific Dermatology",
    phone: "(206) 855-5555",
    email: "lchang@pacificderm.com",
    address: "110 Cedar Ave, Snohomish, WA",
    zip: "98290",
    timezone: "PST",
    lastNotes: "New lead from conference.",
    dealSize: "$30k",
    drServed: "Dermatology",
    status: "New",
    location_lat: 47.9129,
    location_lng: -122.0982
  },
  {
    id: "11",
    name: "Mark Thompson",
    title: "Operations Director",
    company: "Western WA Medical",
    phone: "(425) 259-4041",
    email: "mthompson@wwmed.com",
    address: "12728 19th Ave SE, Everett, WA",
    zip: "98208",
    timezone: "PST",
    lastNotes: "Quarterly review meeting.",
    dealSize: "$110k",
    drServed: "General Practice",
    status: "Meeting Scheduled",
    location_lat: 47.8864,
    location_lng: -122.2171
  },
  {
    id: "12",
    name: "Dr. Patel",
    title: "Owner",
    company: "Mill Creek Family Practice",
    phone: "(425) 338-4000",
    email: "apatel@millcreekfp.com",
    address: "15418 Main St, Mill Creek, WA",
    zip: "98012",
    timezone: "PST",
    lastNotes: "Gatekeeper said to email.",
    dealSize: "$20k",
    drServed: "General Practice",
    status: "Email Sent",
    location_lat: 47.8608,
    location_lng: -122.2145
  },
  {
    id: "13",
    name: "Sarah Connor",
    title: "Clinic Supervisor",
    company: "Kaiser Permanente Everett",
    phone: "(425) 261-1500",
    email: "sconnor@kp.org",
    address: "2930 Maple St, Everett, WA",
    zip: "98201",
    timezone: "PST",
    lastNotes: "Checking inventory needs.",
    dealSize: "$90k",
    drServed: "General Practice",
    status: "Call Scheduled",
    location_lat: 47.9736,
    location_lng: -122.2048
  },
  {
    id: "14",
    name: "Dr. James Kim",
    title: "Nephrologist",
    company: "Puget Sound Kidney Ctr",
    phone: "(425) 744-1000",
    email: "jkim@pskc.net",
    address: "21309 44th Ave W, Mountlake Terrace, WA",
    zip: "98043",
    timezone: "PST",
    lastNotes: "Interested in dialysis scheduling module.",
    dealSize: "$65k",
    drServed: "Nephrology",
    status: "Visit Scheduled",
    location_lat: 47.8062,
    location_lng: -122.2921
  },
  {
    id: "15",
    name: "Emily Davis",
    title: "Office Manager",
    company: "Mukilteo Dental Center",
    phone: "(425) 347-5555",
    email: "edavis@mukilteodental.com",
    address: "800 2nd St, Mukilteo, WA",
    zip: "98275",
    timezone: "PST",
    lastNotes: "Follow up in 2 weeks.",
    dealSize: "$15k",
    drServed: "Dentist",
    status: "Nurture",
    location_lat: 47.9445,
    location_lng: -122.3046
  }
];
