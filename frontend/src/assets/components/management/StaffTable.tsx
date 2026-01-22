"use client";

import Link from "next/link";
import { Mail, Phone, MoreHorizontal } from "lucide-react";

export interface StaffMember {
  id: string;
  fullName: string;
  role: string; // e.g., Teacher, Admin, Registrar
  department: string;
  email: string;
  phone: string;
  status: "Active" | "On Leave" | "Inactive";
  profileImage: string;
}

export function StaffTable({ staff }: { staff: StaffMember[] }) {
  return (
    <div className="bg-white border-x border-b rounded-b-2xl overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-y text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <tr>
            <th className="px-6 py-4">Staff Member</th>
            <th className="px-6 py-4">Role / Dept</th>
            <th className="px-6 py-4">Contact Info</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y text-sm">
          {staff.map((member) => (
            <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img src={member.profileImage} alt="" className="w-10 h-10 rounded-full bg-slate-100 object-cover" />
                  <div>
                    <p className="font-bold text-slate-700">{member.fullName}</p>
                    <p className="text-[11px] text-cyan-600 font-mono">{member.id}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="font-medium text-slate-700">{member.role}</p>
                <p className="text-xs text-slate-400">{member.department}</p>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1 text-slate-500">
                  <span className="flex items-center gap-2 text-xs"><Mail size={12}/> {member.email}</span>
                  <span className="flex items-center gap-2 text-xs"><Phone size={12}/> {member.phone}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <StaffStatusBadge status={member.status} />
              </td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StaffStatusBadge({ status }: { status: string }) {
  const styles: any = {
    Active: "bg-green-50 text-green-600",
    "On Leave": "bg-blue-50 text-blue-600",
    Inactive: "bg-slate-50 text-slate-600",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold w-fit ${styles[status]}`}>
      {status}
    </span>
  );
}