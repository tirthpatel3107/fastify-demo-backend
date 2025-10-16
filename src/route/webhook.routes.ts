import { FastifyInstance } from "fastify";
import { WebhookController } from "../controllers";
import { catchAsync } from "../utils";

export default async function webhookRoutes(fastify: FastifyInstance) {
  // Create webhook log
  fastify.post("/logs", catchAsync(WebhookController.createWebhookLog));

  // Get webhook log by ID
  fastify.get("/logs/:id", catchAsync(WebhookController.getWebhookLogById));

  // Update webhook log
  fastify.put("/logs/:id", catchAsync(WebhookController.updateWebhookLog));

  // Delete webhook log
  fastify.delete("/logs/:id", catchAsync(WebhookController.deleteWebhookLog));

  // Mark webhook log as processed
  fastify.patch(
    "/logs/:id/process",
    catchAsync(WebhookController.markWebhookLogAsProcessed),
  );

  // Get all webhook logs with pagination
  fastify.get("/logs", catchAsync(WebhookController.getAllWebhookLogs));

  // Get unprocessed webhook logs
  fastify.get(
    "/logs/unprocessed",
    catchAsync(WebhookController.getUnprocessedWebhookLogs),
  );

  // Get webhook logs by prescription ID
  fastify.get(
    "/logs/prescription/:prescriptionId",
    catchAsync(WebhookController.getWebhookLogsByPrescription),
  );

  // Get webhook logs by event type
  fastify.get(
    "/logs/event/:eventType",
    catchAsync(WebhookController.getWebhookLogsByEventType),
  );

  // Process webhook event
  fastify.post("/process", catchAsync(WebhookController.processWebhookEvent));

  // Clean up old webhook logs
  fastify.delete(
    "/logs/cleanup",
    catchAsync(WebhookController.cleanupOldWebhookLogs),
  );

  // Get webhook statistics
  fastify.get("/stats/overview", catchAsync(WebhookController.getWebhookStats));
}
