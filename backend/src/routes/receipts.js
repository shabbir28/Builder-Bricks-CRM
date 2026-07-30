const express = require("express");
const { auth } = require("../middleware/auth");
const { Receipt, Client, User } = require("../models/index");

const router = express.Router();

router.use(auth);

// @desc    Get all receipts
// @route   GET /api/receipts
// @access  Private
router.get("/", async (req, res) => {
  try {
    const receipts = await Receipt.findAll({
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "name", "bookingReferenceNo", "unitNo", "type"],
        },
        {
          model: User,
          as: "uploader",
          attributes: ["id", "name", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: receipts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
