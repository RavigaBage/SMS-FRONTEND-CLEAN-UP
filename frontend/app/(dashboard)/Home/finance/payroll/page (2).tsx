"use client";

import React, { useState, useEffect } from "react";
import { 
  Download, Play, FileText, Edit3, 
  Search, TrendingUp, CreditCard, 
  User, CheckCircle2, Clock, AlertCircle 
} from "lucide-react";

// --- TYPES ---
interface PayrollRecord {
  id: number;
  staff_name: string;
  role: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_pay: number;
  status: 'paid' | 'processing' | 'pending';
  initials: string;
}

export default function PayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>(dummyPayroll);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecords = records.filter(r => 
    r.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payroll Management</h1>
          <p className="text-slate-500 text-sm">Manage staff compensations and financial disbursement.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20">
            <option>January 2026</option>
            <option>December 2025</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
            <Download size={16} /> Export CSV
          </button>
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all">
            <Play size={16} fill="currentColor" /> Run Payroll
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Gross Payroll" value="$142,500.00" trend="+2.4%" />
        <StatCard label="Total Allowances" value="$12,840.00" />
        <StatCard label="Total Deductions" value="$8,420.00" isNegative />
        <StatCard label="Net Disbursed" value="$146,920.00" isTeal />
      </section>

      {/* Table Section */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-bold text-slate-700">Staff Salary Records</h3>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search staff..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4 text-right">Basic Salary</th>
                <th className="px-6 py-4 text-right">Allowances</th>
                <th className="px-6 py-4 text-right">Deductions</th>
                <th className="px-6 py-4 text-right">Net Pay</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 group transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${record.status === 'processing' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                        {record.initials}
                      </div>
                      <div>
                        <div className="font-bold text-slate-700">{record.staff_name}</div>
                        <div className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">{record.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-600">${record.basic_salary.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-600">${record.allowances.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-rose-500">-${record.deductions.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">${record.net_pay.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {record.status === 'paid' ? (
                        <button className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors" title="Payslip">
                          <FileText size={18} />
                        </button>
                      ) : (
                        <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Process">
                          <CreditCard size={18} />
                        </button>
                      )}
                      <button className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors">
                        <Edit3 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ label, value, trend, isNegative, isTeal }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className={`text-xl font-black ${isNegative ? 'text-rose-600' : isTeal ? 'text-emerald-600' : 'text-slate-900'}`}>
        {value}
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-emerald-600 font-bold text-[11px]">
          <TrendingUp size={12} /> {trend} <span className="text-slate-400 font-normal">from last month</span>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: PayrollRecord['status'] }) {
  const configs = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
    processing: "bg-blue-50 text-blue-700 border-blue-100",
    pending: "bg-amber-50 text-amber-700 border-amber-100"
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${configs[status]}`}>
      ● {status}
    </span>
  );
}

// --- DUMMY DATA ---
const dummyPayroll: PayrollRecord[] = [
  { id: 1, staff_name: "Marcus Aurelius", role: "School Principal", basic_salary: 8500, allowances: 1200, deductions: 450, net_pay: 9250, status: 'paid', initials: 'MA' },
  { id: 2, staff_name: "Sarah Jenkins", role: "HOD Science", basic_salary: 5200, allowances: 800, deductions: 320, net_pay: 5680, status: 'processing', initials: 'SJ' },
  { id: 3, staff_name: "Robert Taylor", role: "Senior IT Admin", basic_salary: 4800, allowances: 500, deductions: 280, net_pay: 5020, status: 'paid', initials: 'RT' },
  { id: 4, staff_name: "Emily Lawson", role: "Art Instructor", basic_salary: 3900, allowances: 400, deductions: 150, net_pay: 4150, status: 'pending', initials: 'EL' },
];