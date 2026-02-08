// frontend/src/assets/components/management/StaffFilters.tsx
"use client";

import { ChevronDown } from "lucide-react";

export function StaffFilters({ 
  onFilterChange, 
  onClear, 
  filters 
}: { 
  onFilterChange: (filters: any) => void;
  onClear: () => void;
  filters: any;
}) {
  const filterOptions = [
    { label: "All Roles", key: "role", options: ["Teacher", "Administrator", "Support"] },
    { label: "Status: All", key: "status", options: ["active", "On Leave", "Inactive"] },
  ];

  const hasActiveFilters = Object.values(filters).some(val => val !== "");

  return (
    <div className="flex flex-wrap items-center gap-3">
      {filterOptions.map((filter) => (
        <div key={filter.key} className="relative">
          <select 
            value={filters[filter.key]} // Now controlled by parent state
            onChange={(e) => onFilterChange({ [filter.key]: e.target.value })}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-cyan-100 transition-all cursor-pointer"
          >
            <option value="">{filter.label}</option>
            {filter.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      ))}

      {hasActiveFilters && (
        <button 
          onClick={onClear}
          className="text-xs font-black text-red-500 uppercase tracking-wider hover:text-red-600 transition-colors ml-2"
        >
          Clear All
        </button>
      )}
    </div>
  );
}