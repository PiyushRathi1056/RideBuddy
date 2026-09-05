const express = require("express");
const RideRequest = require("../models/RidesRequest");
const BuddyRequest = require("../models/BuddyRequest");
const verifyFirebaseToken = require("../middleware/auth");

const router = express.Router();

const ONE_HOUR = 1 * 60 * 60 * 1000; // ms

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
        $gte: new Date(rideTime - ONE_HOUR),
        $lte: new Date(rideTime + ONE_HOUR),
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

    // Block if either ride is already matched or not active
    if (fromRide.status !== "active") {
      return res.status(400).json({ message: "Your ride is no longer active" });
    }
    if (toRide.status !== "active") {
      return res
        .status(400)
        .json({ message: "That ride is no longer available" });
    }

    // Check for duplicate (any status — don't allow re-requesting after rejection either)
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
      .populate("fromRideId", "from to departureTime name")
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

    // Guard: make sure neither ride has been deleted
    const [fromRide, toRide] = await Promise.all([
      RideRequest.findById(buddyReq.fromRideId),
      RideRequest.findById(buddyReq.toRideId),
    ]);

    if (!fromRide || fromRide.isDeleted) {
      // Requester's ride is gone — clean up this request
      buddyReq.status = "rejected";
      await buddyReq.save();
      return res
        .status(400)
        .json({ message: "The requester's ride no longer exists" });
    }

    if (!toRide || toRide.isDeleted) {
      buddyReq.status = "rejected";
      await buddyReq.save();
      return res.status(400).json({ message: "Your ride no longer exists" });
    }

    // Atomic lock on the requester's ride: only succeeds if it's still active.
    // This is the concurrency guard — if two accepts race, only one wins here.
    const lockedFromRide = await RideRequest.findOneAndUpdate(
      { _id: buddyReq.fromRideId, status: "active", isDeleted: false },
      { $set: { status: "matched", matchedWith: buddyReq.toRideId } },
      { new: true },
    );

    if (!lockedFromRide) {
      // Another accept already won the race, or the ride was matched/deleted
      buddyReq.status = "rejected";
      await buddyReq.save();
      return res.status(409).json({
        message: "That person has already been matched with someone else",
      });
    }

    // Atomic lock on the recipient's ride too — they might have accepted
    // a different request in a parallel call
    const lockedToRide = await RideRequest.findOneAndUpdate(
      { _id: buddyReq.toRideId, status: "active", isDeleted: false },
      { $set: { status: "matched", matchedWith: buddyReq.fromRideId } },
      { new: true },
    );

    if (!lockedToRide) {
      // Roll back the fromRide lock — this accept can't complete
      await RideRequest.findByIdAndUpdate(buddyReq.fromRideId, {
        status: "active",
        matchedWith: null,
      });
      buddyReq.status = "rejected";
      await buddyReq.save();
      return res
        .status(409)
        .json({ message: "Your ride is no longer available" });
    }

    // Both rides locked — confirm the buddy request
    buddyReq.status = "accepted";
    await buddyReq.save();

    // Cancel all other pending buddy requests involving either ride
    // (any direction — requests they sent or received)
    await BuddyRequest.updateMany(
      {
        _id: { $ne: buddyReq._id },
        status: "pending",
        $or: [
          { fromRideId: { $in: [buddyReq.fromRideId, buddyReq.toRideId] } },
          { toRideId: { $in: [buddyReq.fromRideId, buddyReq.toRideId] } },
        ],
      },
      { $set: { status: "rejected" } },
    );

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

// 💔 UNMATCH — removes buddy connection, keeps both rides active
router.patch("/unmatch/:rideId", verifyFirebaseToken, async (req, res) => {
  try {
    const ride = await RideRequest.findById(req.params.rideId);

    if (!ride || ride.isDeleted) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.userId !== req.user.uid) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (ride.status !== "matched") {
      return res.status(400).json({ message: "Ride is not matched" });
    }

    const buddyRideId = ride.matchedWith;

    // Reset both rides back to active
    await RideRequest.findByIdAndUpdate(buddyRideId, {
      status: "active",
      matchedWith: null,
    });

    ride.status = "active";
    ride.matchedWith = null;
    await ride.save();

    // Mark the buddy request as rejected so it doesn't linger
    await BuddyRequest.findOneAndUpdate(
      {
        $or: [
          { fromRideId: ride._id, toRideId: buddyRideId },
          { fromRideId: buddyRideId, toRideId: ride._id },
        ],
        status: "accepted",
      },
      { status: "rejected" },
    );

    res.json({ message: "Buddy removed. Your ride is active again." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
