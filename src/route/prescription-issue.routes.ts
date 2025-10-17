import { FastifyInstance } from "fastify";
import { PrescriptionIssueController } from "../controllers";

export default async function prescriptionIssueRoutes(
  fastify: FastifyInstance,
) {
  // Get all prescriptions
  fastify.get("/", PrescriptionIssueController.getAllPrescriptions);

  // Issue prescription for delivery
  fastify.post("/issue", PrescriptionIssueController.issuePrescription);

  // Get prescription status
  fastify.get("/:id/status", PrescriptionIssueController.getPrescriptionStatus);

  // Get available medicines for frontend dropdown
  fastify.get("/medicines", PrescriptionIssueController.getAvailableMedicines);

  // Get mock patient data for frontend
  fastify.get("/patient/mock", PrescriptionIssueController.getMockPatientData);
}
