const mongoose = require("mongoose");

const buddyRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: String,
      required: true,
      index: true,
    },

    fromRideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RideRequest",
      required: true,
    },

    toUserId: {
      type: String,
      required: true,
      index: true,
    },

    toRideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RideRequest",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate buddy requests between the same two rides
buddyRequestSchema.index({ fromRideId: 1, toRideId: 1 }, { unique: true });

module.exports = mongoose.model("BuddyRequest", buddyRequestSchema);
