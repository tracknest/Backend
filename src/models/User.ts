import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

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
  role: "user" | "admin";
}

const UserSchema: Schema<IUser> = new Schema({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  phone: { type: String },
  avatarUrl: { type: String },
  otp: { type: String, default: undefined },
  otpExpires: { type: Number, default: undefined },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

UserSchema.pre<IUser>("save", async function (this: IUser) {
  if (!this.password) return;
  if (!this.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) return false; // Google users have no password
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
