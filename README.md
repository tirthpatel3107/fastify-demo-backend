# SignatureRx Prescription Management Backend

A Fastify-based backend service for managing prescriptions with SignatureRx API integration.

## Features

- **OAuth2 Authentication**: Client credentials flow with automatic token caching and refresh
- **Prescription Management**: Issue prescriptions via SignatureRx API with retry logic
- **Webhook Processing**: Receive and process SignatureRx webhook events
- **Database Integration**: MongoDB for storing prescriptions and webhook logs
- **Error Handling**: Comprehensive error handling with structured responses
- **Rate Limiting**: Built-in rate limiting and security features

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your SignatureRx credentials
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Test Endpoints**
   ```bash
   node test-endpoints.js
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/token` - Get OAuth2 token
- `GET /api/v1/auth/test-connection` - Test SignatureRx connection
- `GET /api/v1/auth/token-status` - Get token cache status

### Prescriptions
- `POST /api/v1/prescriptions/issue` - Issue prescription
- `GET /api/v1/prescriptions/{id}/status` - Get prescription status
- `GET /api/v1/prescriptions/medicines` - Get available medicines
- `GET /api/v1/prescriptions/patient/mock` - Get mock patient data

### Webhooks
- `POST /api/v1/webhooks/signaturerx` - Receive SignatureRx webhooks
- `GET /api/v1/webhooks/logs` - Get webhook logs
- `GET /api/v1/webhooks/stats/overview` - Get webhook statistics

## Environment Variables

```env
# SignatureRx OAuth2 Configuration
SIGNATURERX_CLIENT_ID=your_client_id_here
SIGNATURERX_CLIENT_SECRET=your_client_secret_here
SIGNATURERX_SCOPE=prescriptions:issue
SIGNATURERX_TOKEN_URL=https://app.signaturerx.co.uk/api/auth/token
SIGNATURERX_BASE_URL=https://app.signaturerx.co.uk/api
SIGNATURERX_PRESCRIPTIONS_URL=/prescriptions/issueForDelivery

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/fastify-demo-backend

# Server Configuration
NODE_ENV=development
PORT=3000
```

## Frontend Integration

This backend is designed to work with a React + Vite frontend. The frontend can:

1. **Get Medicine List**: Call `GET /prescriptions/medicines` to populate dropdown
2. **Get Mock Patient**: Call `GET /prescriptions/patient/mock` for testing
3. **Issue Prescription**: Call `POST /prescriptions/issue` with prescription data
4. **Check Status**: Call `GET /prescriptions/{id}/status` to check prescription status

## Architecture

```
src/
├── app.ts                 # Main Fastify application
├── server.ts              # Server startup
├── config/                # Configuration files
├── controllers/           # Request handlers
├── services/              # Business logic
├── models/                # Database models
├── dao/                   # Data access objects
├── route/                 # API routes
└── utils/                 # Utility functions
```

## Development

- **Build**: `npm run build`
- **Start**: `npm start`
- **Format**: `npm run format`

## License

ISC