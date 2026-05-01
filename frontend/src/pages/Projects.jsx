import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { Link } from "react-router-dom";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [inviteCode, setInviteCode] = useState("");

  const load = async () => {
    const { data } = await api.get("/projects");
    setProjects(data);
  };

  useEffect(() => {
    load();
  }, []);

  const createProject = async (e) => {
    e.preventDefault();
    await api.post("/projects", form);
    setOpen(false);
    setForm({ name: "", description: "" });
    load();
  };

  const joinProject = async (e) => {
    e.preventDefault();
    await api.post("/projects/join", { inviteCode });
    setJoinOpen(false);
    setInviteCode("");
    load();
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="mt-2 text-slate-400">Create teams, join by invite code, and organize work.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setJoinOpen(true)} className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3">Join Project</button>
            <button onClick={() => setOpen(true)} className="rounded-xl bg-white px-4 py-3 font-semibold text-slate-900">Create Project</button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <Link key={p._id} to={`/projects/${p._id}`} className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{p.name}</h2>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{p.members?.length || 0} members</span>
              </div>
              <p className="mt-3 text-sm text-slate-400">{p.description || "No description"}</p>
              <div className="mt-4 text-xs text-slate-500">Invite Code: {p.inviteCode}</div>
            </Link>
          ))}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create Project">
        <form onSubmit={createProject} className="space-y-4">
          <input className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3" placeholder="Project Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3" rows="4" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="rounded-xl bg-white px-4 py-3 font-semibold text-slate-900">Create</button>
        </form>
      </Modal>

      <Modal open={joinOpen} onClose={() => setJoinOpen(false)} title="Join Project">
        <form onSubmit={joinProject} className="space-y-4">
          <input className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3" placeholder="Invite Code" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} />
          <button className="rounded-xl bg-white px-4 py-3 font-semibold text-slate-900">Join</button>
        </form>
      </Modal>
    </Layout>
  );
}