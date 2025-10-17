import { FastifyInstance } from "fastify";
import { API_START_POINT } from "../utils/constants";
import { webhookRoutes, oauth2Routes, prescriptionIssueRoutes } from "./index";

export const routeManager = (app: FastifyInstance) => {
  // Register only the essential routes for SignatureRx integration
  // This includes OAuth2 authentication, prescription management, and webhook handling

  // Webhook routes for receiving SignatureRx events
  app.register(webhookRoutes, { prefix: `${API_START_POINT}webhooks` });

  // OAuth2 routes for SignatureRx API authentication
  app.register(oauth2Routes, { prefix: `${API_START_POINT}auth` });

  // Prescription routes for issuing and managing prescriptions
  app.register(prescriptionIssueRoutes, {
    prefix: `${API_START_POINT}prescriptions`,
  });
};
