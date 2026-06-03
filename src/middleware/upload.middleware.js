import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => {
        // Validate mime type before upload reaches Cloudinary
        const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedMimes.includes(file.mimetype)) {
            throw new Error("Only JPEG, PNG, and WebP images are allowed");
        }
        return {
            folder: "tracknest/avatars",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            transformation: [
                { width: 400, height: 400, crop: "fill", gravity: "face" },
                { quality: "auto", fetch_format: "auto" },
            ],
            public_id: `avatar_${Date.now()}`,
        };
    },
});
const fileFilter = (_req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
    }
};
export const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    fileFilter,
}).single("avatar"); // expects field name "avatar" in the form-data body
//# sourceMappingURL=upload.middleware.js.map