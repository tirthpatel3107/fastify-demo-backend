import { WebhookLogDAO } from "../dao";
import { WebhookLog, WebhookResponse } from "../interfaces";
import { WebhookLogDocument } from "../models";
import logger from "../utils/logger";

// Helper function to convert WebhookLogDocument to WebhookLog
const convertToWebhookLog = (doc: WebhookLogDocument): WebhookLog => ({
  id: (doc._id as any).toString(),
  event_type: doc.event_type,
  payload: doc.payload,
  received_at: doc.received_at,
  prescription_id: doc.prescription_id || undefined,
  processed: doc.processed,
  error_message: doc.error_message || undefined,
  created_at: doc.created_at,
  updated_at: doc.updated_at,
});

export class WebhookService {
  /**
   * Create a new webhook log
   */
  static async createWebhookLog(
    webhookData: Omit<WebhookLog, "id" | "created_at" | "updated_at">,
  ): Promise<WebhookResponse> {
    try {
      const webhookLog = await WebhookLogDAO.create(webhookData);
      logger.info(`Webhook log created successfully: ${webhookLog.id}`);

      return {
        success: true,
        data: convertToWebhookLog(webhookLog),
        message: "Webhook log created successfully",
      };
    } catch (error) {
      logger.error(`Error creating webhook log: ${error}`);
      return {
        success: false,
        error: `Failed to create webhook log: ${error}`,
      };
    }
  }

  /**
   * Get webhook log by ID
   */
  static async getWebhookLogById(id: string): Promise<WebhookResponse> {
    try {
      const webhookLog = await WebhookLogDAO.getById(id);
      if (!webhookLog) {
        return {
          success: false,
          error: "Webhook log not found",
        };
      }

      return {
        success: true,
        data: convertToWebhookLog(webhookLog),
        message: "Webhook log retrieved successfully",
      };
    } catch (error) {
      logger.error(`Error getting webhook log by ID: ${error}`);
      return {
        success: false,
        error: `Failed to get webhook log: ${error}`,
      };
    }
  }

  /**
   * Update webhook log
   */
  static async updateWebhookLog(
    id: string,
    updateData: Partial<WebhookLog>,
  ): Promise<WebhookResponse> {
    try {
      const webhookLog = await WebhookLogDAO.updateById(id, updateData);
      if (!webhookLog) {
        return {
          success: false,
          error: "Webhook log not found",
        };
      }

      logger.info(`Webhook log updated successfully: ${id}`);
      return {
        success: true,
        data: convertToWebhookLog(webhookLog),
        message: "Webhook log updated successfully",
      };
    } catch (error) {
      logger.error(`Error updating webhook log: ${error}`);
      return {
        success: false,
        error: `Failed to update webhook log: ${error}`,
      };
    }
  }

  /**
   * Delete webhook log
   */
  static async deleteWebhookLog(id: string): Promise<WebhookResponse> {
    try {
      const result = await WebhookLogDAO.deleteById(id);
      if (!result) {
        return {
          success: false,
          error: "Webhook log not found",
        };
      }

      logger.info(`Webhook log deleted successfully: ${id}`);
      return {
        success: true,
        message: "Webhook log deleted successfully",
      };
    } catch (error) {
      logger.error(`Error deleting webhook log: ${error}`);
      return {
        success: false,
        error: `Failed to delete webhook log: ${error}`,
      };
    }
  }

  /**
   * Get webhook logs by prescription ID
   */
  static async getWebhookLogsByPrescription(
    prescriptionId: string,
    limit: number = 10,
    skip: number = 0,
  ): Promise<{
    success: boolean;
    data?: WebhookLog[];
    total?: number;
    error?: string;
  }> {
    try {
      const webhookLogs = await WebhookLogDAO.getByPrescriptionId(
        prescriptionId,
        limit,
        skip,
      );
      const total = webhookLogs.length; // Simplified count

      return {
        success: true,
        data: webhookLogs.map((webhookLog) => convertToWebhookLog(webhookLog)),
        total,
      };
    } catch (error) {
      logger.error(`Error getting webhook logs by prescription: ${error}`);
      return {
        success: false,
        error: `Failed to get webhook logs: ${error}`,
      };
    }
  }

  /**
   * Get webhook logs by event type
   */
  static async getWebhookLogsByEventType(
    eventType: string,
    limit: number = 10,
    skip: number = 0,
  ): Promise<{
    success: boolean;
    data?: WebhookLog[];
    total?: number;
    error?: string;
  }> {
    try {
      const webhookLogs = await WebhookLogDAO.getByEventType(
        eventType,
        limit,
        skip,
      );
      const total = webhookLogs.length; // Simplified count

      return {
        success: true,
        data: webhookLogs.map((webhookLog) => convertToWebhookLog(webhookLog)),
        total,
      };
    } catch (error) {
      logger.error(`Error getting webhook logs by event type: ${error}`);
      return {
        success: false,
        error: `Failed to get webhook logs: ${error}`,
      };
    }
  }

