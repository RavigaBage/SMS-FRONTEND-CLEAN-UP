// frontend/src/assets/components/management/Pagination.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
}

export function Pagination({ totalItems, itemsPerPage, currentPage }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex items-center justify-between py-4 px-2">
      {/* Record Count - Using dataCount from API */}
      <p className="text-xs text-slate-400 font-medium italic">
        Showing <span className="text-slate-700 font-bold">1 to {itemsPerPage}</span> of <span className="text-slate-700 font-bold">{totalItems}</span> students
      </p>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50">
          <ChevronLeft size={16} />
        </button>

        {/* Page Numbers */}
        {[1, 2, 3, "...", totalPages].map((page, index) => (
          <button
            key={index}
            className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
              page === currentPage
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-200"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {page}
          </button>
        ))}

        <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}