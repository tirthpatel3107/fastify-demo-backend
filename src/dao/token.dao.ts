import { TokenModel, TokenDocument } from "../models";
import { Token } from "../interfaces";

export class TokenDAO {
  /**
   * Create a new token
   */
  static async create(
    tokenData: Omit<Token, "id" | "created_at" | "updated_at">,
  ): Promise<TokenDocument> {
    try {
      const token = new TokenModel(tokenData);
      return await token.save();
    } catch (error) {
      throw new Error(`Failed to create token: ${error}`);
    }
  }

  /**
   * Get token by ID
   */
  static async getById(id: string): Promise<TokenDocument | null> {
    try {
      return await TokenModel.findById(id);
    } catch (error) {
      throw new Error(`Failed to get token by ID: ${error}`);
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
      throw new Error(`Failed to get token by access token: ${error}`);
    }
  }

  /**
   * Get token by refresh token
   */
  static async getByRefreshToken(
    refreshToken: string,
  ): Promise<TokenDocument | null> {
    try {
      return await TokenModel.findOne({ refresh_token: refreshToken });
    } catch (error) {
      throw new Error(`Failed to get token by refresh token: ${error}`);
    }
  }

  /**
   * Get tokens by user ID
   */
  static async getByUserId(userId: string): Promise<TokenDocument[]> {
    try {
      return await TokenModel.find({ user_id: userId }).sort({
        created_at: -1,
      });
    } catch (error) {
      throw new Error(`Failed to get tokens by user ID: ${error}`);
    }
  }

  /**
   * Update token by ID
   */
  static async updateById(
    id: string,
    updateData: Partial<Token>,
  ): Promise<TokenDocument | null> {
    try {
      return await TokenModel.findByIdAndUpdate(
        id,
        { ...updateData, updated_at: new Date() },
        { new: true, runValidators: true },
      );
    } catch (error) {
      throw new Error(`Failed to update token: ${error}`);
    }
  }

  /**
   * Delete token by ID
   */
  static async deleteById(id: string): Promise<boolean> {
    try {
      const result = await TokenModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new Error(`Failed to delete token: ${error}`);
    }
  }

  /**
   * Delete tokens by user ID
   */
  static async deleteByUserId(userId: string): Promise<number> {
    try {
      const result = await TokenModel.deleteMany({ user_id: userId });
      return result.deletedCount || 0;
    } catch (error) {
      throw new Error(`Failed to delete tokens by user ID: ${error}`);
    }
  }

  /**
   * Clean up expired tokens
   */
  static async cleanupExpiredTokens(): Promise<number> {
    try {
      const now = new Date().toISOString();
      const result = await TokenModel.deleteMany({ expires_at: { $lt: now } });
      return result.deletedCount || 0;
    } catch (error) {
      throw new Error(`Failed to cleanup expired tokens: ${error}`);
    }
  }
}
