"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import { api } from "@/lib/api";
import {
  Copy, CheckCheck, Wifi, Server, Database, Key,
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

  const envVars = [
    { key: "TWILIO_ACCOUNT_SID", desc: "Your Twilio Account SID (starts with AC)" },
    { key: "TWILIO_AUTH_TOKEN", desc: "Your Twilio Auth Token" },
    { key: "TWILIO_PHONE_NUMBER", desc: "Your Twilio phone number in E.164 format" },
    { key: "DATABASE_URL", desc: "Supabase PostgreSQL connection string" },
    { key: "API_KEY", desc: "Secret key for X-API-Key header authentication" },
    { key: "BASE_URL", desc: "Your Render deployment URL" },
    { key: "NODE_ENV", desc: "Set to production" },
  ];

  const links = [
    { label: "GitHub Repo", url: "https://github.com/learninghub44/call-management-system", icon: ExternalLink },
    { label: "Render Dashboard", url: "https://dashboard.render.com", icon: ExternalLink },
    { label: "Supabase Dashboard", url: "https://supabase.com/dashboard", icon: ExternalLink },
    { label: "Twilio Console", url: "https://console.twilio.com", icon: ExternalLink },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <PageHeader title="Settings" subtitle="System configuration and integration setup" />

        <div className="max-w-2xl space-y-6">
          {/* System Health */}
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
                  <p className="text-xs text-slate-400 font-mono">{API_URL}</p>
                </div>
              </div>
              <button onClick={checkHealth} className="btn-secondary text-xs">
                <RefreshCw size={12} /> Check
              </button>
            </div>
          </div>

          {/* Twilio Webhook URLs */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Wifi size={16} className="text-slate-500" />
              <h2 className="font-display font-600 text-slate-800">Twilio Webhook URLs</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">Copy these into your Twilio Console → Phone Numbers → Configure</p>
            <div className="space-y-4">
              {webhooks.map(w => (
                <div key={w.key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-600">{w.label}</label>
                  </div>
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

          {/* API Key */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Key size={16} className="text-slate-500" />
              <h2 className="font-display font-600 text-slate-800">API Authentication</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">All REST API calls require this header</p>
            <div className="bg-slate-900 rounded-xl px-4 py-3">
              <code className="text-xs text-emerald-400 font-mono">X-API-Key: <span className="text-blue-300">{process.env.NEXT_PUBLIC_API_KEY || "callsystem2024secret"}</span></code>
            </div>
          </div>

          {/* Required env vars */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Database size={16} className="text-slate-500" />
              <h2 className="font-display font-600 text-slate-800">Required Environment Variables</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">Set these in your Render dashboard → Environment</p>
            <div className="space-y-2">
              {envVars.map(v => (
                <div key={v.key} className="flex items-start gap-3 py-2 border-b border-slate-50">
                  <code className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded w-52 flex-shrink-0">{v.key}</code>
                  <span className="text-xs text-slate-500">{v.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
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
