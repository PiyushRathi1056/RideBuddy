const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const connectDB = require("./config/db");

const verifyFirebaseToken = require("./middleware/auth");
const rideRoutes = require("./routes/rides");
const buddyRoutes = require("./routes/buddy");
const startExpireRidesJob = require("./jobs/expireRides");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Start scheduled jobs
startExpireRidesJob();

app.get("/protected", verifyFirebaseToken, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

// Basic test route
app.get("/", (req, res) => {
  res.send("RideBuddy API is running 🚗");
});

app.use("/api/rides", rideRoutes);
app.use("/api/buddy", buddyRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
