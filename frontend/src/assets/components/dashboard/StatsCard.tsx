// frontend/src/components/dashboard/StatsCard.tsx
interface StatsCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  color: "cyan" | "blue" | "orange";
}

export function StatsCard({ label, value, subValue, color }: StatsCardProps) {
  const colors = {
    cyan: "text-cyan-600 bg-cyan-50",
    blue: "text-blue-600 bg-blue-50",
    orange: "text-orange-600 bg-orange-50",
  };

  return (
    <div className="p-4 rounded-xl border bg-white shadow-sm">
      <p className="text-sm font-medium text-slate-500 uppercase">{label}</p>
      <div className="flex items-center justify-between mt-2">
        <h2 className="text-2xl font-bold">{value}</h2>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {/* Icon would go here */}
        </div>
      </div>
      {subValue && <p className="text-xs mt-2 text-green-600 font-medium">{subValue}</p>}
    </div>
  );
}