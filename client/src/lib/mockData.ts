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

export interface SubContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary?: boolean;
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
  clientAdmins?: SubContact[];
  providerContacts?: SubContact[];
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

// Updated with Miami Dade (1-10) and DMV/DC area (11-20) addresses for realistic mapping
export const MOCK_CONTACTS: Contact[] = [
  // MIAMI DADE - CONTACTS 1-10
  {
    id: "1",
    name: "Dr. Sarah Jenkins",
    title: "Chief of Surgery",
    company: "Baptist Health South Florida",
    phone: "(305) 662-1234",
    email: "sjenkins@baptisthealth.net",
    address: "8900 North Kendall Drive, Miami, FL",
    zip: "33176",
    timezone: "EST",
    lastNotes: "Spoke to gatekeeper last week. Interested in new surgical tools. Call back Tuesday morning.",
    dealSize: "$50k",
    drServed: "Orthopedics",
    status: "New",
    location_lat: 25.7039,
    location_lng: -80.2131,
    emailHistory: [
      { id: "e1", subject: "Intro to QuantumPunch for Surgeons", date: "2 days ago", status: "opened" }
    ],
    clientAdmins: [
      { id: "ca1", name: "Martha Jones", role: "Office Manager", email: "mjones@baptist.net", phone: "(305) 662-1235", isPrimary: true },
      { id: "ca2", name: "Bill Smith", role: "Billing Coordinator", email: "bsmith@baptist.net", phone: "(305) 662-1236" }
    ],
    providerContacts: [
      { id: "pc1", name: "Dr. Sarah Jenkins", role: "Chief Surgeon", email: "sjenkins@baptist.net", phone: "(305) 662-1234", isPrimary: true },
      { id: "pc2", name: "Dr. Mark Liu", role: "Associate Surgeon", email: "mliu@baptist.net", phone: "(305) 662-1237" }
    ]
  },
  {
    id: "2",
    name: "James Wilson",
    title: "Procurement Director",
    company: "Jackson Memorial Hospital",
    phone: "(305) 585-1111",
    email: "jwilson@jhsmiami.org",
    address: "1611 NW 12th Avenue, Miami, FL",
    zip: "33136",
    timezone: "EST",
    lastNotes: "Left voicemail. Need to confirm budget cycle.",
    dealSize: "$120k",
    drServed: "General Practice",
    status: "New",
    location_lat: 25.8150,
    location_lng: -80.2093,
    emailHistory: [],
    clientAdmins: [
       { id: "ca3", name: "Tina Fay", role: "Admin Assistant", email: "tfay@jhsmiami.org", phone: "(305) 585-1115", isPrimary: true }
    ],
    providerContacts: [
       { id: "pc3", name: "Dr. Gregory House", role: "Diagnostician", email: "ghouse@jhsmiami.org", phone: "(305) 585-1120", isPrimary: true }
    ]
  },
  {
    id: "3",
    name: "Dr. Emily Chen",
    title: "Medical Director",
    company: "Coral Gables Medical Center",
    phone: "(305) 442-8600",
    email: "echen@cgmc.com",
    address: "3100 Douglas Road, Coral Gables, FL",
    zip: "33134",
    timezone: "EST",
    lastNotes: "Initial email sent. No response yet.",
    dealSize: "$25k",
    status: "Email Sent",
    location_lat: 25.7431,
    location_lng: -80.2655,
    emailHistory: [
      { id: "e2", subject: "QuantumPunch: Better Patient Management", date: "Yesterday", status: "sent" }
    ]
  },
  {
    id: "4",
    name: "Michael Ross",
    title: "Operations Manager",
    company: "Miami Children's Hospital",
    phone: "(305) 666-6511",
    email: "mross@mch.com",
    address: "3100 SW 62nd Avenue, Miami, FL",
    zip: "33155",
    timezone: "EST",
    lastNotes: "Asked for brochure. Sent yesterday.",
    dealSize: "$75k",
    drServed: "Pediatrics",
    status: "New",
    location_lat: 25.7264,
    location_lng: -80.2731,
    emailHistory: [
      { id: "e3", subject: "Requested Brochure", date: "Yesterday", status: "opened" },
      { id: "e4", subject: "Meeting Follow up", date: "Last Week", status: "replied" }
    ]
  },
  {
    id: "5",
    name: "Linda Martinez",
    title: "Office Manager",
    company: "Cleveland Clinic Florida",
    phone: "(239) 343-2000",
    email: "lmartinez@ccf.org",
    address: "6801 Lake Osprey Drive, Weston, FL",
    zip: "33327",
    timezone: "EST",
    lastNotes: "Gatekeeper is tough. Try calling during lunch.",
    status: "Called - No Answer",
    location_lat: 26.0866,
    location_lng: -80.3506,
    emailHistory: []
  },
  {
    id: "6",
    name: "Dr. Robert Lee",
    title: "Director of Cardiology",
    company: "Aventura Hospital & Medical Centers",
    phone: "(305) 682-7000",
    email: "rlee@aventurahospital.com",
    address: "20900 Biscayne Boulevard, Aventura, FL",
    zip: "33180",
    timezone: "EST",
    lastNotes: "Scheduled visit for product demo.",
    dealSize: "$200k",
    drServed: "Cardiology",
    status: "Visit Scheduled",
    location_lat: 25.9613,
    location_lng: -80.0831
  },
  {
    id: "7",
    name: "Jennifer Wu",
    title: "Clinic Manager",
    company: "Kendall Medical Center",
    phone: "(305) 270-1111",
    email: "jwu@kendallmed.com",
    address: "11520 South Dixie Highway, Miami, FL",
    zip: "33156",
    timezone: "EST",
    lastNotes: "Following up on proposal sent last week.",
    dealSize: "$80k",
    drServed: "General Practice",
    status: "Meeting Scheduled",
    location_lat: 25.6926,
    location_lng: -80.2949
  },
  {
    id: "8",
    name: "Dr. Alan Grant",
    title: "Orthopedic Surgeon",
    company: "Orthopedic Surgery Associates",
    phone: "(305) 375-4505",
    email: "agrant@osami.com",
    address: "5280 Sunset Drive, Miami, FL",
    zip: "33143",
    timezone: "EST",
    lastNotes: "Interested in joint replacement inventory tracking.",
    dealSize: "$150k",
    drServed: "Orthopedics",
    status: "Visit Scheduled",
    location_lat: 25.7487,
    location_lng: -80.2874
  },
  {
    id: "9",
    name: "Susan Miller",
    title: "Practice Administrator",
    company: "Wynwood Medical Associates",
    phone: "(305) 576-9090",
    email: "smiller@wynwoodmed.com",
    address: "2701 North Miami Avenue, Miami, FL",
    zip: "33127",
    timezone: "EST",
    lastNotes: "Needs to reschedule.",
    dealSize: "$45k",
    drServed: "General Practice",
    status: "Follow-up Needed",
    location_lat: 25.8282,
    location_lng: -80.1999
  },
  {
    id: "10",
    name: "Dr. Lisa Chang",
    title: "Dermatologist",
    company: "Miami Derm Institute",
    phone: "(305) 442-0011",
    email: "lchang@miamiderm.com",
    address: "4200 Ponce de Leon Boulevard, Coral Gables, FL",
    zip: "33146",
    timezone: "EST",
    lastNotes: "New lead from conference.",
    dealSize: "$30k",
    drServed: "Dermatology",
    status: "New",
    location_lat: 25.7425,
    location_lng: -80.2755
  },

  // DMV/DC AREA - CONTACTS 11-20
  {
    id: "11",
    name: "Mark Thompson",
    title: "Operations Director",
    company: "MedStar Health Washington Hospital",
    phone: "(202) 877-3627",
    email: "mthompson@medstar.net",
    address: "110 Irving Street NW, Washington, DC",
    zip: "20010",
    timezone: "EST",
    lastNotes: "Quarterly review meeting.",
    dealSize: "$110k",
    drServed: "General Practice",
    status: "Meeting Scheduled",
    location_lat: 38.9247,
    location_lng: -77.0265
  },
  {
    id: "12",
    name: "Dr. Patel",
    title: "Owner",
    company: "Bethesda Medical Associates",
    phone: "(301) 654-3000",
    email: "apatel@bethesdamed.com",
    address: "7910 Wisconsin Avenue, Bethesda, MD",
    zip: "20814",
    timezone: "EST",
    lastNotes: "Gatekeeper said to email.",
    dealSize: "$20k",
    drServed: "General Practice",
    status: "Email Sent",
    location_lat: 38.9823,
    location_lng: -77.0955
  },
  {
    id: "13",
    name: "Sarah Connor",
    title: "Clinic Supervisor",
    company: "Georgetown University Medical Center",
    phone: "(202) 444-2000",
    email: "sconnor@gumc.edu",
    address: "3800 Reservoir Road NW, Washington, DC",
    zip: "20007",
    timezone: "EST",
    lastNotes: "Checking inventory needs.",
    dealSize: "$90k",
    drServed: "General Practice",
    status: "Call Scheduled",
    location_lat: 38.9058,
    location_lng: -77.0726
  },
  {
    id: "14",
    name: "Dr. James Kim",
    title: "Nephrologist",
    company: "Arlington Hospital Nephrology",
    phone: "(703) 558-5000",
    email: "jkim@arlingtonhospital.org",
    address: "1701 N. George Mason Drive, Arlington, VA",
    zip: "22205",
    timezone: "EST",
    lastNotes: "Interested in dialysis scheduling module.",
    dealSize: "$65k",
    drServed: "Nephrology",
    status: "Visit Scheduled",
    location_lat: 38.8677,
    location_lng: -77.0987
  },
  {
    id: "15",
    name: "Emily Davis",
    title: "Office Manager",
    company: "Silver Spring Medical Dental",
    phone: "(301) 563-1234",
    email: "edavis@silverspringmedical.com",
    address: "8630 Colesville Road, Silver Spring, MD",
    zip: "20910",
    timezone: "EST",
    lastNotes: "Follow up in 2 weeks.",
    dealSize: "$15k",
    drServed: "Dentist",
    status: "Nurture",
    location_lat: 38.9932,
    location_lng: -77.0331
  },
  {
    id: "16",
    name: "David Anderson",
    title: "Practice Manager",
    company: "Fairfax Hospital Surgery Center",
    phone: "(703) 776-4001",
    email: "danderson@fairfaxhosp.org",
    address: "3601 University Drive, Fairfax, VA",
    zip: "22030",
    timezone: "EST",
    lastNotes: "Initial contact. Schedule follow-up.",
    dealSize: "$85k",
    drServed: "Orthopedics",
    status: "New",
    location_lat: 38.8408,
    location_lng: -77.3065
  },
  {
    id: "17",
    name: "Dr. Victoria Lewis",
    title: "Medical Director",
    company: "Howard University Hospital",
    phone: "(202) 865-6100",
    email: "vlewis@howard.edu",
    address: "2041 Georgia Avenue NW, Washington, DC",
    zip: "20060",
    timezone: "EST",
    lastNotes: "Connected last week. Awaiting proposal review.",
    dealSize: "$95k",
    drServed: "Cardiology",
    status: "Proposal Sent",
    location_lat: 38.9222,
    location_lng: -77.0222
  },
  {
    id: "18",
    name: "Robert Collins",
    title: "CEO",
    company: "Leesburg Outpatient Medical Center",
    phone: "(703) 771-3600",
    email: "rcollins@leesburgmed.com",
    address: "410 East Market Street, Leesburg, VA",
    zip: "20176",
    timezone: "EST",
    lastNotes: "Very interested. Demo scheduled for Friday.",
    dealSize: "$55k",
    drServed: "General Practice",
    status: "Demo/Presentation Complete",
    location_lat: 39.1147,
    location_lng: -77.5660
  },
  {
    id: "19",
    name: "Dr. Keisha Murphy",
    title: "Chief of Staff",
    company: "Prince George's Hospital System",
    phone: "(301) 618-2000",
    email: "kmurphy@pghs.org",
    address: "3001 Hospital Drive, Cheverly, MD",
    zip: "20785",
    timezone: "EST",
    lastNotes: "Waiting for budget approval. Check back next month.",
    dealSize: "$140k",
    drServed: "Pediatrics",
    status: "Negotiating",
    location_lat: 38.8578,
    location_lng: -76.8667
  },
  {
    id: "20",
    name: "Richard Jackson",
    title: "Operations Manager",
    company: "Alexandria Health Associates",
    phone: "(703) 549-2222",
    email: "rjackson@alexhealth.org",
    address: "2500 North Van Dorn Street, Alexandria, VA",
    zip: "22302",
    timezone: "EST",
    lastNotes: "Scheduled meeting for next Wednesday.",
    dealSize: "$72k",
    drServed: "Dermatology",
    status: "Meeting Scheduled",
    location_lat: 38.8213,
    location_lng: -77.0790
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
