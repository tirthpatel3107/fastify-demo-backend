import { PrescriptionModel, PrescriptionDocument } from "../models";
import {
  CreatePrescriptionRequest,
  UpdatePrescriptionData,
} from "../interfaces";

export class PrescriptionDAO {
  /**
   * Create a new prescription
   */
  static async create(
    prescriptionData: CreatePrescriptionRequest,
  ): Promise<PrescriptionDocument> {
    try {
      const prescription = new PrescriptionModel(prescriptionData);
      return await prescription.save();
    } catch (error) {
      throw new Error(`Failed to create prescription: ${error}`);
    }
  }

  /**
   * Get prescription by ID
   */
  static async getById(id: string): Promise<PrescriptionDocument | null> {
    try {
      return await PrescriptionModel.findById(id);
    } catch (error) {
      throw new Error(`Failed to get prescription by ID: ${error}`);
    }
  }

  /**
   * Update prescription by ID
   */
  static async updateById(
    id: string,
    updateData: UpdatePrescriptionData,
  ): Promise<PrescriptionDocument | null> {
    try {
      return await PrescriptionModel.findByIdAndUpdate(
        id,
        { ...updateData, updated_at: new Date() },
        { new: true, runValidators: true },
      );
    } catch (error) {
      throw new Error(`Failed to update prescription: ${error}`);
    }
  }

  /**
   * Get all prescriptions with pagination
   */
  static async getAll(
    limit: number = 10,
    skip: number = 0,
  ): Promise<PrescriptionDocument[]> {
    try {
      return await PrescriptionModel.find()
        .limit(limit)
        .skip(skip)
        .sort({ created_at: -1 });
    } catch (error) {
      throw new Error(`Failed to get prescriptions: ${error}`);
    }
  }

  /**
   * Get prescriptions count
   */
  static async getCount(filters?: {
    status?: "Pending" | "Sent" | "Delivered" | "Failed";
    doctor_id?: string;
  }): Promise<number> {
    try {
      const filter = filters || {};
      return await PrescriptionModel.countDocuments(filter);
    } catch (error) {
      throw new Error(`Failed to get prescriptions count: ${error}`);
    }
  }

  /**
   * Update prescription status
   */
  static async updateStatus(
    id: string,
    status: "Pending" | "Sent" | "Delivered" | "Failed",
  ): Promise<PrescriptionDocument | null> {
    try {
      return await PrescriptionModel.findByIdAndUpdate(
        id,
        { status, updated_at: new Date() },
        { new: true, runValidators: true },
      );
    } catch (error) {
      throw new Error(`Failed to update prescription status: ${error}`);
    }
  }
}
