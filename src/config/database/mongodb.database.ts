import fastifyPlugin from "fastify-plugin";
import mongoose from "mongoose";
import type { FastifyInstance, FastifyPluginCallback } from "fastify";
import logger from "../../utils/logger";

const connectToDb: FastifyPluginCallback = async (
  fastify: FastifyInstance,
  _options: Record<string, any>,
  done: (err?: Error | undefined) => void,
) => {
  try {
    logger.info("Initializing MongoDB connection...");

    await mongoose.connect(fastify.config.MONGODB_URI);

    logger.info("✅ MongoDB connected successfully");
    done();
  } catch (error) {
    logger.error("❌ MongoDB connection error: " + error);
    done(error as Error);
  }
};

export const connectToMongoDB = fastifyPlugin(connectToDb);
