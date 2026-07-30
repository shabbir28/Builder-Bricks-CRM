const { Communication, Lead } = require("../models/index");

// @desc    Create a new communication log for a lead
// @route   POST /api/communications
// @access  Private
exports.createCommunication = async (req, res, next) => {
  try {
    const { leadId, type, description, agentName } = req.body;

    if (!leadId || !type || !description || !agentName) {
      return res.status(400).json({
        success: false,
        message: "Please provide leadId, type, description, and agentName",
      });
    }

    let attachedFileUrl = null;
    let attachedFileOriginalName = null;
    if (req.file) {
      attachedFileUrl = `/uploads/${req.file.filename}`;
      attachedFileOriginalName = req.file.originalname;
    }

    // Verify lead exists
    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const communication = await Communication.create({
      leadId,
      type,
      description,
      agentName,
      attachedFileUrl,
      attachedFileOriginalName,
    });

    res.status(201).json({
      success: true,
      data: communication,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all communications for a specific lead
// @route   GET /api/communications/:leadId
// @access  Private
exports.getLeadCommunications = async (req, res, next) => {
  try {
    const { leadId } = req.params;

    const communications = await Communication.findAll({
      where: { leadId },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: communications.length,
      data: communications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a communication log
// @route   DELETE /api/communications/:id
// @access  Private
exports.deleteCommunication = async (req, res, next) => {
  try {
    const communication = await Communication.findByPk(req.params.id);

    if (!communication) {
      return res.status(404).json({
        success: false,
        message: "Communication not found",
      });
    }

    await communication.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
