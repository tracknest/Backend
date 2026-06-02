import type { Request, Response } from "express";
import User from "../../models/User.ts";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?._id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req.user as any)?._id;

    const { first_name, last_name, phone, avatarUrl } = req.body;
    const allowedUpdates: Record<string, any> = {};

    if (first_name !== undefined) allowedUpdates.first_name = first_name;
    if (last_name !== undefined) allowedUpdates.last_name = last_name;
    if (phone !== undefined) allowedUpdates.phone = phone;
    if (avatarUrl !== undefined) allowedUpdates.avatarUrl = avatarUrl;

    if (Object.keys(allowedUpdates).length === 0) {
      res.status(400).json({ message: "No valid field provider to update" });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: allowedUpdates },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
        res.status(404).json({message: "User not found"});
        return;
    }

    res.status(200).json({message: "Profile update successfully", user: updatedUser})
  } catch (error) {
    console.error("[updateProfile]", error);
    res.status(500).json({message: "Internal server error"})
  }
};




export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?._id;
 
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) {
      res.status(404).json({ message: "User not found" });
      return;
    }
 
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("[deleteAccount]", err);
    res.status(500).json({ message: "Internal server error" });
  }
};