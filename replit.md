# Anonymous Chat Application

## Overview

This is a full-stack anonymous chat application built with React, Express, and PostgreSQL. The application allows users to connect with random strangers for one-on-one conversations in a completely anonymous environment. It features a modern UI with dark theme styling, real-time communication via WebSockets, and premium subscription functionality powered by Stripe.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom dark theme variables
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Payment Integration**: Stripe React components for subscription handling
- **Device Identification**: Custom fingerprinting system for user persistence

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ES modules
- **Real-time Communication**: WebSocket Server (ws library)
- **Session Management**: In-memory storage with Map-based data structures
- **Payment Processing**: Stripe API integration
- **Development**: Hot reload with Vite middleware integration
- **User Identification**: Device fingerprinting + optional email binding

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon Database)
- **Schema**: Enhanced user table with device fingerprint and email fields
- **Migrations**: Managed through Drizzle Kit

## Key Components

### Database Schema
- **users**: Stores user sessions, device fingerprints, optional email, premium status, and Stripe customer information
- **chatSessions**: Tracks active chat sessions between two users
- **messages**: Stores all chat messages with timestamps and sender information

### User Identification System
- **Device Fingerprinting**: Uses browser/device characteristics for persistent user identification
- **Optional Email Binding**: Premium users can add email for cross-device access recovery
- **Session Recovery**: Users maintain premium status across device changes via fingerprinting
- **Privacy-First**: Email is optional and only used for premium feature recovery

### Real-time Communication
- WebSocket server handles connection management and message routing
- Connection state tracked via Map data structures
- Message types: join, find_partner, send_message, disconnect

### Storage Layer
- Interface-based storage design (IStorage)
- Current implementation uses in-memory storage (MemStorage)
- Supports user management, chat sessions, and message persistence

### UI Components
- Mobile-first responsive design
- Dark theme with custom CSS variables
- Comprehensive component library including forms, dialogs, and navigation
- Loading states and error handling

## Data Flow

1. **User Connection**: Client establishes WebSocket connection with unique session ID
2. **Partner Matching**: Server maintains queue of waiting users for random pairing
3. **Chat Session**: Once matched, users can exchange messages in real-time
4. **Message Routing**: Server routes messages between connected partners
5. **Session Management**: Chat sessions are tracked and can be terminated by either user

## External Dependencies

### Payment Processing
- **Stripe**: Handles subscription creation, payment processing, and customer management
- **Integration**: Both client-side (Stripe Elements) and server-side (Stripe API)

### Database
- **Neon Database**: PostgreSQL hosting service
- **Connection**: Uses @neondatabase/serverless for optimal performance

### UI Framework
- **Radix UI**: Accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Comprehensive icon library

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations managed via `db:push` command

### Environment Configuration
- **Development**: Uses Vite dev server with Express middleware
- **Production**: Serves static files from Express with WebSocket support
- **Database**: Requires DATABASE_URL environment variable
- **Payments**: Requires STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY

### Key Features
- **Anonymous Matching**: Users are paired randomly without identity disclosure
- **Real-time Messaging**: Instant message delivery via WebSockets
- **Premium Features**: Stripe-powered subscriptions with 50% reduced pricing
- **Device Fingerprinting**: Persistent user identification without personal data
- **Optional Email Binding**: Premium users can add email for cross-device recovery
- **Settings Page**: Device info, email management, and account status
- **Mobile Optimized**: Responsive design for mobile and desktop
- **Session Persistence**: Messages and chat state maintained during sessions

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and scalable real-time communication patterns.