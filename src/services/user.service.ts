import { UserDAO } from "../dao";
import { User } from "../interfaces";
import { UserDocument } from "../models";
import logger from "../utils/logger";

// Helper function to convert UserDocument to User
const convertToUser = (doc: UserDocument): User => ({
  id: (doc._id as any).toString(),
  name: doc.name,
  email: doc.email,
  role: doc.role,
  created_at: doc.created_at,
  updated_at: doc.updated_at,
});

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(
    userData: Omit<User, "id" | "created_at" | "updated_at">,
  ): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await UserDAO.getByEmail(userData.email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      const user = await UserDAO.create(userData);
      logger.info(`User created successfully: ${user.email}`);
      return convertToUser(user);
    } catch (error) {
      logger.error(`Error creating user: ${error}`);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    try {
      const user = await UserDAO.getById(id);
      return user ? convertToUser(user) : null;
    } catch (error) {
      logger.error(`Error getting user by ID: ${error}`);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await UserDAO.getByEmail(email);
      return user ? convertToUser(user) : null;
    } catch (error) {
      logger.error(`Error getting user by email: ${error}`);
      throw error;
    }
  }

  /**
   * Update user
   */
  static async updateUser(
    id: string,
    updateData: Partial<User>,
  ): Promise<User | null> {
    try {
      const user = await UserDAO.updateById(id, updateData);
      if (user) {
        logger.info(`User updated successfully: ${user.email}`);
      }
      return user ? convertToUser(user) : null;
    } catch (error) {
      logger.error(`Error updating user: ${error}`);
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await UserDAO.deleteById(id);
      if (result) {
        logger.info(`User deleted successfully: ${id}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error deleting user: ${error}`);
      throw error;
    }
  }

  /**
   * Get all users with pagination
   */
  static async getUsers(
    limit: number = 10,
    skip: number = 0,
    role?: "patient" | "doctor" | "admin",
  ): Promise<{ users: User[]; total: number }> {
    try {
      const [users, total] = await Promise.all([
        UserDAO.getAll(limit, skip, role),
        UserDAO.getCount(role),
      ]);

      return {
        users: users.map((user) => convertToUser(user)),
        total,
      };
    } catch (error) {
      logger.error(`Error getting users: ${error}`);
      throw error;
    }
  }

  /**
   * Validate doctor exists and is authorized to create prescriptions
   */
  static async validateDoctor(doctorId: string): Promise<boolean> {
    try {
      const doctor = await UserDAO.getById(doctorId);
      if (!doctor) {
        return false;
      }

      if (doctor.role !== "doctor" && doctor.role !== "admin") {
        return false;
      }

      return true;
    } catch (error) {
      logger.error(`Error validating doctor: ${error}`);
      throw error;
    }
  }

  /**
   * Get doctors list
   */
  static async getDoctors(): Promise<User[]> {
    try {
      const doctors = await UserDAO.getAll(100, 0, "doctor");
      return doctors.map(convertToUser);
    } catch (error) {
      logger.error(`Error getting doctors: ${error}`);
      throw error;
    }
  }
}
