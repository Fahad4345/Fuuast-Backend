import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "resumes",
    resource_type: "raw", // IMPORTANT for PDF files
    format: async () => "pdf",
    type: "upload",
    public_id: (req, file) => Date.now() + "-" + file.originalname,
  },
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "images",
    resource_type: "image",
    public_id: (req, file) =>
      Date.now() + "-" + file.originalname.split(".")[0],
  },
});

export const uploadImages = multer({
  storage: imageStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
});
export const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
});
