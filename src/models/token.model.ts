import { Schema, model, Document } from 'mongoose';
import { Token } from '../interfaces';

export interface TokenDocument extends Omit<Token, 'id'>, Document {}

const tokenSchema = new Schema<TokenDocument>({
  user_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  access_token: {
    type: String,
    required: true,
    unique: true
  },
  refresh_token: {
    type: String,
    required: true,
    unique: true
  },
  expires_at: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'tokens'
});

// Indexes
tokenSchema.index({ user_id: 1 });
tokenSchema.index({ access_token: 1 });
tokenSchema.index({ refresh_token: 1 });
tokenSchema.index({ expires_at: 1 });

// TTL index for automatic cleanup of expired tokens
tokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const TokenModel = model<TokenDocument>('Token', tokenSchema);
