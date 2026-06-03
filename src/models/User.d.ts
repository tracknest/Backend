import mongoose, { Document } from "mongoose";
export interface IUser extends Document {
    googleId?: string;
    email: string;
    password?: string;
    first_name: string;
    last_name: string;
    phone?: string;
    avatarUrl?: string;
    otp?: string | undefined;
    otpExpires?: number | undefined;
    comparePassword(candidatePassword: string): Promise<boolean>;
    isVerified: boolean;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default User;
//# sourceMappingURL=User.d.ts.map