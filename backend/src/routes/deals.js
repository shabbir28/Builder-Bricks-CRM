const express = require("express");
const { body, validationResult } = require("express-validator");
const { auth, agentOrAdminAuth } = require("../middleware/auth");
const { Deal, Lead, Property, User } = require("../models/index");

const router = express.Router();

// All routes require authentication
router.use(auth);

// Validation rules
const createDealValidation = [
  body("title").notEmpty().withMessage("Deal title is required"),
  body("leadId").isInt().withMessage("Valid lead ID is required"),
  body("propertyId").isInt().withMessage("Valid property ID is required"),
  body("dealValue").isNumeric().withMessage("Deal value must be a number"),
  body("expectedClosingDate")
    .isISO8601()
    .withMessage("Valid expected closing date is required"),
];

// @desc    Get all deals
// @route   GET /api/deals
// @access  Private
router.get("/", agentOrAdminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.pipelineStage) where.pipelineStage = req.query.pipelineStage;
    if (req.query.agent) where.agentId = req.query.agent;

    // If agent, only show their deals
    if (req.user.role === "agent") {
      where.agentId = req.user.id;
    }

    const { count, rows: deals } = await Deal.findAndCountAll({
      where,
      include: [
        {
          model: Lead,
          as: "lead",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: Property,
          as: "property",
          attributes: ["id", "title", "price", "city"],
        },
        {
          model: User,
          as: "agent",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: deals,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/deals ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get single deal
// @route   GET /api/deals/:id
// @access  Private
router.get("/:id", agentOrAdminAuth, async (req, res) => {
  try {
    const deal = await Deal.findByPk(req.params.id, {
      include: [
        {
          model: Lead,
          as: "lead",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: Property,
          as: "property",
          attributes: [
            "id",
            "title",
            "price",
            "street",
            "city",
            "state",
            "bedrooms",
            "bathrooms",
            "area",
            "images",
          ],
        },
        {
          model: User,
          as: "agent",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
    });

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    // Check permissions
    if (req.user.role === "agent" && deal.agentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: deal,
    });
  } catch (error) {
    console.error("GET /api/deals/:id ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Create deal
// @route   POST /api/deals
// @access  Private
router.post("/", agentOrAdminAuth, createDealValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0]?.msg || "Validation Error",
        errors: errors.array(),
      });
    }

    const dealData = { ...req.body };

    // Verify lead exists
    const lead = await Lead.findByPk(dealData.leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Verify property exists
    const property = await Property.findByPk(dealData.propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Set agent
    if (req.user.role === "agent") {
      dealData.agentId = req.user.id;
    } else if (!dealData.agentId) {
      dealData.agentId = lead.assignedAgent;
    }

    const deal = await Deal.create(dealData);

    const createdDeal = await Deal.findByPk(deal.id, {
      include: [
        { model: Lead, as: "lead", attributes: ["id", "name", "email", "phone"] },
        { model: Property, as: "property", attributes: ["id", "title", "price", "city"] },
        { model: User, as: "agent", attributes: ["id", "name", "email"] },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Deal created successfully",
      data: createdDeal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Update deal
// @route   PUT /api/deals/:id
// @access  Private
router.put("/:id", agentOrAdminAuth, async (req, res) => {
  try {
    const deal = await Deal.findByPk(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    // Check permissions
    if (req.user.role === "agent" && deal.agentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await deal.update(req.body);

    const updatedDeal = await Deal.findByPk(req.params.id, {
      include: [
        { model: Lead, as: "lead", attributes: ["id", "name", "email", "phone"] },
        { model: Property, as: "property", attributes: ["id", "title", "price", "city"] },
        { model: User, as: "agent", attributes: ["id", "name", "email"] },
      ],
    });

    res.json({
      success: true,
      message: "Deal updated successfully",
      data: updatedDeal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Delete deal
// @route   DELETE /api/deals/:id
// @access  Private
router.delete("/:id", agentOrAdminAuth, async (req, res) => {
  try {
    const deal = await Deal.findByPk(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    // Check permissions
    if (req.user.role === "agent" && deal.agentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await deal.destroy();

    res.json({
      success: true,
      message: "Deal deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get deals pipeline data
// @route   GET /api/deals/pipeline/data
// @access  Private
router.get("/pipeline/data", agentOrAdminAuth, async (req, res) => {
  try {
    const stages = [
      "lead",
      "qualified",
      "proposal",
      "negotiation",
      "closing",
      "won",
      "lost",
    ];

    const where = {};
    if (req.user.role === "agent") {
      where.agentId = req.user.id;
    }

    const pipelineData = await Promise.all(
      stages.map(async (stage) => {
        const deals = await Deal.findAll({
          where: { ...where, pipelineStage: stage },
          include: [
            { model: Lead, as: "lead", attributes: ["id", "name"] },
            { model: Property, as: "property", attributes: ["id", "title"] },
          ],
          order: [["createdAt", "DESC"]],
        });

        const totalValue = deals.reduce((sum, deal) => sum + deal.dealValue, 0);

        return {
          stage,
          deals,
          count: deals.length,
          totalValue,
        };
      })
    );

    res.json({
      success: true,
      data: pipelineData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
