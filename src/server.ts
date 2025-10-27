import app from "./app";
import logger from "./utils/logger";
import mongoose from "mongoose";

const start = async () => {
  try {
    // Wait for the app to be ready so that plugins are registered
    await app.ready();

    const PORT = app.config.PORT || 3000;

    await app.listen({ port: Number(PORT) });
    logger.info(`🚀 Server is working on PORT: ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info(`📴 Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close the Fastify server
    await app.close();
    logger.info("✅ Fastify server closed");

    // Close MongoDB connection
    await mongoose.connection.close();
    logger.info("✅ MongoDB connection closed");

    logger.info("✅ Graceful shutdown completed");
    process.exit(0);
  } catch (err) {
    logger.error("❌ Error during graceful shutdown:", err);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

start();
