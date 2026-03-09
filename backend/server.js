import express from "express";
import dotenv from "dotenv";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import examRoutes from "./routes/examRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import codingRoutes from "./routes/codingRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import { exec } from "child_process";
import fs from "fs";
import { writeFileSync } from "fs";
import path from "path";
import cors from "cors";
dotenv.config();
connectDB();
const app = express();
const port = process.env.PORT || 5000;

// to parse req body
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://mini-project-ivory-seven.vercel.app",
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.post("/run-python", (req, res) => {
  const { code } = req.body; // Get Python code from request body
  writeFileSync("script.py", code); // Write code to script.py file

  exec("python script.py", (error, stdout, stderr) => {
    if (error) {
      res.send(`Error is: ${stderr}`); // Send error message if any
    } else {
      res.send(stdout); // Send output of the Python script
    }
  });
});

app.post("/run-javascript", (req, res) => {
  const { code } = req.body; // Get JavaScript code from request body
  writeFileSync("script.js", code); // Write code to script.js file

  exec("node script.js", (error, stdout, stderr) => {
    if (error) {
      res.send(`Error: ${stderr}`); // Send error message if any
    } else {
      res.send(stdout); // Send output of the JavaScript code
    }
  });
});

app.post("/run-java", (req, res) => {
  const { code } = req.body; // Get Java code from request body
  writeFileSync("Main.java", code); // Write code to Main.java file

  exec("javac Main.java && java Main", (error, stdout, stderr) => {
    if (error) {
      res.send(`Error: ${stderr}`); // Send error message if any
    } else {
      res.send(stdout); // Send output of the Java program
    }
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/users", resultRoutes);
app.use("/api/coding", codingRoutes);

// we we are deploying this in production
// make frontend build then
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  // we making front build folder static to serve from this app
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  // if we get an routes that are not define by us we show then index html file
  // every enpoint that is not api/users go to this index file
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("<h1>server is running </h1>");
  });
}

// Error handling middleware - must be after all routes
app.use(notFound);
app.use(errorHandler);

// Server
app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});

// Todos:
// -**POST /api/users**- Register a users
// -**POST /api/users/auth**- Authenticate a user and get token
// -**POST /api/users/logout**- logou user and clear cookie
// -**GET /api/users/profile**- Get user Profile
// -**PUT /api/users/profile**- Update user Profile
