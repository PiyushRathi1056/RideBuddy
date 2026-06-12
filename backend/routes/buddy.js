const express = require("express");
const RideRequest = require("../models/RidesRequest");
const BuddyRequest = require("../models/BuddyRequest");
const verifyFirebaseToken = require("../middleware/auth");

const router = express.Router();

const TWO_HOURS = 2 * 60 * 60 * 1000; // ms

// 🔍 GET MATCHES FOR A RIDE
// Returns other users' active rides with same from/to within ±2hr window
// Sorted by closest departure time to the user's ride
router.get("/matches/:rideId", verifyFirebaseToken, async (req, res) => {
  try {
    const ride = await RideRequest.findById(req.params.rideId);

    if (!ride || ride.isDeleted) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Only the owner can look for matches on their ride
    if (ride.userId !== req.user.uid) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const rideTime = new Date(ride.departureTime).getTime();

    const matches = await RideRequest.find({
      _id: { $ne: ride._id }, // not the same ride
      userId: { $ne: req.user.uid }, // not the same user
      from: ride.from,
      to: ride.to,
      status: "active",
      isDeleted: false,
      departureTime: {
        $gte: new Date(rideTime - TWO_HOURS),
        $lte: new Date(rideTime + TWO_HOURS),
      },
    });

    // Sort by closest departure time to the user's ride
    matches.sort((a, b) => {
      const diffA = Math.abs(new Date(a.departureTime) - rideTime);
      const diffB = Math.abs(new Date(b.departureTime) - rideTime);
      return diffA - diffB;
    });

    // Attach buddy request status for each match so the frontend
    // knows if a request was already sent
    const matchesWithStatus = await Promise.all(
      matches.map(async (match) => {
        const existing = await BuddyRequest.findOne({
          fromRideId: ride._id,
          toRideId: match._id,
        });

        return {
          ...match.toObject(),
          buddyRequestStatus: existing ? existing.status : null,
          buddyRequestId: existing ? existing._id : null,
        };
      }),
    );

    res.json(matchesWithStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📨 SEND BUDDY REQUEST
router.post("/request", verifyFirebaseToken, async (req, res) => {
  try {
    const { fromRideId, toRideId } = req.body;

    if (!fromRideId || !toRideId) {
      return res.status(400).json({ message: "Both ride IDs are required" });
    }

    const fromRide = await RideRequest.findById(fromRideId);
    const toRide = await RideRequest.findById(toRideId);

    if (!fromRide || fromRide.isDeleted) {
      return res.status(404).json({ message: "Your ride not found" });
    }

    if (!toRide || toRide.isDeleted) {
      return res.status(404).json({ message: "Target ride not found" });
    }

    // Verify ownership of the fromRide
    if (fromRide.userId !== req.user.uid) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Prevent sending request to yourself
    if (toRide.userId === req.user.uid) {
      return res
        .status(400)
        .json({ message: "Cannot send request to yourself" });
    }

    // Check for duplicate
    const existing = await BuddyRequest.findOne({ fromRideId, toRideId });
    if (existing) {
      return res.status(400).json({ message: "Buddy request already sent" });
    }

    const buddyRequest = new BuddyRequest({
      fromUserId: req.user.uid,
      fromRideId,
      toUserId: toRide.userId,
      toRideId,
    });

    await buddyRequest.save();

    res.status(201).json({ message: "Buddy request sent", buddyRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📋 GET INCOMING BUDDY REQUESTS
router.get("/incoming", verifyFirebaseToken, async (req, res) => {
  try {
    const incoming = await BuddyRequest.find({
      toUserId: req.user.uid,
      status: "pending",
    })
      .populate("fromRideId", "from to departureTime name email")
      .populate("toRideId", "from to departureTime")
      .sort({ createdAt: -1 });

    res.json(incoming);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔢 GET PENDING INCOMING COUNT (for dashboard badge)
router.get("/incoming/count", verifyFirebaseToken, async (req, res) => {
  try {
    const count = await BuddyRequest.countDocuments({
      toUserId: req.user.uid,
      status: "pending",
    });

    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ ACCEPT BUDDY REQUEST
router.patch("/accept/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const buddyReq = await BuddyRequest.findById(req.params.id);

    if (!buddyReq) {
      return res.status(404).json({ message: "Buddy request not found" });
    }

    // Only the recipient can accept
    if (buddyReq.toUserId !== req.user.uid) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (buddyReq.status !== "pending") {
      return res.status(400).json({ message: "Request already handled" });
    }

    // Accept the buddy request
    buddyReq.status = "accepted";
    await buddyReq.save();

    // Mark both rides as matched and link them to each other
    await RideRequest.findByIdAndUpdate(buddyReq.fromRideId, {
      status: "matched",
      matchedWith: buddyReq.toRideId,
    });

    await RideRequest.findByIdAndUpdate(buddyReq.toRideId, {
      status: "matched",
      matchedWith: buddyReq.fromRideId,
    });

    res.json({ message: "Buddy request accepted! You're matched 🎉" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ❌ REJECT BUDDY REQUEST
router.patch("/reject/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const buddyReq = await BuddyRequest.findById(req.params.id);

    if (!buddyReq) {
      return res.status(404).json({ message: "Buddy request not found" });
    }

    // Only the recipient can reject
    if (buddyReq.toUserId !== req.user.uid) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (buddyReq.status !== "pending") {
      return res.status(400).json({ message: "Request already handled" });
    }

    buddyReq.status = "rejected";
    await buddyReq.save();

    res.json({ message: "Buddy request rejected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
