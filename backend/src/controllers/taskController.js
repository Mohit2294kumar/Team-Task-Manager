const asyncHandler = require("express-async-handler");
const Task = require("../models/Task");
const Project = require("../models/Project");

const getProjectTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ project: req.project._id })
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  res.json(tasks);
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, dueDate, priority, assignedTo } = req.body;

  if (!title || !dueDate) {
    res.status(400);
    throw new Error("Title and due date are required");
  }

  if (assignedTo) {
    const member = req.project.members.find(
      (m) => m.user.toString() === assignedTo
    );
    if (!member) {
      res.status(400);
      throw new Error("Assigned user must be a project member");
    }
  }

  const task = await Task.create({
    project: req.project._id,
    title,
    description: description || "",
    dueDate,
    priority: priority || "Medium",
    assignedTo: assignedTo || null,
    status: "To Do",
    createdBy: req.user._id
  });

  const populated = await Task.findById(task._id)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  res.status(201).json(populated);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  if (task.project.toString() !== req.project._id.toString()) {
    res.status(403);
    throw new Error("Task does not belong to this project");
  }

  const isAdmin = req.projectRole === "Admin";
  const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

  if (!isAdmin && !isAssignee) {
    res.status(403);
    throw new Error("Not allowed to update this task");
  }

  const fields = ["title", "description", "dueDate", "priority", "status", "assignedTo"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) task[field] = req.body[field];
  });

  if (task.assignedTo) {
    const member = req.project.members.find(
      (m) => m.user.toString() === task.assignedTo.toString()
    );
    if (!member) {
      res.status(400);
      throw new Error("Assigned user must be a project member");
    }
  }

  await task.save();

  const updated = await Task.findById(task._id)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  res.json(updated);
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const isAdmin = req.projectRole === "Admin";
  const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

  if (!isAdmin && !isAssignee) {
    res.status(403);
    throw new Error("Only assignee or admin can update status");
  }

  task.status = status;
  await task.save();

  const updated = await Task.findById(task._id)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  res.json(updated);
});

const deleteTask = asyncHandler(async (req, res) => {
  if (req.projectRole !== "Admin") {
    res.status(403);
    throw new Error("Admin only");
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  await task.deleteOne();
  res.json({ message: "Task deleted" });
});

module.exports = {
  getProjectTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};