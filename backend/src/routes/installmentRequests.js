const express = require("express");
const { auth, adminAuth } = require("../middleware/auth");
const { InstallmentRequest, Client, User } = require("../models");

const router = express.Router();

// All routes require authentication
router.use(auth);

// @desc    Get all installment requests (admin/super_admin only)
// @route   GET /api/installment-requests
router.get("/", adminAuth, async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const requests = await InstallmentRequest.findAll({
      where,
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "name", "unitNo", "bookingReferenceNo"],
        },
        {
          model: User,
          as: "requester",
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get pending count (for badge)
// @route   GET /api/installment-requests/pending-count
router.get("/pending-count", adminAuth, async (req, res) => {
  try {
    const count = await InstallmentRequest.count({ where: { status: "pending" } });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get my submitted requests (executive)
// @route   GET /api/installment-requests/my-requests
router.get("/my-requests", async (req, res) => {
  try {
    const requests = await InstallmentRequest.findAll({
      where: { requestedBy: req.user.id },
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "name", "unitNo"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Approve an installment request
// @route   PUT /api/installment-requests/:id/approve
router.put("/:id/approve", adminAuth, async (req, res) => {
  try {
    const request = await InstallmentRequest.findByPk(req.params.id, {
      include: [{ model: Client, as: "client" }],
    });

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`,
      });
    }

    const client = request.client;
    const schedule = client.installmentSchedule || [];
    const index = schedule.findIndex((item) => item.id === request.installmentId);

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Installment not found in schedule" });
    }

    // Apply the approved changes
    schedule[index] = {
      ...schedule[index],
      ...request.changes,
    };

    client.set("installmentSchedule", schedule);
    client.changed("installmentSchedule", true);
    await client.save();

    // Update request status
    await request.update({
      status: "approved",
      reviewedBy: req.user.id,
      reviewNote: req.body.reviewNote || null,
      reviewedAt: new Date(),
    });

    res.json({
      success: true,
      message: "Request approved and installment updated",
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Reject an installment request
// @route   PUT /api/installment-requests/:id/reject
router.put("/:id/reject", adminAuth, async (req, res) => {
  try {
    const request = await InstallmentRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`,
      });
    }

    await request.update({
      status: "rejected",
      reviewedBy: req.user.id,
      reviewNote: req.body.reviewNote || null,
      reviewedAt: new Date(),
    });

    res.json({
      success: true,
      message: "Request rejected",
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
