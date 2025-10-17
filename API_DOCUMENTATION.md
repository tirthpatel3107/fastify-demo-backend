# SignatureRx Backend API Documentation

This backend provides APIs for prescription management with SignatureRx integration.

## Base URL
```
http://localhost:3000/api/v1
```

## Available Endpoints

### 1. OAuth2 Authentication

#### Get OAuth2 Token
- **Endpoint**: `POST /auth/token`
- **Description**: Get access token from SignatureRx using client credentials flow
- **Request Body**:
  ```json
  {
    "grant_type": "client_credentials",
    "client_id": "your_client_id",
    "client_secret": "your_client_secret",
    "scope": "prescriptions:issue"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "Bearer",
      "expires_in": 3600,
      "scope": "prescriptions:issue"
    },
    "message": "Token retrieved successfully"
  }
  ```

#### Test SignatureRx Connection
- **Endpoint**: `GET /auth/test-connection`
- **Description**: Test connection to SignatureRx API
- **Response**:
  ```json
  {
    "success": true,
    "message": "Successfully connected to SignatureRx API"
  }
  ```

#### Get Token Status
- **Endpoint**: `GET /auth/token-status`
- **Description**: Get current token cache status
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "cached": true,
      "expires_at": 1703123456789,
      "valid": true
    },
    "message": "Token status retrieved successfully"
  }
  ```

#### Clear Token Cache
- **Endpoint**: `DELETE /auth/token-cache`
- **Description**: Clear cached OAuth2 token
- **Response**:
  ```json
  {
    "success": true,
    "message": "Token cache cleared successfully"
  }
  ```

### 2. Prescription Management

#### Issue Prescription
- **Endpoint**: `POST /prescriptions/issue`
- **Description**: Issue a prescription for delivery using SignatureRx API
- **Request Body**:
  ```json
  {
    "patient": {
      "name": "John Doe",
      "dateOfBirth": "1990-01-15",
      "address": "123 Main Street, London, SW1A 1AA"
    },
    "medicine": {
      "name": "Paracetamol 500mg",
      "dosage": "1 tablet every 6 hours"
    },
    "delivery": {
      "type": "delivery",
      "address": "123 Main Street, London, SW1A 1AA"
    },
    "doctor": {
      "id": "doc_001",
      "name": "Dr. Smith"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "prescription_id": "presc_123456",
      "signatureRx_id": "srx_789012",
      "status": "Sent",
      "prescription_url": "https://app.signaturerx.co.uk/prescriptions/789012",
      "created_at": "2023-12-21T10:30:00.000Z"
    },
    "message": "Prescription issued successfully"
  }
  ```

#### Get Prescription Status
- **Endpoint**: `GET /prescriptions/{id}/status`
- **Description**: Get prescription status by ID
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "presc_123456",
      "status": "Delivered",
      "signatureRxId": "srx_789012",
      "prescriptionUrl": "https://app.signaturerx.co.uk/prescriptions/789012",
      "created_at": "2023-12-21T10:30:00.000Z",
      "updated_at": "2023-12-21T14:45:00.000Z"
    },
    "message": "Prescription status retrieved successfully"
  }
  ```

#### Get Available Medicines
- **Endpoint**: `GET /prescriptions/medicines`
- **Description**: Get list of available medicines for frontend dropdown
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "med_001",
        "name": "Paracetamol 500mg",
        "dosage": "1 tablet every 6 hours",
        "description": "Pain relief and fever reducer"
      },
      {
        "id": "med_002",
        "name": "Ibuprofen 400mg",
        "dosage": "1 tablet every 8 hours",
        "description": "Anti-inflammatory pain relief"
      }
    ],
    "message": "Available medicines retrieved successfully"
  }
  ```

#### Get Mock Patient Data
- **Endpoint**: `GET /prescriptions/patient/mock`
- **Description**: Get mock patient data for frontend testing
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "name": "John Doe",
      "dateOfBirth": "1990-01-15",
      "address": "123 Main Street, London, SW1A 1AA",
      "phone": "+44 20 7946 0958",
      "email": "john.doe@example.com"
    },
    "message": "Mock patient data retrieved successfully"
  }
  ```

### 3. Webhook Management

#### SignatureRx Webhook Endpoint
- **Endpoint**: `POST /webhooks/signaturerx`
- **Description**: Receive webhook events from SignatureRx API
- **Request Body**: (SignatureRx webhook payload)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Webhook received and processed successfully",
    "event_type": "prescription.delivered",
    "processed": true
  }
  ```

#### Get Webhook Logs
- **Endpoint**: `GET /webhooks/logs`
- **Description**: Get all webhook logs with pagination
- **Query Parameters**:
  - `limit` (optional): Number of logs per page (default: 10)
  - `skip` (optional): Number of logs to skip (default: 0)
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "webhook_123",
        "event_type": "prescription.delivered",
        "payload": {...},
        "received_at": "2023-12-21T14:45:00.000Z",
        "prescription_id": "presc_123456",
        "processed": true,
        "created_at": "2023-12-21T14:45:00.000Z",
        "updated_at": "2023-12-21T14:45:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "skip": 0,
      "hasMore": true
    }
  }
  ```

#### Get Webhook Statistics
- **Endpoint**: `GET /webhooks/stats/overview`
- **Description**: Get webhook processing statistics
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "total": 100,
      "processed": 95,
      "unprocessed": 5,
      "processing_rate": 95.0
    }
  }
  ```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "message": "Additional error details"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Frontend Integration

For the React + Vite frontend, you'll need these endpoints:

1. **GET /prescriptions/medicines** - Populate medicine dropdown
2. **GET /prescriptions/patient/mock** - Get mock patient data
3. **POST /prescriptions/issue** - Submit prescription
4. **GET /prescriptions/{id}/status** - Check prescription status

## Environment Variables

Make sure to set these environment variables:

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
PORT=3000
```
