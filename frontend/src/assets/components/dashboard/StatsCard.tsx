
interface StatsCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  color: "cyan" | "blue" | "orange" | "emerald" | "slate"; 
}

export function StatsCard({ label, value, subValue, color }: StatsCardProps) {
  // 2. Add the Tailwind classes for the new colors
  const colorClasses = {
    cyan: "bg-cyan-50 text-cyan-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    emerald: "bg-emerald-50 text-emerald-600", // For 'Active'
    slate: "bg-slate-50 text-slate-600",       // For 'Inactive'
  };


return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-end gap-2 mt-1">
        <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
        {subValue && <span className="text-[10px] font-bold text-slate-400 mb-1">{subValue}</span>}
      </div>
      {/* Visual indicator bar or icon using the color */}
      <div className={`h-1 w-8 mt-3 rounded-full ${colorClasses[color]}`} />
    </div>
  );
}