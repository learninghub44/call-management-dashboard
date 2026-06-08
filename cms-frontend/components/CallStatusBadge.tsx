import clsx from "clsx";
import { CallStatus } from "@/lib/api";

const config: Record<CallStatus, { label: string; classes: string }> = {
  completed:   { label: "Completed",   classes: "bg-emerald-50 text-emerald-700" },
  in_progress: { label: "In Progress", classes: "bg-blue-50 text-blue-700 animate-pulse" },
  ringing:     { label: "Ringing",     classes: "bg-amber-50 text-amber-700" },
  queued:      { label: "Queued",      classes: "bg-slate-100 text-slate-600" },
  busy:        { label: "Busy",        classes: "bg-orange-50 text-orange-700" },
  no_answer:   { label: "No Answer",   classes: "bg-slate-100 text-slate-500" },
  failed:      { label: "Failed",      classes: "bg-red-50 text-red-700" },
  canceled:    { label: "Canceled",    classes: "bg-slate-100 text-slate-500" },
};

export default function CallStatusBadge({ status }: { status: CallStatus }) {
  const c = config[status] ?? { label: status, classes: "bg-slate-100 text-slate-600" };
  return (
    <span className={clsx("badge", c.classes)}>{c.label}</span>
  );
}
