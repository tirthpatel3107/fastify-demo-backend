import dotenv from "dotenv";
dotenv.config(); // Set env file

import Fastify from "fastify";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyCors from "@fastify/cors";
import { connectToMongoDB } from "./config/database/mongodb.database";
// import { routeManager } from "./route/route.manager";
import { AppError, createErrorResponse } from "./utils/errorHandler";
import { STATUS } from "./utils/enums";

const app = Fastify({ logger: true });

// Register security plugins
app.register(fastifyHelmet);
app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: "1 minute",
});
app.register(fastifyCors, {
  origin: true,
});

// Database connection
app.register(connectToMongoDB);

// Importing Routes
// routeManager(app);

// Global error handler
app.setErrorHandler((error, _request, reply) => {
  const errorResponse = createErrorResponse(error);
  const statusCode =
    error instanceof AppError ? error.statusCode : STATUS.SERVER_ERROR;

  reply.code(statusCode).send(errorResponse);
});

export default app;
