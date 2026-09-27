require("dotenv").config();
const express = require("express");
const cors = require("cors");
const prisma = require("./prisma");
const categoryRoutes = require("./routes/categoryRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
// Google Cloud Run injects PORT (defaults to 8080)
const PORT = process.env.PORT || 5001;

// CORS configuration (configured for development and production Cloud Run)
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(
  cors({
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Standardized Health Check Endpoint (Google Cloud Run / Kubernetes / Monitoring)
app.get("/api/health", async (req, res) => {
  try {
    // Quick DB query to verify PostgreSQL connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      service: "waste-collection-api",
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      service: "waste-collection-api",
      message: "Database connection failed",
    });
  }
});

// Category Routes
app.use("/api/waste-categories", categoryRoutes);

// Collection Request Routes (Supports both /api/requests and /api/collection-requests)
app.use("/api/requests", requestRoutes);
app.use("/api/collection-requests", requestRoutes);

// Admin Operations & Analytics Routes
app.use("/api/admin", adminRoutes);

// Root informational endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "waste-collection-api",
    message: "EcoCollect Waste Collection Management Platform API is running.",
    documentation: {
      health: "GET /api/health",
      categories: "GET /api/waste-categories",
      createRequest: "POST /api/requests",
      trackRequest: "GET /api/requests/track/:requestNumber",
      userHistory: "GET /api/requests/user/:phone",
      adminRequests: "GET /api/admin/requests",
      adminStats: "GET /api/admin/stats",
      adminAnalytics: "GET /api/admin/analytics",
    },
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Centralized Error Handler caught:", err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start listener bound to 0.0.0.0 for Cloud Run compatibility
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`[EcoCollect] Backend API active on port ${PORT} (0.0.0.0)`);
  console.log(`[EcoCollect] Health Check: http://localhost:${PORT}/api/health`);
  console.log(`[EcoCollect] Categories: http://localhost:${PORT}/api/waste-categories`);
});

module.exports = app;
