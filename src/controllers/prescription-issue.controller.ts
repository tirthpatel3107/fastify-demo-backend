import { FastifyRequest, FastifyReply } from "fastify";
import { SignatureRxService } from "../services/signaturerx.service";
import { PrescriptionService } from "../services/prescription.service";
import { PrescriptionIssueRequestSchema } from "../utils/schemas";
import { STATUS } from "../utils/enums";
import logger from "../utils/logger";

export class PrescriptionIssueController {
  /**
   * Issue a prescription for delivery using SignatureRx API
   */
  static async issuePrescription(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Validate request body
      const validationResult = PrescriptionIssueRequestSchema.safeParse(request.body);
      if (!validationResult.success) {
        return reply.code(STATUS.BAD_REQUEST).send({
          success: false,
          error: "Invalid request data",
          details: validationResult.error.issues,
        });
      }

      const prescriptionData = validationResult.data;

      // Validate doctor exists and is authorized
      const doctorValidation = await PrescriptionService.getPrescriptionById(prescriptionData.doctor.id);
      if (!doctorValidation.success) {
        return reply.code(STATUS.BAD_REQUEST).send({
          success: false,
          error: "Invalid or unauthorized doctor",
        });
      }

      // Issue prescription via SignatureRx API
      const signatureRxResponse = await SignatureRxService.issuePrescriptionForDelivery(prescriptionData, request.server.config);

      if (!signatureRxResponse.success) {
        logger.error(`SignatureRx API error: ${signatureRxResponse.error}`);
        return reply.code(STATUS.SERVER_ERROR).send({
          success: false,
          error: "Failed to issue prescription via SignatureRx",
          message: signatureRxResponse.error,
        });
      }

      // Store prescription details in our database
      const prescriptionRequest = {
        patient_name: prescriptionData.patient.name,
        patient_dob: prescriptionData.patient.dateOfBirth,
        patient_address: prescriptionData.patient.address,
        medication: prescriptionData.medicine.name,
        dosage: prescriptionData.medicine.dosage,
        delivery_type: prescriptionData.delivery.type,
        doctor_id: prescriptionData.doctor.id,
        payload: {
          signatureRxId: signatureRxResponse.data?.id,
          signatureRxStatus: signatureRxResponse.data?.status,
          prescriptionUrl: signatureRxResponse.data?.prescription_url,
          signatureRxCreatedAt: signatureRxResponse.data?.created_at,
          signatureRxUpdatedAt: signatureRxResponse.data?.updated_at,
        },
        status: "Sent" as const,
      };

      const prescriptionResult = await PrescriptionService.createPrescription(prescriptionRequest);

      if (!prescriptionResult.success) {
        logger.error(`Failed to store prescription in database: ${prescriptionResult.error}`);
        return reply.code(STATUS.SERVER_ERROR).send({
          success: false,
          error: "Failed to store prescription in database",
          message: prescriptionResult.error,
        });
      }

      logger.info(`Prescription issued successfully: ${prescriptionResult.data?.id}`);

      return reply.code(STATUS.CREATE).send({
        success: true,
        data: {
          prescription_id: prescriptionResult.data?.id,
          signatureRx_id: signatureRxResponse.data?.id,
          status: prescriptionResult.data?.status,
          prescription_url: signatureRxResponse.data?.prescription_url,
          created_at: prescriptionResult.data?.created_at,
        },
        message: "Prescription issued successfully",
      });
    } catch (error: any) {
      logger.error(`Error issuing prescription: ${error.message}`);
      return reply.code(STATUS.SERVER_ERROR).send({
        success: false,
        error: "Failed to issue prescription",
        message: error.message,
      });
    }
  }

  /**
   * Get prescription status by ID
   */
  static async getPrescriptionStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      if (!id) {
        return reply.code(STATUS.BAD_REQUEST).send({
          success: false,
          error: "Prescription ID is required",
        });
      }

      const prescriptionResult = await PrescriptionService.getPrescriptionById(id);

      if (!prescriptionResult.success) {
        return reply.code(STATUS.NOT_FOUND).send({
          success: false,
          error: prescriptionResult.error,
        });
      }

      return reply.code(STATUS.SUCCESS).send({
        success: true,
        data: {
          id: prescriptionResult.data?.id,
          status: prescriptionResult.data?.status,
          signatureRxId: (prescriptionResult.data?.payload as any)?.signatureRxId,
          prescriptionUrl: (prescriptionResult.data?.payload as any)?.prescriptionUrl,
          created_at: prescriptionResult.data?.created_at,
          updated_at: prescriptionResult.data?.updated_at,
        },
        message: "Prescription status retrieved successfully",
      });
    } catch (error: any) {
      logger.error(`Error getting prescription status: ${error.message}`);
      return reply.code(STATUS.SERVER_ERROR).send({
        success: false,
        error: "Failed to get prescription status",
        message: error.message,
      });
    }
  }

  /**
   * Get available medicines for frontend dropdown
   */
  static async getAvailableMedicines(_request: FastifyRequest, reply: FastifyReply) {
    try {
      // Mock medicine data for frontend dropdown
      const medicines = [
        {
          id: "med_001",
          name: "Paracetamol 500mg",
          dosage: "1 tablet every 6 hours",
          description: "Pain relief and fever reducer",
        },
        {
          id: "med_002", 
          name: "Ibuprofen 400mg",
          dosage: "1 tablet every 8 hours",
          description: "Anti-inflammatory pain relief",
        },
        {
          id: "med_003",
          name: "Amoxicillin 250mg",
          dosage: "1 capsule every 8 hours",
          description: "Antibiotic for bacterial infections",
        },
        {
          id: "med_004",
          name: "Lisinopril 10mg",
          dosage: "1 tablet daily",
          description: "Blood pressure medication",
        },
        {
          id: "med_005",
          name: "Metformin 500mg",
          dosage: "1 tablet twice daily",
          description: "Diabetes medication",
        },
      ];

      return reply.code(STATUS.SUCCESS).send({
        success: true,
        data: medicines,
        message: "Available medicines retrieved successfully",
      });
    } catch (error: any) {
      logger.error(`Error getting available medicines: ${error.message}`);
      return reply.code(STATUS.SERVER_ERROR).send({
        success: false,
        error: "Failed to get available medicines",
        message: error.message,
      });
    }
  }

  /**
   * Get mock patient data for frontend testing
   */
  static async getMockPatientData(_request: FastifyRequest, reply: FastifyReply) {
    try {
      // Mock patient data for frontend testing
      const mockPatient = {
        name: "John Doe",
        dateOfBirth: "1990-01-15",
        address: "123 Main Street, London, SW1A 1AA",
        phone: "+44 20 7946 0958",
        email: "john.doe@example.com",
      };

      return reply.code(STATUS.SUCCESS).send({
        success: true,
        data: mockPatient,
        message: "Mock patient data retrieved successfully",
      });
    } catch (error: any) {
      logger.error(`Error getting mock patient data: ${error.message}`);
      return reply.code(STATUS.SERVER_ERROR).send({
        success: false,
        error: "Failed to get mock patient data",
        message: error.message,
      });
    }
  }
}
