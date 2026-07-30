const express = require("express");
const { auth } = require("../middleware/auth");
const {
  createTask,
  getAllTasks,
  getAgentTasks,
  completeTask,
  deleteTask,
  respondToTask,
  updateTaskProgress,
} = require("../controllers/taskController");

const router = express.Router();

router.use(auth);

router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/agent/:agentId", getAgentTasks);
router.patch("/:id/complete", completeTask);
router.patch("/:id/respond", respondToTask);
router.patch("/:id/progress", updateTaskProgress);
router.delete("/:id", deleteTask);

module.exports = router;
