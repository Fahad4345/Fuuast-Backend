import { Router } from "express";
import { Protected } from "../middleware/protected.js";
import useCompany from "../controller/admin/company.js";
const { getMyJobs, getApplicants, updateCompanyProfile } = useCompany();
const router = Router();
router.get("/MyJobs/:Id", Protected, getMyJobs);
router.get("/Applicants/:jobId", Protected, getApplicants);
router.put("/updateCompanyprofile/:Id", Protected, updateCompanyProfile);
export default router;
