# Anonymous Chat Application

A real-time anonymous chat application with premium features, built with React, Express, and PostgreSQL.

## Features

- **Anonymous Chat**: Random user matching for private conversations
- **Device Fingerprinting**: Persistent user identification across sessions
- **Premium Features**: Stripe-powered subscriptions with advanced features
- **Email Binding**: Optional email for premium users to recover access
- **Real-time Messaging**: WebSocket-based instant messaging
- **Mobile Responsive**: Optimized for both desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, WebSocket (ws library)
- **Database**: PostgreSQL with Drizzle ORM
- **Payments**: Stripe for subscription management
- **Deployment**: Render with Docker support

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon Database recommended)
- Stripe account for payments

### Environment Variables

Create a `.env` file with:

```env
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### Installation

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the server
npm start
```

### Development

```bash
# Start in development mode
npm run dev
```

## Deployment on Render

### Method 1: Using Blueprint (Recommended)

1. Fork this repository to your GitHub account
2. Connect your GitHub account to Render
3. Create a new Web Service and select this repository
4. Render will automatically detect the `render.yaml` configuration
5. Add your environment variables in the Render dashboard
6. Deploy!

### Method 2: Manual Setup

1. Create a new Web Service on Render
2. Connect your repository
3. Use these settings:
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
   - **Node Version**: `18`
4. Add environment variables
5. Deploy

### Environment Variables on Render

Add these environment variables in your Render dashboard:

- `NODE_ENV`: `production`
- `DATABASE_URL`: Your PostgreSQL connection string
- `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with `sk_`)
- `VITE_STRIPE_PUBLIC_KEY`: Your Stripe public key (starts with `pk_`)

### Database Setup

1. Create a PostgreSQL database (Neon Database recommended)
2. Add the connection string to `DATABASE_URL`
3. Run database migrations: `npm run db:push`

### Stripe Setup

1. Create a Stripe account
2. Get your API keys from the Stripe dashboard
3. Add the keys to your environment variables
4. Create subscription products in your Stripe dashboard

## API Endpoints

- `GET /api/stats` - Get online user count
- `GET /api/users/me` - Get current user info
- `PUT /api/users/email` - Update user email
- `DELETE /api/users/email` - Remove user email
- `POST /api/create-payment-intent` - Create payment intent
- `POST /api/create-subscription` - Create subscription
- `WebSocket /ws` - Real-time messaging

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── pages/          # Page components
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes and WebSocket
│   ├── storage.ts         # Data storage layer
│   └── production.ts      # Production server config
├── shared/                 # Shared types and schemas
└── render.yaml            # Render deployment config
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details