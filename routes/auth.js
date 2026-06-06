import { Router } from "express";
import AuthController from "../controller/authController.js";
import { Protected } from "../middleware/protected.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import User from "../model/user.js";
import { uploadToCloudinary } from "../utils.js";
import { uploadImages, uploadResume } from "../middleware/upload.js";
const router = Router();
import useStudent from "../controller/student/student.js";
const { applyJob } = useStudent();
const authController = new AuthController();
router.post("/signup", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/requestAccess", authController.requestAccess);
router.post("/logout", authController.logout);
router.post("/sendResetPassword", authController.sendResetPassword);
router.post("/resetPassword", authController.resetPassword);
router.put("/updateProfile/:id", authController.updateprofile);
router.post("/applyJob/:id", Protected, applyJob);
router.put(
  "/uploadImages/:id",
  uploadImages.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  Protected,
  authController.uploadImages,
);
router.post(
  "/uploadResume/:id",
  Protected,
  uploadResume.single("resume"),
  async (req, res) => {
    try {
      const id = req.params.id;
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
          error: "File is required",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          resume: req.file.path,
        },
        { new: true },
      );

      res.json({
        success: true,
        message: "Resume uploaded & saved",
        user: updatedUser,
      });
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  },
);
router.put(
  "/updateResume/:id",
  Protected,
  uploadResume.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }
      const id = req.params.id;

      // Find current user
      const user = await User.findById(id);

      // OPTIONAL: Delete old resume from Cloudinary
      if (user?.resume) {
        const parts = user.resume.split("/");
        const fileName = parts[parts.length - 1];
        const publicId = `resumes/${fileName.split(".")[0]}`;

        await cloudinary.uploader.destroy(publicId, {
          resource_type: "raw",
        });
      }

      // Save new resume URL
      user.resume = req.file.path;

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: "Resume updated successfully",
        user: updatedUser,
      });
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  },
);

export default router;
