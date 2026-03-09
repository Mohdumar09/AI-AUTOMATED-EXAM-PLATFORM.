import mongoose from "mongoose";

const codingSchema = new mongoose.Schema(
  {
    examId: {
      type: String,
      required: [true, "Exam ID is required"],
    },
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Question description is required"],
      trim: true,
    },
    submittedAnswer: {
      code: {
        type: String,
        trim: true,
      },
      language: {
        type: String,
        enum: ["javascript", "python", "java", "cpp"],
      },
      status: {
        type: String,
        enum: ["pending", "passed", "failed", "error"],
        default: "pending",
      },
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher reference is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Add any necessary indexes
codingSchema.index({ examId: 1 });

const CodingQuestion = mongoose.model("CodingQuestion", codingSchema);

export default CodingQuestion;
