import express from "express";
import { uploadFile, getAllFiles, getFileById } from "../controller/file.controller.js";
import { getFileSummary, getFileQuiz } from "../controller/ai.controller.js";
import { upload } from "../middleware/upload.middleware.js";
import { protectRoute, isTeacher } from "../middleware/auth.middleware.js";

const router = express.Router()

router.post("/", protectRoute, isTeacher, upload.single('file'), uploadFile)
router.get("/", getAllFiles)

router.get("/:id", getFileById)

router.get("/:id/summary", protectRoute, getFileSummary)

router.get("/:id/quiz", protectRoute, getFileQuiz)

export default router;