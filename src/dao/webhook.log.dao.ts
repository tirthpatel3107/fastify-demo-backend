import { WebhookLogModel, WebhookLogDocument } from "../models";
import { WebhookLog } from "../interfaces";

export class WebhookLogDAO {
  /**
   * Create a new webhook log
   */
  static async create(
    webhookData: Omit<WebhookLog, "id" | "created_at" | "updated_at">,
  ): Promise<WebhookLogDocument> {
    try {
      const webhookLog = new WebhookLogModel(webhookData);
      return await webhookLog.save();
    } catch (error) {
      throw new Error(`Failed to create webhook log: ${error}`);
    }
  }

  /**
   * Get webhook log by ID
   */
  static async getById(id: string): Promise<WebhookLogDocument | null> {
    try {
      return await WebhookLogModel.findById(id);
    } catch (error) {
      throw new Error(`Failed to get webhook log by ID: ${error}`);
    }
  }

  /**
   * Update webhook log by ID
   */
  static async updateById(
    id: string,
    updateData: Partial<WebhookLog>,
  ): Promise<WebhookLogDocument | null> {
    try {
      return await WebhookLogModel.findByIdAndUpdate(
        id,
        { ...updateData, updated_at: new Date() },
        { new: true, runValidators: true },
      );
    } catch (error) {
      throw new Error(`Failed to update webhook log: ${error}`);
    }
  }

  /**
   * Delete webhook log by ID
   */
  static async deleteById(id: string): Promise<boolean> {
    try {
      const result = await WebhookLogModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new Error(`Failed to delete webhook log: ${error}`);
    }
  }

  /**
   * Get webhook logs by prescription ID
   */
  static async getByPrescriptionId(
    prescriptionId: string,
    limit: number = 10,
    skip: number = 0,
  ): Promise<WebhookLogDocument[]> {
    try {
      return await WebhookLogModel.find({ prescription_id: prescriptionId })
        .limit(limit)
        .skip(skip)
        .sort({ created_at: -1 });
    } catch (error) {
      throw new Error(
        `Failed to get webhook logs by prescription ID: ${error}`,
      );
    }
  }

  /**
   * Get webhook logs by event type
   */
  static async getByEventType(
    eventType: string,
    limit: number = 10,
    skip: number = 0,
  ): Promise<WebhookLogDocument[]> {
    try {
      return await WebhookLogModel.find({ event_type: eventType })
        .limit(limit)
        .skip(skip)
        .sort({ created_at: -1 });
    } catch (error) {
      throw new Error(`Failed to get webhook logs by event type: ${error}`);
    }
  }

  /**
   * Get unprocessed webhook logs
   */
  static async getUnprocessed(
    limit: number = 10,
    skip: number = 0,
  ): Promise<WebhookLogDocument[]> {
    try {
      return await WebhookLogModel.find({ processed: false })
        .limit(limit)
        .skip(skip)
        .sort({ created_at: 1 }); // Process oldest first
    } catch (error) {
      throw new Error(`Failed to get unprocessed webhook logs: ${error}`);
    }
  }

  /**
   * Get all webhook logs with pagination
   */
  static async getAll(
    limit: number = 10,
    skip: number = 0,
  ): Promise<WebhookLogDocument[]> {
    try {
      return await WebhookLogModel.find()
        .limit(limit)
        .skip(skip)
        .sort({ created_at: -1 });
    } catch (error) {
      throw new Error(`Failed to get webhook logs: ${error}`);
    }
  }

  /**
   * Get webhook logs count
   */
  static async getCount(filters?: {
    processed?: boolean;
    event_type?: string;
  }): Promise<number> {
    try {
      const filter = filters || {};
      return await WebhookLogModel.countDocuments(filter);
    } catch (error) {
      throw new Error(`Failed to get webhook logs count: ${error}`);
    }
  }

  /**
   * Mark webhook log as processed
   */
  static async markAsProcessed(
    id: string,
    errorMessage?: string,
  ): Promise<WebhookLogDocument | null> {
    try {
      const updateData: Partial<WebhookLog> = {
        processed: true,
        updated_at: new Date(),
      };

      if (errorMessage) {
        updateData.error_message = errorMessage;
      }

      return await WebhookLogModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw new Error(`Failed to mark webhook log as processed: ${error}`);
    }
  }

  /**
   * Clean up old processed webhook logs
   */
  static async cleanupOldLogs(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await WebhookLogModel.deleteMany({
        processed: true,
        created_at: { $lt: cutoffDate },
      });

      return result.deletedCount || 0;
    } catch (error) {
      throw new Error(`Failed to cleanup old webhook logs: ${error}`);
    }
  }
}
