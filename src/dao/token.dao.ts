import { TokenModel, TokenDocument } from "../models";
import { TokenStore } from "../interfaces";
import logger from "../utils/logger";

export class TokenDAO {
  /**
   * Create a new token
   */
  static async create(tokenData: TokenStore): Promise<TokenDocument> {
    try {
      const token = new TokenModel({
        ...tokenData,
        expires_at: new Date(tokenData.expires_at), // Convert string to Date
      });
      return await token.save();
    } catch (error) {
      logger.error(`Error creating token: ${error}`);
      throw error;
    }
  }

  /**
   * Get valid token (not expired)
   */
  static async getValidToken(): Promise<TokenDocument | null> {
    try {
      const now = new Date();
      return await TokenModel.findOne({
        expires_at: { $gt: now },
      }).sort({ created_at: -1 });
    } catch (error) {
      logger.error(`Error getting valid token: ${error}`);
      throw error;
    }
  }

  /**
   * Delete expired tokens
   */
  static async deleteExpiredTokens(): Promise<number> {
    try {
      const now = new Date();
      const result = await TokenModel.deleteMany({
        expires_at: { $lt: now },
      });
      return result.deletedCount;
    } catch (error) {
      logger.error(`Error deleting expired tokens: ${error}`);
      throw error;
    }
  }
}
