import { FastifyRequest, FastifyReply } from "fastify";
import { 
  AppError, 
  handleMongoError, 
  handleJWTError, 
  handleValidationError,
  createErrorResponse 
} from "./errorHandler";
import { STATUS } from "./enums";

/**
 * Wraps async route handlers to automatically catch and handle errors
 * This eliminates the need for try-catch blocks in every route handler
 */
export const catchAsync = (
  fn: (request: FastifyRequest, reply: FastifyReply) => Promise<any>
) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      return await fn(request, reply);
    } catch (error: any) {
      // Handle specific error types
      let processedError = error;

      // Handle MongoDB errors
      if (error.name === "CastError" || error.code === 11000) {
        processedError = handleMongoError(error);
      }
      
      // Handle JWT errors
      if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
        processedError = handleJWTError(error);
      }
      
      // Handle validation errors
      if (error.name === "ValidationError") {
        processedError = handleValidationError(error);
      }

      // Create error response
      const errorResponse = createErrorResponse(processedError);
      
      // Send error response with appropriate status code
      const statusCode = processedError instanceof AppError ? processedError.statusCode : STATUS.SERVER_ERROR;
      
      return reply.code(statusCode).send(errorResponse);
    }
  };
};
