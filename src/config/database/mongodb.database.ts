import fastifyPlugin from "fastify-plugin";
import mongoose from "mongoose";
import type { FastifyInstance } from "fastify";
import logger from "../../utils/logger";

const connectToDb = async (
  fastify: FastifyInstance,
  _options: Record<string, any>
) => {
  try {
    await mongoose.connect(fastify.config.MONGODB_URI);

    logger.info("✅ MongoDB connected successfully");
  } catch (error) {
    logger.error("❌ MongoDB connection error: " + error);
    throw error;
  }
};

export const connectToMongoDB = fastifyPlugin(connectToDb);
