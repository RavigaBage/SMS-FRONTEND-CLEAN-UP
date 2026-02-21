
"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  Home,
  BookOpen,
  Zap,
  Settings,
  Download,
  Loader2,
  Filter,
} from "lucide-react";
import { apiRequest, fetchWithAuth } from "@/src/lib/apiClient";
import { RecordExpenseModal } from "@/src/assets/components/management/RecordExpenseModal";

/* ---------------- TYPES ---------------- */

export interface ApiResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
}

export interface ExpenditureRaw {
  id: number;
  expenditure_number: string;
  item_name: string;
  category: string;
  category_display?: string;
  amount: string | number;
  vendor_name?: string | null;
  transaction_date?: string | null;
  processed_by?: number | null;
  processed_by_username?: string | null;
  staff_name?: string | null;
  description?: string | null;
  receipt_url?: string | null;
  created_at?: string | null;
}

export interface Expenditure {
  id: number;
  expenditureNumber: string;
  itemName: string;
  category: string;
  categoryDisplay?: string;
  amount: number;
  vendorName?: string | null;
  date?: string | null;
  staffName?: string | null;
  description?: string | null;
  receiptUrl?: string | null;
  createdAt?: string | null;
}

export interface ExpenditureSummary {
  infrastructure?: number;
  academic?: number;
  utilities?: number;
  maintenance?: number;
}

interface FetchExpenditureOptions {
  search?: string;
  page?: number;
  startDate?: string;
  endDate?: string;
}

interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

/* ---------------- HELPERS ---------------- */

const normalizeExpenditure = (raw: ExpenditureRaw): Expenditure => ({
  id: raw.id,
  expenditureNumber: raw.expenditure_number,
  itemName: raw.item_name,
  category: raw.category,
  categoryDisplay: raw.category_display,
  amount: typeof raw.amount === 'string' ? parseFloat(raw.amount) || 0 : raw.amount,
  vendorName: raw.vendor_name ?? null,
  date: raw.transaction_date ?? raw.created_at ?? null,
  staffName: raw.staff_name ?? raw.processed_by_username ?? null,
  description: raw.description ?? null,
  receiptUrl: raw.receipt_url ?? null,
  createdAt: raw.created_at ?? null,
});

function unwrapArray<T>(payload: ApiResponse<T> | T[] | null | undefined): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if ((payload as ApiResponse<T>).results) return (payload as ApiResponse<T>).results as T[];
  return [];
}

const buildQuery = (opts?: { search?: string; page?: number }) => {
  const params = new URLSearchParams();
  if (opts?.search) params.append("search", opts.search);
  if (opts?.page && opts.page > 1) params.append("page", String(opts.page));
  return params.toString();
};

const getCurrentMonthStart = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

const getCurrentMonthEnd = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
};

const createApiError = (err: unknown, defaultMessage = 'An error occurred'): ApiError => {
  if (err instanceof Error) {
    return {
      message: err.message || defaultMessage,
      status: (err as any).status,
      details: err
    };
  }
  
  if (typeof err === 'object' && err !== null) {
    return {
      message: (err as any).message || defaultMessage,
      status: (err as any).status,
      details: err
    };
  }

  return {
    message: defaultMessage,
    details: err
  };
};

/* ---------------- COMPONENT ---------------- */

