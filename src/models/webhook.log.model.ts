import { Schema, model, Document } from "mongoose";
import { WebhookLog } from "../interfaces";

export interface WebhookLogDocument extends Omit<WebhookLog, "id">, Document {}

const webhookLogSchema = new Schema<WebhookLogDocument>(
  {
    event_type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    received_at: {
      type: String,
      required: true,
    },
    prescription_id: {
      type: String,
      ref: "Prescription",
      required: false,
    },
    processed: {
      type: Boolean,
      default: false,
    },
    error_message: {
      type: String,
      required: false,
      maxlength: 500,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "webhook_logs",
  },
);

// Indexes
webhookLogSchema.index({ event_type: 1 });
webhookLogSchema.index({ prescription_id: 1 });
webhookLogSchema.index({ processed: 1 });
webhookLogSchema.index({ received_at: 1 });
webhookLogSchema.index({ created_at: -1 });

export const WebhookLogModel = model<WebhookLogDocument>(
  "WebhookLog",
  webhookLogSchema,
);
