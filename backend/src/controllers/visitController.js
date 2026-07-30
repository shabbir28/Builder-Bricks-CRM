const { Visit, Lead, Property, User } = require("../models/index");

// @desc    Schedule a new site visit
// @route   POST /api/visits
// @access  Private
exports.scheduleVisit = async (req, res) => {
  try {
    const { leadId, propertyId, agentId, visitDate, visitTime, notes } = req.body;

    const assignedAgentId =
      req.user.role === "admin" && agentId ? agentId : req.user.id;

    const visit = await Visit.create({
      leadId,
      propertyId,
      agentId: assignedAgentId,
      visitDate,
      visitTime,
      notes,
    });

    res.status(201).json({ success: true, data: visit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get visits for an agent
// @route   GET /api/visits/agent/:agentId
// @access  Private
exports.getAgentVisits = async (req, res) => {
  try {
    const targetAgentId = req.params.agentId === "me" ? req.user.id : req.params.agentId;

    const visits = await Visit.findAll({
      where: { agentId: targetAgentId },
      include: [
        {
          model: Lead,
          as: "lead",
          attributes: ["id", "name", "email", "phone", "status"],
        },
        {
          model: Property,
          as: "property",
          attributes: ["id", "title", "location", "price"],
        },
      ],
      order: [["visitDate", "ASC"]],
    });

    res.status(200).json({ success: true, count: visits.length, data: visits });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update visit status
// @route   PATCH /api/visits/:id/status
// @access  Private
exports.updateVisitStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ["scheduled", "completed", "cancelled"];

    if (status && !validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const visit = await Visit.findByPk(req.params.id);

    if (!visit) {
      return res
        .status(404)
        .json({ success: false, message: "Visit not found" });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    await visit.update(updateData);

    res.status(200).json({ success: true, data: visit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
