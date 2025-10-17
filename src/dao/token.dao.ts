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
   * Get token by access token
   */
  static async getByAccessToken(
    accessToken: string,
  ): Promise<TokenDocument | null> {
    try {
      return await TokenModel.findOne({ access_token: accessToken });
    } catch (error) {
      logger.error(`Error getting token by access token: ${error}`);
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
   * Update token
   */
  static async updateByAccessToken(
    accessToken: string,
    updateData: Partial<TokenStore>,
  ): Promise<TokenDocument | null> {
    try {
      const updateObj: any = { ...updateData };
      if (updateData.expires_at) {
        updateObj.expires_at = new Date(updateData.expires_at);
      }

      return await TokenModel.findOneAndUpdate(
        { access_token: accessToken },
        updateObj,
        { new: true },
      );
    } catch (error) {
      logger.error(`Error updating token: ${error}`);
      throw error;
    }
  }

  /**
   * Delete token by access token
   */
  static async deleteByAccessToken(accessToken: string): Promise<boolean> {
    try {
      const result = await TokenModel.deleteOne({ access_token: accessToken });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error(`Error deleting token: ${error}`);
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

  /**
   * Get all tokens
   */
  static async getAll(
    limit: number = 10,
    skip: number = 0,
  ): Promise<TokenDocument[]> {
    try {
      return await TokenModel.find()
        .sort({ created_at: -1 })
        .limit(limit)
        .skip(skip);
    } catch (error) {
      logger.error(`Error getting all tokens: ${error}`);
      throw error;
    }
  }

  /**
   * Get token count
   */
  static async getCount(): Promise<number> {
    try {
      return await TokenModel.countDocuments();
    } catch (error) {
      logger.error(`Error getting token count: ${error}`);
      throw error;
    }
  }
}
