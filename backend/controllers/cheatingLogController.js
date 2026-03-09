import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import CheatingLog from "../models/cheatingLogModel.js";
import Exam from "../models/examModel.js";

// @desc Save cheating log data
// @route POST /api/cheatingLogs
// @access Private
const saveCheatingLog = asyncHandler(async (req, res) => {
  console.log('Received request to save cheating log');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const {
    noFaceCount,
    multipleFaceCount,
    cellPhoneCount,
    prohibitedObjectCount,
    examId,
    username,
    email,
    screenshots,
  } = req.body;

  console.log("Received cheating log data:", {
    noFaceCount,
    multipleFaceCount,
    cellPhoneCount,
    prohibitedObjectCount,
    examId,
    username,
    email,
    screenshots,
  });

  if (!examId) {
    console.error('Missing examId in request');
    res.status(400);
    throw new Error('examId is required');
  }

  if (!username || !email) {
    console.error('Missing user information');
    res.status(400);
    throw new Error('username and email are required');
  }

  const cheatingLog = new CheatingLog({
    noFaceCount: Number(noFaceCount) || 0,
    multipleFaceCount: Number(multipleFaceCount) || 0,
    cellPhoneCount: Number(cellPhoneCount) || 0,
    prohibitedObjectCount: Number(prohibitedObjectCount) || 0,
    examId,
    username,
    email,
    screenshots: screenshots || [],
  });

  console.log('Attempting to save cheating log:', JSON.stringify(cheatingLog, null, 2));
  
  const savedLog = await cheatingLog.save();
  console.log('Successfully saved cheating log:', JSON.stringify(savedLog, null, 2));

  if (savedLog) {
    res.status(201).json(savedLog);
  } else {
    console.error('Failed to save cheating log - no document returned');
    res.status(400);
    throw new Error('Failed to save cheating log');
  }
});

// @desc Get all cheating log data for a specific exam
// @route GET /api/cheatingLogs/:examId
// @access Private
const getCheatingLogsByExamId = asyncHandler(async (req, res) => {
  const examId = req.params.examId;
  console.log('Fetching logs for exam:', examId);

  try {
    // First get the exam details to verify it exists
    let exam;
    if (mongoose.Types.ObjectId.isValid(examId)) {
      console.log('Looking up exam by MongoDB ID:', examId);
      exam = await Exam.findById(examId);
    }
    
    if (!exam) {
      console.log('Looking up exam by examId:', examId);
      exam = await Exam.findOne({ examId: examId });
    }

    if (!exam) {
      console.log('Exam not found:', examId);
      return res.status(404).json({ message: 'Resource Not Found in DB' });
    }

    console.log('Found exam:', {
      _id: exam._id,
      examId: exam.examId,
      name: exam.examName
    });
    
    // Find logs using both ID formats
    const cheatingLogs = await CheatingLog.find({
      $or: [
        { examId: exam._id.toString() }, // Match by MongoDB _id
        { examId: exam.examId }, // Legacy: Match by UUID (old format)
        { examUUID: exam.examId }, // New: Match by stored UUID
      ]
    })
    .select('-__v') // Exclude version field
    .sort({ createdAt: -1 }); // Sort by newest first

    console.log(`Found ${cheatingLogs.length} logs for exam ${exam.examName}`);

    if (cheatingLogs.length === 0) {
      console.log('No logs found');
      return res.status(200).json([]); // Return empty array for no logs
    }

    // Log sample entry for debugging
    if (cheatingLogs.length > 0) {
      console.log('Sample log entry:', {
        id: cheatingLogs[0]._id,
        examId: cheatingLogs[0].examId,
        username: cheatingLogs[0].username,
        violations: {
          noFace: cheatingLogs[0].noFaceCount,
          multipleFace: cheatingLogs[0].multipleFaceCount,
          cellPhone: cheatingLogs[0].cellPhoneCount,
          prohibited: cheatingLogs[0].prohibitedObjectCount
        }
      });
    }

    return res.status(200).json(cheatingLogs);
  } catch (error) {
    console.error('Error in getCheatingLogsByExamId:', error);
    return res.status(500).json({ 
      message: 'Error fetching cheating logs',
      error: error.message || 'Internal Server Error',
      examId: examId
    });
  }
});

export { saveCheatingLog, getCheatingLogsByExamId };
