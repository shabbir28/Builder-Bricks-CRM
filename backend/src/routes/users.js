const express = require("express");
const { body } = require("express-validator");
const { auth, adminAuth, superAdminAuth, isAdminLevel } = require("../middleware/auth");
const { User, Lead, Deal } = require("../models/index");

const router = express.Router();

// All routes require authentication
router.use(auth);

// @desc    Get agents with their assigned leads/deals summary
// @route   GET /api/users/agents-stats
// @access  Private/Admin
router.get("/agents-stats", adminAuth, async (req, res) => {
  try {
    const agents = await User.findAll({
      where: { 
        role: ["executive", "agent", "admin", "super_admin"] 
      },
      attributes: { exclude: ["password"] },
    });

    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const assignedLeadsCount = await Lead.count({
          where: { assignedAgent: agent.id },
        });

        const closedDealsCount = await Deal.count({
          where: {
            agentId: agent.id,
            pipelineStage: "won",
          },
        });

        const assignedLeads = await Lead.findAll({
          where: { assignedAgent: agent.id },
          attributes: ["id", "name", "status", "createdAt"],
          limit: 5,
        });

        return {
          ...agent.toJSON(),
          assignedLeadsCount,
          closedDealsCount,
          assignedLeads,
        };
      })
    );

    res.json({
      success: true,
      data: agentsWithStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get("/", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.role) where.role = req.query.role;
    if (req.query.isActive !== undefined)
      where.isActive = req.query.isActive === "true";

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    if (isNaN(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check permissions (admin can view any user, agent can only view themselves)
    if (req.user.role === "agent" && req.user.id !== user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(400).json({ success: false, message: "Invalid data format" });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Create user (admin only)
// @route   POST /api/users
// @access  Private/Admin
router.post(
  "/",
  adminAuth,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["super_admin", "admin", "executive"])
      .withMessage("Role must be super_admin, admin, or executive"),
  ],
  async (req, res) => {
    try {
      // Only super_admin can create another super_admin or admin
      // Admin can only create executive
      if (req.body.role === "super_admin" && req.user.role !== "super_admin") {
        return res.status(403).json({
          success: false,
          message: "Only Super Admin can create a Super Admin account",
        });
      }
      if (req.body.role === "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({
          success: false,
          message: "Only Super Admin can create an Admin account",
        });
      }

      const user = await User.create(req.body);

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put(
  "/:id",
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Please provide a valid email"),
    body("role")
      .optional()
      .isIn(["super_admin", "admin", "executive"])
      .withMessage("Role must be super_admin, admin, or executive"),
  ],
  async (req, res) => {
    try {
      if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid user ID" });
      }

      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Executives cannot change their own role
      if (req.user.role === "executive" && req.user.id !== user.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Executives cannot change role
      if (req.user.role === "executive" && req.body.role) {
        delete req.body.role;
      }

      await user.update(req.body);

      const updatedUser = await User.findByPk(req.params.id, {
        attributes: { exclude: ["password"] },
      });

      res.json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError' || error.name === 'SequelizeDatabaseError') {
        return res.status(400).json({
          success: false,
          message: error.errors ? error.errors.map(e => e.message).join(", ") : error.message,
        });
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    if (isNaN(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({
        success: false,
        message: "Cannot delete user because they are associated with existing records (e.g. leads, deals).",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
