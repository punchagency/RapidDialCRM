# CRM Dialer Application

## Overview
A comprehensive CRM system with contact management and Smart Calling & Route Optimization capabilities. The system includes intelligent address lookup using HERE Maps API, RBAC permissions, stakeholder management, and Twilio-powered browser-based calling.

## Recent Changes
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
- **2024-11-27**: Added Twilio integration for browser-based audio calling with full dialer interface
- Call controls: Start call, end call, mute/unmute, DTMF dialpad
- Backend endpoints for Twilio token generation and TwiML voice handling

## Project Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Phone System**: Twilio Voice SDK

### Key Directories
- `client/src/pages/` - Page components
- `client/src/components/crm/` - CRM-specific components
- `client/src/hooks/` - Custom React hooks (including useTwilioDevice)
- `server/routes.ts` - API endpoints
- `server/services/` - Backend services (twilio.ts, geocoding.ts, optimization.ts)
- `shared/schema.ts` - Database schema and types

## Twilio Integration

### Required Environment Variables
The following secrets must be set for Twilio calling to work:
- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_API_KEY` - Your Twilio API Key SID (starts with SK...)
- `TWILIO_API_SECRET` - Your Twilio API Key Secret (used to sign access tokens)
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number (with country code, e.g., +1XXXXXXXXXX)
- `TWILIO_TWIML_APP_SID` - TwiML App SID for browser-initiated calls

### Setting Up Twilio
1. Create a Twilio account at twilio.com
2. Get your Account SID and Auth Token from the Twilio Console dashboard
3. Create an API Key: Console > Account > API Keys & Tokens > Create API Key
   - Copy the SID (starts with SK...) as TWILIO_API_KEY
   - Copy the Secret as TWILIO_API_SECRET (shown only once!)
4. Get or buy a phone number: Console > Phone Numbers > Manage > Buy a Number
5. Create a TwiML App: Console > Voice > TwiML Apps > Create TwiML App
   - Set the Voice Request URL to your app's /api/twilio/voice endpoint
   - Copy the SID as TWILIO_TWIML_APP_SID

### API Endpoints
- `POST /api/twilio/token` - Generate access token for browser client
- `POST /api/twilio/voice` - TwiML endpoint for handling calls
- `POST /api/twilio/call` - Initiate outbound call
- `POST /api/twilio/status` - Call status webhook
- `GET /api/twilio/config` - Check Twilio configuration status

### Browser Calling
The dialer uses Twilio Client SDK v1.14 loaded dynamically in the browser. The `useTwilioDevice` hook manages:
- Device initialization and token refresh
- Making outbound calls
- Call controls (mute, hangup, DTMF)
- Call status tracking

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
