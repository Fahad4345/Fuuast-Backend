import { Router } from "express";
import { Protected } from "../middleware/protected.js";
import useStudent from "../controller/student/student.js";
const { applyJob } = useStudent();
const router = Router();
router.post("/applyJob", Protected, applyJob);

export default router;
