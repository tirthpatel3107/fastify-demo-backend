import { FastifyInstance } from 'fastify';
import { PrescriptionController } from '../controllers';
import { catchAsync } from '../utils';

export default async function prescriptionRoutes(fastify: FastifyInstance) {
  // Create prescription
  fastify.post('/', catchAsync(PrescriptionController.createPrescription));

  // Get prescription by ID
  fastify.get('/:id', catchAsync(PrescriptionController.getPrescriptionById));

  // Update prescription
  fastify.put('/:id', catchAsync(PrescriptionController.updatePrescription));

  // Delete prescription
  fastify.delete('/:id', catchAsync(PrescriptionController.deletePrescription));

  // Update prescription status
  fastify.patch('/:id/status', catchAsync(PrescriptionController.updatePrescriptionStatus));

  // Get all prescriptions with pagination
  fastify.get('/', catchAsync(PrescriptionController.getAllPrescriptions));

  // Get prescriptions by doctor ID
  fastify.get('/doctor/:doctorId', catchAsync(PrescriptionController.getPrescriptionsByDoctor));

  // Get prescriptions by status
  fastify.get('/status/:status', catchAsync(PrescriptionController.getPrescriptionsByStatus));

  // Search prescriptions by patient name
  fastify.get('/search/patient/:patientName', catchAsync(PrescriptionController.searchPrescriptionsByPatient));

  // Get prescription statistics
  fastify.get('/stats/overview', catchAsync(PrescriptionController.getPrescriptionStats));
}
