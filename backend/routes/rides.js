const express = require("express");
const RideRequest = require("../models/RidesRequest");
const BuddyRequest = require("../models/BuddyRequest");
const verifyFirebaseToken = require("../middleware/auth");

const router = express.Router();

// 🚗 CREATE RIDE
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const { from, to, departureTime, name } = req.body;

    if (!from || !to || !departureTime || !name) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    // Enforce 3-day advance booking limit
    const departure = new Date(departureTime);
    const now = new Date();
    const diffMs = departure - now;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > 3) {
      return res.status(400).json({
        message: "Rides can only be requested up to 3 days in advance.",
      });
    }

    if (departure < now) {
      return res.status(400).json({
        message: "Departure time cannot be in the past.",
      });
    }

    const { uid, email } = req.user;

    // Limit active rides
    const activeCount = await RideRequest.countDocuments({
      userId: uid,
      status: "active",
      isDeleted: false,
    });

    if (activeCount >= 3) {
      return res.status(400).json({
        message: "Maximum 3 active rides allowed.",
      });
    }

    const ride = new RideRequest({
      userId: uid,
      name,
      email,
      from,
      to,
      departureTime: new Date(departureTime),
    });

    await ride.save();

    res.status(201).json({
      message: "Ride created successfully",
      ride,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📋 GET MY RIDES
router.get("/my", verifyFirebaseToken, async (req, res) => {
  try {
    const rides = await RideRequest.find({
      userId: req.user.uid,
      isDeleted: false,
      status: { $ne: "cancelled" },
    })
      .populate("matchedWith", "name from to departureTime")
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// 🌍 GET ALL RIDES (FEED)
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const rides = await RideRequest.find({
      isDeleted: false,
      status: "active",
      departureTime: { $gte: new Date() },
    }).sort({ departureTime: 1 });

    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// 🗑️ DELETE (SOFT DELETE)
router.delete("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const ride = await RideRequest.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // 🔒 Ownership check
    if (ride.userId !== req.user.uid) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🤝 If this ride was matched, free up the buddy's ride
    if (ride.status === "matched" && ride.matchedWith) {
      await RideRequest.findByIdAndUpdate(ride.matchedWith, {
        status: "active",
        matchedWith: null,
      });
    }

    // 🗑️ Soft delete
    ride.isDeleted = true;
    ride.deletedAt = new Date();
    ride.status = "cancelled";
    await ride.save();

    // ❌ Cancel all pending buddy requests involving this ride (sent or received)
    await BuddyRequest.updateMany(
      {
        status: "pending",
        $or: [{ fromRideId: ride._id }, { toRideId: ride._id }],
      },
      { $set: { status: "rejected" } },
    );

    res.json({ message: "Ride deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📄 GET SINGLE RIDE (for future clickable card)
router.get("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const ride = await RideRequest.findById(req.params.id);

    if (!ride || ride.isDeleted) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.json(ride);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
