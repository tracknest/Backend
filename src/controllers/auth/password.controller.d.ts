import type { Request, Response } from "express";
type PendingReset = {
    otpHash: string;
    otpExpires: number;
    isVerified?: boolean;
};
export declare const pendingResets: Map<string, PendingReset>;
export declare const forgotPassword: (req: Request, res: Response) => Promise<void>;
export declare const changePassword: (req: Request, res: Response) => Promise<void>;
export declare const resetPassword: (req: Request, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=password.controller.d.ts.map