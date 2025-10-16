import { FastifyInstance } from "fastify";
import { API_START_POINT } from "../utils/constants";
import {
  userRoutes,
  prescriptionRoutes,
  webhookRoutes,
  tokenRoutes,
} from "./index";

export const routeManager = (app: FastifyInstance) => {
  // Register all module routes
  app.register(userRoutes, { prefix: `${API_START_POINT}users` });
  app.register(prescriptionRoutes, {
    prefix: `${API_START_POINT}prescriptions`,
  });
  app.register(webhookRoutes, { prefix: `${API_START_POINT}webhooks` });
  app.register(tokenRoutes, { prefix: `${API_START_POINT}tokens` });
};
