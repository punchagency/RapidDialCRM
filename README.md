# QuantumPunch

A HIPAA-compliant CRM system designed for healthcare sales teams managing high-volume sales calls (30-50 calls/day). Built with modern web technologies and security at its core.

## 🎯 Overview

QuantumPunch is a comprehensive sales management platform specifically engineered for the healthcare industry. It provides four distinct user interfaces tailored to different roles—inside sales reps, field sales reps, managers, and lead loaders—each with customized dashboards, workflows, and features.

## 🔐 HIPAA Compliance

QuantumPunch is built from the ground up to meet and exceed HIPAA standards for safeguarding Protected Health Information (PHI):

- **End-to-End Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Access Controls**: Role-Based Access Control (RBAC) with Multi-Factor Authentication (MFA)
- **Audit Logging**: Immutable audit trails for all data access and modifications
- **Business Associate Agreement**: Full BAA compliance for covered entities
- **Physical Security**: SOC 2 Type II and ISO 27001 certified infrastructure
- **Vulnerability Management**: Weekly security scans and annual penetration testing

Read more: [HIPAA Compliance & Security](/hipaa)

## 👥 User Roles

### Inside Sales Reps
- **Power Dialer Integration**: QuantumPunch API telephony for efficient cold calling
- **Daily Call Goals**: Track calls made vs. targets
- **Call Outcome Tracking**: Customizable call statuses with color coding and icons
- **Contact Management**: Quick access to customer information during calls

### Field Sales Reps
- **Interactive Territory Mapping**: OpenStreetMap integration for route planning
- **Visit Goals**: Track daily appointments and meeting targets
- **Real-time Route Planning**: Optimize visit sequences and travel time
- **Territory Management**: Monitor assigned accounts and prospects

### Managers
- **Performance Dashboards**: Real-time metrics for team productivity
- **Multi-tab Analytics**:
  - Call Review: Inside rep performance tracking
  - Field Rep Metrics: Visit goals, route efficiency, territory coverage
  - Inside Rep Metrics: Call volume, conversion rates, outcomes
- **Team Org Chart**: Visual hierarchy and team structure
- **Reporting & Insights**: Team-wide performance analytics

### Lead Loaders
- **Bulk Import**: Manage large-scale lead pipeline uploads
- **Data Quality Metrics**: Track upload success rates and data accuracy
- **Lead Pipeline Management**: Monitor lead status from upload to assignment
- **Update Speed Visibility**: Performance metrics on data processing

## ✨ Key Features

### Core Functionality
- **Email Tracking**: Integration with professional email templates
- **Google Calendar Sync**: Automatic appointment scheduling and updates
- **Gamification**: Points, leaderboards, and achievement badges to drive engagement
- **Profession-Specific Templates**: Pre-built email and communication templates by industry
- **Contact Management**: Comprehensive contact database with custom fields

### Contacts & Stakeholders
- **Client Admin Contacts**: Required contact point for account management
- **Provider Contacts**: Medical/clinical decision makers
- **Contact Cards**: Click-through to Power Dialer for seamless calling

### Settings & Configuration
- **Custom Call Statuses**: Define unlimited call outcome types with colors and icons
- **Team Structure Management**: Build and manage organization hierarchies
- **Security Settings**: Control access permissions and authentication
- **Integration Settings**: Connect to external services (Google Calendar, Email, etc.)
- **Professional Customization**: Configure profession types, templates, and notification rules

## 🛠 Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **Wouter** - Lightweight routing
- **React Query** - Server state management

### Styling & Design
- **Tailwind CSS** - Responsive design
- **Tailwind Merge** - Class composition
- **Radix UI** - Accessible components
- **Framer Motion** - Animations and transitions

### Maps & Location
- **Leaflet** - Interactive map library
- **React Leaflet** - React bindings for Leaflet

### Forms & Validation
- **React Hook Form** - Efficient form management
- **Zod** - TypeScript-first schema validation
- **Drizzle ORM** - Type-safe database queries

### Notifications & UX
- **Sonner** - Toast notifications
- **React Day Picker** - Date selection components

## 📁 Project Structure

```
client/
├── src/
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx    # Role-specific dashboards
│   │   ├── Dialer.tsx       # Power Dialer interface
│   │   ├── Settings.tsx     # Settings management
│   │   ├── Contacts.tsx     # Contact management
│   │   ├── HipaaCompliance.tsx
│   │   └── ...
│   ├── components/          # Reusable React components
│   │   ├── layout/          # Layout components (Sidebar, Header, etc.)
│   │   ├── crm/             # CRM-specific components
│   │   └── ui/              # UI components (buttons, forms, etc.)
│   ├── lib/                 # Utilities and context
│   │   ├── UserRoleContext.tsx
│   │   ├── statusUtils.ts
│   │   └── ...
│   └── App.tsx              # Main app component
├── index.html
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd quantumpunch
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run type-check` - Run TypeScript type checking

## 🎨 Design System

The application uses a cohesive Miami-inspired aesthetic with:
- **Color Palette**: Primary pink/magenta with emerald accents for security
- **Typography**: Bold display fonts paired with clean body fonts
- **Spacing**: Generous whitespace and considered layouts
- **Depth**: Subtle shadows, gradients, and backdrop effects
- **Interactions**: Smooth transitions and responsive hover states

## 📊 Data Management

- **Local State**: React hooks for component state
- **Global State**: UserRoleContext for role management
- **Server State**: React Query for API data
- **Persistence**: LocalStorage for client-side preferences

## 🔒 Security Features

- Role-based access control per user
- Immutable audit logs for all actions
- Encrypted data storage
- Secure session management
- HIPAA-compliant data handling

## 📝 Testing

Test IDs are added to all interactive elements and meaningful information displays following the pattern:
- Interactive: `{action}-{target}` (e.g., `button-submit`)
- Display: `{type}-{content}` (e.g., `text-username`)
- Dynamic: `{type}-{description}-{id}` (e.g., `card-product-${id}`)

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📜 License

This project is proprietary and confidential. All rights reserved.

## 📞 Support

For issues, feature requests, or questions about HIPAA compliance, please contact the development team.

---

Built with ❤️ for healthcare sales teams.
