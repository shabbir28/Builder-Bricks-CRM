const express = require("express");
const { auth } = require("../middleware/auth");
const {
  scheduleVisit,
  getAgentVisits,
  updateVisitStatus,
} = require("../controllers/visitController");

const router = express.Router();

router.use(auth);

router.post("/", scheduleVisit);
router.get("/agent/:agentId", getAgentVisits);
router.patch("/:id/status", updateVisitStatus);

module.exports = router;
