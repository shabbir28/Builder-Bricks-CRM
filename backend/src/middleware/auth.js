const jwt = require("jsonwebtoken");
const { User } = require("../models/index");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("--- Auth Middleware ---");
    console.log("Path:", req.path);
    console.log("Token present:", !!token);

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully for user ID:", decoded.id);

    // Mongoose findById → Sequelize findByPk
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid token or user not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

// Super Admin only
const superAdminAuth = (req, res, next) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Super Admin rights required.",
    });
  }
  next();
};

// Admin or Super Admin (full access)
const adminAuth = (req, res, next) => {
  if (!["super_admin", "admin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin rights required.",
    });
  }
  next();
};

// Executive only
const executiveAuth = (req, res, next) => {
  if (req.user.role !== "executive") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Executive rights required.",
    });
  }
  next();
};

// Any authenticated user (super_admin, admin, executive)
const anyRoleAuth = (req, res, next) => {
  if (!["super_admin", "admin", "executive"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  }
  next();
};

// Helper: Check if user is admin-level (super_admin or admin)
const isAdminLevel = (user) =>
  user && ["super_admin", "admin"].includes(user.role);

// Legacy alias for backward compatibility (old routes using agentOrAdminAuth)
const agentOrAdminAuth = anyRoleAuth;

module.exports = {
  auth,
  adminAuth,
  superAdminAuth,
  executiveAuth,
  anyRoleAuth,
  agentOrAdminAuth,
  isAdminLevel,
};
