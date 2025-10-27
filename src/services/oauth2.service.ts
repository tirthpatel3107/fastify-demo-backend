import axios, { AxiosResponse } from "axios";
import logger from "../utils/logger";

export interface OAuth2TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface OAuth2ErrorResponse {
  error?: string;
  error_description?: string;
  error_uri?: string;
  message?: string;
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
          errorData.message ||
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
}
