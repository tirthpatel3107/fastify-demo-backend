import { FastifyRequest, FastifyReply } from 'fastify';
import { PrescriptionService } from '../services';
import { CreatePrescriptionRequest, UpdatePrescriptionData } from '../interfaces';
import { STATUS } from '../utils/enums';

export class PrescriptionController {
  /**
   * Create a new prescription
   */
  static async createPrescription(request: FastifyRequest, reply: FastifyReply) {
    const prescriptionData = request.body as CreatePrescriptionRequest;
    
    // Validate required fields
    const requiredFields = ['patient_name', 'patient_dob', 'patient_address', 'medication', 'dosage', 'delivery_type', 'doctor_id'];
    const missingFields = requiredFields.filter(field => !prescriptionData[field as keyof CreatePrescriptionRequest]);
    
    if (missingFields.length > 0) {
      return reply.code(STATUS.BAD_REQUEST).send({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    const result = await PrescriptionService.createPrescription(prescriptionData);
    
    if (!result.success) {
      return reply.code(STATUS.BAD_REQUEST).send(result);
    }
    
    return reply.code(STATUS.CREATE).send(result);
  }

  /**
   * Get prescription by ID
   */
  static async getPrescriptionById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    
    const result = await PrescriptionService.getPrescriptionById(id);
    
    if (!result.success) {
      return reply.code(STATUS.NOT_FOUND).send(result);
    }
    
    return reply.code(STATUS.SUCCESS).send(result);
  }

  /**
   * Update prescription
   */
  static async updatePrescription(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const updateData = request.body as UpdatePrescriptionData;
    
    const result = await PrescriptionService.updatePrescription(id, updateData);
    
    if (!result.success) {
      return reply.code(STATUS.NOT_FOUND).send(result);
    }
    
    return reply.code(STATUS.SUCCESS).send(result);
  }

  /**
   * Delete prescription
   */
  static async deletePrescription(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    
    const result = await PrescriptionService.deletePrescription(id);
    
    if (!result.success) {
      return reply.code(STATUS.NOT_FOUND).send(result);
    }
    
    return reply.code(STATUS.SUCCESS).send(result);
  }

  /**
   * Get prescriptions by doctor ID
   */
  static async getPrescriptionsByDoctor(request: FastifyRequest, reply: FastifyReply) {
    const { doctorId } = request.params as { doctorId: string };
    const { limit = 10, skip = 0 } = request.query as { limit?: number; skip?: number };
    
    const result = await PrescriptionService.getPrescriptionsByDoctor(doctorId, limit, skip);
    
    if (!result.success) {
      return reply.code(STATUS.SERVER_ERROR).send(result);
    }
    
    return reply.code(STATUS.SUCCESS).send({
      ...result,
      pagination: {
        total: result.total,
        limit,
        skip,
        hasMore: result.total! > skip + limit
      }
    });
  }

  /**
   * Get prescriptions by status
   */
  static async getPrescriptionsByStatus(request: FastifyRequest, reply: FastifyReply) {
    const { status } = request.params as { status: string };
    const { limit = 10, skip = 0 } = request.query as { limit?: number; skip?: number };
    
    // Validate status
    const validStatuses = ['Pending', 'Sent', 'Delivered', 'Failed'];
    if (!validStatuses.includes(status)) {
      return reply.code(STATUS.BAD_REQUEST).send({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const result = await PrescriptionService.getPrescriptionsByStatus(status as "Pending" | "Sent" | "Delivered" | "Failed", limit, skip);
    
    if (!result.success) {
      return reply.code(STATUS.SERVER_ERROR).send(result);
    }
    
    return reply.code(STATUS.SUCCESS).send({
      ...result,
      pagination: {
        total: result.total,
        limit,
        skip,
        hasMore: result.total! > skip + limit
      }
    });
  }

  /**
   * Search prescriptions by patient name
   */
  static async searchPrescriptionsByPatient(request: FastifyRequest, reply: FastifyReply) {
    const { patientName } = request.params as { patientName: string };
    const { limit = 10, skip = 0 } = request.query as { limit?: number; skip?: number };
    
    if (!patientName || patientName.trim().length < 2) {
      return reply.code(STATUS.BAD_REQUEST).send({
        success: false,
        error: 'Patient name must be at least 2 characters long'
      });
    }
    
    const result = await PrescriptionService.searchPrescriptionsByPatient(patientName.trim(), limit, skip);
    
    if (!result.success) {
      return reply.code(STATUS.SERVER_ERROR).send(result);
    }
    
    return reply.code(STATUS.SUCCESS).send({
      ...result,
      pagination: {
        total: result.total,
        limit,
        skip,
        hasMore: result.total! > skip + limit
      }
    });
  }

  /**
   * Get all prescriptions with pagination
   */
  static async getAllPrescriptions(request: FastifyRequest, reply: FastifyReply) {
    const { limit = 10, skip = 0 } = request.query as { limit?: number; skip?: number };
    
    const result = await PrescriptionService.getAllPrescriptions(limit, skip);
    
    if (!result.success) {
      return reply.code(STATUS.SERVER_ERROR).send(result);
    }
    
    return reply.code(STATUS.SUCCESS).send({
      ...result,
      pagination: {
        total: result.total,
        limit,
        skip,
        hasMore: result.total! > skip + limit
      }
    });
  }

  /**
   * Update prescription status
   */
  static async updatePrescriptionStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: "Pending" | "Sent" | "Delivered" | "Failed" };
    
    // Validate status
    const validStatuses = ['Pending', 'Sent', 'Delivered', 'Failed'];
    if (!validStatuses.includes(status)) {
      return reply.code(STATUS.BAD_REQUEST).send({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const result = await PrescriptionService.updatePrescriptionStatus(id, status);
    
    if (!result.success) {
      return reply.code(STATUS.NOT_FOUND).send(result);
    }
    
    return reply.code(STATUS.SUCCESS).send(result);
  }

  /**
   * Get prescription statistics
   */
  static async getPrescriptionStats(_request: FastifyRequest, reply: FastifyReply) {
    const result = await PrescriptionService.getPrescriptionStats();
    
    if (!result.success) {
      return reply.code(STATUS.SERVER_ERROR).send(result);
    }
    
    return reply.code(STATUS.SUCCESS).send(result);
  }
}