export default function ExpenditurePage() {
  const [expenses, setExpenses] = useState<Expenditure[]>([]);
  const [stats, setStats] = useState<ExpenditureSummary>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Expenditure | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  
  const [dateRange, setDateRange] = useState({
    startDate: getCurrentMonthStart(),
    endDate: getCurrentMonthEnd()
  });
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const abortControllerRef = useRef<AbortController | null>(null);

 
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Reset page when search changes
  useEffect(() => setPage(1), [debouncedSearch]);

  // Fetch data when search, page, or date range changes
  useEffect(() => {
    fetchExpenditureData({ 
      search: debouncedSearch, 
      page,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });

  }, [debouncedSearch, page, dateRange]);

  /* ---------------- API ---------------- */

  const fetchExpenditureData = useCallback(async (opts?: FetchExpenditureOptions) => {

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    setError(null);

    try {
      const {
        search,
        page,
        startDate = getCurrentMonthStart(),
        endDate = getCurrentMonthEnd()
      } = opts ?? {};

      const query = buildQuery({ search, page });

      // Make API calls in parallel with independent error handling
      const [listResult, statsResult] = await Promise.allSettled([
        apiRequest<ApiResponse<ExpenditureRaw>>(
          `/expenditures/?${query}`,
          { method: "GET", signal }
        ),
        fetchWithAuth(
          `${baseUrl}/financial-dashboard/summary/?start_date=${startDate}&end_date=${endDate}`,
          { method: "GET", signal }
        )
      ]);

      
      if (listResult.status === 'fulfilled') {
       
        const rawList = unwrapArray<ExpenditureRaw>(listResult.value as any);

        const normalized = (rawList ?? []).map(normalizeExpenditure);
        setExpenses(normalized);

        setTotalCount((listResult.value as any)?.count ?? rawList.length);
      } else {
        if (listResult.reason?.name !== 'AbortError') {
          console.error('Failed to fetch expenditures:', listResult.reason);
          setExpenses([]);
          setTotalCount(0);
          throw createApiError(listResult.reason, 'Failed to fetch expenditures');
        }
      }

      if (statsResult.status === 'fulfilled') {
        setStats((statsResult.value as any) ?? {});
      } else {
        if (statsResult.reason?.name !== 'AbortError') {
          console.warn('Failed to fetch stats:', statsResult.reason);
          setStats({});
        }
      }

    } catch (err) {
      
      if ((err as Error)?.name === 'AbortError') {
        return;
      }

      const apiError = createApiError(err);
      console.error('Expenditure fetch error:', apiError);
      
      setError(apiError.message);
      setExpenses([]);
      setStats({});
      setTotalCount(0);
      
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  /* ---------------- CRUD ---------------- */

  const handleAddClick = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (exp: Expenditure) => {
    setEditing(exp);
    setIsModalOpen(true);
  };
  const trendData = useMemo(() => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIndex = new Date().getMonth(); // 1 for Feb in 2026
  
  // 1. Initialize totals for each month
  const monthlyTotals = months.map((month) => ({ label: month, total: 0 }));

  // 2. Sum up expenses into their respective months
  expenses.forEach((exp) => {
    if (!exp.date) return;
    const date = new Date(exp.date);
    if (date.getFullYear() === 2026) {
      const monthIndex = date.getMonth();
      monthlyTotals[monthIndex].total += exp.amount;
    }
  });

  const maxSpend = Math.max(...monthlyTotals.map(m => m.total), 1); 
  return monthlyTotals.map((m, index) => ({
    ...m,
    height: `${(m.total / maxSpend) * 100}%`,
    active: index === currentMonthIndex,
    formattedTotal: `₵${m.total.toLocaleString(undefined, { minimumFractionDigits: 0 })}`
  }));
  }, [expenses]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this expenditure? This action cannot be undone.")) return;
    
    try {
      setLoading(true);
      await apiRequest(`/expenditures/${id}/`, { method: "DELETE" });
      await fetchExpenditureData({ 
        search: debouncedSearch, 
        page,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
    } catch (err) {
      console.error(err);
      const apiError = createApiError(err, "Failed to delete expenditure");
      setError(apiError.message);
      alert(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const qs = buildQuery({ search: debouncedSearch });
      const exportUrl = `${process.env.NEXT_PUBLIC_API_URL || ""}/expenditures/export/?${qs}`;
      window.open(exportUrl, "_blank");
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleModalSuccess = useCallback(() => {
    setIsModalOpen(false);
    setEditing(null);
    fetchExpenditureData({ 
      search: debouncedSearch, 
      page,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });
  }, [debouncedSearch, page, dateRange, fetchExpenditureData]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditing(null);
  }, []);

  const totalPages = useMemo(() => Math.ceil((totalCount || 0) / 20), [totalCount]);

  const areaPath = useMemo(() => {
    if (trendData.length === 0) return { line: "", fill: "" };

    const width = 1000;
    const height = 160;
    const step = width / (trendData.length - 1);

    // Map data to coordinates
    const points = trendData.map((d, i) => ({
      x: i * step,
      y: height - (parseFloat(d.height) / 100) * height,
    }));

    // Function to create smooth Bezier curves
    const renderCurve = (pts: { x: number; y: number }[]) => {
      return pts.reduce((acc, point, i, a) => {
        if (i === 0) return `M ${point.x},${point.y}`;

        // Control points for the curve (roughly 20% of the step distance)
        const cp1x = a[i - 1].x + step * 0.4;
        const cp1y = a[i - 1].y;
        const cp2x = point.x - step * 0.4;
        const cp2y = point.y;

        return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
      }, "");
    };

    const linePath = renderCurve(points);
    const fillPath = `${linePath} L ${width},${height} L 0,${height} Z`;

    return { line: linePath, fill: fillPath };
  }, [trendData]);

  /* ---------------- RENDER ---------------- */

  return (
    <div className="p-8 bg-slate-50 min-h-screen space-y-8 animate-in fade-in duration-500">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 font-bold text-lg"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            Expenditure Management
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Track school spending, utility costs, and resource procurement.
          </p>
        </div>
        {/* <div className="flex gap-3">
          <button 
            onClick={handleExport} 
            className="flex items-center gap-2 px-5 py-2.5 bg-white border rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || expenses.length === 0}
          >
            <Download size={16} /> Export CSV
          </button>
          <button 
            onClick={handleAddClick} 
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg text-xs font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <Plus size={16} /> Record Expense
          </button>
        </div> */}
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Infrastructure" 
          value={stats.infrastructure} 
          icon={<Home size={20} />} 
          color="blue" 
          loading={loading}
        />
        <StatCard 
          label="Academic Resources" 
          value={stats.academic} 
          icon={<BookOpen size={20} />} 
          color="teal" 
          loading={loading}
        />
        <StatCard 
          label="Utilities" 
          value={stats.utilities} 
          icon={<Zap size={20} />} 
          color="amber" 
          loading={loading}
        />
        <StatCard 
          label="Maintenance" 
          value={stats.maintenance} 
          icon={<Settings size={20} />} 
          color="emerald" 
          loading={loading}
        />
      </section>

      {/* Trend */}
      {/* Trend Section */}
<section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
  <div className="flex justify-between items-center mb-10 relative z-1">
    <div>
      <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Expenditure Pulse</h3>
      <p className="text-[10px] text-slate-400 font-bold uppercase">Real-time cashflow wave</p>
    </div>
    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-tighter">
      Year 2026
    </span>
  </div>

<div className="relative h-48 w-full group pt-10">
  <svg 
    viewBox="0 0 1000 160" 
    preserveAspectRatio="none" 
    className="w-full h-full overflow-visible"
  >
    <defs>
      {/* Smooth Gradient Fill */}
      <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
      </linearGradient>

      {/* Glow/Shadow for the line */}
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* The Area Fill (The Wave) */}
    <path 
      d={areaPath.fill} 
      fill="url(#waveGradient)" 
      className="transition-all duration-1000 ease-in-out"
    />

    {/* The Main Curved Line */}
    <path 
      d={areaPath.line} 
      fill="none" 
      stroke="#3b82f6" 
      strokeWidth="4" 
      strokeLinecap="round" 
      filter="url(#glow)"
      className="transition-all duration-1000 ease-in-out"
    />

    {/* Highlighters loop (The code you provided) */}
    {trendData.map((d, i) => {
      const x = (i * 1000) / (trendData.length - 1);
      const y = 160 - (parseFloat(d.height) / 100) * 160;

      return (
        <g key={i} className="group/point">
          {/* Vertical Guide line */}
          <line
            x1={x} y1="0"
            x2={x} y2="160"
            className="stroke-slate-200 opacity-0 group-hover/point:opacity-100 transition-opacity"
            strokeWidth="1"
            strokeDasharray="4"
          />
          
          {/* Invisible Hover Area */}
          <circle cx={x} cy={y} r="25" fill="transparent" className="cursor-pointer" />
          
          {/* The Dot */}
          <circle
            cx={x}
            cy={y}
            r={d.active ? "6" : "4"}
            className={`${
              d.active ? 'fill-blue-600' : 'fill-white stroke-blue-500'
            } transition-all duration-300 group-hover/point:scale-125 group-hover/point:fill-blue-600`}
            strokeWidth="3"
          />

          {/* Tooltip */}
          <g className="opacity-0 group-hover/point:opacity-100 transition-all duration-200 pointer-events-none translate-y-2 group-hover/point:translate-y-0">
            <rect x={x - 45} y={y - 40} width="90" height="28" rx="8" className="fill-slate-900 shadow-xl" />
            <text x={x} y={y - 22} textAnchor="middle" className="fill-white text-[11px] font-black tracking-tight">
              {d.formattedTotal}
            </text>
            <path d={`M ${x-5} ${y-12} L ${x} ${y-7} L ${x+5} ${y-12} Z`} className="fill-slate-900" />
          </g>
        </g>
      );
    })}
  </svg>
</div>

  {/* X-Axis Labels */}
  <div className="flex justify-between mt-4 px-1">
    {trendData.map((d) => (
      <span key={d.label} className={`text-[9px] font-black uppercase tracking-tighter ${d.active ? 'text-blue-600' : 'text-slate-400'}`}>
        {d.label}
      </span>
    ))}
  </div>
</section>

      {/* Table */}
      <main className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50/30 flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by description, staff, or category..."
              className="w-full pl-12 pr-4 py-3 bg-white border rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium"
              disabled={loading}
            />
          </div>
          {/* <button 
            className="p-3 bg-white border rounded-xl hover:bg-slate-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <Filter size={18} className="text-slate-600" />
          </button> */}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Item</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Staff</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={32} />
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      Loading Transactions...
                    </span>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-slate-300 text-5xl">📊</div>
                      <p className="text-slate-400 font-medium">
                        {debouncedSearch 
                          ? "No expenditure records match your search" 
                          : "No expenditure records found"}
                      </p>
                      {debouncedSearch && (
                        <button 
                          onClick={() => setSearchTerm("")}
                          className="text-blue-600 text-sm font-semibold hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      {exp.date ? new Date(exp.date).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">
                        {exp.categoryDisplay ?? exp.category}
                      </span>
                    </td>
                    <td className="px-8 py-5">{exp.itemName}</td>
                    <td className="px-8 py-5 font-mono font-black text-slate-900">
                      ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-5">{exp.staffName ?? "—"}</td>
                    <td className="px-8 py-5">
                      <StatusBadge status={exp.description ? "Approved" : "Pending"} />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditClick(exp)} 
                          className="px-3 py-1.5 bg-white border rounded-lg text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(exp.id)} 
                          className="px-3 py-1.5 bg-white border rounded-lg text-[10px] font-black uppercase text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && expenses.length > 0 && (
          <div className="p-4 flex justify-between items-center bg-slate-50">
            <div className="text-sm text-slate-500">
              Showing {expenses.length} of {totalCount}
            </div>
            <div className="flex items-center gap-2">
              <button 
                disabled={page <= 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                className="px-3 py-1 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Prev
              </button>
              <span className="px-3 py-1 text-sm font-semibold">
                {page} / {totalPages}
              </span>
              <button 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => p + 1)} 
                className="px-3 py-1 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      <RecordExpenseModal
        key={editing?.id || 'new'}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editData={editing}
      />
    </div>
  );
}

/* ---------------- SUBCOMPONENTS ---------------- */

function StatCard({ label, value, icon, color, loading }: any) {
  const colors: any = { 
    blue: "bg-blue-50 text-blue-600", 
    teal: "bg-teal-50 text-teal-600", 
    amber: "bg-amber-50 text-amber-600", 
    emerald: "bg-emerald-50 text-emerald-600"
  };
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </span>
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
      {loading ? (
        <div className="h-8 bg-slate-100 rounded animate-pulse" />
      ) : (
        <div className="text-2xl font-black text-slate-800">
          ${(Number(value) || 0).toLocaleString()}
        </div>
      )}
    </div>
  );
}

const TrendBar = ({ height, label, active = false, tooltip }: any) => {
  return (
    <div className="flex flex-col items-center gap-2 flex-1 group">
      <div className="w-full bg-slate-50 rounded-t-lg relative flex items-end h-32">
        <div 
          className={`w-full rounded-t-lg transition-all duration-700 ease-out group-hover:brightness-90 ${
            active ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-slate-200'
          }`}
          style={{ height: height }}
        />
        
        {/* Tooltip shows actual $ value */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 pointer-events-none z-10 whitespace-nowrap shadow-xl">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      </div>
      <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-wider ${
        active ? 'text-blue-600' : 'text-slate-400'
      }`}>
        {label}
      </span>
    </div>
  );
};

function StatusBadge({ status }: { status: string }) {
  const styles: any = { 
    Approved: "bg-teal-50 text-teal-600 border-teal-100", 
    Pending: "bg-blue-50 text-blue-600 border-blue-100", 
    Rejected: "bg-red-50 text-red-600 border-red-100" 
  };
  
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
      styles[status] ?? "bg-slate-50 text-slate-600 border-slate-100"
    }`}>
      {status}
    </span>
  );
}