const mongoose = require("mongoose");

const nftSchema = new mongoose.Schema(
  {
    title: String,
    description: String,

    imageUrl: String,
    cloudinaryId: String,

    price: { type: Number, required: true },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isListed: { type: Boolean, default: true },
    isPaused: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["available", "pending", "sold"],
      default: "available",
    },

    purchasePendingUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NFT", nftSchema);