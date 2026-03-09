import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://umarshaikh52443:umar12345@cluster0.qfulss9.mongodb.net/proctoring", {
      useNewUrlParser: true,
    });
    console.log("MongoDB Connected:");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
