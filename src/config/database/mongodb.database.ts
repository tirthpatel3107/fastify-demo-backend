import { FastifyInstance } from "fastify";
import fastifyMongo from "@fastify/mongodb";
import logger from "../../utils/logger";

const connectToMongoDB = async (fastify: FastifyInstance) => {
  try {
    await fastify.register(fastifyMongo, {
      forceClose: true,
      url: process.env["MONGODB_URI"] || "",
    });

    logger.info("✅ MongoDB connected successfully");
  } catch (error) {
    logger.error("❌ MongoDB connection error: " + error);
    throw error;
  }
};

export default connectToMongoDB;
