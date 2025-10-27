import { FastifyRequest, FastifyReply } from "fastify";
import { SignatureRxService, PrescriptionService } from "../services";
import { STATUS } from "../utils/enums";
import logger from "../utils/logger";

export class PrescriptionIssueController {
  /**
   * Get all prescriptions with pagination
   */
  static async getAllPrescriptions(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    try {
      const { limit = 10, skip = 0 } = request.query as {
        limit?: number;
        skip?: number;
      };

      const result = await PrescriptionService.getAllPrescriptions(
        Number(limit),
        Number(skip),
      );

      if (!result.success) {
        return reply.code(STATUS.SERVER_ERROR).send({
          success: false,
          error: result.error,
        });
      }

      return reply.code(STATUS.SUCCESS).send({
        success: true,
        data: result.data,
        total: result.total,
        message: "Prescriptions retrieved successfully",
      });
    } catch (error: any) {
      logger.error(`Error getting all prescriptions: ${error.message}`);
      return reply.code(STATUS.SERVER_ERROR).send({
        success: false,
        error: "Failed to get prescriptions",
        message: error.message,
      });
    }
  }

  /**
   * Issue a prescription for delivery using SignatureRx API
   * Using the exact payload format from Blinx Healthcare assessment
   */
  static async issuePrescription(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Get request body
      const requestData = request.body as {
        patientName: string;
        dob: string;
        address: string;
        medication: string;
        dosage: string;
        deliveryType: string;
      };

      // Parse the DOB
      const dobDate = new Date(requestData.dob);
      const birth_day = String(dobDate.getDate()).padStart(2, "0");
      const birth_month = String(dobDate.getMonth() + 1).padStart(2, "0");
      const birth_year = String(dobDate.getFullYear());

      const nameParts = requestData.patientName.trim().split(/\s+/);
      const first_name = nameParts[0] || "Unknown";
      const last_name =
        nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Unknown";

      const addressParts = requestData.address
        .split(",")
        .map((part) => part.trim());
      const address_ln1 = addressParts[0] || requestData.address;
      const city =
        addressParts.length > 1 ? addressParts[addressParts.length - 2] : "";
      const post_code =
        addressParts.length > 1 ? addressParts[addressParts.length - 1] : "";

      // Create SignatureRx payload using actual data
      const signatureRxPayload: any = {
        action: "issueForDelivery",
        delivery_address: {
          address_ln1: address_ln1,
          address_ln2: "",
          city: city || "London",
          post_code: post_code || "SW1A",
          country: "United Kingdom",
        },
        prescription_id: "",
        patient: {
          first_name: first_name,
          last_name: last_name,
          birth_day: birth_day,
          birth_month: birth_month,
          birth_year: birth_year,
          address_ln1: address_ln1,
          address_ln2: "",
          city: city || "London",
          post_code: post_code || "SW1A",
          country: "United Kingdom",
          gender: "",
          email: "",
          phone: "",
          client_ref_id: "",
        },
        notes: "",
        client_ref_id: "",
        medicines: [
          {
            object: "medicine",
            id: 0,
            VPID: "",
            APID: "",
            VPPID: "",
            APPID: "",
            description: requestData.medication,
            qty: "1",
            directions: requestData.dosage,
          },
        ],
        // prescriber_ip: "11.17.271.86",
      };

      logger.info(
        "Issuing prescription with SignatureRx payload:",
        JSON.stringify(signatureRxPayload, null, 2),
      );

      // Issue prescription via SignatureRx API
      const signatureRxResponse =
        await SignatureRxService.issuePrescriptionForDelivery(
          signatureRxPayload,
          request.server.config,
        );

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
        patient_name: `${signatureRxPayload.patient.first_name} ${signatureRxPayload.patient.last_name}`,
        patient_dob: `${signatureRxPayload.patient.birth_year}-${signatureRxPayload.patient.birth_month}-${signatureRxPayload.patient.birth_day}`,
        patient_address: `${signatureRxPayload.patient.address_ln1}, ${signatureRxPayload.patient.city}, ${signatureRxPayload.patient.post_code}`,
        medication:
          signatureRxPayload.medicines[0]?.description || "Unknown medication",
        dosage: signatureRxPayload.medicines[0]?.directions || "As directed",
        delivery_type: "delivery" as const,
        doctor_id: "blinx_doctor_001",
        payload: {
          signatureRxId: signatureRxResponse.data?.id,
          signatureRxStatus: signatureRxResponse.data?.status,
          prescriptionUrl: signatureRxResponse.data?.prescription_url,
          signatureRxCreatedAt: signatureRxResponse.data?.created_at,
          signatureRxUpdatedAt: signatureRxResponse.data?.updated_at,
          originalPayload: signatureRxPayload,
        },
        status: "Sent" as const,
      };

      const prescriptionResult =
        await PrescriptionService.createPrescription(prescriptionRequest);

