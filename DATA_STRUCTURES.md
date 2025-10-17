# Data Structures Documentation

## Core Data Structures

The backend now implements the exact data structures you specified:

### 1. TokenStore Interface
```typescript
interface TokenStore {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}
```

**Location**: `src/interfaces/index.ts`  
**Database Model**: `src/models/token.model.ts`  
**DAO**: `src/dao/token.dao.ts`

**Features**:
- Stores OAuth2 tokens with access_token, refresh_token, and expiry
- MongoDB collection: `tokens`
- Automatic expiry handling and cleanup
- Indexed for fast lookups

### 2. PrescriptionRequest Interface
```typescript
interface PrescriptionRequest {
  id: string;
  payload: object;
  status: "Pending" | "Sent" | "Delivered" | "Failed";
}
```

**Location**: `src/interfaces/index.ts`  
**Database Model**: `src/models/prescription.model.ts`  
**DAO**: `src/dao/prescription.dao.ts`

**Features**:
- Core prescription data structure
- Status tracking with enum values
- Flexible payload for additional data
- MongoDB collection: `prescriptions`

### 3. WebhookEvent Interface
```typescript
interface WebhookEvent {
  event_type: string;
  payload: object;
  received_at: string;
}
```

**Location**: `src/interfaces/index.ts`  
**Database Model**: `src/models/webhook.log.model.ts`  
**DAO**: `src/dao/webhook.log.dao.ts`

**Features**:
- Webhook event structure
- Flexible payload for any webhook data
- Timestamp tracking
- MongoDB collection: `webhook_logs`

## Extended Database Models

### Prescription (extends PrescriptionRequest)
```typescript
interface Prescription extends PrescriptionRequest {
  patient_name: string;
  patient_dob: string;
  patient_address: string;
  medication: string;
  dosage: string;
  delivery_type: "pickup" | "delivery";
  doctor_id: string;
  created_at: Date;
  updated_at: Date;
}
```

### WebhookLog (extends WebhookEvent)
```typescript
interface WebhookLog extends WebhookEvent {
  id: string;
  prescription_id?: string;
  processed: boolean;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}
```

## Database Collections

### 1. `tokens` Collection
```javascript
{
  _id: ObjectId,
  access_token: String,
  refresh_token: String,
  expires_at: Date,
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:
- `access_token` (unique)
- `expires_at` (for cleanup)
- `created_at` (for sorting)

### 2. `prescriptions` Collection
```javascript
{
  _id: ObjectId,
  patient_name: String,
  patient_dob: String,
  patient_address: String,
  medication: String,
  dosage: String,
  delivery_type: String, // "pickup" | "delivery"
  doctor_id: String,
  payload: Object,
  status: String, // "Pending" | "Sent" | "Delivered" | "Failed"
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:
- `doctor_id`
- `status`
- `patient_name`
- `created_at` (descending)
- `delivery_type`

### 3. `webhook_logs` Collection
```javascript
{
  _id: ObjectId,
  event_type: String,
  payload: Object,
  received_at: String,
  prescription_id: String,
  processed: Boolean,
  error_message: String,
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:
- `event_type`
- `prescription_id`
- `processed`
- `received_at`
- `created_at` (descending)

## API Integration

### OAuth2 Service
- Uses `TokenStore` interface for token management
- Stores tokens in database using `TokenDAO`
- Automatic token cleanup and validation

### Prescription Service
- Uses `PrescriptionRequest` and `Prescription` interfaces
- Stores prescription data with `PrescriptionDAO`
- Status tracking and updates

### Webhook Service
- Uses `WebhookEvent` and `WebhookLog` interfaces
- Stores webhook events with `WebhookLogDAO`
- Event processing and status updates

## Usage Examples

### Storing a Token
```typescript
const tokenStore: TokenStore = {
  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  expires_at: "2023-12-21T15:30:00.000Z"
};

await TokenDAO.create(tokenStore);
```

### Creating a Prescription
```typescript
const prescriptionRequest: PrescriptionRequest = {
  id: "presc_123456",
  payload: { signatureRxId: "srx_789012" },
  status: "Pending"
};

await PrescriptionDAO.create(prescriptionRequest);
```

### Logging a Webhook Event
```typescript
const webhookEvent: WebhookEvent = {
  event_type: "prescription.delivered",
  payload: { prescription_id: "presc_123456", status: "delivered" },
  received_at: "2023-12-21T15:30:00.000Z"
};

await WebhookLogDAO.create(webhookEvent);
```

## Data Validation

All data structures are validated using:
- **TypeScript interfaces** for compile-time validation
- **MongoDB schemas** for runtime validation
- **Zod schemas** for API request validation
- **Database constraints** for data integrity

The backend now fully implements your specified data structures with proper database integration! 🎯
