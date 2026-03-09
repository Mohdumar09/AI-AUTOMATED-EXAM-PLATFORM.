import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  createExam,
  DeleteExamById,
  getExams,
  validateExamKey,
} from "../controllers/examController.js";

import {
  createQuestion,
  getQuestionsByExamId,
} from "../controllers/quesController.js";

import {
  getCheatingLogsByExamId,
  saveCheatingLog,
} from "../controllers/cheatingLogController.js";

const examRoutes = express.Router();

/* =========================
   EXAM ROUTES
========================= */

// Get exams / Create exam
examRoutes
  .route("/")
  .get(protect, getExams)
  .post(protect, createExam);

/* =========================
   🔐 EXAM KEY VALIDATION
   (MUST COME BEFORE :examId)
========================= */

examRoutes.post("/validate-key", protect, validateExamKey);

/* =========================
   QUESTION ROUTES
========================= */

examRoutes.post("/questions", protect, createQuestion);
examRoutes.get("/questions/:examId", protect, getQuestionsByExamId);

/* =========================
   CHEATING LOG ROUTES
========================= */

examRoutes.get("/cheatingLogs/:examId", protect, getCheatingLogsByExamId);
examRoutes.post("/cheatingLogs", protect, saveCheatingLog);

/* =========================
   DELETE EXAM (UUID examId)
========================= */

examRoutes.delete("/:examId", protect, DeleteExamById);

export default examRoutes;
