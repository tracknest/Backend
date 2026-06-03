import type { Request, Response } from "express";
import type { SignupDTO } from "../../dto/auth.dto.ts";
type PendingRegistration = SignupDTO & {
    otpHash: string;
    otpExpires: number;
};
export declare const pendingRegistrations: Map<string, PendingRegistration>;
export declare const signup: (req: Request, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=signup.controller.d.ts.map