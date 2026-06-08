"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import { api, Call } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { RefreshCw, TrendingUp, PhoneIncoming, PhoneOutgoing, Clock } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function AnalyticsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const r = await api.getCalls(500); setCalls(r.data || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Calls per day (last 14 days)
  const callsPerDay = (() => {
    const days: Record<string, { date: string; inbound: number; outbound: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = { date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), inbound: 0, outbound: 0 };
    }
    calls.forEach(c => {
      const key = c.created_at.slice(0, 10);
      if (days[key]) days[key][c.direction]++;
    });
    return Object.values(days);
  })();

  // Status breakdown
  const statusData = (() => {
    const counts: Record<string, number> = {};
    calls.forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  // Direction split
  const inbound = calls.filter(c => c.direction === "inbound").length;
  const outbound = calls.filter(c => c.direction === "outbound").length;
  const directionData = [
    { name: "Inbound", value: inbound },
    { name: "Outbound", value: outbound },
  ];

  // Peak hours
  const peakHours = (() => {
    const hours: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hours[i] = 0;
    calls.forEach(c => { const h = new Date(c.created_at).getHours(); hours[h]++; });
    return Object.entries(hours).map(([h, count]) => ({
      hour: `${h.padStart(2, "0")}:00`, count
    }));
  })();

  // Duration trend
  const durationTrend = callsPerDay.map(day => {
    const dayCalls = calls.filter(c => {
      const d = new Date(c.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
      return d === day.date && c.status === "completed" && c.duration;
    });
    const avg = dayCalls.length ? Math.round(dayCalls.reduce((s, c) => s + (c.duration || 0), 0) / dayCalls.length) : 0;
    return { date: day.date, avg };
  });

  const completedCalls = calls.filter(c => c.status === "completed");
  const avgDuration = completedCalls.length
    ? Math.round(completedCalls.reduce((s, c) => s + (c.duration || 0), 0) / completedCalls.length) : 0;

  if (loading) return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <RefreshCw size={32} className="animate-spin mx-auto mb-3 text-blue-400" />
          <p>Loading analytics...</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <PageHeader
          title="Analytics"
          subtitle="Call performance insights"
          action={
            <button onClick={load} className="btn-secondary">
              <RefreshCw size={14} /> Refresh
            </button>
          }
        />

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4 mb-7">
          {[
            { label: "Total Calls", value: calls.length, icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
            { label: "Inbound", value: inbound, icon: PhoneIncoming, color: "text-indigo-600 bg-indigo-50" },
            { label: "Outbound", value: outbound, icon: PhoneOutgoing, color: "text-cyan-600 bg-cyan-50" },
            { label: "Avg Duration", value: avgDuration ? `${avgDuration}s` : "—", icon: Clock, color: "text-amber-600 bg-amber-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={17} />
              </div>
              <div>
                <p className="text-xl font-display font-700 text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-3 gap-5 mb-5">
          <div className="col-span-2 card p-5">
            <h3 className="font-display font-600 text-slate-800 mb-4">Calls Per Day (Last 14 Days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={callsPerDay} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="inbound" name="Inbound" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outbound" name="Outbound" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="font-display font-600 text-slate-800 mb-4">Call Status Breakdown</h3>
            {statusData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-slate-300 text-sm">No data</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1">
                  {statusData.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-slate-600 capitalize">{s.name.replace("_", " ")}</span>
                      </div>
                      <span className="font-semibold text-slate-700">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="font-display font-600 text-slate-800 mb-4">Peak Hours</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={3} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="count" name="Calls" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="font-display font-600 text-slate-800 mb-4">Avg Call Duration Trend (s)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={durationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Line type="monotone" dataKey="avg" name="Avg (s)" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
