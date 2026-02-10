type TrendBarProps = {
  height: React.CSSProperties["height"];
  label: string;
  active?: boolean;
};

export function TrendBar({ height, label, active = false }: TrendBarProps) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1 group">
      <div className="w-full bg-slate-100 rounded-t-lg relative flex items-end h-32">
        <div
          className={`w-full rounded-t-lg transition-all duration-500 group-hover:opacity-80 ${
            active ? "bg-blue-600" : "bg-slate-300"
          }`}
          style={{ height }}
        />

        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {height}
        </div>
      </div>

      <span
        className={`text-[10px] font-black uppercase tracking-wider ${
          active ? "text-blue-600" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
