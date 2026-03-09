import asyncHandler from "express-async-handler";
import Exam from "./../models/examModel.js";

/* =========================
   @desc    Get all exams
   @route   GET /api/exams
   @access  Private
========================= */
const getExams = asyncHandler(async (req, res) => {
  // Teacher sees only their exams, student sees all
  const query = req.user.isTeacher ? { creator: req.user._id } : {};
  const exams = await Exam.find(query);
  res.status(200).json(exams);
});

/* =========================
   @desc    Create a new exam
   @route   POST /api/exams
   @access  Private (Teacher/Admin)
========================= */
const createExam = asyncHandler(async (req, res) => {
  const {
    examName,
    examKey,
    totalQuestions,
    duration,
    liveDate,
    deadDate,
    examType,
  } = req.body;

  if (!examKey || examKey.length !== 6) {
    res.status(400);
    throw new Error("Exam key must be exactly 6 digits");
  }

  const exam = new Exam({
    examName,
    examKey, // 🔐 will be hashed automatically in model
    totalQuestions,
    duration,
    liveDate,
    deadDate,
    examType,
    creator: req.user._id,
  });

  const createdExam = await exam.save();

  if (createdExam) {
    res.status(201).json(createdExam);
  } else {
    res.status(400);
    throw new Error("Invalid Exam Data");
  }
});

/* =========================
   @desc    Delete exam by UUID examId
   @route   DELETE /api/exams/:examId
   @access  Private (Teacher/Admin)
========================= */
const DeleteExamById = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  const exam = await Exam.findOneAndDelete({ examId });

  if (!exam) {
    res.status(404);
    throw new Error("Exam not found");
  }

  res.status(200).json({ message: "Exam deleted successfully", exam });
});

/* =========================
   @desc    Validate exam key before opening exam
   @route   POST /api/exams/validate-key
   @access  Private (Student)
========================= */
const validateExamKey = asyncHandler(async (req, res) => {
  const { examId, examKey } = req.body;

  console.log("👉 validateExamKey HIT");
  console.log("examId:", examId);
  console.log("examKey:", examKey);


  if (!examId || !examKey) {
    res.status(400);
    throw new Error("Exam ID and Exam Key are required");
  }

  // Find exam using UUID
  const exam = await Exam.findOne({ examId });

  if (!exam) {
    res.status(404);
    throw new Error("Exam not found");
  }

  // 🔐 Validate exam key
  const isKeyValid = await exam.matchExamKey(examKey);

  if (!isKeyValid) {
    res.status(401);
    throw new Error("Invalid exam key");
  }

  // ⏰ Check exam timing
    // 🔥 FORCE BYPASS (NO DATE CHECK AT ALL)
  console.log("🔥 BYPASSING exam active check");
  console.log("liveDate:", exam.liveDate);
  console.log("deadDate:", exam.deadDate);
  console.log("now:", new Date());

  // ✅ Success
  res.status(200).json({
    message: "Exam key verified successfully",
    examId: exam.examId,
    mongoId: exam._id,
    examType: exam.examType,
    duration: exam.duration,
  });
});

export {
  getExams,
  createExam,
  DeleteExamById,
  validateExamKey,
};
