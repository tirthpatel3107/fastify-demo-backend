import { TokenDAO } from '../dao';
import { Token } from '../interfaces';
import { TokenDocument } from '../models';
import logger from '../utils/logger';

// Helper function to convert TokenDocument to Token
const convertToToken = (doc: TokenDocument): Token => ({
  id: (doc._id as any).toString(),
  user_id: doc.user_id,
  access_token: doc.access_token,
  refresh_token: doc.refresh_token,
  expires_at: doc.expires_at,
  created_at: doc.created_at,
  updated_at: doc.updated_at
});

export class TokenService {
  /**
   * Create a new token
   */
  static async createToken(tokenData: Omit<Token, 'id' | 'created_at' | 'updated_at'>): Promise<Token> {
    try {
      // Clean up any existing tokens for this user
      await TokenDAO.deleteByUserId(tokenData.user_id);

      const token = await TokenDAO.create(tokenData);
      logger.info(`Token created successfully for user: ${token.user_id}`);
      return convertToToken(token);
    } catch (error) {
      logger.error(`Error creating token: ${error}`);
      throw error;
    }
  }

  /**
   * Get token by ID
   */
  static async getTokenById(id: string): Promise<Token | null> {
    try {
      const token = await TokenDAO.getById(id);
      return token ? convertToToken(token) : null;
    } catch (error) {
      logger.error(`Error getting token by ID: ${error}`);
      throw error;
    }
  }

  /**
   * Get token by access token
   */
  static async getTokenByAccessToken(accessToken: string): Promise<Token | null> {
    try {
      const token = await TokenDAO.getByAccessToken(accessToken);
      if (!token) {
        return null;
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(token.expires_at);
      
      if (now > expiresAt) {
        // Token is expired, clean it up
        await TokenDAO.deleteById(token.id);
        return null;
      }

      return convertToToken(token);
    } catch (error) {
      logger.error(`Error getting token by access token: ${error}`);
      throw error;
    }
  }

  /**
   * Get token by refresh token
   */
  static async getTokenByRefreshToken(refreshToken: string): Promise<Token | null> {
    try {
      const token = await TokenDAO.getByRefreshToken(refreshToken);
      if (!token) {
        return null;
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(token.expires_at);
      
      if (now > expiresAt) {
        // Token is expired, clean it up
        await TokenDAO.deleteById(token.id);
        return null;
      }

      return convertToToken(token);
    } catch (error) {
      logger.error(`Error getting token by refresh token: ${error}`);
      throw error;
    }
  }

  /**
   * Get tokens by user ID
   */
  static async getTokensByUserId(userId: string): Promise<Token[]> {
    try {
      const tokens = await TokenDAO.getByUserId(userId);
      return tokens.map(token => convertToToken(token));
    } catch (error) {
      logger.error(`Error getting tokens by user ID: ${error}`);
      throw error;
    }
  }

  /**
   * Update token
   */
  static async updateToken(id: string, updateData: Partial<Token>): Promise<Token | null> {
    try {
      const token = await TokenDAO.updateById(id, updateData);
      if (token) {
        logger.info(`Token updated successfully: ${id}`);
      }
      return token ? convertToToken(token) : null;
    } catch (error) {
      logger.error(`Error updating token: ${error}`);
      throw error;
    }
  }

  /**
   * Delete token by ID
   */
  static async deleteToken(id: string): Promise<boolean> {
    try {
      const result = await TokenDAO.deleteById(id);
      if (result) {
        logger.info(`Token deleted successfully: ${id}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error deleting token: ${error}`);
      throw error;
    }
  }

  /**
   * Delete tokens by user ID
   */
  static async deleteTokensByUserId(userId: string): Promise<number> {
    try {
      const deletedCount = await TokenDAO.deleteByUserId(userId);
      logger.info(`Deleted ${deletedCount} tokens for user: ${userId}`);
      return deletedCount;
    } catch (error) {
      logger.error(`Error deleting tokens by user ID: ${error}`);
      throw error;
    }
  }

  /**
   * Refresh token
   */
  static async refreshToken(refreshToken: string, newAccessToken: string, newExpiresAt: string): Promise<Token | null> {
    try {
      const existingToken = await TokenDAO.getByRefreshToken(refreshToken);
      if (!existingToken) {
        throw new Error('Invalid refresh token');
      }

      // Check if refresh token is expired
      const now = new Date();
      const expiresAt = new Date(existingToken.expires_at);
      
      if (now > expiresAt) {
        await TokenDAO.deleteById(existingToken.id);
        throw new Error('Refresh token expired');
      }

      // Update with new access token and expiration
      const updatedToken = await TokenDAO.updateById(existingToken.id, {
        access_token: newAccessToken,
        expires_at: newExpiresAt
      });

      logger.info(`Token refreshed successfully for user: ${existingToken.user_id}`);
      return updatedToken ? convertToToken(updatedToken) : null;
    } catch (error) {
      logger.error(`Error refreshing token: ${error}`);
      throw error;
    }
  }

  /**
   * Validate token
   */
  static async validateToken(accessToken: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
    try {
      const token = await this.getTokenByAccessToken(accessToken);
      
      if (!token) {
        return {
          valid: false,
          error: 'Token not found or expired'
        };
      }

      return {
        valid: true,
        userId: token.user_id
      };
    } catch (error) {
      logger.error(`Error validating token: ${error}`);
      return {
        valid: false,
        error: `Token validation failed: ${error}`
      };
    }
  }

  /**
   * Clean up expired tokens
   */
  static async cleanupExpiredTokens(): Promise<number> {
    try {
      const deletedCount = await TokenDAO.cleanupExpiredTokens();
      logger.info(`Cleaned up ${deletedCount} expired tokens`);
      return deletedCount;
    } catch (error) {
      logger.error(`Error cleaning up expired tokens: ${error}`);
      throw error;
    }
  }

  /**
   * Generate token expiration date
   */
  static generateExpirationDate(hoursFromNow: number = 1): string {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + hoursFromNow);
    return expirationDate.toISOString();
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(expiresAt: string): boolean {
    const now = new Date();
    const expirationDate = new Date(expiresAt);
    return now > expirationDate;
  }
}
