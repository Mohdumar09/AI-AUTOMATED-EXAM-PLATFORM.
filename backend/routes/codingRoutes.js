import express from "express";
import {
  submitCodingAnswer,
  createCodingQuestion,
  getCodingQuestions,
  getCodingQuestion,
  getCodingQuestionsByExamId,
} from "../controllers/codingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

// Student routes
router.post("/submit", submitCodingAnswer);
router.get("/questions/exam/:examId", getCodingQuestionsByExamId);

// Teacher routes
router.post("/question", createCodingQuestion);
router.get("/questions", getCodingQuestions);
router.get("/questions/:id", getCodingQuestion);

export default router;
