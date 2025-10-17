import { FastifyInstance } from "fastify";
import { OAuth2Controller } from "../controllers";

export default async function oauth2Routes(fastify: FastifyInstance) {
  // Get OAuth2 token
  fastify.post("/token", OAuth2Controller.getToken);

  // Test SignatureRx API connection
  fastify.get("/test-connection", OAuth2Controller.testConnection);

  // Get token cache status
  fastify.get("/token-status", OAuth2Controller.getTokenStatus);

  // Clear token cache
  fastify.delete("/token-cache", OAuth2Controller.clearTokenCache);
}
