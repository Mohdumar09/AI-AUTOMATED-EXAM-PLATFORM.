import CodingQuestion from "../models/codingQuestionModel.js";
import asyncHandler from "express-async-handler";

// @desc    Submit a coding answer
// @route   POST /api/coding/submit
// @access  Private (Student)
const submitCodingAnswer = asyncHandler(async (req, res) => {
  const { questionId, code, language } = req.body;

  if (!code || !language || !questionId) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Find the existing question
  const question = await CodingQuestion.findById(questionId);
  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  // Update the question with the submitted answer
  question.submittedAnswer = {
    code,
    language,
    status: "pending", // Initial status
    executionTime: 0, // Will be updated after execution
  };

  // Save the updated question
  const updatedQuestion = await question.save();

  res.status(200).json({
    success: true,
    data: updatedQuestion,
  });
});

// @desc    Create a new coding question
// @route   POST /api/coding/question
// @access  Private (Teacher)
const createCodingQuestion = asyncHandler(async (req, res) => {
  const { question, description, examId } = req.body;
  console.log("Received coding question data:", {
    question,
    description,
    examId,
  });

  if (!question || !description || !examId) {
    const missingFields = [];
    if (!question) missingFields.push("question");
    if (!description) missingFields.push("description");
    if (!examId) missingFields.push("examId");

    res.status(400);
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  try {
    // Check if a question already exists for this exam
    const existingQuestion = await CodingQuestion.findOne({
      examId: examId.toString(),
    });
    console.log("Existing question check:", existingQuestion);

    if (existingQuestion) {
      res.status(400);
      throw new Error(`A coding question already exists for exam: ${examId}`);
    }

    const newQuestion = await CodingQuestion.create({
      question,
      description,
      examId: examId.toString(),
      teacher: req.user._id,
    });

    console.log("Created new question:", newQuestion);

    res.status(201).json({
      success: true,
      data: newQuestion,
    });
  } catch (error) {
    console.error("Error creating coding question:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      details: error.stack,
    });
  }
});

// @desc    Get all coding questions
// @route   GET /api/coding/questions
// @access  Private
const getCodingQuestions = asyncHandler(async (req, res) => {
  const questions = await CodingQuestion.find()
    .select("-submittedAnswer") // Don't send other submissions
    .populate("teacher", "name email");

  res.status(200).json({
    success: true,
    count: questions.length,
    data: questions,
  });
});

// @desc    Get a single coding question
// @route   GET /api/coding/questions/:id
// @access  Private
const getCodingQuestion = asyncHandler(async (req, res) => {
  const question = await CodingQuestion.findById(req.params.id).populate(
    "teacher",
    "name email"
  );

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  res.status(200).json({
    success: true,
    data: question,
  });
});

// @desc    Get coding questions by exam ID
// @route   GET /api/coding/questions/exam/:examId
// @access  Private
const getCodingQuestionsByExamId = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  console.log("Fetching question for examId:", examId);

  if (!examId) {
    res.status(400);
    throw new Error("Exam ID is required");
  }

  try {
    const question = await CodingQuestion.findOne({
      examId: examId.toString(),
    });
    console.log("Found question:", question);

    if (!question) {
      res.status(404);
      throw new Error(`No coding question found for exam: ${examId}`);
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Error fetching coding question:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      details: error.stack,
    });
  }
});

export {
  submitCodingAnswer,
  createCodingQuestion,
  getCodingQuestions,
  getCodingQuestion,
  getCodingQuestionsByExamId,
};
