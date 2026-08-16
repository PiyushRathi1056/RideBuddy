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
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
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
