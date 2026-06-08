"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Phone, Users, PhoneOutgoing,
  BarChart3, Settings, Activity, Zap
} from "lucide-react";
import clsx from "clsx";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calls", label: "Call Logs", icon: Phone },
  { href: "/agents", label: "Agents", icon: Users },
  { href: "/make-call", label: "Make a Call", icon: PhoneOutgoing },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-navy-900 flex flex-col z-40 shadow-sidebar">
      {/* Logo */}
      <div className="px-5 pt-7 pb-6 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-display font-700 text-white text-sm leading-tight">CallMS</p>
            <p className="text-xs text-slate-500 font-mono">v1.0 · production</p>
          </div>
        </div>
      </div>

      {/* System status */}
      <div className="mx-4 mt-4 mb-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <span className="text-xs text-emerald-400 font-medium">System Online</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 pt-3 pb-2 text-xs font-semibold text-slate-600 uppercase tracking-widest">Menu</p>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className={clsx("sidebar-link", active && "active")}>
              <Icon size={17} className={active ? "text-blue-400" : ""} />
              <span>{label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white">C</div>
          <div>
            <p className="text-xs font-semibold text-white">Chris Odhiambo</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
          <Activity size={14} className="ml-auto text-slate-600" />
        </div>
      </div>
    </aside>
  );
}
