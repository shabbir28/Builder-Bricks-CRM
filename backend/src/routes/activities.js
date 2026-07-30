const express = require("express");
const { Op } = require("sequelize");
const { body } = require("express-validator");
const { auth, agentOrAdminAuth } = require("../middleware/auth");
const { Activity, User, Lead, Deal, Property } = require("../models/index");

const router = express.Router();

// All routes require authentication
router.use(auth);

// Validation rules
const createActivityValidation = [
  body("type")
    .isIn(["call", "email", "meeting", "site-visit", "note", "task", "reminder"])
    .withMessage("Invalid activity type"),
  body("title").notEmpty().withMessage("Activity title is required"),
  body("assignedTo").isInt().withMessage("Valid assigned user ID is required"),
];

// @desc    Get all activities
// @route   GET /api/activities
// @access  Private
router.get("/", agentOrAdminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.type) where.type = req.query.type;
    if (req.query.status) where.status = req.query.status;
    if (req.query.assignedTo) where.assignedTo = req.query.assignedTo;
    if (req.query.lead) where.leadId = req.query.lead;
    if (req.query.deal) where.dealId = req.query.deal;

    // If agent, only show their assigned activities
    if (req.user.role === "agent") {
      where.assignedTo = req.user.id;
    }

    const { count, rows: activities } = await Activity.findAndCountAll({
      where,
      include: [
        { model: User, as: "assignedToUser", attributes: ["id", "name", "email"] },
        { model: User, as: "createdByUser", attributes: ["id", "name", "email"] },
        { model: Lead, as: "lead", attributes: ["id", "name"] },
        { model: Deal, as: "deal", attributes: ["id", "title"] },
        { model: Property, as: "property", attributes: ["id", "title"] },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single activity
// @route   GET /api/activities/:id
// @access  Private
router.get("/:id", agentOrAdminAuth, async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id, {
      include: [
        { model: User, as: "assignedToUser", attributes: ["id", "name", "email", "phone"] },
        { model: User, as: "createdByUser", attributes: ["id", "name", "email"] },
        { model: Lead, as: "lead", attributes: ["id", "name", "email", "phone"] },
        { model: Deal, as: "deal", attributes: ["id", "title", "status"] },
        { model: Property, as: "property", attributes: ["id", "title", "city"] },
      ],
    });

    if (!activity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }

    // Check permissions
    if (
      req.user.role === "agent" &&
      activity.assignedTo !== req.user.id &&
      activity.createdBy !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create activity
// @route   POST /api/activities
// @access  Private
router.post("/", agentOrAdminAuth, createActivityValidation, async (req, res) => {
  try {
    const activityData = { ...req.body };

    // Set created by
    activityData.createdBy = req.user.id;

    // If agent, can only assign to themselves
    if (req.user.role === "agent") {
      activityData.assignedTo = req.user.id;
    }

    const activity = await Activity.create(activityData);

    const createdActivity = await Activity.findByPk(activity.id, {
      include: [
        { model: User, as: "assignedToUser", attributes: ["id", "name", "email"] },
        { model: User, as: "createdByUser", attributes: ["id", "name", "email"] },
        { model: Lead, as: "lead", attributes: ["id", "name"] },
        { model: Deal, as: "deal", attributes: ["id", "title"] },
        { model: Property, as: "property", attributes: ["id", "title"] },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Activity created successfully",
      data: createdActivity,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private
router.put("/:id", agentOrAdminAuth, async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id);

    if (!activity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }

    // Check permissions
    if (
      req.user.role === "agent" &&
      activity.assignedTo !== req.user.id &&
      activity.createdBy !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // If completing activity, set completedAt
    if (req.body.status === "completed" && activity.status !== "completed") {
      req.body.completedAt = new Date();
    }

    await activity.update(req.body);

    const updatedActivity = await Activity.findByPk(req.params.id, {
      include: [
        { model: User, as: "assignedToUser", attributes: ["id", "name", "email"] },
        { model: User, as: "createdByUser", attributes: ["id", "name", "email"] },
        { model: Lead, as: "lead", attributes: ["id", "name"] },
        { model: Deal, as: "deal", attributes: ["id", "title"] },
        { model: Property, as: "property", attributes: ["id", "title"] },
      ],
    });

    res.json({
      success: true,
      message: "Activity updated successfully",
      data: updatedActivity,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
router.delete("/:id", agentOrAdminAuth, async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id);

    if (!activity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }

    // Check permissions
    if (
      req.user.role === "agent" &&
      activity.assignedTo !== req.user.id &&
      activity.createdBy !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await activity.destroy();

    res.json({ success: true, message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get today's activities
// @route   GET /api/activities/today/list
// @access  Private
router.get("/today/list", agentOrAdminAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where = {
      dueDate: {
        [Op.gte]: today,
        [Op.lt]: tomorrow,
      },
    };

    // If agent, only show their assigned activities
    if (req.user.role === "agent") {
      where.assignedTo = req.user.id;
    }

    const activities = await Activity.findAll({
      where,
      include: [
        { model: User, as: "assignedToUser", attributes: ["id", "name", "email"] },
        { model: Lead, as: "lead", attributes: ["id", "name"] },
        { model: Deal, as: "deal", attributes: ["id", "title"] },
      ],
      order: [["dueDate", "ASC"]],
    });

    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
