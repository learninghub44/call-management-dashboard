"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import { Copy, CheckCheck, Wifi } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://call-management-system-11b9.onrender.com";

export default function SettingsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const webhooks = [
    { label: "Voice Webhook URL", key: "voice", url: `${API_URL}/webhooks/voice`, desc: "Set as Voice webhook in Twilio phone number settings" },
    { label: "Status Callback URL", key: "status", url: `${API_URL}/webhooks/status`, desc: "Set as Status Callback in Twilio phone number settings" },
    { label: "Outbound TwiML URL", key: "outbound", url: `${API_URL}/webhooks/outbound-twiml`, desc: "Used internally for outbound call TwiML" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <PageHeader title="Settings" subtitle="System configuration and integration setup" />

        <div className="max-w-2xl">
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
                      {copied === w.key
                        ? <CheckCheck size={14} className="text-emerald-500" />
                        : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}