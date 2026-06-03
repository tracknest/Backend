import type { Request, Response, NextFunction } from "express";
interface ErrorWithStatus extends Error {
    statusCode?: number;
}
declare const errorHandler: (err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => void;
export default errorHandler;
//# sourceMappingURL=errorHandler.middleware.d.ts.map