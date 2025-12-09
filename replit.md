# LeadSense CRM

## Overview

LeadSense is a lead management and CRM application built for sales teams. It provides functionality for loading, managing, and organizing sales leads with territory-based assignment, contact management, and field sales visualization. The application features a React frontend with a component-based architecture using modern UI libraries.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: shadcn/ui component library (built on Radix UI primitives)
- **Styling**: Tailwind CSS with utility-first approach
- **State Management**: React hooks (useState) for local component state
- **Routing**: Client-side routing structure with pages directory

### Component Organization
- **Pages**: Feature-specific pages (e.g., LeadLoader.tsx) that compose layouts and components
- **Layouts**: Shared layout components like Sidebar for consistent navigation
- **UI Components**: Reusable UI primitives from shadcn/ui (Card, Button, Input, Table, etc.)

### Design Patterns
- **Component Composition**: Pages built from smaller, reusable UI components
- **Mock Data Pattern**: Currently uses mock data constants for development (MOCK_SEARCH_RESULTS, MOCK_POOL)
- **Type-Safe Development**: TypeScript interfaces for data structures (SearchResult, SubContact)

### Key Features Structure
- **Lead Loading**: Search and import leads from external sources
- **Territory Management**: Geographic organization of leads by city/region
- **Contact Management**: SubContact support for managing multiple contacts per account

## External Dependencies

### UI Framework
- **React 18+**: Core UI library
- **Radix UI**: Headless UI primitives (via shadcn/ui)
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Build & Development
- **Vite**: Development server and build tooling
- **TypeScript**: Type checking and enhanced developer experience

### Component Libraries
- **shadcn/ui components**: Button, Card, Input, Label, Tabs, ScrollArea, Badge, Table, Select, Checkbox, Separator
- **Custom hooks**: useToast for notifications

### Utilities
- **cn utility**: Class name merging (likely clsx + tailwind-merge)

### Data Layer
- **Current State**: Mock data in component files
- **Future Integration**: Backend API integration expected (Express/Node.js pattern typical for Replit templates)
- **Database Ready**: Structure supports Drizzle ORM integration when database is added