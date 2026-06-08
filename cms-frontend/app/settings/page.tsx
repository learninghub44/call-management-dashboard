"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import { api } from "@/lib/api";
import {
  Copy, CheckCheck, Wifi, Server,
  ExternalLink, CheckCircle2, XCircle, RefreshCw
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://call-management-system-11b9.onrender.com";

export default function SettingsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [health, setHealth] = useState<"checking" | "ok" | "error">("checking");
  const [healthTs, setHealthTs] = useState("");

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const checkHealth = async () => {
    setHealth("checking");
    try {
      const r = await api.health();
      setHealth(r.status === "ok" ? "ok" : "error");
      setHealthTs(new Date(r.ts).toLocaleTimeString());
    } catch { setHealth("error"); }
  };

  useEffect(() => { checkHealth(); }, []);

  const webhooks = [
    { label: "Voice Webhook URL", key: "voice", url: `${API_URL}/webhooks/voice`, desc: "Set as Voice webhook in Twilio phone number settings" },
    { label: "Status Callback URL", key: "status", url: `${API_URL}/webhooks/status`, desc: "Set as Status Callback in Twilio phone number settings" },
    { label: "Outbound TwiML URL", key: "outbound", url: `${API_URL}/webhooks/outbound-twiml`, desc: "Used internally for outbound call TwiML" },
  ];

  const links = [
    { label: "Twilio Console", url: "https://console.twilio.com", icon: ExternalLink },
    { label: "Render Dashboard", url: "https://dashboard.render.com", icon: ExternalLink },
    { label: "Supabase Dashboard", url: "https://supabase.com/dashboard", icon: ExternalLink },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <PageHeader title="Settings" subtitle="System configuration and integration setup" />

        <div className="max-w-2xl space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Server size={16} className="text-slate-500" />
              <h2 className="font-display font-600 text-slate-800">System Health</h2>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                {health === "checking" && <RefreshCw size={18} className="animate-spin text-slate-400" />}
                {health === "ok" && <CheckCircle2 size={18} className="text-emerald-500" />}
                {health === "error" && <XCircle size={18} className="text-red-500" />}
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {health === "checking" ? "Checking backend..." : health === "ok" ? "Backend Online" : "Backend Unreachable"}
                  </p>
                  {healthTs && <p className="text-xs text-slate-400">Last checked at {healthTs}</p>}
                </div>
              </div>
              <button onClick={checkHealth} className="btn-secondary text-xs">
                <RefreshCw size={12} /> Check
              </button>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Wifi size={16} className="text-slate-500" />
              <h2 className="font-display font-600 text-slate-800">Twilio Webhook URLs</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">Copy these into your Twilio Console → Phone Numbers → Configure</p>
            <div className="space-y-4">
              {webhooks.map(w => (
                <div key={w.key}>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">{w.label}</label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                    <code className="text-xs text-slate-700 flex-1 font-mono truncate">{w.url}</code>
                    <button onClick={() => copy(w.url, w.key)}
                      className="text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0">
                      {copied === w.key ? <CheckCheck size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display font-600 text-slate-800 mb-4">Quick Links</h2>
            <div className="grid grid-cols-2 gap-3">
              {links.map(({ label, url, icon: Icon }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl text-sm text-slate-700 hover:text-blue-700 transition-all">
                  <Icon size={14} /> {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}