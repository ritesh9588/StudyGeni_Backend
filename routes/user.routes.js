import express from "express";
import { getUserInfo } from "../controller/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router()

router.get("/me", protectRoute, getUserInfo)

export default router;