// src/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from "express";
import logger from "../config/logger.ts";


interface ErrorWithStatus extends Error {
  statusCode?: number;
}

const errorHandler = (
  err: ErrorWithStatus,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default values
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message;

  // Log error details
  logger.error(
    `Error: ${err.message} | Status: ${statusCode} | Stack: ${err.stack}`
  );

  // Send JSON response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorHandler;
