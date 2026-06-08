"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import { api, Call } from "@/lib/api";
import CallStatusBadge from "@/components/CallStatusBadge";
import {
  PhoneOutgoing, Loader2, CheckCircle2, AlertCircle,
  Phone, Clock, User, Info
} from "lucide-react";

export default function MakeCallPage() {
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Call | null>(null);
  const [error, setError] = useState("");

  const dial = async () => {
    if (!to.trim()) { setError("Please enter a phone number"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await api.makeCall(to.trim());
      setResult(r.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to initiate call. Check Twilio credentials.");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <PageHeader title="Make a Call" subtitle="Initiate an outbound call via Twilio" />

        <div className="max-w-xl">
          {/* Notice */}
          <div className="flex items-start gap-3 px-4 py-3 mb-6 bg-amber-50 border border-amber-200 rounded-xl">
            <Info size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Requires Twilio credentials in your Render environment. Make sure <code className="font-mono text-xs bg-amber-100 px-1 rounded">TWILIO_ACCOUNT_SID</code>, <code className="font-mono text-xs bg-amber-100 px-1 rounded">TWILIO_AUTH_TOKEN</code>, and <code className="font-mono text-xs bg-amber-100 px-1 rounded">TWILIO_PHONE_NUMBER</code> are set.
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <PhoneOutgoing size={17} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-display font-600 text-slate-800">Outbound Call</h2>
                <p className="text-xs text-slate-400">Round-robin agent assignment</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Destination Number (E.164)
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && dial()}
                  placeholder="+254712345678"
                  className="input pl-9 font-mono text-base"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Format: +[country code][number] e.g. +254712345678</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <button onClick={dial} disabled={loading || !to.trim()} className="btn-primary w-full justify-center py-3">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Dialing...</>
                : <><PhoneOutgoing size={16} /> Dial Now</>}
            </button>
          </div>

          {/* Success result */}
          {result && (
            <div className="card p-6 mt-4 border-emerald-100">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <h3 className="font-semibold text-slate-800">Call Initiated</h3>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Phone, label: "To", value: result.to_number },
                  { icon: User, label: "Agent", value: result.agent?.name || "Assigning…" },
                  { icon: Clock, label: "Status", value: null },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="flex items-center gap-2 text-xs text-slate-500">
                      <Icon size={13} />{label}
                    </span>
                    {label === "Status"
                      ? <CallStatusBadge status={result.status} />
                      : <span className="text-sm font-mono text-slate-700">{value}</span>}
                  </div>
                ))}
                {result.twilio_sid && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-slate-500">Twilio SID</span>
                    <span className="text-xs font-mono text-slate-500 max-w-[60%] truncate">{result.twilio_sid}</span>
                  </div>
                )}
              </div>
              <button onClick={() => { setResult(null); setTo(""); }} className="btn-secondary w-full mt-4 justify-center">
                Make Another Call
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
