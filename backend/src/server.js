const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const datasetRoutes = require("./routes/datasetRoutes");
const predictionRoutes = require("./routes/predictionRoutes");

const app = express();


// ============================================================
// Connect MongoDB
// ============================================================

connectDB();


// ============================================================
// Middleware
// ============================================================

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/datasets", datasetRoutes);
app.use("/api/predictions", predictionRoutes);

// ============================================================
// Health Check
// ============================================================

app.get("/", (req, res) => {
    res.json({
        service: "BugVision AI Backend",
        status: "running",
        version: "1.0.0",
        database: "MongoDB"
    });
});


// ============================================================
// Start Server
// ============================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`BugVision AI Backend running on port ${PORT}`);
});