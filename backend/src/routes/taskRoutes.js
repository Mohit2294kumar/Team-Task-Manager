const express = require("express");
const {
  getProjectTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} = require("../controllers/taskController");
const { protect, projectAccess } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/project/:projectId", protect, projectAccess, getProjectTasks);
router.post("/project/:projectId", protect, projectAccess, createTask);
router.put("/:id/project/:projectId", protect, projectAccess, updateTask);
router.patch("/:id/status/project/:projectId", protect, projectAccess, updateTaskStatus);
router.delete("/:id/project/:projectId", protect, projectAccess, deleteTask);

module.exports = router;