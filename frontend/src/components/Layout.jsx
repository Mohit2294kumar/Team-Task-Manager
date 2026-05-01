import React, { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    `rounded-xl px-4 py-3 text-sm transition ${
      isActive ? "bg-white text-slate-900" : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b,_#020617_55%)] text-white">
      <div className="flex">
        <aside className="hidden min-h-screen w-72 border-r border-white/10 p-6 lg:block">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            TaskFlow Pro
          </Link>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-slate-400">Signed in as</div>
            <div className="mt-1 font-medium">{user?.name}</div>
            <div className="text-xs text-slate-500">{user?.email}</div>
          </div>

          <nav className="mt-8 space-y-2">
            <NavLink to="/" className={navClass}>Dashboard</NavLink>
            <NavLink to="/projects" className={navClass}>Projects</NavLink>
          </nav>

          <button
            onClick={onLogout}
            className="mt-8 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-300 hover:bg-red-500/20 hover:text-white"
          >
            Logout
          </button>
        </aside>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}