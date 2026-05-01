const asyncHandler = require("express-async-handler");
const Task = require("../models/Task");
const Project = require("../models/Project");

const getProjectDashboard = asyncHandler(async (req, res) => {
  const projectId = req.project._id;

  const totalTasks = await Task.countDocuments({ project: projectId });
  const byStatus = await Task.aggregate([
    { $match: { project: req.project._id } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  const tasksPerUser = await Task.aggregate([
    { $match: { project: req.project._id, assignedTo: { $ne: null } } },
    { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        userId: "$user._id",
        name: "$user.name",
        email: "$user.email",
        count: 1
      }
    }
  ]);

  const overdueTasks = await Task.countDocuments({
    project: projectId,
    dueDate: { $lt: new Date() },
    status: { $ne: "Done" }
  });

  const recentTasks = await Task.find({ project: projectId })
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    totalTasks,
    byStatus,
    tasksPerUser,
    overdueTasks,
    recentTasks
  });
});

module.exports = { getProjectDashboard };