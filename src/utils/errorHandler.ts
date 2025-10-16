import { STATUS, STATUS_ERROR_MESSAGE } from "./enums";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleMongoError = (error: any): AppError => {
  // Wrong MongoDB ObjectId error
  if (error.name === "CastError") {
    const message = `Resource not found. Invalid ${error.path}`;
    return new AppError(message, STATUS.BAD_REQUEST);
  }

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const message = `${field} already exists`;
    return new AppError(message, STATUS.BAD_REQUEST);
  }

  return error;
};

export const handleJWTError = (error: any): AppError => {
  if (error.name === "JsonWebTokenError") {
    return new AppError("Invalid JWT. Please try again", STATUS.BAD_REQUEST);
  }

  if (error.name === "TokenExpiredError") {
    return new AppError("Expired JWT. Please try again", STATUS.BAD_REQUEST);
  }

  return error;
};

export const handleValidationError = (error: any): AppError => {
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err: any) => err.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppError(message, STATUS.BAD_REQUEST);
  }

  return error;
};

export const createErrorResponse = (error: AppError | Error) => {
  const statusCode =
    error instanceof AppError ? error.statusCode : STATUS.SERVER_ERROR;
  const message = error.message || STATUS_ERROR_MESSAGE.INTERNAL_SERVER;

  return {
    success: false,
    error: {
      status: statusCode,
      message: message,
    },
  };
};
