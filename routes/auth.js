
import { Router } from "express";
import AuthController from "../controller/authController.js";
import { Protected } from "../middleware/protected.js";

const router = Router();
const authController = new AuthController();
router.post("/signup", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);
router.put("/updateprofile/:id", Protected, authController.updateprofile);

export default router;