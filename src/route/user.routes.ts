import { FastifyInstance } from "fastify";
import { UserController } from "../controllers";
import { catchAsync } from "../utils";

export default async function userRoutes(fastify: FastifyInstance) {
  // Create user
  fastify.post("/", catchAsync(UserController.createUser));

  // Get user by ID
  fastify.get("/:id", catchAsync(UserController.getUserById));

  // Get user by email
  fastify.get("/email/:email", catchAsync(UserController.getUserByEmail));

  // Update user
  fastify.put("/:id", catchAsync(UserController.updateUser));

  // Delete user
  fastify.delete("/:id", catchAsync(UserController.deleteUser));

  // Get all users with pagination
  fastify.get("/", catchAsync(UserController.getUsers));

  // Get doctors list
  fastify.get("/doctors/list", catchAsync(UserController.getDoctors));

  // Validate doctor
  fastify.get(
    "/doctors/validate/:doctorId",
    catchAsync(UserController.validateDoctor),
  );
}
