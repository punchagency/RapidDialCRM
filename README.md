# RapidDialCRM Client

Frontend application for RapidDialCRM - a modern, responsive sales and appointment scheduling CRM system.

## Overview

This is the React/Vite frontend that provides:

- Intuitive UI for managing prospects,appointments, and field reps
- Interactive maps for territory visualization
- Real-time calling features with Twilio
- LiveKit integration for communications
- Responsive design with Tailwind CSS
- Component library built with Radix UI

## Prerequisites

- Node.js 18+ and npm
- Running RapidDialCRM server (see server README)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

3. Update `.env.local` with your values:

```env
VITE_API_URL=http://localhost:5000
VITE_HERE_API_KEY=your_here_api_key
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (Vite's default port)

**Important**: Make sure the backend server is running at `http://localhost:5000` before starting the client.

## Environment Variables

### Required Variables

- `VITE_API_URL` - Backend API URL (default: `http://localhost:5000`)

### Optional Variables

- `VITE_HERE_API_KEY` - HERE Maps API key for map features (falls back to server-side geocoding if not set)

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run check` - Type-check TypeScript

## Features

### Core Features

- **Prospect Management** - Create, view, and update business prospects
- **Appointment Scheduling** - Schedule and manage field appointments
- **Territory Management** - Visualize prospects on interactive maps
- **Call Management** - Make calls directly from the app via Twilio
- **Real-time Communication** - LiveKit integration for voice/video
- **User Management** - Role-based access control (RBAC)

### UI Components

- Built with React 19 and modern hooks
- Shadcn/ui component library (Radix UI primitives)
- Tailwind CSS for styling
- Dark mode support
- Responsive design for mobile and desktop

## Project Structure

```
client-new/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (shadcn/ui)
│   │   └── ...             # Feature-specific components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and helpers
│   │   ├── api.ts          # API client functions
│   │   └── utils.ts        # General utilities
│   ├── pages/              # Route pages/views
│   ├── App.tsx             # Main app component with routing
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── index.html             # HTML entry point
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── components.json        # Shadcn/ui configuration
└── package.json
```

## Building for Production

Create a production build:

```bash
npm run build
```

This generates optimized static files in the `dist/` directory.

Preview the production build locally:

```bash
npm run preview
```

## Deployment

The built `dist/` folder can be deployed to any static hosting service:

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket
- **GitHub Pages**: Deploy `dist/` folder

**Important**: Update `VITE_API_URL` to point to your production API server.

## API Integration

The client communicates with the backend via REST API. All API calls go through `/api/*` endpoints.

During development, Vite proxies these requests to the backend server (configured in `vite.config.ts`).

In production, ensure your deployment handles API routing correctly or update `VITE_API_URL` to the full backend URL.

## Common Development Tasks

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in relevant component

### Adding a New UI Component

1. For shadcn/ui components: Use the CLI or copy from shadcn/ui docs
2. Place in `src/components/ui/`
3. Import and use in your pages/components

### Making API Calls

1. Define API function in `src/lib/api.ts`
2. Use React Query hooks in components for data fetching
3. Handle loading and error states

## Troubleshooting

### Cannot connect to API

- Verify backend server is running on port 5000
- Check `VITE_API_URL` in `.env.local`
- Check browser console for CORS errors

### Maps not loading

- Verify `VITE_HERE_API_KEY` is set
- Check browser console for API key errors
- Ensure key has correct permissions

### Build errors

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check TypeScript errors: `npm run check`

### Hot reload not working

- Check Vite dev server is running
- Try restarting the dev server
- Clear browser cache

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **State Management**: React Query (TanStack Query)
- **Routing**: Wouter
- **Forms**: React Hook Form + Zod
- **Maps**: Leaflet + React Leaflet
- **Charts**: Recharts
- **Icons**: Lucide React

## License

MIT
