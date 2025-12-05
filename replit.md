# CRM Dialer Application

## Overview
A comprehensive CRM system with contact management and Smart Calling & Route Optimization capabilities. The system includes intelligent address lookup using HERE Maps API, RBAC permissions, stakeholder management, and LiveKit-powered browser-based calling.

## Recent Changes
- **2024-12-01**: Added Map Selection tab to Lead Management tool
  - New interactive map view to visualize search results geographically
  - Click markers or sidebar items to select multiple leads
  - Select All / Clear selection buttons for bulk operations
  - Add selected leads to Unassigned Pool with one click
  - Shares search results with Lead Discovery tab for seamless workflow
- **2024-11-28**: Added Admin Impersonation feature and User Profile pages
  - Admins can now "View As" any user to see the app from their perspective
  - New User Profile page at /users/:id showing user details, territories, and professions
  - Impersonation banner shows when viewing as another user with exit button
  - Leaderboard users and User Assignments now link to individual user profiles
  - UserRoleContext extended with actualRole vs effectiveRole for impersonation
- **2024-11-28**: Added multi-territory and multi-profession user assignments
  - Users can now be assigned to multiple territories (Miami, Washington DC, Los Angeles, New York, Chicago, Dallas)
  - Users can be assigned to multiple professions (Dental, Chiropractor, Optometry, Physical Therapy, Orthodontics, Legal, Financial, Real Estate)
  - New "User Assignments" tab in Settings for admins/managers to manage assignments
  - Junction tables (user_territories, user_professions) for many-to-many relationships
- **2024-12-05**: Replaced Twilio with LiveKit for browser-based audio calling
  - LiveKit WebRTC-based calling with room management
  - Call controls: Start call, end call, mute/unmute, DTMF dialpad
  - Backend endpoints for LiveKit token generation and room management
  - Frontend hook: useLiveKitDevice for call state management

## Project Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Phone System**: LiveKit WebRTC

### Key Directories
- `client/src/pages/` - Page components
- `client/src/components/crm/` - CRM-specific components
- `client/src/hooks/` - Custom React hooks (including useLiveKitDevice)
- `server/routes.ts` - API endpoints
- `server/services/` - Backend services (livekit.ts, geocoding.ts, optimization.ts)
- `shared/schema.ts` - Database schema and types

## LiveKit Integration

### Required Environment Variables
The following secrets must be set for LiveKit calling to work:
- `LIVEKIT_API_KEY` - Your LiveKit API Key
- `LIVEKIT_API_SECRET` - Your LiveKit API Secret
- `LIVEKIT_URL` - Your LiveKit server URL (e.g., wss://your-project.livekit.cloud)

### Setting Up LiveKit
1. Create a LiveKit Cloud account at cloud.livekit.io
2. Create a new project in the LiveKit dashboard
3. Go to Settings > Keys to get your API Key and API Secret
4. Copy the WebSocket URL from your project settings

### API Endpoints
- `GET /api/livekit/config` - Check LiveKit configuration status
- `POST /api/livekit/token` - Generate access token for browser client
- `POST /api/livekit/call` - Create a call room and get token
- `POST /api/livekit/end-call` - End call and record outcome

### Browser Calling
The dialer uses LiveKit Client SDK for WebRTC-based audio calling. The `useLiveKitDevice` hook manages:
- Room connection and audio track publishing
- Making outbound calls
- Call controls (mute, hangup, DTMF)
- Call status tracking
- Automatic audio playback handling

## Twilio Integration (Legacy)

Twilio credentials are still configured but LiveKit is now the primary calling system.
The following Twilio secrets may still be present:
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_API_KEY`, `TWILIO_API_SECRET`
- `TWILIO_PHONE_NUMBER`, `TWILIO_TWIML_APP_SID`

## Admin Impersonation

Administrators can view the application from any user's perspective:
- Click "View As User" button in the sidebar to open the user dropdown
- Select a user to impersonate and see the app as they would see it
- An amber banner displays at the top showing who you're viewing as
- Click the X on the banner to exit impersonation and return to admin view
- The effectiveRole determines the dashboard view and permissions shown
- The actualRole (admin) is preserved to allow exiting impersonation

### User Profile Pages
Individual user profiles are available at `/users/:id`:
- Shows user details (name, email, role, active status)
- Displays assigned territories and professions
- Admins/managers can edit assignments directly on the profile
- "View As" button allows direct impersonation from the profile page
- Activity summary section (placeholder for future metrics)

## User Preferences
- Specialty colors are user-settable via Settings > Specialty Colors
- Call outcome colors are customizable with intensity levels (50-900) for green, yellow, red

## Development Notes
- Database seeding runs automatically on startup
- Use `npm run db:push` to sync schema changes
- Call outcomes are stored in the database, not hardcoded

## Security Notes (Production)
This is a prototype/mockup application. For production deployment:
- **Authentication**: Add proper session-based authentication (e.g., Passport.js, Replit Auth)
- **Authorization**: The user assignment routes (`/api/users/:id/territories`, `/api/users/:id/professions`) currently rely on frontend role enforcement only. Add server-side middleware to verify admin/manager roles
- **API Protection**: All API routes should require authentication in production
