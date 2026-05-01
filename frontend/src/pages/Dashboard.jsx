import React, { useContext, useEffect, useState } from "react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState("");
  const [dash, setDash] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/projects");
      setProjects(data);
      if (data.length && !selected) setSelected(data[0]._id);
    };
    load();
  }, []);

  useEffect(() => {
    const loadDash = async () => {
      if (!selected) return;
      const { data } = await api.get(`/dashboard/${selected}`);
      setDash(data);
    };
    loadDash();
  }, [selected]);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Team Dashboard</h1>
              <p className="mt-2 text-slate-400">Manage tasks, people, and deadlines in one place.</p>
            </div>
            <div className="w-full max-w-sm">
              <label className="mb-2 block text-xs text-slate-400">Select project</label>
              <select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3">
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {dash && (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Total Tasks" value={dash.totalTasks} hint="All tasks in the project" />
              <StatCard title="Overdue Tasks" value={dash.overdueTasks} hint="Due date passed and not done" />
              <StatCard title="My Role" value="Member" hint={user?.email} />
              <StatCard title="Project Count" value={projects.length} hint="Projects you can access" />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold">Tasks by status</h2>
                <div className="mt-4 space-y-3">
                  {dash.byStatus.map((s) => (
                    <div key={s._id} className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3">
                      <span>{s._id}</span>
                      <span className="font-semibold">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold">Tasks per user</h2>
                <div className="mt-4 space-y-3">
                  {dash.tasksPerUser.map((u) => (
                    <div key={u.userId} className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3">
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                      <span className="font-semibold">{u.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Recent tasks</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {dash.recentTasks.map((t) => (
                  <div key={t._id} className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold">{t.title}</div>
                        <div className="mt-1 text-sm text-slate-400">{t.description}</div>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}