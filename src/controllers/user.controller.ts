import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services';
import { User } from '../interfaces';
import { STATUS } from '../utils/enums';

export class UserController {
  /**
   * Create a new user
   */
  static async createUser(request: FastifyRequest, reply: FastifyReply) {
    const userData = request.body as Omit<User, 'id' | 'created_at' | 'updated_at'>;
    
    const user = await UserService.createUser(userData);
    
    return reply.code(STATUS.CREATE).send({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  }

  /**
   * Get user by ID
   */
  static async getUserById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    
    const user = await UserService.getUserById(id);
    
    if (!user) {
      return reply.code(STATUS.NOT_FOUND).send({
        success: false,
        error: 'User not found'
      });
    }
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: user,
      message: 'User retrieved successfully'
    });
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(request: FastifyRequest, reply: FastifyReply) {
    const { email } = request.query as { email: string };
    
    const user = await UserService.getUserByEmail(email);
    
    if (!user) {
      return reply.code(STATUS.NOT_FOUND).send({
        success: false,
        error: 'User not found'
      });
    }
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: user,
      message: 'User retrieved successfully'
    });
  }

  /**
   * Update user
   */
  static async updateUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const updateData = request.body as Partial<User>;
    
    const user = await UserService.updateUser(id, updateData);
    
    if (!user) {
      return reply.code(STATUS.NOT_FOUND).send({
        success: false,
        error: 'User not found'
      });
    }
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  }

  /**
   * Delete user
   */
  static async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    
    const result = await UserService.deleteUser(id);
    
    if (!result) {
      return reply.code(STATUS.NOT_FOUND).send({
        success: false,
        error: 'User not found'
      });
    }
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      message: 'User deleted successfully'
    });
  }

  /**
   * Get all users with pagination
   */
  static async getUsers(request: FastifyRequest, reply: FastifyReply) {
    const { 
      limit = 10, 
      skip = 0, 
      role 
    } = request.query as { 
      limit?: number; 
      skip?: number; 
      role?: string; 
    };
    
    const result = await UserService.getUsers(limit, skip, role as "patient" | "doctor" | "admin" | undefined);
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: result.users,
      pagination: {
        total: result.total,
        limit,
        skip,
        hasMore: result.total > skip + limit
      }
    });
  }

  /**
   * Get doctors list
   */
  static async getDoctors(_request: FastifyRequest, reply: FastifyReply) {
    const doctors = await UserService.getDoctors();
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: doctors
    });
  }

  /**
   * Validate doctor
   */
  static async validateDoctor(request: FastifyRequest, reply: FastifyReply) {
    const { doctorId } = request.params as { doctorId: string };
    
    const result = await UserService.getUserById(doctorId);
    
    if (!result) {
      return reply.code(STATUS.NOT_FOUND).send({
        success: false,
        error: 'Doctor not found'
      });
    }
    
    // Check if user is a doctor
    if (result.role !== 'doctor') {
      return reply.code(STATUS.BAD_REQUEST).send({
        success: false,
        error: 'User is not a doctor'
      });
    }
    
    return reply.code(STATUS.SUCCESS).send({
      success: true,
      data: result,
      message: 'Doctor is valid'
    });
  }
}
