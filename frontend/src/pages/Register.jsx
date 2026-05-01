import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.post("/auth/register", form);
      login(data);
      navigate("/");
    } catch (error) {
      setErr(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <h1 className="text-3xl font-bold text-white">Create account</h1>
        <p className="mt-2 text-sm text-slate-400">Start a project workspace in seconds.</p>

        {err && <div className="mt-4 rounded-xl bg-red-500/15 p-3 text-sm text-red-300">{err}</div>}

        <div className="mt-6 space-y-4">
          <input className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button disabled={loading} className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-slate-900 hover:bg-slate-200">
            {loading ? "Creating..." : "Register"}
          </button>
        </div>

        <p className="mt-5 text-sm text-slate-400">
          Already have an account? <Link className="text-white underline" to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}