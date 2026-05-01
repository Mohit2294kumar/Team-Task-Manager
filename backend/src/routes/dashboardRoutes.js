const express = require("express");
const { protect, projectAccess } = require("../middleware/authMiddleware");
const { getProjectDashboard } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/:projectId", protect, projectAccess, getProjectDashboard);

module.exports = router;