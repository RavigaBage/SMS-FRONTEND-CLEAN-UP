"use client";

import Link from "next/link";
import { Mail, Phone, Trash2, ExternalLink, X, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/src/lib/apiClient";

export interface StaffMember {
  id: string;
  fullName: string;
  role: string; 
  department: string;
  email: string;
  phone: string;
  status: "Active" | "On Leave" | "Inactive";
  profileImage: string;
}

export function StaffTable({ staff }: { staff: StaffMember[] }) {

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = async (id: string) => {
    setIsProcessing(true);
    try {
      await apiRequest(`/staff/${id}/`, { method: "DELETE" });
      window.location.reload();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete staff member. Please try again.");
    } finally {
      setIsProcessing(false);
      setDeletingId(null);
    }
  };

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
            <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
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
                <div className="flex justify-end items-center gap-2">
                  {deletingId === member.id ? (
                    // VERIFICATION STATE
                    <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200">
                      <span className="text-[10px] font-black text-rose-500 uppercase mr-2">Confirm?</span>
                      <button 
                        onClick={() => handleDelete(member.id)}
                        disabled={isProcessing}
                        className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                      >
                        {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      </button>
                      <button 
                        onClick={() => setDeletingId(null)}
                        className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    // DEFAULT STATE
                    <>
                      <Link 
                        href={`/Home/profiles/teachers&staff/profile/${member.id}`}
                        className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
                      >
                        <ExternalLink size={18} />
                      </Link>
                      <button 
                        onClick={() => setDeletingId(member.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
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
    Active: "bg-green-50 text-green-600 border border-green-100",
    "On Leave": "bg-blue-50 text-blue-600 border border-blue-100",
    Inactive: "bg-slate-50 text-slate-600 border border-slate-100",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold w-fit ${styles[status]}`}>
      {status}
    </span>
  );
}