import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

const examSchema = mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    examName: {
      type: String,
      required: true,
    },

    // 🔑 EXAM KEY (6 digits)
    examKey: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 6,
    },

    totalQuestions: {
      type: Number,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    examType: {
      type: String,
      enum: ["mcq", "mcq+coding"],
      required: true,
      default: "mcq",
    },

    liveDate: {
      type: Date,
      required: true,
    },

    deadDate: {
      type: Date,
      required: true,
    },

    // UUID-based exam public ID
    examId: {
      type: String,
      default: uuidv4,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================================
   🔐 EXAM KEY METHODS (OPTIONAL BUT RECOMMENDED)
================================ */

// Compare entered exam key
examSchema.methods.matchExamKey = async function (enteredKey) {
  return await bcrypt.compare(enteredKey, this.examKey);
};

// Hash exam key before saving
examSchema.pre("save", async function (next) {
  if (!this.isModified("examKey")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.examKey = await bcrypt.hash(this.examKey, salt);
});

const Exam = mongoose.model("Exam", examSchema);
export default Exam;
