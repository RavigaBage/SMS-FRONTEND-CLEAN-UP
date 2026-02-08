"use client";
import React, { useEffect, useState } from "react";
import { apiRequest } from "@/src/lib/apiClient";
import { Users, GraduationCap, Calendar, DollarSign, Plus, FileText, ClipboardList, MessageSquare, Activity, Search,
   AlertCircle, RefreshCcw 
} from "lucide-react";
import Link from "next/link";
import { Bar, Line } from 'react-chartjs-2';
import "@/styles/home.css";
import Image from "next/image";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
   Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
   Filler,
);

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [UserName, setUsername] = useState("");
  const [UserRole, setRole] = useState("");
  
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res: any = await apiRequest("/api/dashboard-summary/");
        console.log(res);
        setStats(res.data);
        setTransactions(res.data.recent_transactions || []);
        setActivities(res.data.recent_activities || []);
      } catch (e: any) {
        console.error(e);
         setError(e.message || "An unexpected error occurred while loading the dashboard.");
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    const username = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    setUsername(username as any);
    setRole(userRole as any);
    fetchDashboardData();
  }, []);

  const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const mapChartDataToMonths = (
  labels: string[] = [],
  values: number[] = []
) => {
  const monthIndex = MONTHS.reduce((acc: any, m, i) => {
    acc[m] = i;
    return acc;
  }, {});

  const data = Array(12).fill(0);

  labels.forEach((label, i) => {
    const idx = monthIndex[label];
    if (idx !== undefined) {
      data[idx] = values[i];
    }
  });

  return data;
};


const feeChartData = {
  labels: MONTHS,
  datasets: [
    {
      label: "Fees Collected",
      data: mapChartDataToMonths(
        stats?.chart_data?.labels,
        stats?.chart_data?.values
      ),
      backgroundColor: "#3b82f6",
      borderRadius: 8,
    },
  ],
};


const attendanceChartData = {
  labels: MONTHS,
  datasets: [
    {
      label: "Attendance %",
      data: mapChartDataToMonths(
        stats?.attendance_chart?.labels,
        stats?.attendance_chart?.values
      ),
      borderColor: "#10b981",
      backgroundColor: "rgba(16,185,129,0.25)",
      tension: 0.4,
      fill: true,
    },
  ],
};


const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

  const SkeletonBox = ({ className }: { className?: string }) => (
    <div className={`bg-slate-100 animate-pulse rounded ${className}`}></div>
  );

if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-200 max-w-md w-full">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Connection Failed</h2>
          <p className="text-slate-500 mb-8 text-sm leading-relaxed">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="flex items-center justify-center gap-3 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95"
          >
            <RefreshCcw size={18} />
            Try Reconnecting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-view bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="top-bar bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        {loading ? (
          <div className="flex items-center gap-4 w-full">
            <SkeletonBox className="h-8 w-32" />
            <SkeletonBox className="h-8 w-24" />
            <div className="flex-1 flex justify-end gap-4">
              <SkeletonBox className="h-10 w-32" />
              <SkeletonBox className="h-10 w-10 rounded-full" />
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg">Main Dashboard</button>

            <span className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg text-xs font-extrabold tracking-wide shadow-sm">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
            </span>

            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-slate-900 text-sm">{UserName}</p>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{UserRole}</p>
              </div>
              <Image
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(UserName)}&background=random`}
                alt="User avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
          </div>
        )}
      </header>

      <div className="dashboard-grid p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column */}
        <section className="left-column lg:col-span-1 space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {loading ? (
              [1,2,3,4].map(i => <SkeletonBox key={i} className="h-28 w-full" />)
            ) : (
              <>
                <KPICard label="Total Students" value={stats.student_count} icon={<Users />} />
                <KPICard label="Total Staff" value={stats.staff_count} icon={<GraduationCap />} />
                <KPICard label="Attendance" value={`${stats.active_attendance}%`} icon={<Calendar />} />
                <KPICard label="Fees Collected" value={`$${stats.fees_collected.toLocaleString()}`} icon={<DollarSign />} />
              </>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {loading ? (
              [1,2].map(i => <SkeletonBox key={i} className="h-80 w-full" />)
            ) : (
              <>
                <ChartCard title="Fee Collection" subtitle="January to December">
                  <Bar data={feeChartData} options={chartOptions} />
                </ChartCard>

                <ChartCard title="Attendance Trends" subtitle="January to December">
                  <Line data={attendanceChartData} options={chartOptions} />
                </ChartCard>
              </>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Recent Fee Transactions</h3>
              {!loading && <button className="text-blue-600 text-xs font-bold hover:underline">View All</button>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    {['Student', 'Trans Ref', 'Amount', 'Method', 'Date'].map(h => <th key={h} className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    [1,2,3].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-6 py-4"><SkeletonBox className="h-4 w-full" /></td>
                      </tr>
                    ))
                  ) : transactions.length > 0 ? (
                    transactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold">{t.student_name}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm font-mono uppercase">{t.transaction_reference}</td>
                        <td className="px-6 py-4 font-bold">${Number(t.amount_paid).toLocaleString()}</td>
                        <td className="px-6 py-4">{t.payment_method}</td>
                        <td className="px-6 py-4 text-right text-slate-400">{new Date(t.payment_date).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">No transactions</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Right Panel */}
        <aside className="lg:col-span-1 space-y-8">
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-3">
              {loading ? [1,2,3,4].map(i => <SkeletonBox key={i} className="h-20 w-full" />) : (
                <>
                  <Link href="/Home/profiles/students/"><QuickBtn icon={<Plus />} label="Add Student" color="bg-blue-600" /></Link>
                  <Link href="/Home/finance/invoices/"><QuickBtn icon={<FileText />} label="Invoice" color="bg-slate-900" /></Link>
                  <Link href="/Home/academics/grades/"><QuickBtn icon={<ClipboardList />} label="Exam Result" color="bg-emerald-600" /></Link>
                  <Link href="/Home/profiles/staff"><QuickBtn icon={<MessageSquare />} label="Teachers & Staffs" color="bg-indigo-600" /></Link>
                </>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Recent Activity</h4>
            <div className="space-y-6">
              {loading ? (
                [1,2,3].map(i => <SkeletonBox key={i} className="h-10 w-full" />)
              ) : activities.length > 0 ? (
                activities.map(act => (
                  <div key={act.id} className="flex gap-4 items-center">
                    <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                    <p className="text-sm text-slate-700">{act.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No recent activity.</p>
              )}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-blue-900/20 group cursor-default">
            {loading ? <SkeletonBox className="h-16 w-full" /> : (
              <>
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest">System Online</span>
                </div>
                <p className="text-xs text-slate-400 group-hover:text-slate-200">Latency: 14ms. All modules running normally.</p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
const KPICard = ({ label, value, icon }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1">{label}</p>
    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{value ?? "0"}</h2>
  </div>
);

const QuickBtn = ({ icon, label, color }: any) => (
  <button className={`${color} w-full text-white p-4 rounded-2xl flex flex-col items-center gap-2`}>
    {React.cloneElement(icon, { size: 18 })}
    <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

const ChartCard = ({ title, subtitle, children }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-80">
    <div className="mb-4">
      <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
    <div className="h-56">{children}</div>
  </div>
);
