import logger from "../config/logger.js";
const errorHandler = (err, _req, res, _next) => {
    // Default values
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message;
    // Log error details
    logger.error(`Error: ${err.message} | Status: ${statusCode} | Stack: ${err.stack}`);
    // Send JSON response
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};
export default errorHandler;
//# sourceMappingURL=errorHandler.middleware.js.map