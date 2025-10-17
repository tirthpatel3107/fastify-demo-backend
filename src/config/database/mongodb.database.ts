import fastifyPlugin from "fastify-plugin";
import mongoose from "mongoose";
import type { FastifyInstance } from "fastify";
import logger from "../../utils/logger";

const connectToDb = async (
  fastify: FastifyInstance,
  _options: Record<string, any>
) => {
  try {
    // Configure mongoose connection options for better timeout handling
    const mongooseOptions = {
      serverSelectionTimeoutMS: 5000, // 5 seconds
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 1, // Maintain a minimum of 1 socket connection
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    };

    await mongoose.connect(fastify.config.MONGODB_URI, mongooseOptions);

    logger.info("✅ MongoDB connected successfully");
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on('reconnected', () => {
      logger.info("🔄 MongoDB reconnected");
    });

  } catch (error) {
    logger.error("❌ MongoDB connection error: " + error);
    throw error;
  }
};

export const connectToMongoDB = fastifyPlugin(connectToDb);
