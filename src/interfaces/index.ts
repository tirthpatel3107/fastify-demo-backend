// Core interfaces for the prescription system

export interface TokenStore {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface PrescriptionRequest {
  id: string;
  payload: object;
  status: "Pending" | "Sent" | "Delivered" | "Failed";
}

export interface WebhookEvent {
  event_type: string;
  payload: object;
  received_at: string;
}

// Extended interfaces for database operations
export interface User {
  id: string;
  name: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  created_at: Date;
  updated_at: Date;
}

export interface Token extends TokenStore {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Prescription extends PrescriptionRequest {
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

export interface WebhookLog extends WebhookEvent {
  id: string;
  prescription_id?: string | undefined;
  processed: boolean;
  error_message?: string | undefined;
  created_at: Date;
  updated_at: Date;
}

// Request/Response DTOs
export interface CreatePrescriptionRequest {
  patient_name: string;
  patient_dob: string;
  patient_address: string;
  medication: string;
  dosage: string;
  delivery_type: "pickup" | "delivery";
  doctor_id: string;
}

export interface UpdatePrescriptionRequest {
  id: string;
  status?: "Pending" | "Sent" | "Delivered" | "Failed";
  payload?: object;
}

export interface UpdatePrescriptionData {
  status?: "Pending" | "Sent" | "Delivered" | "Failed";
  payload?: object;
}

export interface PrescriptionResponse {
  success: boolean;
  data?: Prescription;
  message?: string;
  error?: string;
}

export interface WebhookResponse {
  success: boolean;
  data?: WebhookLog;
  message?: string;
  error?: string;
}
