import { LucideIcon, Phone, Mail, User, CheckCircle, XCircle, Clock, Calendar, DollarSign, FileText, MapPin, Star, PhoneOff, MessageSquare, MonitorPlay, Briefcase, Trophy, Heart, Bell, Ghost, Ban, Scale } from "lucide-react";

export type CallStatus = 
  | "New"
  | "Email Sent"
  | "Called - No Answer"
  | "Connected"
  | "Responded"
  | "Qualified"
  | "Meeting Scheduled"
  | "Visit Scheduled"
  | "Call Scheduled" 
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

export interface RecordedCall {
  id: string;
  rep: string;
  customer: string;
  duration: string;
  date: string;
  status: string;
  score: number;
  transcript?: string;
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
  { label: "New", value: "New", color: "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200", icon: Star },
  { label: "Email Sent", value: "Email Sent", color: "bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200", icon: Mail },
  { label: "No Answer", value: "Called - No Answer", color: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200", icon: PhoneOff },
  { label: "Connected", value: "Connected", color: "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200", icon: Phone },
  { label: "Responded", value: "Responded", color: "bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200", icon: MessageSquare },
  { label: "Qualified", value: "Qualified", color: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200", icon: CheckCircle },
  { label: "Meeting Set", value: "Meeting Scheduled", color: "bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200", icon: Calendar },
  { label: "Visit Set", value: "Visit Scheduled", color: "bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200", icon: MapPin },
  { label: "Call Set", value: "Call Scheduled", color: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200", icon: Clock },
  { label: "Demo Done", value: "Demo/Presentation Complete", color: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 hover:bg-fuchsia-200", icon: MonitorPlay },
  { label: "Proposal", value: "Proposal Sent", color: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200", icon: FileText },
  { label: "Negotiating", value: "Negotiating", color: "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200", icon: Scale },
  { label: "Closed Won", value: "Closed Won", color: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200", icon: Trophy },
  { label: "Closed Lost", value: "Closed Lost", color: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200", icon: XCircle },
  { label: "Nurture", value: "Nurture", color: "bg-lime-100 text-lime-800 border-lime-200 hover:bg-lime-200", icon: Heart },
  { label: "Follow Up", value: "Follow-up Needed", color: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200", icon: Bell },
  { label: "No Response", value: "No Response", color: "bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200", icon: Ghost },
  { label: "DNC", value: "DNC", color: "bg-zinc-100 text-zinc-800 border-zinc-200 hover:bg-zinc-200", icon: Ban },
];

export const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: "t1",
    name: "General Introduction",
    subject: "Introduction: QuantumPunch x {{company}}",
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
      { id: "e1", subject: "Intro to QuantumPunch for Surgeons", date: "2 days ago", status: "opened" }
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
      { id: "e2", subject: "QuantumPunch: Better Patient Management", date: "Yesterday", status: "sent" }
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

export const MOCK_CALLS: RecordedCall[] = [
    { 
        id: "call-1", 
        rep: "Alex Johnson", 
        customer: "Dr. Sarah Jenkins", 
        duration: "4:12", 
        date: "Today, 10:30 AM", 
        status: "Meeting Scheduled", 
        score: 0,
        transcript: "Alex: Hi Dr. Jenkins, this is Alex from QuantumPunch. I wanted to follow up on the email I sent regarding our inventory tracking for orthopedics.\n\nDr. Jenkins: Oh, yes, I saw that. We're actually struggling with our current system.\n\nAlex: I hear that a lot. Specifically with surgical kits?\n\nDr. Jenkins: Exactly. It's a mess.\n\nAlex: Well, our new module is designed exactly for that. Could we set up a 15-minute demo next week?\n\nDr. Jenkins: That sounds reasonable. How about Tuesday at 10?\n\nAlex: Tuesday at 10 works perfectly. I'll send the invite. Thanks!"
    },
    { 
        id: "call-2", 
        rep: "Alex Johnson", 
        customer: "James Wilson", 
        duration: "1:45", 
        date: "Today, 9:15 AM", 
        status: "Connected", 
        score: 5,
        transcript: "Alex: Hello James, Alex here from QuantumPunch. Do you have a quick minute?\n\nJames: Honestly, I'm about to step into a meeting.\n\nAlex: No problem at all. I'll keep it super brief. Just wanted to see if your procurement cycle is opening up next month as we discussed?\n\nJames: Yes, it is. Call me back next Thursday.\n\nAlex: Will do. Thanks James."
    },
    { 
        id: "call-3", 
        rep: "Alex Johnson", 
        customer: "Apex Health Systems", 
        duration: "3:05", 
        date: "Yesterday, 4:45 PM", 
        status: "Qualified", 
        score: 15,
        transcript: "Alex: Hi, may I speak with the practice manager?\n\nReceptionist: This is she.\n\nAlex: Hi, this is Alex with QuantumPunch. We're working with several other clinics in the area to streamline patient communication.\n\nManager: Oh, we use standard email for that.\n\nAlex: I understand. Many of our partners did too, but found text messaging increased response rates by 40%. Is that something you'd be interested in exploring?\n\nManager: Actually, yes. We have a lot of no-shows."
    },
    { 
        id: "call-4", 
        rep: "Alex Johnson", 
        customer: "Evergreen Clinic", 
        duration: "0:45", 
        date: "Yesterday, 2:15 PM", 
        status: "Called - No Answer", 
        score: 0,
        transcript: "Voicemail: You have reached the Evergreen Clinic. Please leave a message.\n\nAlex: Hi, this is Alex from QuantumPunch calling for the practice administrator. I'll try again later. Thanks."
    },
    { 
        id: "call-5", 
        rep: "Alex Johnson", 
        customer: "Dr. Emily Chen", 
        duration: "5:30", 
        date: "Yesterday, 11:00 AM", 
        status: "Meeting Scheduled", 
        score: 25,
        transcript: "Alex: Dr. Chen, thanks for taking the time.\n\nDr. Chen: No problem. I have about 5 minutes.\n\nAlex: Perfect. I wanted to show you how we handle multi-location scheduling.\n\nDr. Chen: That is our biggest headache right now.\n\nAlex: I imagined so. With QuantumPunch, you can view all provider schedules in a single view. Let me describe how it works..."
    },
    { 
        id: "call-6", 
        rep: "Alex Johnson", 
        customer: "Seattle Children's", 
        duration: "2:10", 
        date: "2 days ago, 3:30 PM", 
        status: "Follow-up Needed", 
        score: 5,
        transcript: "Alex: Hi Michael, checking in on the brochure I sent.\n\nMichael: Hey Alex. Yes, I got it. Haven't had a chance to review it yet.\n\nAlex: Totally understand. What's the best time to circle back? Next week?\n\nMichael: Yeah, try me Wednesday afternoon."
    },
    { 
        id: "call-7", 
        rep: "Alex Johnson", 
        customer: "Providence Regional", 
        duration: "6:15", 
        date: "2 days ago, 1:00 PM", 
        status: "Demo/Presentation Complete", 
        score: 10,
        transcript: "Alex: ...and that concludes the pricing module. Any questions?\n\nClient: It looks comprehensive. But does it integrate with Epic?\n\nAlex: Yes, we have a native integration. I can send you the technical documentation.\n\nClient: That would be great. Send that over."
    },
    { 
        id: "call-8", 
        rep: "Alex Johnson", 
        customer: "Swedish Edmonds", 
        duration: "0:30", 
        date: "3 days ago, 9:45 AM", 
        status: "Called - No Answer", 
        score: 0,
        transcript: "Voicemail: Please leave a message after the tone.\n\nAlex: Hi Dr. Grant, Alex from QuantumPunch here. calling regarding the inventory tracking. I'll shoot you an email."
    },
    { 
        id: "call-9", 
        rep: "Alex Johnson", 
        customer: "Pacific Dermatology", 
        duration: "4:00", 
        date: "3 days ago, 11:20 AM", 
        status: "Qualified", 
        score: 10,
        transcript: "Alex: Hi Dr. Chang, saw your presentation at the conference.\n\nDr. Chang: Oh, thank you. Did you enjoy it?\n\nAlex: Very much so. Especially the part about patient retention. That's actually what we specialize in.\n\nDr. Chang: Interesting. Tell me more."
    },
    { 
        id: "call-10", 
        rep: "Alex Johnson", 
        customer: "Western WA Medical", 
        duration: "1:15", 
        date: "Last Week, 2:00 PM", 
        status: "Not Interested", 
        score: 0,
        transcript: "Alex: Hi Mark, Alex calling from QuantumPunch.\n\nMark: Look, we're happy with our current vendor.\n\nAlex: I understand. Even if you could save 20%?\n\nMark: We're under contract. Not interested right now."
    },
    { 
        id: "call-11", 
        rep: "Alex Johnson", 
        customer: "Mill Creek Family", 
        duration: "3:45", 
        date: "Last Week, 10:00 AM", 
        status: "Meeting Scheduled", 
        score: 20,
        transcript: "Alex: Good morning Dr. Patel.\n\nDr. Patel: Good morning.\n\nAlex: I'm calling about the partnership program for family practices.\n\nDr. Patel: I've heard a bit about that. Is it true you offer free onboarding?\n\nAlex: For this month, yes we do."
    },
    { 
        id: "call-12", 
        rep: "Alex Johnson", 
        customer: "Kaiser Permanente", 
        duration: "2:50", 
        date: "Last Week, 4:15 PM", 
        status: "Follow-up Needed", 
        score: 5,
        transcript: "Alex: Hi Sarah, just checking on the inventory needs.\n\nSarah: We're still assessing. Can you give us another week?\n\nAlex: Absolutely. I'll mark my calendar for next Friday."
    }
];
