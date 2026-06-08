"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { api, Agent } from "@/lib/api";
import {
  Users, Plus, RefreshCw, Phone, ToggleLeft, ToggleRight,
  Loader2, X, Check, UserPlus, CheckCheck
} from "lucide-react";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    try { const r = await api.getAgents(); setAgents(r.data || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (agent: Agent) => {
    setToggling(agent.id);
    try {
      const r = await api.setAvailability(agent.id, !agent.is_available);
      setAgents(prev => prev.map(a => a.id === agent.id ? r.data : a));
    } catch (e) { console.error(e); }
    finally { setToggling(null); }
  };

  const bulkToggle = async (available: boolean) => {
    for (const a of agents) {
      if (a.is_available !== available) await toggle(a);
    }
  };

  const create = async () => {
    if (!name.trim() || !phone.trim()) { setError("Name and phone are required"); return; }
    setCreating(true); setError("");
    try {
      const r = await api.createAgent(name.trim(), phone.trim());
      setAgents(prev => [r.data, ...prev]);
      setName(""); setPhone(""); setShowForm(false);
      setSuccess("Agent created successfully"); setTimeout(() => setSuccess(""), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create agent");
    } finally { setCreating(false); }
  };

  const available = agents.filter(a => a.is_available).length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <PageHeader
          title="Agents"
          subtitle={`${available} online · ${agents.length - available} offline`}
          action={
            <div className="flex gap-2">
              <button onClick={() => bulkToggle(true)} className="btn-secondary text-xs">All Online</button>
              <button onClick={() => bulkToggle(false)} className="btn-secondary text-xs">All Offline</button>
              <button onClick={() => setShowForm(true)} className="btn-primary">
                <Plus size={15} /> Add Agent
              </button>
            </div>
          }
        />

        {success && (
          <div className="mb-5 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
            <CheckCheck size={15} /> {success}
          </div>
        )}

        {/* Add agent form */}
        {showForm && (
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <UserPlus size={16} className="text-blue-600" />
                <h3 className="font-display font-600 text-slate-800">New Agent</h3>
              </div>
              <button onClick={() => { setShowForm(false); setError(""); }} className="text-slate-400 hover:text-slate-700"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alice Mwangi" className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Phone Number (E.164)</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+254712345678" className="input font-mono" />
              </div>
            </div>
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <div className="flex gap-2">
              <button onClick={create} disabled={creating} className="btn-primary">
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Create Agent
              </button>
              <button onClick={() => { setShowForm(false); setError(""); }} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="card p-20 text-center text-slate-400">
            <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-blue-400" />
            <p className="text-sm">Loading agents...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="card">
            <EmptyState icon={Users} title="No agents yet"
              description="Add your first agent to start routing calls"
              action={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={14} /> Add Agent</button>} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {agents.map(agent => (
              <div key={agent.id} className="card p-5 hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-lg font-bold text-white shadow-sm">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{agent.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{agent.phone_number}</p>
                    </div>
                  </div>
                  <button onClick={() => toggle(agent)} disabled={toggling === agent.id}
                    className="flex-shrink-0 transition-colors">
                    {toggling === agent.id
                      ? <Loader2 size={22} className="animate-spin text-slate-300" />
                      : agent.is_available
                        ? <ToggleRight size={28} className="text-emerald-500 hover:text-emerald-600" />
                        : <ToggleLeft size={28} className="text-slate-300 hover:text-slate-400" />}
                  </button>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
                  <span className={`badge ${agent.is_available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${agent.is_available ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {agent.is_available ? "Online" : "Offline"}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Phone size={11} /> {agent._count?.calls ?? 0} calls
                  </span>
                  <span className="ml-auto text-xs text-slate-300">
                    {new Date(agent.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