      if (!prescriptionResult.success) {
        logger.error(
          `Failed to store prescription in database: ${prescriptionResult.error}`,
        );
        return reply.code(STATUS.SERVER_ERROR).send({
          success: false,
          error: "Failed to store prescription in database",
          message: prescriptionResult.error,
        });
      }

      logger.info(
        `Prescription issued successfully: ${prescriptionResult.data?.id}`,
      );

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
  static async getPrescriptionStatus(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params as { id: string };

      if (!id) {
        return reply.code(STATUS.BAD_REQUEST).send({
          success: false,
          error: "Prescription ID is required",
        });
      }

      const prescriptionResult =
        await PrescriptionService.getPrescriptionById(id);

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
          signatureRxId: (prescriptionResult.data?.payload as any)
            ?.signatureRxId,
          prescriptionUrl: (prescriptionResult.data?.payload as any)
            ?.prescriptionUrl,
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
   * Using the exact medication data from Blinx Healthcare assessment
   */
  static async getAvailableMedicines(
    _request: FastifyRequest,
    reply: FastifyReply,
  ) {
    try {
      // Medicine data from Blinx Healthcare assessment
      const medicines = [
        {
          snomedId: "13892511000001100",
          displayName: "Amlodipine 5mg/5ml oral solution",
          unlicensed: false,
          endorsements: {},
          prescribeByBrandOnly: false,
          type: "vmp",
          bnfExactMatch: null,
          bnfMatches: null,
          applianceTypes: [],
        },
        {
          snomedId: "39732011000001102",
          displayName: "Amlodipine 5mg tablets",
          unlicensed: false,
          endorsements: {},
          prescribeByBrandOnly: false,
          type: "vmp",
          bnfExactMatch: null,
          bnfMatches: null,
          applianceTypes: [],
        },
        {
          snomedId: "11712111000001101",
          displayName: "Amlodipine 50mg/5ml oral solution",
          unlicensed: false,
          endorsements: {},
          prescribeByBrandOnly: false,
          type: "vmp",
          bnfExactMatch: null,
          bnfMatches: null,
          applianceTypes: [],
        },
        {
          snomedId: "15773611000001107",
          displayName: "Amlodipine 2mg/5ml oral solution",
          unlicensed: false,
          endorsements: {},
          prescribeByBrandOnly: false,
          type: "vmp",
          bnfExactMatch: null,
          bnfMatches: null,
          applianceTypes: [],
        },
        {
          snomedId: "15773411000001109",
          displayName: "Amlodipine 1.5mg/5ml oral solution",
          unlicensed: false,
          endorsements: {},
          prescribeByBrandOnly: false,
          type: "vmp",
          bnfExactMatch: null,
          bnfMatches: null,
          applianceTypes: [],
        },
        {
          snomedId: "11711911000001109",
          displayName: "Amlodipine 4mg/5ml oral solution",
          unlicensed: false,
          endorsements: {},
          prescribeByBrandOnly: false,
          type: "vmp",
          bnfExactMatch: null,
          bnfMatches: null,
          applianceTypes: [],
        },
        {
          snomedId: "8278311000001107",
          displayName: "Amlodipine 5mg/5ml oral suspension",
          unlicensed: false,
          endorsements: {},
          prescribeByBrandOnly: false,
          type: "vmp",
          bnfExactMatch: null,
          bnfMatches: null,
          applianceTypes: [],
        },
        {
          snomedId: "39731911000001109",
          displayName: "Amlodipine 10mg tablets",
          unlicensed: false,
          endorsements: {},
          prescribeByBrandOnly: false,
          type: "vmp",
          bnfExactMatch: null,
          bnfMatches: null,
          applianceTypes: [],
        },
        {
          snomedId: "20478011000001105",
          displayName: "Amlodipine 10mg/5ml oral solution",
          unlicensed: false,
          endorsements: {},
          prescribeByBrandOnly: false,
          type: "vmp",
          bnfExactMatch: null,
          bnfMatches: null,
          applianceTypes: [],
        },
        {
          snomedId: "42206211000001100",
          displayName: "Amlodipine 2.5mg tablets",
          unlicensed: false,
          endorsements: {},
          prescribeByBrandOnly: false,
          type: "vmp",
          bnfExactMatch: null,
          bnfMatches: null,
          applianceTypes: [],
        },
      ];

      return reply.code(STATUS.SUCCESS).send({
        success: true,
        data: {
          meds: medicines,
          total: medicines.length,
        },
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
   * Using SignatureRx patient format from Blinx Healthcare assessment
   */
  static async getMockPatientData(
    _request: FastifyRequest,
    reply: FastifyReply,
  ) {
    try {
      // Mock patient data in SignatureRx format
      const mockPatient = {
        first_name: "Pooja",
        last_name: "TR",
        gender: "female",
        email: "pooja+1133@signaturerx.co.uk",
        phone: "441234567890",
        birth_day: "10",
        birth_month: "01",
        birth_year: "1990",
        address_ln1: "Address line 1",
        address_ln2: "",
        city: "BLABLA",
        post_code: "SW1A",
        country: "United Kingdom",
        client_ref_id: "testingclientref",
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
