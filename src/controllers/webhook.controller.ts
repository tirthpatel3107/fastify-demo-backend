import { FastifyRequest, FastifyReply } from 'fastify';
import { WebhookService } from '../services';
import { WebhookLog } from '../interfaces';
import { STATUS } from '../utils/enums';

export class WebhookController {
  /**
   * Create a new webhook log
   */
  static async createWebhookLog(request: FastifyRequest, reply: FastifyReply) {
    const webhookData = request.body as Omit<WebhookLog, 'id' | 'created_at' | 'updated_at'>;
    
    const webhookLog = await WebhookService.createWebhookLog(webhookData);
    
    return reply.code(STATUS.CREATE).send({
      success: true,
      data: webhookLog,
      message: 'Webhook log created successfully'
    });
  }

  /**
   * Get webhook log by ID
   */
  static async getWebhookLogById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    
    const webhookLog = await WebhookService.getWebhookLogById(id);
    
    if (!webhookLog) {
      return reply.code(STATUS.NOT_FOUND).send({
        success: false,
        error: 'Webhook log not found'
      });
    }
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: webhookLog,
      message: 'Webhook log retrieved successfully'
    });
  }

  /**
   * Update webhook log
   */
  static async updateWebhookLog(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const updateData = request.body as Partial<WebhookLog>;
    
    const webhookLog = await WebhookService.updateWebhookLog(id, updateData);
    
    if (!webhookLog) {
      return reply.code(STATUS.NOT_FOUND).send({
        success: false,
        error: 'Webhook log not found'
      });
    }
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: webhookLog,
      message: 'Webhook log updated successfully'
    });
  }

  /**
   * Delete webhook log
   */
  static async deleteWebhookLog(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    
    const result = await WebhookService.deleteWebhookLog(id);
    
    if (!result) {
      return reply.code(STATUS.NOT_FOUND).send({
        success: false,
        error: 'Webhook log not found'
      });
    }
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      message: 'Webhook log deleted successfully'
    });
  }

  /**
   * Mark webhook log as processed
   */
  static async markWebhookLogAsProcessed(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    
    const webhookLog = await WebhookService.markWebhookLogAsProcessed(id);
    
    if (!webhookLog) {
      return reply.code(STATUS.NOT_FOUND).send({
        success: false,
        error: 'Webhook log not found'
      });
    }
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: webhookLog,
      message: 'Webhook log marked as processed'
    });
  }

  /**
   * Get all webhook logs with pagination
   */
  static async getAllWebhookLogs(request: FastifyRequest, reply: FastifyReply) {
    const { limit = 10, skip = 0 } = request.query as { limit?: number; skip?: number };
    
    const result = await WebhookService.getAllWebhookLogs(limit, skip);
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: result.data,
      pagination: {
        total: result.total || 0,
        limit,
        skip,
        hasMore: (result.total || 0) > skip + limit
      }
    });
  }

  /**
   * Get unprocessed webhook logs
   */
  static async getUnprocessedWebhookLogs(request: FastifyRequest, reply: FastifyReply) {
    const { limit = 10, skip = 0 } = request.query as { limit?: number; skip?: number };
    
    const result = await WebhookService.getUnprocessedWebhookLogs(limit, skip);
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: result.data,
      pagination: {
        total: result.total || 0,
        limit,
        skip,
        hasMore: (result.total || 0) > skip + limit
      }
    });
  }

  /**
   * Get webhook logs by prescription ID
   */
  static async getWebhookLogsByPrescription(request: FastifyRequest, reply: FastifyReply) {
    const { prescriptionId } = request.params as { prescriptionId: string };
    const { limit = 10, skip = 0 } = request.query as { limit?: number; skip?: number };
    
    const result = await WebhookService.getWebhookLogsByPrescription(prescriptionId, limit, skip);
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: result.data,
      pagination: {
        total: result.total || 0,
        limit,
        skip,
        hasMore: (result.total || 0) > skip + limit
      }
    });
  }

  /**
   * Get webhook logs by event type
   */
  static async getWebhookLogsByEventType(request: FastifyRequest, reply: FastifyReply) {
    const { eventType } = request.params as { eventType: string };
    const { limit = 10, skip = 0 } = request.query as { limit?: number; skip?: number };
    
    const result = await WebhookService.getWebhookLogsByEventType(eventType, limit, skip);
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: result.data,
      pagination: {
        total: result.total || 0,
        limit,
        skip,
        hasMore: (result.total || 0) > skip + limit
      }
    });
  }

  /**
   * Process webhook event
   */
  static async processWebhookEvent(request: FastifyRequest, reply: FastifyReply) {
    const { eventType, payload, prescriptionId } = request.body as { 
      eventType: string; 
      payload: object; 
      prescriptionId?: string; 
    };
    
    const result = await WebhookService.processWebhookEvent(eventType, payload, prescriptionId);
    
    if (!result.success) {
      return reply.code(STATUS.BAD_REQUEST).send(result);
    }
    
    return reply.code(STATUS.SUCCESS).send(result);
  }

  /**
   * Clean up old webhook logs
   */
  static async cleanupOldWebhookLogs(_request: FastifyRequest, reply: FastifyReply) {
    const deletedCount = await WebhookService.cleanupOldWebhookLogs();
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: { deletedCount },
      message: `${deletedCount} old webhook logs cleaned up successfully`
    });
  }

  /**
   * Get webhook statistics
   */
  static async getWebhookStats(_request: FastifyRequest, reply: FastifyReply) {
    const result = await WebhookService.getWebhookStats();
    
    if (!result.success) {
      return reply.code(STATUS.SERVER_ERROR).send(result);
    }
    
    return reply.code(STATUS.SUCCESS).send(result);
  }
}
