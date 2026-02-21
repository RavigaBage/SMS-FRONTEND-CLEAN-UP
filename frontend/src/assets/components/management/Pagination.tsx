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
  resultsPerPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  // Show a window of max 5 page buttons around the current page
  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    for (let i = left; i <= right; i++) range.push(i);

    // Always include first and last, with ellipsis gaps
    const pages: (number | "...")[] = [];
    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push("...");
    }
    pages.push(...range);
    if (right < totalPages) {
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="rounded-b-2xl px-6 py-4 flex items-center justify-between">
      <p className="text-sm text-slate-500 font-medium">
        Showing <span className="text-slate-800 font-bold">{startResult}</span>{" "}
        to <span className="text-slate-800 font-bold">{endResult}</span> of{" "}
        <span className="text-slate-800 font-bold">{totalResults}</span> results
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} className="text-slate-600" />
        </button>

        {getPageNumbers().map((page, i) =>
          page === "..." ? (
            <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-slate-400 text-sm">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 text-sm font-bold rounded-lg transition-all ${
                currentPage === page
                  ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                  : "text-slate-500 hover:bg-slate-50 border border-transparent"
              }`}
            >
              {page}
            </button>
          )
        )}

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