import { PrescriptionDAO, UserDAO } from "../dao";
import {
  Prescription,
  CreatePrescriptionRequest,
  UpdatePrescriptionData,
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
      // Validate doctor exists and is authorized
      const isDoctorValid = await UserDAO.getById(prescriptionData.doctor_id);
      if (
        !isDoctorValid ||
        (isDoctorValid.role !== "doctor" && isDoctorValid.role !== "admin")
      ) {
        return {
          success: false,
          error: "Invalid or unauthorized doctor",
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
   * Update prescription
   */
  static async updatePrescription(
    id: string,
    updateData: UpdatePrescriptionData,
  ): Promise<PrescriptionResponse> {
    try {
      const prescription = await PrescriptionDAO.updateById(id, updateData);
      if (!prescription) {
        return {
          success: false,
          error: "Prescription not found",
        };
      }

      logger.info(`Prescription updated successfully: ${id}`);
      return {
        success: true,
        data: convertToPrescription(prescription),
        message: "Prescription updated successfully",
      };
    } catch (error) {
      logger.error(`Error updating prescription: ${error}`);
      return {
        success: false,
        error: `Failed to update prescription: ${error}`,
      };
    }
  }

  /**
   * Delete prescription
   */
  static async deletePrescription(id: string): Promise<PrescriptionResponse> {
    try {
      const result = await PrescriptionDAO.deleteById(id);
      if (!result) {
        return {
          success: false,
          error: "Prescription not found",
        };
      }

      logger.info(`Prescription deleted successfully: ${id}`);
      return {
        success: true,
        message: "Prescription deleted successfully",
      };
    } catch (error) {
      logger.error(`Error deleting prescription: ${error}`);
      return {
        success: false,
        error: `Failed to delete prescription: ${error}`,
      };
    }
  }

  /**
   * Get prescriptions by doctor ID
   */
  static async getPrescriptionsByDoctor(
    doctorId: string,
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
        PrescriptionDAO.getByDoctorId(doctorId, limit, skip),
        PrescriptionDAO.getCount({ doctor_id: doctorId }),
      ]);

      return {
        success: true,
        data: prescriptions.map(convertToPrescription),
        total,
      };
    } catch (error) {
      logger.error(`Error getting prescriptions by doctor: ${error}`);
      return {
        success: false,
        error: `Failed to get prescriptions: ${error}`,
      };
    }
  }

  /**
   * Get prescriptions by status
   */
  static async getPrescriptionsByStatus(
    status: "Pending" | "Sent" | "Delivered" | "Failed",
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
        PrescriptionDAO.getByStatus(status, limit, skip),
        PrescriptionDAO.getCount({ status }),
      ]);

      return {
        success: true,
        data: prescriptions.map(convertToPrescription),
        total,
      };
    } catch (error) {
      logger.error(`Error getting prescriptions by status: ${error}`);
      return {
        success: false,
        error: `Failed to get prescriptions: ${error}`,
      };
    }
  }

  /**
   * Search prescriptions by patient name
   */
  static async searchPrescriptionsByPatient(
    patientName: string,
    limit: number = 10,
    skip: number = 0,
  ): Promise<{
    success: boolean;
    data?: Prescription[];
    total?: number;
    error?: string;
  }> {
    try {
      const prescriptions = await PrescriptionDAO.getByPatientName(
        patientName,
        limit,
        skip,
      );
      // Note: Mongoose doesn't support count with regex in a simple way, so we'll use the length
      const total = prescriptions.length;

      return {
        success: true,
        data: prescriptions.map(convertToPrescription),
        total,
      };
    } catch (error) {
      logger.error(`Error searching prescriptions by patient: ${error}`);
      return {
        success: false,
        error: `Failed to search prescriptions: ${error}`,
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

  /**
   * Get prescription statistics
   */
  static async getPrescriptionStats(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const [total, pending, sent, delivered, failed] = await Promise.all([
        PrescriptionDAO.getCount(),
        PrescriptionDAO.getCount({ status: "Pending" }),
        PrescriptionDAO.getCount({ status: "Sent" }),
        PrescriptionDAO.getCount({ status: "Delivered" }),
        PrescriptionDAO.getCount({ status: "Failed" }),
      ]);

      const stats = {
        total,
        by_status: {
          pending,
          sent,
          delivered,
          failed,
        },
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      logger.error(`Error getting prescription stats: ${error}`);
      return {
        success: false,
        error: `Failed to get prescription statistics: ${error}`,
      };
    }
  }
}
