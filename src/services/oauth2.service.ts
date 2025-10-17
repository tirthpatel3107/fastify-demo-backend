import axios, { AxiosResponse } from "axios";
import logger from "../utils/logger";
import { TokenStore } from "../interfaces";
import { TokenDAO } from "../dao";

export interface OAuth2TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface OAuth2ErrorResponse {
  error: string;
  error_description?: string;
  error_uri?: string;
}

export interface CachedToken {
  access_token: string;
  expires_at: number;
  scope?: string | undefined;
}

export class OAuth2Service {
  private static cachedToken: CachedToken | null = null;
  private static readonly TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry

  /**
   * Get a valid access token (from cache or by fetching new one)
   */
  static async getValidToken(config?: any): Promise<string> {
    try {
      // Check if we have a valid cached token
      if (this.cachedToken && this.isTokenValid(this.cachedToken)) {
        logger.debug("Using cached OAuth2 token");
        return this.cachedToken.access_token;
      }

      // Fetch new token
      logger.info("Fetching new OAuth2 token from SignatureRx");
      const tokenResponse = await this.fetchToken(config);

      // Cache the token
      this.cachedToken = {
        access_token: tokenResponse.access_token,
        expires_at: Date.now() + tokenResponse.expires_in * 1000,
        scope: tokenResponse.scope,
      };

      logger.info("OAuth2 token cached successfully");
      return tokenResponse.access_token;
    } catch (error) {
      logger.error(`Error getting valid OAuth2 token: ${error}`);
      throw new Error(`Failed to get OAuth2 token: ${error}`);
    }
  }

  /**
   * Fetch a new access token from SignatureRx
   */
  private static async fetchToken(config?: any): Promise<OAuth2TokenResponse> {
    const clientId =
      config?.SIGNATURERX_CLIENT_ID || process.env["SIGNATURERX_CLIENT_ID"];
    const clientSecret =
      config?.SIGNATURERX_CLIENT_SECRET ||
      process.env["SIGNATURERX_CLIENT_SECRET"];
    const scope = config?.SIGNATURERX_SCOPE || process.env["SIGNATURERX_SCOPE"];
    const tokenUrl =
      config?.SIGNATURERX_TOKEN_URL || process.env["SIGNATURERX_TOKEN_URL"];

    if (!clientId || !clientSecret || !scope || !tokenUrl) {
      throw new Error("Missing required OAuth2 environment variables");
    }

    const requestData = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: scope,
    });

    try {
      const response: AxiosResponse<OAuth2TokenResponse> = await axios.post(
        tokenUrl,
        requestData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          timeout: 10000, // 10 seconds timeout
        },
      );

      if (response.status === 200 && response.data.access_token) {
        logger.info("Successfully obtained OAuth2 token from SignatureRx");
        return response.data;
      } else {
        throw new Error(
          `Invalid token response: ${JSON.stringify(response.data)}`,
        );
      }
    } catch (error: any) {
      if (error.response) {
        const errorData = error.response.data as OAuth2ErrorResponse;
        const errorMessage =
          errorData.error_description ||
          errorData.error ||
          "Unknown OAuth2 error";
        logger.error(`OAuth2 token request failed: ${errorMessage}`);
        throw new Error(`OAuth2 token request failed: ${errorMessage}`);
      } else if (error.code === "ECONNABORTED") {
        logger.error("OAuth2 token request timed out");
        throw new Error("OAuth2 token request timed out");
      } else {
        logger.error(`OAuth2 token request error: ${error.message}`);
        throw new Error(`OAuth2 token request error: ${error.message}`);
      }
    }
  }

  /**
   * Check if the cached token is still valid
   */
  private static isTokenValid(token: CachedToken): boolean {
    const now = Date.now();
    const expiresAt = token.expires_at - this.TOKEN_REFRESH_BUFFER;
    return now < expiresAt;
  }

  /**
   * Clear the cached token (useful for testing or manual refresh)
   */
  static clearCachedToken(): void {
    this.cachedToken = null;
    logger.info("OAuth2 token cache cleared");
  }

  /**
   * Get token info for debugging
   */
  static getTokenInfo(): {
    cached: boolean;
    expires_at?: number;
    valid?: boolean;
  } {
    if (!this.cachedToken) {
      return { cached: false };
    }

    return {
      cached: true,
      expires_at: this.cachedToken.expires_at,
      valid: this.isTokenValid(this.cachedToken),
    };
  }

  /**
   * Store token in database using TokenStore interface
   */
  static async storeTokenInDatabase(
    tokenData: OAuth2TokenResponse,
  ): Promise<TokenStore> {
    try {
      const tokenStore: TokenStore = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.access_token, // Using access_token as refresh_token for client_credentials
        expires_at: new Date(
          Date.now() + tokenData.expires_in * 1000,
        ).toISOString(),
      };

      // Store in database
      await TokenDAO.create(tokenStore);
      logger.info("Token stored in database successfully");

      return tokenStore;
    } catch (error) {
      logger.error(`Error storing token in database: ${error}`);
      throw error;
    }
  }

  /**
   * Get valid token from database
   */
  static async getValidTokenFromDatabase(): Promise<string | null> {
    try {
      const token = await TokenDAO.getValidToken();
      if (token) {
        logger.info("Valid token found in database");
        return token.access_token;
      }
      return null;
    } catch (error) {
      logger.error(`Error getting valid token from database: ${error}`);
      return null;
    }
  }

  /**
   * Clear expired tokens from database
   */
  static async clearExpiredTokensFromDatabase(): Promise<number> {
    try {
      const deletedCount = await TokenDAO.deleteExpiredTokens();
      logger.info(`Cleared ${deletedCount} expired tokens from database`);
      return deletedCount;
    } catch (error) {
      logger.error(`Error clearing expired tokens from database: ${error}`);
      return 0;
    }
  }
}
