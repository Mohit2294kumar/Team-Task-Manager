import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [dash, setDash] = useState(null);
  const [taskModal, setTaskModal] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    assignedTo: ""
  });
  const [memberEmail, setMemberEmail] = useState("");

  const load = async () => {
    const [p, t, d] = await Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/tasks/project/${id}`),
      api.get(`/dashboard/${id}`)
    ]);
    setProject(p.data);
    setTasks(t.data);
    setDash(d.data);
  };

  useEffect(() => {
    load();
  }, [id]);

  const createTask = async (e) => {
    e.preventDefault();
    await api.post(`/tasks/project/${id}`, taskForm);
    setTaskModal(false);
    setTaskForm({ title: "", description: "", dueDate: "", priority: "Medium", assignedTo: "" });
    load();
  };

  const addMember = async (e) => {
    e.preventDefault();
    await api.post(`/projects/${id}/members`, { email: memberEmail, role: "Member" });
    setMemberModal(false);
    setMemberEmail("");
    load();
  };

  const updateStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}/status/project/${id}`, { status });
    load();
  };

  if (!project) {
    return (
      <Layout>
        <div className="text-white">Loading project...</div>
      </Layout>
    );
  }

  const isAdmin = project.members?.find((m) => m.user._id === user?._id || m.user === user?._id)?.role === "Admin";

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="mt-2 text-slate-400">{project.description}</p>
              <div className="mt-3 text-sm text-slate-500">Invite Code: {project.inviteCode}</div>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <button onClick={() => setMemberModal(true)} className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3">
                  Add Member
                </button>
              )}
              {isAdmin && (
                <button onClick={() => setTaskModal(true)} className="rounded-xl bg-white px-4 py-3 font-semibold text-slate-900">
                  Create Task
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-slate-400">Total Tasks</div>
            <div className="mt-2 text-3xl font-bold">{dash?.totalTasks || 0}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-slate-400">Overdue</div>
            <div className="mt-2 text-3xl font-bold">{dash?.overdueTasks || 0}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-slate-400">Members</div>
            <div className="mt-2 text-3xl font-bold">{project.members?.length || 0}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Members</h2>
            <div className="mt-4 space-y-3">
              {project.members.map((m) => (
                <div key={m.user._id || m.user} className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3">
                  <div>
                    <div className="font-medium">{m.user.name || "Unknown"}</div>
                    <div className="text-xs text-slate-500">{m.user.email || ""}</div>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{m.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Tasks</h2>
            <div className="mt-4 space-y-4">
              {tasks.map((t) => (
                <div key={t._id} className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold">{t.title}</div>
                      <div className="mt-1 text-sm text-slate-400">{t.description}</div>
                      <div className="mt-2 text-xs text-slate-500">
                        Due: {new Date(t.dueDate).toLocaleDateString()} | Priority: {t.priority}
                      </div>
                    </div>
                    <select
                      value={t.status}
                      onChange={(e) => updateStatus(t._id, e.target.value)}
                      className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm"
                    >
                      <option>To Do</option>
                      <option>In Progress</option>
                      <option>Done</option>
                    </select>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    Assigned To: {t.assignedTo?.name || "Unassigned"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal open={taskModal} onClose={() => setTaskModal(false)} title="Create Task">
        <form onSubmit={createTask} className="space-y-4">
          <input className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3" placeholder="Title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
          <textarea className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3" rows="4" placeholder="Description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
          <input className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3" type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
          <select className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <input className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3" placeholder="Assign user ID (optional)" value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })} />
          <button className="rounded-xl bg-white px-4 py-3 font-semibold text-slate-900">Create</button>
        </form>
      </Modal>

      <Modal open={memberModal} onClose={() => setMemberModal(false)} title="Add Member">
        <form onSubmit={addMember} className="space-y-4">
          <input className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3" placeholder="Member email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} />
          <button className="rounded-xl bg-white px-4 py-3 font-semibold text-slate-900">Add</button>
        </form>
      </Modal>
    </Layout>
  );
}