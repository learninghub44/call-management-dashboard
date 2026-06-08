"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import CallStatusBadge from "@/components/CallStatusBadge";
import PageHeader from "@/components/PageHeader";
import { api, Agent, Call } from "@/lib/api";
import {
  Phone, Users, Clock, TrendingUp, RefreshCw,
  PhoneIncoming, PhoneOutgoing, Copy, CheckCheck,
  AlertCircle, Wifi
} from "lucide-react";

const WEBHOOK_BASE = process.env.NEXT_PUBLIC_API_URL || "https://call-management-system-11b9.onrender.com";

export default function DashboardPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = async () => {
    setLoading(true);
    try {
      const [callsRes, agentsRes, health] = await Promise.all([
        api.getCalls(200),
        api.getAgents(),
        api.health(),
      ]);
      setCalls(callsRes.data || []);
      setAgents(agentsRes.data || []);
      setHealthy(health.status === "ok");
    } catch {
      setHealthy(false);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => { load(); }, []);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const today = new Date().toDateString();
  const todayCalls = calls.filter(c => new Date(c.created_at).toDateString() === today);
  const availableAgents = agents.filter(a => a.is_available);
  const completedCalls = calls.filter(c => c.status === "completed");
  const avgDuration = completedCalls.length
    ? Math.round(completedCalls.reduce((s, c) => s + (c.duration || 0), 0) / completedCalls.length)
    : 0;
  const recentCalls = [...calls].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);

  const webhooks = [
    { label: "Voice Webhook", url: `${WEBHOOK_BASE}/webhooks/voice` },
    { label: "Status Callback", url: `${WEBHOOK_BASE}/webhooks/status` },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 max-w-[1400px]">
        <PageHeader
          title="Dashboard"
          subtitle={`Last refreshed ${lastRefresh.toLocaleTimeString()}`}
          action={
            <button onClick={load} className="btn-secondary">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          }
        />

        {/* Health banner */}
        {healthy === false && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle size={16} />
            Backend unreachable — check your Render deployment
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <StatCard label="Total Calls" value={calls.length} icon={Phone} color="blue"
            sub={`${todayCalls.length} today`} />
          <StatCard label="Available Agents" value={`${availableAgents.length}/${agents.length}`}
            icon={Users} color="emerald" sub="online right now" />
          <StatCard label="Avg Duration" value={avgDuration > 0 ? `${avgDuration}s` : "—"}
            icon={Clock} color="amber" sub="completed calls" />
          <StatCard label="Completion Rate"
            value={calls.length ? `${Math.round((completedCalls.length / calls.length) * 100)}%` : "—"}
            icon={TrendingUp} color="rose" sub={`${completedCalls.length} completed`} />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Recent Calls */}
          <div className="col-span-2 card">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-display font-600 text-slate-800">Recent Calls</h2>
              <a href="/calls" className="text-xs text-blue-600 hover:underline font-medium">View all →</a>
            </div>
            {recentCalls.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Phone size={28} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No calls yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentCalls.map(call => (
                  <div key={call.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${call.direction === "inbound" ? "bg-indigo-50" : "bg-cyan-50"}`}>
                      {call.direction === "inbound"
                        ? <PhoneIncoming size={14} className="text-indigo-600" />
                        : <PhoneOutgoing size={14} className="text-cyan-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-slate-700 truncate">{call.from_number} → {call.to_number}</p>
                      <p className="text-xs text-slate-400">{call.agent?.name ?? "Unassigned"} · {new Date(call.created_at).toLocaleString()}</p>
                    </div>
                    <CallStatusBadge status={call.status} />
                    <span className="text-xs text-slate-400 font-mono w-12 text-right">{call.duration ? `${call.duration}s` : "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Agents */}
            <div className="card">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-display font-600 text-slate-800">Agents</h2>
                <a href="/agents" className="text-xs text-blue-600 hover:underline font-medium">Manage →</a>
              </div>
              <div className="p-4 space-y-2">
                {agents.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No agents yet</p>
                ) : agents.slice(0, 5).map(agent => (
                  <div key={agent.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{agent.name}</p>
                      <p className="text-xs text-slate-400 font-mono truncate">{agent.phone_number}</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${agent.is_available ? "bg-emerald-400" : "bg-slate-300"}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Twilio Webhooks */}
            <div className="card">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <Wifi size={14} className="text-slate-400" />
                <h2 className="font-display font-600 text-slate-800">Twilio Webhooks</h2>
              </div>
              <div className="p-4 space-y-3">
                {webhooks.map(w => (
                  <div key={w.label}>
                    <p className="text-xs font-semibold text-slate-500 mb-1">{w.label}</p>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                      <code className="text-xs text-slate-600 flex-1 truncate font-mono">{w.url}</code>
                      <button onClick={() => copy(w.url, w.label)}
                        className="text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0">
                        {copied === w.label ? <CheckCheck size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-slate-400 pt-1">Paste these into your Twilio phone number settings</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
