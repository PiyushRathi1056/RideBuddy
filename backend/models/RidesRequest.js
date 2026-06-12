const mongoose = require("mongoose");

const rideRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    from: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    to: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // ⭐ NEW: Proper datetime
    departureTime: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "matched", "cancelled"],
      default: "active",
      index: true,
    },

    // 🤝 Matched ride reference
    matchedWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RideRequest",
      default: null,
    },

    // 🗑️ Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("RideRequest", rideRequestSchema);
