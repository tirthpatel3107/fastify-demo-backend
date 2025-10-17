import axios, { AxiosResponse } from "axios";
import { OAuth2Service } from "./oauth2.service";
import logger from "../utils/logger";

export interface SignatureRxPrescriptionRequest {
  action: string;
  contact_id: number;
  clinic_id: number;
  aff_tag: string;
  secure_pin: string;
  notify: boolean;
  send_sms: boolean;
  invoice_clinic: boolean;
  delivery_address: {
    address_ln1: string;
    address_ln2: string;
    city: string;
    post_code: string;
    country: string;
  };
  prescription_id: string;
  patient: {
    first_name: string;
    last_name: string;
    gender: string;
    email: string;
    phone: string;
    birth_day: string;
    birth_month: string;
    birth_year: string;
    address_ln1: string;
    address_ln2: string;
    city: string;
    post_code: string;
    country: string;
    client_ref_id: string;
  };
  notes: string;
  client_ref_id: string;
  medicines: Array<{
    object: string;
    id: number;
    VPID: string;
    APID: string;
    VPPID: string;
    APPID: string;
    description: string;
    qty: string;
    directions: string;
  }>;
  prescriber_ip: string;
}

export interface SignatureRxPrescriptionResponse {
  success: boolean;
  data?: {
    id: string;
    status: string;
    prescription_url?: string;
    created_at: string;
    updated_at: string;
  };
  error?: string;
  message?: string;
}

export interface SignatureRxErrorResponse {
  error: string;
  message?: string;
  details?: any;
}

export class SignatureRxService {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  /**
   * Issue a prescription for delivery using SignatureRx API
   */
  static async issuePrescriptionForDelivery(
    prescriptionData: SignatureRxPrescriptionRequest,
    config?: any,
  ): Promise<SignatureRxPrescriptionResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        logger.info(
          `Attempting to issue prescription (attempt ${attempt}/${this.MAX_RETRIES})`,
        );

        // Get valid OAuth2 token
        const accessToken = await OAuth2Service.getValidToken(config);

        // Prepare the request
        const baseUrl =
          config?.SIGNATURERX_BASE_URL || process.env["SIGNATURERX_BASE_URL"];
        const prescriptionsUrl =
          config?.SIGNATURERX_PRESCRIPTIONS_URL ||
          process.env["SIGNATURERX_PRESCRIPTIONS_URL"];

        if (!baseUrl || !prescriptionsUrl) {
          throw new Error("Missing SignatureRx API configuration");
        }

        const apiUrl = `${baseUrl}${prescriptionsUrl}`;

        // Make the API call
        const response: AxiosResponse<SignatureRxPrescriptionResponse> =
          await axios.post(apiUrl, prescriptionData, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: 30000, // 30 seconds timeout
          });

        if (response.status === 200 || response.status === 201) {
          logger.info(
            `Prescription issued successfully: ${response.data.data?.id}`,
          );
          return response.data;
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (error: any) {
        lastError = error;
        logger.error(
          `Prescription issue attempt ${attempt} failed: ${error.message}`,
        );

        // Check if this is a token-related error that we can retry
        if (this.isTokenError(error) && attempt < this.MAX_RETRIES) {
          logger.info("Token error detected, clearing cache and retrying");
          OAuth2Service.clearCachedToken();

          // Wait before retry
          await this.delay(this.RETRY_DELAY * attempt);
          continue;
        }

        // Check if this is a rate limit error
        if (this.isRateLimitError(error) && attempt < this.MAX_RETRIES) {
          const retryAfter = this.getRetryAfterDelay(error);
          logger.info(`Rate limit hit, waiting ${retryAfter}ms before retry`);
          await this.delay(retryAfter);
          continue;
        }

        // For other errors, don't retry
        break;
      }
    }

    // All retries failed
    logger.error(
      `All prescription issue attempts failed. Last error: ${lastError?.message}`,
    );
    return {
      success: false,
      error: `Failed to issue prescription after ${this.MAX_RETRIES} attempts: ${lastError?.message}`,
    };
  }

  /**
   * Check if the error is token-related
   */
  private static isTokenError(error: any): boolean {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // 401 Unauthorized or 403 Forbidden
      if (status === 401 || status === 403) {
        return true;
      }

      // Check for token-related error messages
      if (data && typeof data === "object") {
        const errorMessage = (data.error || data.message || "").toLowerCase();
        return (
          errorMessage.includes("token") ||
          errorMessage.includes("unauthorized") ||
          errorMessage.includes("forbidden")
        );
      }
    }

    return false;
  }

  /**
   * Check if the error is rate limit related
   */
  private static isRateLimitError(error: any): boolean {
    if (error.response) {
      const status = error.response.status;
      return status === 429; // Too Many Requests
    }
    return false;
  }

  /**
   * Get retry delay from rate limit headers
   */
  private static getRetryAfterDelay(error: any): number {
    if (error.response && error.response.headers) {
      const retryAfter = error.response.headers["retry-after"];
      if (retryAfter) {
        const delay = parseInt(retryAfter, 10) * 1000; // Convert to milliseconds
        return Math.min(delay, 60000); // Cap at 60 seconds
      }
    }
    return this.RETRY_DELAY * 2; // Default delay
  }

  /**
   * Delay execution for the specified milliseconds
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Test the connection to SignatureRx API
   */
  static async testConnection(
    config?: any,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await OAuth2Service.getValidToken(config);
      logger.info("SignatureRx API connection test successful");
      return {
        success: true,
        message: "Successfully connected to SignatureRx API",
      };
    } catch (error: any) {
      logger.error(`SignatureRx API connection test failed: ${error.message}`);
      return {
        success: false,
        message: `Connection test failed: ${error.message}`,
      };
    }
  }
}
