import { Router } from "express";
import { TrainingWorkshops } from "../../controller/admin/post.js";
import { Protected } from "../../middleware/protected.js";
import { useAlumni } from "../../controller/admin/alumni.js";
import useCompany from "../../controller/admin/company.js";
import { uploadImages } from "../../middleware/upload.js"
import { useStudent } from "../../controller/admin/student.js";
import multer from "multer";
const upload = multer()
const router = Router();
const { createPost, getPosts, deletePost, updatePost } = TrainingWorkshops();
const {
  createAlumni,
  getAlumni,
  deleteAlumni,
  updateAlumni,
  requestjoinAssociation,
  changeAssociationStatus,
  getAlumniAssociation,
} = useAlumni();
const { getSoftCompany, updateCompanyStatus } = useCompany();
const { createStudent, getStudent, deleteStudent, updateStudent } = useStudent();
const conditionalUpload = (req, res, next) => {
  if (req.params.type === "event") {
    uploadImages.single("image")(req, res, next);
  } else if (req.params.type === "training") {
    upload.any()(req, res, next);
  } else {
    next();
  }
};

router.post(
  "/createPost/:type",
  Protected,
  conditionalUpload,
  createPost
);
router.get("/getPosts/:type", getPosts);

router.put("/updatePost/:id/:type", conditionalUpload, Protected, updatePost);
router.delete("/deletePost/:id", Protected, deletePost);
router.put("/updateCompanyStatus/:id/:status", Protected, updateCompanyStatus);
router.get("/getsoftCompany/:type", Protected, getSoftCompany);
router.post("/createAlumni", Protected, createAlumni);
router.get("/getAlumni/:type", getAlumni);
router.get("/getAlumniAssociation/:type", getAlumniAssociation);
router.delete("/deleteAlumni/:id", Protected, deleteAlumni);
router.put("/updateAlumni/:id", Protected, updateAlumni);
router.put("/requestjoinAssociation/:id", Protected, requestjoinAssociation);
router.put("/updateAlumniStatus/:id", Protected, changeAssociationStatus);
router.post("/createStudent", Protected, createStudent);
router.get("/getStudent", getStudent);
router.delete("/deleteStudent/:id", Protected, deleteStudent);
router.put("/updateStudent/:id", Protected, updateStudent);
export default router;
