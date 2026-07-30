const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const sequelize = require("./config/database");
// Import models (for associations setup)
require("./models/index");

console.log("-----------------------------------------");
console.log("🚀 CRM Backend Initialization Starting...");
console.log("-----------------------------------------");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const leadRoutes = require("./routes/leads");
const propertyRoutes = require("./routes/properties");
const propertyImportRoutes = require("./routes/propertyImportRoutes");
const propertyMatchingRoutes = require("./routes/propertyMatchingRoutes");
const dealRoutes = require("./routes/deals");
const activityRoutes = require("./routes/activities");
const dashboardRoutes = require("./routes/dashboard");
const communicationRoutes = require("./routes/communicationRoutes");
const taskRoutes = require("./routes/tasks");
const visitRoutes = require("./routes/visits");
const clientRoutes = require("./routes/clients");
const installmentRequestRoutes = require("./routes/installmentRequests");
const receiptsRoutes = require("./routes/receipts");

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
});
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
// Fallback for existing receipts in DB that have "/uploads/receipts/..." paths
app.use("/uploads/receipts", express.static(path.join(__dirname, "..", "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/properties", propertyMatchingRoutes);
app.use("/api/properties/import", propertyImportRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/communications", communicationRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/installment-requests", installmentRequestRoutes);
app.use("/api/receipts", receiptsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

console.log("📡 Connecting to PostgreSQL...");

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ SUCCESS: Connected to PostgreSQL!");
    // sync({force: false}) - Do not recreate tables if they already exist
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("✅ Database tables synced successfully!");
    app.listen(PORT, () => {
      console.log(`📡 SERVER: Running on http://localhost:${PORT}`);
      console.log("-----------------------------------------");
    });
  })
  .catch((error) => {
    console.error("❌ DATABASE CONNECTION ERROR:");
    console.error(error.message);
    console.log("\n💡 Troubleshooting Tips:");
    console.log("1. Check if PostgreSQL service is running");
    console.log("2. Verify DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD in .env");
    console.log("3. Check if the database 'Builders-Brick' exists");
    console.log("-----------------------------------------");
    process.exit(1);
  });
