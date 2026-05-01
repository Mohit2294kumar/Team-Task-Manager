const express = require("express");
const {
  createProject,
  getMyProjects,
  getProjectById,
  joinProject,
  addMember,
  removeMember
} = require("../controllers/projectController");
const { protect, projectAccess, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, getMyProjects).post(protect, createProject);
router.get("/:id", protect, getProjectById);
router.post("/join", protect, joinProject);
router.post("/:id/members", protect, projectAccess, adminOnly, addMember);
router.delete("/:id/members/:userId", protect, projectAccess, adminOnly, removeMember);

module.exports = router;