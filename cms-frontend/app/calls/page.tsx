"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import CallStatusBadge from "@/components/CallStatusBadge";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { api, Call } from "@/lib/api";
import {
  Phone, PhoneIncoming, PhoneOutgoing, RefreshCw,
  Clock, Search, Filter, Download, ChevronLeft, ChevronRight, X
} from "lucide-react";

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "inbound" | "outbound">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Call | null>(null);
  const PER_PAGE = 15;

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getCalls(500);
      setCalls(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const fmt = (s: number | null) => {
    if (!s) return "—";
    const m = Math.floor(s / 60), sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const filtered = calls.filter(c => {
    if (filter !== "all" && c.direction !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.from_number.includes(q) && !c.to_number.includes(q) && !c.agent?.name?.toLowerCase().includes(q)) return false;
    }
    if (dateFrom && new Date(c.created_at) < new Date(dateFrom)) return false;
    if (dateTo && new Date(c.created_at) > new Date(dateTo + "T23:59:59")) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const exportCSV = () => {
    const rows = [["ID", "Direction", "From", "To", "Agent", "Status", "Duration", "Date"]];
    filtered.forEach(c => rows.push([c.id, c.direction, c.from_number, c.to_number, c.agent?.name || "", c.status, String(c.duration || ""), fmtDate(c.created_at)]));
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "calls.csv"; a.click();
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <PageHeader
          title="Call Logs"
          subtitle={`${calls.length} total calls`}
          action={
            <div className="flex gap-2">
              <button onClick={exportCSV} className="btn-secondary">
                <Download size={14} /> Export CSV
              </button>
              <button onClick={load} className="btn-secondary">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          }
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search by number or agent..."
              className="input pl-9" />
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <Filter size={13} className="text-slate-400 ml-1.5" />
            {(["all", "inbound", "outbound"] as const).map(f => (
              <button key={f} onClick={() => { setFilter(f); setPage(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-700"}`}>
                {f}
              </button>
            ))}
          </div>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }}
            className="input w-auto text-xs px-3 py-2" />
          <span className="text-slate-400 text-sm">→</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }}
            className="input w-auto text-xs px-3 py-2" />
          {(search || filter !== "all" || dateFrom || dateTo) && (
            <button onClick={() => { setSearch(""); setFilter("all"); setDateFrom(""); setDateTo(""); setPage(0); }}
              className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
              <X size={13} /> Clear
            </button>
          )}
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-20 text-center text-slate-400">
              <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-blue-400" />
              <p className="text-sm">Loading call logs...</p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Phone} title="No calls found" description="Try adjusting your search or filters" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {["#", "Direction", "From", "To", "Agent", "Status", "Duration", "Date & Time"].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginated.map((call, i) => (
                      <tr key={call.id}
                        onClick={() => setSelected(call)}
                        className="hover:bg-blue-50/30 transition-colors cursor-pointer">
                        <td className="px-5 py-4 text-xs text-slate-400 font-mono">{page * PER_PAGE + i + 1}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${call.direction === "inbound" ? "bg-indigo-50 text-indigo-700" : "bg-cyan-50 text-cyan-700"}`}>
                            {call.direction === "inbound" ? <PhoneIncoming size={11} /> : <PhoneOutgoing size={11} />}
                            {call.direction}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-700 font-mono">{call.from_number}</td>
                        <td className="px-5 py-4 text-sm text-slate-700 font-mono">{call.to_number}</td>
                        <td className="px-5 py-4">
                          {call.agent ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
                                {call.agent.name.charAt(0)}
                              </div>
                              <span className="text-sm text-slate-700">{call.agent.name}</span>
                            </div>
                          ) : <span className="text-slate-300 text-sm">—</span>}
                        </td>
                        <td className="px-5 py-4"><CallStatusBadge status={call.status} /></td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Clock size={12} className="text-slate-400" />{fmt(call.duration)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">{fmtDate(call.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft size={15} />
                  </button>
                  <span className="px-3 text-xs text-slate-600 font-medium">{page + 1} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Call detail modal */}
        {selected && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-700 text-slate-900">Call Details</h3>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
              </div>
              <div className="space-y-3">
                {[
                  ["ID", selected.id],
                  ["Twilio SID", selected.twilio_sid || "—"],
                  ["Direction", selected.direction],
                  ["From", selected.from_number],
                  ["To", selected.to_number],
                  ["Agent", selected.agent?.name || "Unassigned"],
                  ["Status", selected.status],
                  ["Duration", fmt(selected.duration)],
                  ["Created", fmtDate(selected.created_at)],
                  ["Updated", fmtDate(selected.updated_at)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{k}</span>
                    <span className="text-sm text-slate-700 font-mono text-right max-w-[60%] break-all">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
