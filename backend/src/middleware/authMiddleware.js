const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Project = require("../models/Project");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

const projectAccess = async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;
  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const member = project.members.find(
    (m) => m.user.toString() === req.user._id.toString()
  );

  if (!member) {
    return res.status(403).json({ message: "Access denied to this project" });
  }

  req.project = project;
  req.projectRole = member.role;
  next();
};

const adminOnly = (req, res, next) => {
  if (req.projectRole !== "Admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

module.exports = { protect, projectAccess, adminOnly };