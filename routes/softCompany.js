import { Router } from "express";
import { Protected } from "../middleware/protected.js";
import useCompany from "../controller/admin/company.js";
const { getMyJobs } = useCompany();
const router = Router();
router.get("/MyJobs/:Id", Protected, getMyJobs);

export default router;
