import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import { connectDB } from "./db/connection.js";
connectDB();

import authRoutes from "./routes/authRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ message: "Server is running successfully", port: PORT });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`   Auth: POST /api/auth/signup`);
  console.log(`   Auth: POST /api/auth/login`);
  console.log(`   Reviews: POST /api/reviews/create`);
  console.log(`   Reviews: GET /api/reviews/user-reviews`);
  console.log(`   Reviews: GET /api/reviews/all`);
  console.log(`   Reviews: PUT /api/reviews/update/:reviewId`);
  console.log(`   Reviews: DELETE /api/reviews/delete/:reviewId`);
  console.log(`   Stats: GET /api/reviews/stats/sentiment`);
});
