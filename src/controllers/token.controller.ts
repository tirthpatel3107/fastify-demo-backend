import { FastifyRequest, FastifyReply } from 'fastify';
import { TokenService } from '../services';
import { Token } from '../interfaces';
import { STATUS } from '../utils/enums';

export class TokenController {
  /**
   * Create a new token
   */
  static async createToken(request: FastifyRequest, reply: FastifyReply) {
    const tokenData = request.body as Omit<Token, 'id' | 'created_at' | 'updated_at'>;
    
    const token = await TokenService.createToken(tokenData);
    
    return reply.code(STATUS.CREATE).send({
      success: true,
      data: token,
      message: 'Token created successfully'
    });
  }

  /**
   * Get token by ID
   */
  static async getTokenById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    
    const token = await TokenService.getTokenById(id);
    
    if (!token) {
      return reply.code(STATUS.NOT_FOUND).send({
        success: false,
        error: 'Token not found'
      });
    }
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: token,
      message: 'Token retrieved successfully'
    });
  }

  /**
   * Get token by access token
   */
  static async getTokenByAccessToken(request: FastifyRequest, reply: FastifyReply) {
    const { accessToken } = request.params as { accessToken: string };
    
    const token = await TokenService.getTokenByAccessToken(accessToken);
    
    if (!token) {
      return reply.code(STATUS.NOT_FOUND).send({
        success: false,
        error: 'Token not found'
      });
    }
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: token,
      message: 'Token retrieved successfully'
    });
  }

  /**
   * Get tokens by user ID
   */
  static async getTokensByUserId(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request.params as { userId: string };
    
    const tokens = await TokenService.getTokensByUserId(userId);
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: tokens,
      message: 'Tokens retrieved successfully'
    });
  }

  /**
   * Update token
   */
  static async updateToken(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const updateData = request.body as Partial<Token>;
    
    const token = await TokenService.updateToken(id, updateData);
    
    if (!token) {
      return reply.code(STATUS.NOT_FOUND).send({
        success: false,
        error: 'Token not found'
      });
    }
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: token,
      message: 'Token updated successfully'
    });
  }

  /**
   * Delete token by ID
   */
  static async deleteToken(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    
    const result = await TokenService.deleteToken(id);
    
    if (!result) {
      return reply.code(STATUS.NOT_FOUND).send({
        success: false,
        error: 'Token not found'
      });
    }
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      message: 'Token deleted successfully'
    });
  }

  /**
   * Delete tokens by user ID
   */
  static async deleteTokensByUserId(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request.params as { userId: string };
    
    const deletedCount = await TokenService.deleteTokensByUserId(userId);
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: { deletedCount },
      message: `${deletedCount} tokens deleted successfully`
    });
  }

  /**
   * Refresh token
   */
  static async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken, newAccessToken, newExpiresAt } = request.body as { 
      refreshToken: string; 
      newAccessToken: string; 
      newExpiresAt: string; 
    };
    
    const newToken = await TokenService.refreshToken(refreshToken, newAccessToken, newExpiresAt);
    
    if (!newToken) {
      return reply.code(STATUS.BAD_REQUEST).send({
        success: false,
        error: 'Invalid or expired refresh token'
      });
    }
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: newToken,
      message: 'Token refreshed successfully'
    });
  }

  /**
   * Validate token
   */
  static async validateToken(request: FastifyRequest, reply: FastifyReply) {
    const { accessToken } = request.params as { accessToken: string };
    
    const isValid = await TokenService.validateToken(accessToken);
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: { valid: isValid },
      message: isValid ? 'Token is valid' : 'Token is invalid or expired'
    });
  }

  /**
   * Clean up expired tokens
   */
  static async cleanupExpiredTokens(_request: FastifyRequest, reply: FastifyReply) {
    const deletedCount = await TokenService.cleanupExpiredTokens();
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: { deletedCount },
      message: `${deletedCount} expired tokens cleaned up successfully`
    });
  }
}
