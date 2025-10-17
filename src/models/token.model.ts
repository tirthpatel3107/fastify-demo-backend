import { Schema, model, Document } from "mongoose";
import { TokenStore } from "../interfaces";

export interface TokenDocument
  extends Omit<TokenStore, "expires_at">,
    Document {
  expires_at: Date; // Convert string to Date for MongoDB
}

const tokenSchema = new Schema<TokenDocument>(
  {
    access_token: {
      type: String,
      required: true,
      trim: true,
    },
    refresh_token: {
      type: String,
      required: true,
      trim: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "tokens",
  },
);

// Indexes
tokenSchema.index({ access_token: 1 });
tokenSchema.index({ expires_at: 1 });
tokenSchema.index({ created_at: -1 });

export const TokenModel = model<TokenDocument>("Token", tokenSchema);
