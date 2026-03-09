import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  saveResult,
  getResultsByExamId,
  getUserResults,
  toggleResultVisibility,
  getAllResults,
} from "../controllers/resultController.js";

const resultRoutes = express.Router();

// All routes are protected
resultRoutes.use(protect);

// Save result
resultRoutes.post("/results", saveResult);

// Get all results (for teachers)
resultRoutes.get("/results/all", getAllResults);

// Get results for a specific exam (for teachers)
resultRoutes.get("/results/exam/:examId", getResultsByExamId);

// Get results for current user
resultRoutes.get("/results/user", getUserResults);

// Toggle result visibility
resultRoutes.put(
  "/results/:resultId/toggle-visibility",
  toggleResultVisibility
);

export default resultRoutes;
