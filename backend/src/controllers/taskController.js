const { Task, Lead, User } = require("../models/index");

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, leadId, agentId, type, dueDate } = req.body;

    // Use specific agentId if provided (and user is admin); otherwise default to requesting agent.
    const assignedAgentId =
      req.user.role === "admin" && agentId ? agentId : req.user.id;

    const assignmentStatus =
      req.user.role === "admin" &&
      agentId &&
      parseInt(agentId) !== req.user.id
        ? "assigned"
        : "self";

    const task = await Task.create({
      title,
      description,
      leadId,
      agentId: assignedAgentId,
      type,
      dueDate,
      assignmentStatus,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all tasks (Admin only)
// @route   GET /api/tasks
// @access  Private/Admin
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        {
          model: Lead,
          as: "lead",
          attributes: ["id", "name", "email", "phone", "status"],
        },
        {
          model: User,
          as: "agent",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["dueDate", "ASC"]],
    });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all tasks for an agent
// @route   GET /api/tasks/agent/:agentId
// @access  Private
exports.getAgentTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { agentId: req.params.agentId },
      include: [
        {
          model: Lead,
          as: "lead",
          attributes: ["id", "name", "email", "phone", "status"],
        },
      ],
      order: [["dueDate", "ASC"]],
    });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Complete a task
// @route   PATCH /api/tasks/:id/complete
// @access  Private
exports.completeTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Ensure user owns task or is admin
    if (task.agentId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to complete this task",
      });
    }

    await task.update({ status: "completed" });

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Ensure user owns task or is admin
    if (task.agentId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this task",
      });
    }

    await task.destroy();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Respond to an assigned task
// @route   PATCH /api/tasks/:id/respond
// @access  Private
exports.respondToTask = async (req, res) => {
  try {
    const { response } = req.body;

    if (!["accepted", "rejected"].includes(response)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid response" });
    }

    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Only the assigned agent can respond
    if (task.agentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to respond to this task",
      });
    }

    await task.update({ assignmentStatus: response });

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update task progress and remarks
// @route   PATCH /api/tasks/:id/progress
// @access  Private
exports.updateTaskProgress = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const validStatuses = ["pending", "completed", "delayed", "declined"];

    if (status && !validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Only the assigned agent can update progress
    if (task.agentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update progress for this task",
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (remarks !== undefined) updateData.remarks = remarks;

    await task.update(updateData);

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
