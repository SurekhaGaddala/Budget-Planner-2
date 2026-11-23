require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./src/routes/authRoutes");
const transactionRoutes = require("./src/routes/transactionRoutes");
const budgetRoutes = require("./src/routes/budgetRoutes");
const goalRoutes = require("./src/routes/goalRoutes");
const userRoutes = require("./src/routes/userRoutes");

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to Budget Planner Backend!");
});

// API root & health check
app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    message: "Budget Planner API root"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Budget Planner API is running"
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Server error"
  });
});

// Server and MongoDB connection
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });