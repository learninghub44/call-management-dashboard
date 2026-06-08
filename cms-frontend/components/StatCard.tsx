import clsx from "clsx";
import { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  color?: "blue" | "emerald" | "amber" | "rose";
  trend?: { value: string; up: boolean };
}

const colors = {
  blue:    { icon: "bg-blue-50 text-blue-600",    border: "border-blue-100" },
  emerald: { icon: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
  amber:   { icon: "bg-amber-50 text-amber-600",  border: "border-amber-100" },
  rose:    { icon: "bg-rose-50 text-rose-600",    border: "border-rose-100" },
};

export default function StatCard({ label, value, sub, icon: Icon, color = "blue", trend }: Props) {
  const c = colors[color];
  return (
    <div className={clsx("card p-5 hover:shadow-card-hover transition-shadow duration-200 border", c.border)}>
      <div className="flex items-start justify-between mb-4">
        <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", c.icon)}>
          <Icon size={18} />
        </div>
        {trend && (
          <span className={clsx("text-xs font-semibold px-2 py-1 rounded-full",
            trend.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
            {trend.up ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-700 text-slate-900 mb-0.5">{value}</p>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}
