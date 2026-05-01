const asyncHandler = require("express-async-handler");
const Project = require("../models/Project");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Project name is required");
  }

  const project = await Project.create({
    name,
    description: description || "",
    inviteCode: uuidv4().split("-")[0].toUpperCase(),
    createdBy: req.user._id,
    members: [{ user: req.user._id, role: "Admin" }]
  });

  res.status(201).json(project);
});

const getMyProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ "members.user": req.user._id })
    .populate("createdBy", "name email")
    .populate("members.user", "name email")
    .sort({ createdAt: -1 });

  res.json(projects);
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("createdBy", "name email")
    .populate("members.user", "name email");

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const isMember = project.members.some(
    (m) => m.user._id.toString() === req.user._id.toString()
  );

  if (!isMember) {
    res.status(403);
    throw new Error("Access denied");
  }

  res.json(project);
});

const joinProject = asyncHandler(async (req, res) => {
  const { inviteCode } = req.body;
  const project = await Project.findOne({ inviteCode });

  if (!project) {
    res.status(404);
    throw new Error("Invalid invite code");
  }

  const alreadyMember = project.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  );

  if (!alreadyMember) {
    project.members.push({ user: req.user._id, role: "Member" });
    await project.save();
  }

  res.json({ message: "Joined successfully", projectId: project._id });
});

const addMember = asyncHandler(async (req, res) => {
  const { email, role = "Member" } = req.body;
  const project = req.project;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const exists = project.members.some((m) => m.user.toString() === user._id.toString());
  if (exists) {
    res.status(400);
    throw new Error("User already a member");
  }

  project.members.push({ user: user._id, role });
  await project.save();

  res.json({ message: "Member added" });
});

const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const project = req.project;

  project.members = project.members.filter(
    (m) => m.user.toString() !== userId
  );
  await project.save();

  res.json({ message: "Member removed" });
});

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  joinProject,
  addMember,
  removeMember
};