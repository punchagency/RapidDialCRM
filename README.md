# RapidDial CRM Client

A modern, responsive React frontend for the RapidDial CRM system, built with TypeScript, Vite, and React Query.

## 🚀 Features

- **Modern React**: Built with React 19 and latest hooks
- **TypeScript**: Full type safety throughout the application
- **React Query**: Powerful data fetching and caching with TanStack Query
- **Custom API Integration**: Centralized API client with automatic error handling
- **Real-time Communication**: LiveKit integration for voice/video calls
- **Interactive Maps**: Leaflet maps for territory visualization
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Component Library**: Radix UI primitives with shadcn/ui
- **Role-Based Access**: Permission-based UI rendering
- **Issue Tracking**: Integrated issue reporting with Linear sync

## 📋 Prerequisites

- Node.js 18+ and yarn
- Running CRM backend server (see `crm-backend/README.md`)
- (Optional) HERE Maps API key for geocoding features
- (Optional) Twilio/LiveKit credentials for calling features

## 🛠️ Installation

1. **Navigate to the client directory:**
   ```bash
   cd web-crm-client
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your `.env.local` file:**
   ```env
   # Backend API URL
   VITE_CUSTOM_SERVER_URL=http://localhost:3001

   # Optional: HERE Maps API Key
   VITE_HERE_API_KEY=your_here_api_key
   ```

## 🏃 Running the Application

### Development Mode
```bash
yarn dev
```

The application will be available at `http://localhost:5173` (Vite's default port).

**Important**: Ensure the backend server is running at the URL specified in `VITE_CUSTOM_SERVER_URL`.

### Production Build
```bash
yarn build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build
```bash
yarn preview
```

### Type Checking
```bash
yarn check
```

## 📁 Project Structure

```
web-crm-client/
├── src/
│   ├── App.tsx                    # Main app component with routing
│   ├── main.tsx                   # Application entry point
│   ├── index.css                  # Global styles
│   │
│   ├── components/
│   │   ├── ui/                    # Base UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...                # 40+ UI components
│   │   │
│   │   ├── crm/                   # CRM-specific components
│   │   │   ├── DialerCard.tsx     # Call dialer interface
│   │   │   ├── ProspectCard.tsx   # Prospect display card
│   │   │   ├── IssueTracker.tsx   # Issue reporting
│   │   │   ├── GamificationWidget.tsx
│   │   │   ├── CSVImporter.tsx
│   │   │   ├── FileUploadModal.tsx
│   │   │   └── ...
│   │   │
│   │   └── layout/
│   │       └── Sidebar.tsx        # Main navigation sidebar
│   │
│   ├── pages/                     # Route pages/views
│   │   ├── Dashboard.tsx          # Main dashboard
│   │   ├── Contacts.tsx           # Prospect management
│   │   ├── Dialer.tsx             # Calling interface
│   │   ├── FieldReps.tsx         # Field rep management
│   │   ├── FieldSales.tsx        # Field sales view
│   │   ├── Settings.tsx          # Application settings
│   │   ├── Issues.tsx            # Issue management
│   │   ├── LeadLoader.tsx        # Lead import
│   │   ├── BulkImport.tsx        # Bulk operations
│   │   └── ...
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useProspects.ts       # Prospect data hooks
│   │   ├── useUsers.ts          # User data hooks
│   │   ├── useFieldReps.ts      # Field rep hooks
│   │   ├── useAppointments.ts   # Appointment hooks
│   │   ├── useCallOutcomes.ts   # Call outcome hooks
│   │   ├── useIssues.ts         # Issue hooks
│   │   ├── useSpecialtyColors.ts # Specialty color hooks
│   │   ├── useLiveKitDevice.ts  # LiveKit integration
│   │   ├── useTwilioDevice.ts   # Twilio integration
│   │   └── ...
│   │
│   ├── integrations/
│   │   └── custom-server/       # Backend API integration
│   │       ├── api.ts           # CustomServerApi class
│   │       ├── client.ts        # HTTP client wrapper
│   │       ├── config.ts        # API configuration
│   │       └── endpoints.ts     # API endpoint definitions
│   │
│   ├── lib/                      # Utilities and helpers
│   │   ├── types.ts             # TypeScript type definitions
│   │   ├── utils.ts             # General utilities
│   │   ├── queryClient.ts       # React Query configuration
│   │   ├── permissions.ts       # Permission utilities
│   │   ├── UserRoleContext.tsx  # User role context
│   │   ├── specialtyColors.ts   # Specialty color utilities
│   │   ├── statusUtils.ts       # Status utilities
│   │   └── ...
│   │
│   └── services/                 # Service layer (legacy)
│       └── ...
│
├── public/                       # Static assets
├── index.html                    # HTML entry point
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── components.json              # Shadcn/ui configuration
└── package.json
```

## 🏗️ Architecture

### API Integration

The application uses a centralized API client (`CustomServerApi`) that:
- Handles all HTTP requests to the backend
- Automatically extracts data from backend response format
- Manages authentication tokens
- Provides type-safe API methods
- Handles errors consistently

**Location**: `src/integrations/custom-server/api.ts`

### React Query Hooks

Custom hooks built on React Query provide:
- Automatic caching and refetching
- Loading and error states
- Optimistic updates
- Query invalidation
- Type-safe data fetching

Example:
```typescript
import { useProspects } from '@/hooks/useProspects';

