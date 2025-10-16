import { z } from "zod";

// OAuth2 Token Request Schema
export const OAuth2TokenRequestSchema = z.object({
  grant_type: z.literal("client_credentials"),
  client_id: z.string().min(1, "Client ID is required"),
  client_secret: z.string().min(1, "Client secret is required"),
  scope: z.string().min(1, "Scope is required"),
});

// Prescription Issue Request Schema
export const PrescriptionIssueRequestSchema = z.object({
  patient: z.object({
    name: z.string().min(1, "Patient name is required").max(100, "Patient name too long"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    address: z.string().min(1, "Patient address is required").max(500, "Address too long"),
  }),
  medicine: z.object({
    name: z.string().min(1, "Medicine name is required").max(100, "Medicine name too long"),
    dosage: z.string().min(1, "Dosage is required").max(100, "Dosage too long"),
  }),
  delivery: z.object({
    type: z.enum(["pickup", "delivery"]),
    address: z.string().max(500, "Delivery address too long").optional(),
  }),
  doctor: z.object({
    id: z.string().min(1, "Doctor ID is required"),
    name: z.string().min(1, "Doctor name is required").max(100, "Doctor name too long"),
  }),
});

// Prescription Issue Response Schema
export const PrescriptionIssueResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    status: z.string(),
    prescription_url: z.string().optional(),
    created_at: z.string(),
    updated_at: z.string(),
  }).optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// OAuth2 Token Response Schema
export const OAuth2TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  scope: z.string().optional(),
});

// Error Response Schema
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string().optional(),
});

export type OAuth2TokenRequest = z.infer<typeof OAuth2TokenRequestSchema>;
export type PrescriptionIssueRequest = z.infer<typeof PrescriptionIssueRequestSchema>;
export type PrescriptionIssueResponse = z.infer<typeof PrescriptionIssueResponseSchema>;
export type OAuth2TokenResponse = z.infer<typeof OAuth2TokenResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
