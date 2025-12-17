import express from "express";
import {
  createReview,
  getUserReviews,
  getReviewById,
  getAllReviews,
  updateReview,
  deleteReview,
  getSentimentStats,
} from "../controllers/reviewController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/all", getAllReviews);

router.post("/create", verifyToken, createReview);
router.get("/user-reviews", verifyToken, getUserReviews);
router.get("/:reviewId", verifyToken, getReviewById);
router.put("/update/:reviewId", verifyToken, updateReview);
router.delete("/delete/:reviewId", verifyToken, deleteReview);
router.get("/stats/sentiment", verifyToken, getSentimentStats);

export default router;
