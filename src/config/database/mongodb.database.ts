import fastifyPlugin from "fastify-plugin";
import mongoose from "mongoose";
import type { FastifyInstance, FastifyPluginCallback } from "fastify";
import logger from "../../utils/logger";

const connectToDb: FastifyPluginCallback = async (
  _fastify: FastifyInstance,
  _options: Record<string, any>,
  done: (err?: Error | undefined) => void,
) => {
  try {
    logger.info("Initializing MongoDB connection...");

    await mongoose.connect(process.env["MONGODB_URI"]!, {
      dbName: process.env["MONGODB_DATABASE_NAME"]!,
    });

    logger.info("✅ MongoDB connected successfully");
    done();
  } catch (error) {
    logger.error("❌ MongoDB connection error: " + error);
    done(error as Error);
  }
};

export const connectToMongoDB = fastifyPlugin(connectToDb);
