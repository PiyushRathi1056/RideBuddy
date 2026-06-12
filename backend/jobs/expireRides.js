const cron = require("node-cron");
const RideRequest = require("../models/RidesRequest");

const runCleanup = async () => {
  console.log("[CRON] Running expired rides cleanup...");

  try {
    const now = new Date();

    const expiredRides = await RideRequest.find({
      isDeleted: false,
      status: { $ne: "cancelled" },
      departureTime: { $lt: now },
    });

    if (expiredRides.length === 0) {
      console.log("[CRON] No expired rides found.");
      return;
    }

    for (const ride of expiredRides) {
      // If matched, free up the buddy's ride
      if (ride.status === "matched" && ride.matchedWith) {
        await RideRequest.findByIdAndUpdate(ride.matchedWith, {
          status: "active",
          matchedWith: null,
        });
      }

      ride.isDeleted = true;
      ride.deletedAt = now;
      ride.status = "cancelled";
      await ride.save();
    }

    console.log(
      `[CRON] Expired and cleaned up ${expiredRides.length} ride(s).`,
    );
  } catch (error) {
    console.error("[CRON] Error during expired rides cleanup:", error.message);
  }
};

const startExpireRidesJob = () => {
  // Run immediately on startup to catch any already-expired rides
  runCleanup();

  // Then run every hour at the top of the hour
  cron.schedule("0 * * * *", runCleanup);

  console.log("[CRON] Expire rides job scheduled (every hour).");
};

module.exports = startExpireRidesJob;
