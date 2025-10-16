import { Schema, model, Document } from 'mongoose';
import { Prescription } from '../interfaces';

export interface PrescriptionDocument extends Omit<Prescription, 'id'>, Document {}

const prescriptionSchema = new Schema<PrescriptionDocument>({
  patient_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  patient_dob: {
    type: String,
    required: true,
    trim: true
  },
  patient_address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  medication: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  dosage: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  delivery_type: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true
  },
  doctor_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  payload: {
    type: Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['Pending', 'Sent', 'Delivered', 'Failed'],
    default: 'Pending'
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
  collection: 'prescriptions'
});

// Indexes
prescriptionSchema.index({ doctor_id: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ patient_name: 1 });
prescriptionSchema.index({ created_at: -1 });
prescriptionSchema.index({ delivery_type: 1 });

export const PrescriptionModel = model<PrescriptionDocument>('Prescription', prescriptionSchema);
