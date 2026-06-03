import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
const UserSchema = new Schema({
    googleId: { type: String, unique: true, sparse: true }, // sparse allows multiple null values
    email: { type: String, required: true, unique: true },
    password: { type: String },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone: { type: String },
    avatarUrl: { type: String },
    otp: { type: String, default: undefined },
    otpExpires: { type: Number, default: undefined },
    isVerified: { type: Boolean, default: false },
});
UserSchema.pre("save", async function () {
    if (!this.password)
        return; // skip if no password (Google user)
    if (!this.isModified("password"))
        return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    catch (err) {
        throw err;
    }
});
UserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password)
        return false; // Google users have no password
    return bcrypt.compare(candidatePassword, this.password);
};
const User = mongoose.model("User", UserSchema);
export default User;
//# sourceMappingURL=User.js.map