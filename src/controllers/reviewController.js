import Review from "../schema/reviewSchema.js";
import Sentiment from "sentiment";
import mongoose from "mongoose";

const sentiment = new Sentiment();

const analyzeSentiment = (text) => {
  const result = sentiment.analyze(text);
  let sentimentLabel = "Neutral";
  let normalizedScore = result.score;

  if (result.score > 0) {
    sentimentLabel = "Positive";
    normalizedScore = Math.min(result.score / 5, 1);
  } else if (result.score < 0) {
    sentimentLabel = "Negative";
    normalizedScore = Math.max(result.score / 5, -1);
  }

  return {
    sentiment: sentimentLabel,
    score: normalizedScore,
  };
};

export const createReview = async (req, res) => {
  try {
    const { productName, reviewText, rating } = req.body;
    const userId = req.user.userId;

    if (!productName || !reviewText || !rating) {
      return res
        .status(400)
        .json({ error: "Product name, review text, and rating are required" });
    }

    if (reviewText.length < 10) {
      return res
        .status(400)
        .json({ error: "Review text must be at least 10 characters" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const sentimentData = analyzeSentiment(reviewText);

    const newReview = new Review({
      userId,
      productName,
      reviewText,
      rating,
      sentiment: sentimentData.sentiment,
      score: sentimentData.score,
    });

    await newReview.save();

    res.status(201).json({
      message: "Review created successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.userId;

    const reviews = await Review.find({ userId }).sort({ createdAt: -1 });

    if (!reviews.length) {
      return res.status(200).json({
        message: "No reviews found",
        reviews: [],
      });
    }

    res.status(200).json({
      message: "Reviews retrieved successfully",
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.userId.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    res.status(200).json({
      message: "Review retrieved successfully",
      review,
    });
  } catch (error) {
    console.error("Get review error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All reviews retrieved successfully",
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get all reviews error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { productName, reviewText, rating } = req.body;
    const userId = req.user.userId;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.userId.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    if (reviewText && reviewText.length < 10) {
      return res
        .status(400)
        .json({ error: "Review text must be at least 10 characters" });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (productName) review.productName = productName;
    if (reviewText) {
      review.reviewText = reviewText;
      const sentimentData = analyzeSentiment(reviewText);
      review.sentiment = sentimentData.sentiment;
      review.score = sentimentData.score;
    }
    if (rating) review.rating = rating;

    await review.save();

    res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.userId.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSentimentStats = async (req, res) => {
  try {mongoose.Types.ObjectId
    const userId = req.user.userId;

    const stats = await Review.aggregate([
      { $match: { userId: new (require("mongoose").Types.ObjectId)(userId) } },
      {
        $group: {
          _id: "$sentiment",
          count: { $sum: 1 },
          avgScore: { $avg: "$score" },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const totalReviews = await Review.countDocuments({ userId });

    res.status(200).json({
      message: "Sentiment statistics retrieved successfully",
      totalReviews,
      stats,
    });
  } catch (error) {
    console.error("Get sentiment stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
