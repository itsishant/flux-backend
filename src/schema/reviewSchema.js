import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    reviewText: {
      type: String,
      required: true,
      minlength: 10,
    },
    sentiment: {
      type: String,
      enum: ["Positive", "Negative", "Neutral"],
      default: "Neutral",
    },
    score: {
      type: Number,
      min: -1,
      max: 1,
      default: 0,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