function MyComponent() {
  const { data: prospects, isLoading, error } = useProspects();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{prospects.map(p => <div key={p.id}>{p.name}</div>)}</div>;
}
```

### Component Structure

- **UI Components**: Reusable base components from shadcn/ui
- **CRM Components**: Business logic components for CRM features
- **Pages**: Full-page components that represent routes
- **Layout**: Shared layout components (Sidebar, etc.)

## 📡 API Integration

### Custom Server API

All API calls go through `CustomServerApi` class located in `src/integrations/custom-server/api.ts`.

**Available API Methods:**
- `getProspects()` - Fetch prospects
- `getUsers()` - Fetch users
- `getFieldReps()` - Fetch field reps
- `createAppointment()` - Create appointment
- `recordCallOutcome()` - Record call outcome
- And many more...

### Using API Hooks

Instead of calling `CustomServerApi` directly, use the provided hooks:

```typescript
// ✅ Good: Use hooks
import { useProspects } from '@/hooks/useProspects';
const { data } = useProspects();

// ❌ Avoid: Direct API calls in components
import { CustomServerApi } from '@/integrations/custom-server/api';
const data = await CustomServerApi.getProspects();
```

### Available Hooks

- **Prospects**: `useProspects()`, `useProspect(id)`, `useCreateProspect()`, `useUpdateProspect()`
- **Users**: `useUsers()`, `useUser(id)`, `useCreateUser()`, `useUpdateUser()`, `useUserAssignments()`, `useSetUserAssignments()`
- **Field Reps**: `useFieldReps()`, `useCreateFieldRep()`, `useUpdateFieldRep()`
- **Appointments**: `useTodayAppointments()`, `useCreateAppointment()`, `useUpdateAppointment()`
- **Call Outcomes**: `useCallOutcomes()`, `useCreateCallOutcome()`, `useRecordCallOutcome()`
- **Issues**: `useIssues()`, `useCreateIssue()`, `useUpdateIssue()`, `useDeleteIssue()`
- **Specialty Colors**: `useSpecialtyColors()`, `useUpdateSpecialtyColor()`

## 🎨 Styling

### Tailwind CSS

The application uses Tailwind CSS 4 for styling:
- Utility-first CSS framework
- Responsive design utilities
- Dark mode support (via `next-themes`)
- Custom theme configuration in `tailwind.config.js`

### Component Styling

Components use:
- **Tailwind utilities**: For layout and spacing
- **CSS variables**: For theming
- **cn() utility**: For conditional class names (from `lib/utils.ts`)

## 🔐 Authentication & Permissions

### User Roles

The application supports role-based access control:
- `admin` - Full access
- `manager` - Management access
- `inside_sales_rep` - Inside sales access
- `field_sales_rep` - Field sales access
- `data_loader` - Data loading access

### Permission Guards

Use `PermissionGuard` component to protect routes:
```typescript
<PermissionGuard requiredRole="manager">
  <AdminPanel />
