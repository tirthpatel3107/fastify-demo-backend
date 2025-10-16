import { FastifyInstance } from "fastify";
import { TokenController } from "../controllers";
import { catchAsync } from "../utils";

export default async function tokenRoutes(fastify: FastifyInstance) {
  // Create token
  fastify.post("/", catchAsync(TokenController.createToken));

  // Get token by ID
  fastify.get("/:id", catchAsync(TokenController.getTokenById));

  // Get token by access token
  fastify.get(
    "/access/:accessToken",
    catchAsync(TokenController.getTokenByAccessToken),
  );

  // Get tokens by user ID
  fastify.get("/user/:userId", catchAsync(TokenController.getTokensByUserId));

  // Update token
  fastify.put("/:id", catchAsync(TokenController.updateToken));

  // Delete token by ID
  fastify.delete("/:id", catchAsync(TokenController.deleteToken));

  // Delete tokens by user ID
  fastify.delete(
    "/user/:userId",
    catchAsync(TokenController.deleteTokensByUserId),
  );

  // Refresh token
  fastify.post("/refresh", catchAsync(TokenController.refreshToken));

  // Validate token
  fastify.get(
    "/validate/:accessToken",
    catchAsync(TokenController.validateToken),
  );

  // Clean up expired tokens
  fastify.delete(
    "/cleanup/expired",
    catchAsync(TokenController.cleanupExpiredTokens),
  );
}
