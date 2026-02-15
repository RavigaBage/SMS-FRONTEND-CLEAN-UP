"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalResults: number;
  resultsPerPage: number;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalResults, 
  resultsPerPage 
}: PaginationProps) {
  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <div className="  rounded-b-2xl px-6 py-4 flex items-center justify-between">
      <p className="text-sm text-slate-500 font-medium">
        Showing <span className="text-slate-800 font-bold">{startResult}</span> to{" "}
        <span className="text-slate-800 font-bold">{endResult}</span> of{" "}
        <span className="text-slate-800 font-bold">{totalResults}</span> staff
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} className="text-slate-600" />
        </button>
        
        {/* Simple Page Numbers */}
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => onPageChange(i + 1)}
            className={`w-10 h-10 text-sm font-bold rounded-lg transition-all ${
              currentPage === i + 1
                ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                : "text-slate-500 hover:bg-slate-50 border border-transparent"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} className="text-slate-600" />
        </button>
      </div>
    </div>
  );
}