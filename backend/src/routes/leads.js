const express = require("express");
const { body } = require("express-validator");
const { auth, agentOrAdminAuth } = require("../middleware/auth");
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  getKanbanLeads,
  respondToAssignment,
  updateLeadStatus,
} = require("../controllers/leadController");

const router = express.Router();

// All routes require authentication
router.use(auth);

// Validation rules
const createLeadValidation = [
  body("name").notEmpty().withMessage("Lead name is required"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("phone")
    .optional()
    .isString()
    .withMessage("Please provide a valid phone number"),
  body("source")
    .optional()
    .isIn([
      "website",
      "facebook",
      "instagram",
      "referral",
      "social",
      "email",
      "phone",
      "walk-in",
      "other",
    ]),
  body("status")
    .optional()
    .isIn(["new", "contacted", "visit", "negotiation", "closed", "lost"]),
  body("priority").optional().isIn(["low", "medium", "high"]),
  body("preferredPropertyType")
    .optional()
    .isIn(["apartment", "house", "villa", "commercial", "land", "other"]),
];

const updateLeadValidation = [
  body("name").optional().notEmpty().withMessage("Lead name cannot be empty"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("phone")
    .optional()
    .isString()
    .withMessage("Please provide a valid phone number"),
  body("source")
    .optional()
    .isIn([
      "website",
      "facebook",
      "instagram",
      "referral",
      "social",
      "email",
      "phone",
      "walk-in",
      "other",
    ]),
  body("status")
    .optional()
    .isIn(["new", "contacted", "visit", "negotiation", "closed", "lost"]),
  body("priority").optional().isIn(["low", "medium", "high"]),
  body("preferredPropertyType")
    .optional()
    .isIn(["apartment", "house", "villa", "commercial", "land", "other"]),
];

// Routes
router.get("/", agentOrAdminAuth, getLeads);
router.get("/kanban", agentOrAdminAuth, getKanbanLeads);
router.get("/:id", agentOrAdminAuth, getLead);
router.post("/", agentOrAdminAuth, createLeadValidation, createLead);
router.put("/:id", agentOrAdminAuth, updateLeadValidation, updateLead);
router.put("/:id/respond", agentOrAdminAuth, respondToAssignment);
router.patch("/:id/status", agentOrAdminAuth, updateLeadStatus);
router.delete("/:id", agentOrAdminAuth, deleteLead);

module.exports = router;
