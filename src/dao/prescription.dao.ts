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
   * Delete prescription by ID
   */
  static async deleteById(id: string): Promise<boolean> {
    try {
      const result = await PrescriptionModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new Error(`Failed to delete prescription: ${error}`);
    }
  }

  /**
   * Get prescriptions by doctor ID
   */
  static async getByDoctorId(
    doctorId: string,
    limit: number = 10,
    skip: number = 0,
  ): Promise<PrescriptionDocument[]> {
    try {
      return await PrescriptionModel.find({ doctor_id: doctorId })
        .limit(limit)
        .skip(skip)
        .sort({ created_at: -1 });
    } catch (error) {
      throw new Error(`Failed to get prescriptions by doctor ID: ${error}`);
    }
  }

  /**
   * Get prescriptions by status
   */
  static async getByStatus(
    status: "Pending" | "Sent" | "Delivered" | "Failed",
    limit: number = 10,
    skip: number = 0,
  ): Promise<PrescriptionDocument[]> {
    try {
      return await PrescriptionModel.find({ status })
        .limit(limit)
        .skip(skip)
        .sort({ created_at: -1 });
    } catch (error) {
      throw new Error(`Failed to get prescriptions by status: ${error}`);
    }
  }

  /**
   * Get prescriptions by patient name
   */
  static async getByPatientName(
    patientName: string,
    limit: number = 10,
    skip: number = 0,
  ): Promise<PrescriptionDocument[]> {
    try {
      return await PrescriptionModel.find({
        patient_name: { $regex: patientName, $options: "i" },
      })
        .limit(limit)
        .skip(skip)
        .sort({ created_at: -1 });
    } catch (error) {
      throw new Error(`Failed to get prescriptions by patient name: ${error}`);
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
