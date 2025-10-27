import { z } from "zod";

// OAuth2 Token Request Schema
export const OAuth2TokenRequestSchema = z.object({
  grant_type: z.literal("client_credentials"),
  client_id: z.string().min(1, "Client ID is required"),
  client_secret: z.string().min(1, "Client secret is required"),
  scope: z.string().min(1, "Scope is required"),
});

export type OAuth2TokenRequest = z.infer<typeof OAuth2TokenRequestSchema>;
