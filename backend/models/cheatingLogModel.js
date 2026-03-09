import mongoose from "mongoose";

// Define a schema for the cheating log
const cheatingLogSchema = new mongoose.Schema(
  {
    noFaceCount: { type: Number, default: 0 },
    multipleFaceCount: { type: Number, default: 0 },
    cellPhoneCount: { type: Number, default: 0 },
    prohibitedObjectCount: { type: Number, default: 0 },

    examId: { type: String, required: true }, // MongoDB _id
    examUUID: { type: String }, // UUID format for reference
    email: { type: String, required: true },
    username: { type: String, required: true },

    screenshots: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ["noFace", "multipleFace", "cellPhone", "prohibitedObject"],
          required: true,
        },
        detectedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create a model using the schema
const CheatingLog = mongoose.model("CheatingLog", cheatingLogSchema);

export default CheatingLog;
