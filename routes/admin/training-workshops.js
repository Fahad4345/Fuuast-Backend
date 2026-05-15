import { Router } from "express";
import { TrainingWorkshops } from "../../controller/admin/post.js";
import { Protected } from "../../middleware/protected.js";
import { useAlumni } from "../../controller/admin/alumni.js";
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

router.post("/createPost/:type", Protected, createPost);
router.get("/getPosts/:type", getPosts);
router.put("/updatePost/:id/:type", Protected, updatePost);
router.delete("/deletePost/:id", Protected, deletePost);

router.post("/createAlumni", Protected, createAlumni);
router.get("/getAlumni/:type", getAlumni);
router.get("/getAlumniAssociation/:type", getAlumniAssociation);
router.delete("/deleteAlumni/:id", Protected, deleteAlumni);
router.put("/updateAlumni/:id", Protected, updateAlumni);
router.put("/requestjoinAssociation/:id", Protected, requestjoinAssociation);
router.put("/updateAlumniStatus/:id", Protected, changeAssociationStatus);
export default router;