</PermissionGuard>
```

## 🗺️ Features

### Core Features

- **Prospect Management**: Create, view, update, and manage business prospects
- **Appointment Scheduling**: Schedule and manage field appointments
- **Territory Management**: Visualize prospects on interactive maps
- **Call Management**: Make calls directly from the app via Twilio/LiveKit
- **Real-time Communication**: LiveKit integration for voice/video
- **User Management**: Role-based access control and user assignments
- **Issue Tracking**: Report and track issues with Linear integration
- **Bulk Operations**: Import contacts, geocode addresses, bulk search
- **Lead Import**: CSV import functionality for bulk contact addition

### UI Features

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Dark Mode**: System-aware dark mode support
- **Interactive Maps**: Leaflet maps for territory visualization
- **Data Tables**: Sortable, filterable tables
- **Forms**: React Hook Form with Zod validation
- **Modals & Dialogs**: Accessible modal components
- **Toast Notifications**: User feedback via toast messages

## 🧪 Development

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`:
   ```typescript
   import NewPage from './pages/NewPage';
   
   <Route path="/new-page" component={NewPage} />
   ```
3. Add navigation link in `src/components/layout/Sidebar.tsx`

### Adding a New API Hook

1. Create hook file in `src/hooks/`
2. Use `CustomServerApi` methods
3. Set up React Query with proper query keys
4. Export hook for use in components

Example:
```typescript
import { useQuery } from '@tanstack/react-query';
import { CustomServerApi } from '@/integrations/custom-server/api';

export function useMyData() {
  return useQuery({
    queryKey: ['myData'],
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getMyData();
      if (error) throw new Error(error);
      return data || [];
    },
  });
}
```

### Adding a New UI Component

1. For shadcn/ui components:
   ```bash
   npx shadcn@latest add [component-name]
   ```

2. For custom components:
   - Place in `src/components/ui/` or `src/components/crm/`
   - Follow existing component patterns
   - Use TypeScript for props

## 🐛 Troubleshooting

### Cannot Connect to Backend

- Verify backend server is running
- Check `VITE_CUSTOM_SERVER_URL` in `.env.local`
- Check browser console for CORS errors
- Verify backend is accessible at the configured URL

### Build Errors

- Clear node_modules: `rm -rf node_modules && yarn install`
- Clear Vite cache: `rm -rf .vite`
- Check TypeScript errors: `yarn check`
- Verify all environment variables are set

### Hot Reload Not Working

- Restart the dev server
- Clear browser cache
- Check for syntax errors in console
- Verify file watchers are working

### Type Errors

- Run `yarn check` to see all TypeScript errors
- Ensure all imports are correct
- Check that types are properly exported
- Verify `tsconfig.json` configuration

## 📦 Key Dependencies

### Core
- **react**: ^19.2.0
- **react-dom**: ^19.2.0
- **typescript**: 5.6.3
- **vite**: ^7.1.9

### UI & Styling
- **@radix-ui/react-***: Radix UI primitives
- **tailwindcss**: ^4.1.14
- **lucide-react**: Icons
- **framer-motion**: Animations

### Data & State
- **@tanstack/react-query**: ^5.60.5 - Data fetching and caching
- **wouter**: ^3.3.5 - Routing

### Forms & Validation
- **react-hook-form**: ^7.66.0
- **zod**: ^3.25.76

### Maps & Visualization
- **leaflet**: ^1.9.4
- **react-leaflet**: ^5.0.0
- **recharts**: ^2.15.4

### Communication
- **livekit-client**: ^2.16.0

## 🚀 Deployment

### Build for Production

```bash
yarn build
```

This generates optimized static files in the `dist/` directory.

### Deployment Options

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket
- **GitHub Pages**: Deploy `dist/` folder

**Important**: Update `VITE_CUSTOM_SERVER_URL` to point to your production API server.

### Environment Variables in Production

Set environment variables in your hosting platform:
- `VITE_CUSTOM_SERVER_URL` - Production API URL
- `VITE_HERE_API_KEY` - (Optional) HERE Maps API key

## 📄 License

MIT
