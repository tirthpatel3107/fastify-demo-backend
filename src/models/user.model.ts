import { Schema, model, Document } from "mongoose";
import { User } from "../interfaces";

export interface UserDocument extends Omit<User, "id">, Document {}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
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
    collection: "users",
  },
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export const UserModel = model<UserDocument>("User", userSchema);
