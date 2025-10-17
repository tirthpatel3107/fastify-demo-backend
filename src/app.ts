import Fastify from "fastify";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyCors from "@fastify/cors";
import { buildFastifyEnvPlugin } from "./config/env.config";
import { connectToMongoDB } from "./config/database/mongodb.database";
import { routeManager } from "./route/route.manager";
import { AppError, createErrorResponse } from "./utils/errorHandler";
import { STATUS } from "./utils/enums";

// Fastify application for SignatureRx prescription management system
// This backend handles OAuth2 authentication, prescription issuing, and webhook processing
const app = Fastify({ logger: true });

// Register environment configuration plugin
app.register(buildFastifyEnvPlugin);

// Register security plugins
app.register(fastifyHelmet);
app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: "1 minute",
});
app.register(fastifyCors, {
  origin: true,
});

// Database connection with timeout configuration
app.register(connectToMongoDB, {
  timeout: 15000 // 15 seconds timeout for database connection
});

// Importing Routes
routeManager(app);

// Global error handler
app.setErrorHandler((error, _request, reply) => {
  const errorResponse = createErrorResponse(error);
  const statusCode =
    error instanceof AppError ? error.statusCode : STATUS.SERVER_ERROR;

  reply.code(statusCode).send(errorResponse);
});

export default app;
