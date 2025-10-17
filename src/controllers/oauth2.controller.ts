import { FastifyRequest, FastifyReply } from "fastify";
import { OAuth2Service, SignatureRxService } from "../services";
import { OAuth2TokenRequestSchema } from "../utils/schemas";
import { STATUS } from "../utils/enums";
import logger from "../utils/logger";

export class OAuth2Controller {
  /**
   * Get OAuth2 token from SignatureRx
   */
  static async getToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Validate request body
      const validationResult = OAuth2TokenRequestSchema.safeParse(request.body);
      if (!validationResult.success) {
        return reply.code(STATUS.BAD_REQUEST).send({
          success: false,
          error: "Invalid request data",
          details: validationResult.error.issues,
        });
      }

      const tokenData = validationResult.data;

      // Get valid token
      const accessToken = await OAuth2Service.getValidToken(
        request.server.config,
      );

      // Get token info for response
      const tokenInfo = OAuth2Service.getTokenInfo();

      logger.info("OAuth2 token retrieved successfully");

      return reply.code(STATUS.SUCCESS).send({
        success: true,
        data: {
          access_token: accessToken,
          token_type: "Bearer",
          expires_in: tokenInfo.expires_at
            ? Math.floor((tokenInfo.expires_at - Date.now()) / 1000)
            : 3600,
          scope: tokenData.scope,
        },
        message: "Token retrieved successfully",
      });
    } catch (error: any) {
      logger.error(`Error getting OAuth2 token: ${error.message}`);
      return reply.code(STATUS.SERVER_ERROR).send({
        success: false,
        error: "Failed to get OAuth2 token",
        message: error.message,
      });
    }
  }

  /**
   * Test SignatureRx API connection
   */
  static async testConnection(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await SignatureRxService.testConnection(
        request.server.config,
      );

      if (result.success) {
        return reply.code(STATUS.SUCCESS).send({
          success: true,
          message: result.message,
        });
      } else {
        return reply.code(STATUS.SERVER_ERROR).send({
          success: false,
          error: result.message,
        });
      }
    } catch (error: any) {
      logger.error(`Error testing SignatureRx connection: ${error.message}`);
      return reply.code(STATUS.SERVER_ERROR).send({
        success: false,
        error: "Failed to test SignatureRx connection",
        message: error.message,
      });
    }
  }

  /**
   * Get token cache status
   */
  static async getTokenStatus(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const tokenInfo = OAuth2Service.getTokenInfo();

      return reply.code(STATUS.SUCCESS).send({
        success: true,
        data: tokenInfo,
        message: "Token status retrieved successfully",
      });
    } catch (error: any) {
      logger.error(`Error getting token status: ${error.message}`);
      return reply.code(STATUS.SERVER_ERROR).send({
        success: false,
        error: "Failed to get token status",
        message: error.message,
      });
    }
  }

  /**
   * Clear token cache
   */
  static async clearTokenCache(_request: FastifyRequest, reply: FastifyReply) {
    try {
      OAuth2Service.clearCachedToken();

      logger.info("OAuth2 token cache cleared manually");

      return reply.code(STATUS.SUCCESS).send({
        success: true,
        message: "Token cache cleared successfully",
      });
    } catch (error: any) {
      logger.error(`Error clearing token cache: ${error.message}`);
      return reply.code(STATUS.SERVER_ERROR).send({
        success: false,
        error: "Failed to clear token cache",
        message: error.message,
      });
    }
  }
}
