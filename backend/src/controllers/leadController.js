const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const { Lead, User, LeadProgressLog } = require("../models/index");

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Build filter (where clause)
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.priority) where.priority = req.query.priority;
    if (req.query.assignedAgent) where.assignedAgent = req.query.assignedAgent;
    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { email: { [Op.iLike]: `%${req.query.search}%` } },
        { phone: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    // If agent, only show their leads
    if (req.user.role === "agent") {
      where.assignedAgent = req.user.id;
    }

    const { count, rows: leads } = await Lead.findAndCountAll({
      where,
      include: [
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
      data: leads,
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
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
const getLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "agent",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: LeadProgressLog,
          as: "progressLog",
          include: [
            {
              model: User,
              as: "updatedByUser",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const leadData = { ...req.body };

    // If agent, assign to themselves
    if (req.user.role === "agent") {
      leadData.assignedAgent = req.user.id;
    }

    const lead = await Lead.create(leadData);

    // Reload with associations
    const createdLead = await Lead.findByPk(lead.id, {
      include: [
        {
          model: User,
          as: "agent",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: createdLead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Check permissions
    if (
      req.user.role === "agent" &&
      lead.assignedAgent !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Handle assignment status logic
    if (req.body.assignedAgent !== undefined) {
      if (req.body.assignedAgent) {
        if (lead.assignedAgent !== parseInt(req.body.assignedAgent)) {
          req.body.assignmentStatus = "pending";
        }
      } else {
        req.body.assignmentStatus = "unassigned";
      }
    }

    // Progress log entry banao agar status ya notes change ho
    if (req.body.status || req.body.notes) {
      await LeadProgressLog.create({
        leadId: lead.id,
        status: req.body.status || lead.status,
        notes: req.body.notes || "Lead updated",
        updatedBy: req.user.id,
        timestamp: new Date(),
      });
    }

    await lead.update(req.body);

    const updatedLead = await Lead.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "agent",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Respond to lead assignment (Accept/Reject)
// @route   PUT /api/leads/:id/respond
// @access  Private (Agent only)
const respondToAssignment = async (req, res) => {
  try {
    const { response } = req.body;
    if (!["accepted", "rejected"].includes(response)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid response" });
    }

    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    }

    if (lead.assignedAgent !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (response === "rejected") {
      await lead.update({ assignedAgent: null, assignmentStatus: "unassigned" });
    } else {
      await lead.update({ assignmentStatus: response });
    }

    await lead.reload();

    res.json({
      success: true,
      message: `Assignment ${response} successfully`,
      data: lead,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Check permissions
    if (
      req.user.role === "agent" &&
      lead.assignedAgent !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await lead.destroy();

    res.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get leads by status (for Kanban board)
// @route   GET /api/leads/kanban
// @access  Private
const getKanbanLeads = async (req, res) => {
  try {
    const statuses = [
      "new",
      "contacted",
      "visit",
      "negotiation",
      "closed",
      "lost",
    ];

    const where = {};
    if (req.user.role === "agent") {
      where.assignedAgent = req.user.id;
    }

    const kanbanData = await Promise.all(
      statuses.map(async (status) => {
        const leads = await Lead.findAll({
          where: { ...where, status },
          include: [
            {
              model: User,
              as: "agent",
              attributes: ["id", "name", "email"],
            },
          ],
          order: [["createdAt", "DESC"]],
        });

        return {
          status,
          leads,
        };
      })
    );

    res.json({
      success: true,
      data: kanbanData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (
      !["new", "contacted", "visit", "negotiation", "closed", "lost"].includes(
        status
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    }

    // Check permissions
    if (
      req.user.role === "agent" &&
      lead.assignedAgent !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await lead.update({ status });

    // Progress log entry banao
    await LeadProgressLog.create({
      leadId: lead.id,
      status: status,
      notes: "Status updated via quick action",
      updatedBy: req.user.id,
      timestamp: new Date(),
    });

    await lead.reload();

    res.json({
      success: true,
      message: "Lead status updated successfully",
      data: lead,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  getKanbanLeads,
  respondToAssignment,
  updateLeadStatus,
};
