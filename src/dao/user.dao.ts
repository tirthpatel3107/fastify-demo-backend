import { UserModel, UserDocument } from "../models";
import { User } from "../interfaces";

export class UserDAO {
  /**
   * Create a new user
   */
  static async create(
    userData: Omit<User, "id" | "created_at" | "updated_at">,
  ): Promise<UserDocument> {
    try {
      const user = new UserModel(userData);
      return await user.save();
    } catch (error) {
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  /**
   * Get user by ID
   */
  static async getById(id: string): Promise<UserDocument | null> {
    try {
      return await UserModel.findById(id);
    } catch (error) {
      throw new Error(`Failed to get user by ID: ${error}`);
    }
  }

  /**
   * Get user by email
   */
  static async getByEmail(email: string): Promise<UserDocument | null> {
    try {
      return await UserModel.findOne({ email: email.toLowerCase() });
    } catch (error) {
      throw new Error(`Failed to get user by email: ${error}`);
    }
  }

  /**
   * Update user by ID
   */
  static async updateById(
    id: string,
    updateData: Partial<User>,
  ): Promise<UserDocument | null> {
    try {
      return await UserModel.findByIdAndUpdate(
        id,
        { ...updateData, updated_at: new Date() },
        { new: true, runValidators: true },
      );
    } catch (error) {
      throw new Error(`Failed to update user: ${error}`);
    }
  }

  /**
   * Delete user by ID
   */
  static async deleteById(id: string): Promise<boolean> {
    try {
      const result = await UserModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error}`);
    }
  }

  /**
   * Get all users with pagination
   */
  static async getAll(
    limit: number = 10,
    skip: number = 0,
    role?: "patient" | "doctor" | "admin",
  ): Promise<UserDocument[]> {
    try {
      const filter = role ? { role } : {};
      return await UserModel.find(filter)
        .limit(limit)
        .skip(skip)
        .sort({ created_at: -1 });
    } catch (error) {
      throw new Error(`Failed to get users: ${error}`);
    }
  }

  /**
   * Get users count
   */
  static async getCount(
    role?: "patient" | "doctor" | "admin",
  ): Promise<number> {
    try {
      const filter = role ? { role } : {};
      return await UserModel.countDocuments(filter);
    } catch (error) {
      throw new Error(`Failed to get users count: ${error}`);
    }
  }
}
