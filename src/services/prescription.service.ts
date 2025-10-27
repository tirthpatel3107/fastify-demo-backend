import { PrescriptionDAO } from "../dao";
import {
  Prescription,
  CreatePrescriptionRequest,
  PrescriptionResponse,
} from "../interfaces";
import { PrescriptionDocument } from "../models";
import logger from "../utils/logger";

// Helper function to convert PrescriptionDocument to Prescription
const convertToPrescription = (doc: PrescriptionDocument): Prescription => ({
  id: (doc._id as any).toString(),
  patient_name: doc.patient_name,
  patient_dob: doc.patient_dob,
  patient_address: doc.patient_address,
  medication: doc.medication,
  dosage: doc.dosage,
  delivery_type: doc.delivery_type,
  doctor_id: doc.doctor_id,
  payload: doc.payload,
  status: doc.status,
  created_at: doc.created_at,
  updated_at: doc.updated_at,
});

export class PrescriptionService {
  /**
   * Create a new prescription
   */
  static async createPrescription(
    prescriptionData: CreatePrescriptionRequest,
  ): Promise<PrescriptionResponse> {
    try {
      // Basic validation - check if doctor_id is provided
      if (
        !prescriptionData.doctor_id ||
        prescriptionData.doctor_id.trim() === ""
      ) {
        return {
          success: false,
          error: "Doctor ID is required",
        };
      }

      // Create prescription
      const prescription = await PrescriptionDAO.create(prescriptionData);
      logger.info(`Prescription created successfully: ${prescription.id}`);

      return {
        success: true,
        data: convertToPrescription(prescription),
        message: "Prescription created successfully",
      };
    } catch (error) {
      logger.error(`Error creating prescription: ${error}`);
      return {
        success: false,
        error: `Failed to create prescription: ${error}`,
      };
    }
  }

  /**
   * Get prescription by ID
   */
  static async getPrescriptionById(id: string): Promise<PrescriptionResponse> {
    try {
      const prescription = await PrescriptionDAO.getById(id);
      if (!prescription) {
        return {
          success: false,
          error: "Prescription not found",
        };
      }

      return {
        success: true,
        data: convertToPrescription(prescription),
        message: "Prescription retrieved successfully",
      };
    } catch (error) {
      logger.error(`Error getting prescription by ID: ${error}`);
      return {
        success: false,
        error: `Failed to get prescription: ${error}`,
      };
    }
  }

  /**
   * Get all prescriptions with pagination
   */
  static async getAllPrescriptions(
    limit: number = 10,
    skip: number = 0,
  ): Promise<{
    success: boolean;
    data?: Prescription[];
    total?: number;
    error?: string;
  }> {
    try {
      const [prescriptions, total] = await Promise.all([
        PrescriptionDAO.getAll(limit, skip),
        PrescriptionDAO.getCount(),
      ]);

      return {
        success: true,
        data: prescriptions.map(convertToPrescription),
        total,
      };
    } catch (error) {
      logger.error(`Error getting all prescriptions: ${error}`);
      return {
        success: false,
        error: `Failed to get prescriptions: ${error}`,
      };
    }
  }

  /**
   * Update prescription status
   */
  static async updatePrescriptionStatus(
    id: string,
    status: "Pending" | "Sent" | "Delivered" | "Failed",
  ): Promise<PrescriptionResponse> {
    try {
      const prescription = await PrescriptionDAO.updateStatus(id, status);
      if (!prescription) {
        return {
          success: false,
          error: "Prescription not found",
        };
      }

      logger.info(`Prescription status updated to ${status}: ${id}`);
      return {
        success: true,
        data: convertToPrescription(prescription),
        message: `Prescription status updated to ${status}`,
      };
    } catch (error) {
      logger.error(`Error updating prescription status: ${error}`);
      return {
        success: false,
        error: `Failed to update prescription status: ${error}`,
      };
    }
  }
}