  /**
   * Get unprocessed webhook logs
   */
  static async getUnprocessedWebhookLogs(
    limit: number = 10,
    skip: number = 0,
  ): Promise<{
    success: boolean;
    data?: WebhookLog[];
    total?: number;
    error?: string;
  }> {
    try {
      const webhookLogs = await WebhookLogDAO.getUnprocessed(limit, skip);
      const total = webhookLogs.length; // Simplified count

      return {
        success: true,
        data: webhookLogs.map((webhookLog) => convertToWebhookLog(webhookLog)),
        total,
      };
    } catch (error) {
      logger.error(`Error getting unprocessed webhook logs: ${error}`);
      return {
        success: false,
        error: `Failed to get unprocessed webhook logs: ${error}`,
      };
    }
  }

  /**
   * Get all webhook logs with pagination
   */
  static async getAllWebhookLogs(
    limit: number = 10,
    skip: number = 0,
  ): Promise<{
    success: boolean;
    data?: WebhookLog[];
    total?: number;
    error?: string;
  }> {
    try {
      const [webhookLogs, total] = await Promise.all([
        WebhookLogDAO.getAll(limit, skip),
        WebhookLogDAO.getCount(),
      ]);

      return {
        success: true,
        data: webhookLogs.map((webhookLog) => convertToWebhookLog(webhookLog)),
        total,
      };
    } catch (error) {
      logger.error(`Error getting all webhook logs: ${error}`);
      return {
        success: false,
        error: `Failed to get webhook logs: ${error}`,
      };
    }
  }

  /**
   * Mark webhook log as processed
   */
  static async markWebhookLogAsProcessed(
    id: string,
    errorMessage?: string,
  ): Promise<WebhookResponse> {
    try {
      const webhookLog = await WebhookLogDAO.markAsProcessed(id, errorMessage);
      if (!webhookLog) {
        return {
          success: false,
          error: "Webhook log not found",
        };
      }

      logger.info(`Webhook log marked as processed: ${id}`);
      return {
        success: true,
        data: convertToWebhookLog(webhookLog),
        message: "Webhook log marked as processed",
      };
    } catch (error) {
      logger.error(`Error marking webhook log as processed: ${error}`);
      return {
        success: false,
        error: `Failed to mark webhook log as processed: ${error}`,
      };
    }
  }

  /**
   * Process webhook event
   */
  static async processWebhookEvent(
    eventType: string,
    payload: object,
    prescriptionId?: string,
  ): Promise<WebhookResponse> {
    try {
      // Create webhook log entry
      const webhookData: Omit<WebhookLog, "id" | "created_at" | "updated_at"> =
        {
          event_type: eventType,
          payload,
          received_at: new Date().toISOString(),
          prescription_id: prescriptionId || undefined,
          processed: false,
        };

      const result = await this.createWebhookLog(webhookData);

      if (!result.success) {
        return result;
      }

      // Here you would add your webhook processing logic
      // For example, updating prescription status, sending notifications, etc.
      logger.info(`Processing webhook event: ${eventType}`);

      // Mark as processed (you might want to do this after actual processing)
      const processedResult = await this.markWebhookLogAsProcessed(
        result.data!.id,
      );

      return processedResult;
    } catch (error) {
      logger.error(`Error processing webhook event: ${error}`);
      return {
        success: false,
        error: `Failed to process webhook event: ${error}`,
      };
    }
  }

  /**
   * Clean up old webhook logs
   */
  static async cleanupOldWebhookLogs(
    daysOld: number = 30,
  ): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
    try {
      const deletedCount = await WebhookLogDAO.cleanupOldLogs(daysOld);
      logger.info(`Cleaned up ${deletedCount} old webhook logs`);

      return {
        success: true,
        deletedCount,
      };
    } catch (error) {
      logger.error(`Error cleaning up webhook logs: ${error}`);
      return {
        success: false,
        error: `Failed to cleanup webhook logs: ${error}`,
      };
    }
  }

  /**
   * Get webhook statistics
   */
  static async getWebhookStats(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const [total, processed, unprocessed] = await Promise.all([
        WebhookLogDAO.getCount(),
        WebhookLogDAO.getCount({ processed: true }),
        WebhookLogDAO.getCount({ processed: false }),
      ]);

      const stats = {
        total,
        processed,
        unprocessed,
        processing_rate: total > 0 ? (processed / total) * 100 : 0,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      logger.error(`Error getting webhook stats: ${error}`);
      return {
        success: false,
        error: `Failed to get webhook statistics: ${error}`,
      };
    }
  }
}
