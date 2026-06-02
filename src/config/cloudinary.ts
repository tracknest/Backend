import { v2 as cloudinary } from "cloudinary";
import logger from "./logger.ts";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure:     true, // always return https URLs
});

// Verify the config is valid at startup
export const verifyCloudinary = async (): Promise<void> => {
  try {
    await cloudinary.api.ping();
    logger.info("Cloudinary connected");
  } catch (err) {
    logger.error("Cloudinary connection error: " + err);
    process.exit(1);
  }
};

export default cloudinary;