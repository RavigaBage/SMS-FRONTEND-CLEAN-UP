"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Filter, MoreVertical, Users, GraduationCap, ChevronRight, Loader2 } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
import Link from "next/link";
import { AddClassModal } from "@/src/assets/components/management/AddClassModal";

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ year: "2024/2025", level: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      // Adjust the endpoint to match your Django URL
      const data = await apiRequest("/classes/", { method: "GET" });
      setClasses(data.results || data);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Classes Management</h1>
          <p className="text-slate-500 text-sm font-medium">Manage academic classes, teachers, and student rosters</p>
        </div>
        <button onClick={() => {setIsModalOpen(true)}} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all text-sm">
          <Plus size={18} /> Create New Class
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <select 
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500/20"
          value={filters.year}
          onChange={(e) => setFilters({...filters, year: e.target.value})}
        >
          <option value="2024/2025">Academic Year: 2024 / 2025</option>
          <option value="2023/2024">Academic Year: 2023 / 2024</option>
        </select>

        <select 
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500/20"
          value={filters.level}
          onChange={(e) => setFilters({...filters, level: e.target.value})}
        >
          <option value="">All Class Levels</option>
          <option value="primary">Primary</option>
          <option value="jhs">Junior High</option>
          <option value="shs">Senior High</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-cyan-500" size={40} />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Fetching Classes...</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Class Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Year</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assigned Teacher</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Students</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 font-black text-slate-800">{cls.name}</td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-500">{cls.academic_year || "2024/2025"}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 font-bold text-[10px]">
                          {cls.teacher_name ? cls.teacher_name.charAt(0) : "—"}
                       </div>
                       <span className="text-sm font-bold text-slate-700">{cls.teacher_name || "Unassigned"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black">
                      <Users size={12} /> {cls.student_count || 0}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      cls.is_active 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                        : "bg-red-50 text-red-600 border border-red-100"
                    }`}>
                      {cls.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ActionButton label="View" color="text-slate-600" href={`/management/classes/${cls.id}`} />
                      <ActionButton label="Edit" color="text-blue-600" />
                      <ActionButton label="Assign" color="text-emerald-600" />
                      <ActionButton label="Students" color="text-purple-600" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <AddClassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchClasses} />
      </div>
    </div>
  );
}

function ActionButton({ label, color, href }: { label: string, color: string, href?: string }) {
  const content = (
    <button className={`px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-slate-50 transition-all shadow-sm ${color}`}>
      {label}
    </button>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}