"use client";

import { Mail, Phone, MapPin, Calendar, Briefcase, Star, Clock, GraduationCap, Download, Edit3, ArrowLeft, HeartPulse, Fingerprint } from "lucide-react";
import { useState, useEffect, use } from "react";
import { apiRequest } from "@/src/lib/apiClient";
import { EditStaffModal } from "@/src/assets/components/management/EditStaffModal";
import Link from "next/link";

export default function StaffProfilePage({ params }: { params: Promise<{ staffId: string }> }) {
  const { staffId } = use(params);
  const [currentStaff, setCurrentStaff] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStaffDetails = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`/staff/${staffId}/`, { method: "GET" });
      setCurrentStaff(data.data);
    } catch (err) {
      console.error("Failed to load staff details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaffDetails(); }, [staffId]);

  if (loading) return (
    <div className="p-20 flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Records...</p>
      </div>
    </div>
  );

  if (!currentStaff) return (
    <div className="p-20 text-center bg-slate-50 min-h-screen">
      <p className="text-slate-500 font-bold">Staff member not found.</p>
      <Link href="/management/staff" className="text-cyan-600 hover:underline mt-4 block text-sm">Return to Directory</Link>
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen space-y-8">
      {/* Navigation */}
      <Link href="/management/staff" className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-bold text-xs uppercase tracking-widest">
        <ArrowLeft size={14} /> Back to Directory
      </Link>

      {/* 1. Profile Header */}
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-200 mb-8">
        <div className="h-32 bg-gradient-to-r from-cyan-600 to-blue-700" />
        <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-12">
          <div className="relative">
            <img 
              src={currentStaff.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentStaff.first_name}`} 
              className="w-32 h-32 rounded-[2rem] border-8 border-white bg-slate-100 shadow-sm object-cover" 
              alt="Staff Profile"
            />
            {currentStaff.user?.is_active && (
                <span className="absolute bottom-3 right-3 w-5 h-5 bg-green-500 border-4 border-white rounded-full shadow-sm" />
            )}
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {currentStaff.full_name}
            </h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              USERNAME: {currentStaff.full_name} • {currentStaff.staff_type_display} • {currentStaff.specialization || "General"}
            </p>
          </div>
          <div className="flex gap-3 pb-2">
            <a href={`mailto:${currentStaff.email}`} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition-all text-xs uppercase">
              <Mail size={16} /> Email
            </a>
            <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 text-xs uppercase">
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* LEFT COLUMN: PERSONAL & PROFESSIONAL */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="flex items-center gap-2 text-slate-800 font-black uppercase tracking-[0.2em] text-[10px] mb-8">
              <GraduationCap size={16} className="text-cyan-500" /> Professional Details
            </h3>
            <div className="space-y-6">
              <DetailItem icon={<Calendar />} label="Date of Birth" value={currentStaff.date_of_birth || "Not Provided"} />
              <DetailItem icon={<Phone />} label="Phone Number" value={currentStaff.phone_number || "Not Provided"} />
              <DetailItem icon={<Mail />} label="Work Email" value={currentStaff.email} />
              <DetailItem icon={<MapPin />} label="Address" value={currentStaff.address || "No address on file"} />
              <DetailItem icon={<Briefcase />} label="Joined School" value={currentStaff.employment_date || "Not Provided"} />
              <DetailItem icon={<Fingerprint />} label="National ID" value={currentStaff.national_id || "Pending Verification"} />
            </div>
            
            <hr className="my-8 border-slate-100" />
            
            <h3 className="flex items-center gap-2 text-slate-800 font-black uppercase tracking-[0.2em] text-[10px] mb-6">
              <HeartPulse size={16} className="text-rose-500" /> Medical / Health
            </h3>
            <p className="text-sm text-slate-600 font-medium bg-rose-50/50 p-4 rounded-2xl border border-rose-100 italic">
               {currentStaff.health_info || "No critical health information recorded."}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: STATS & CONTENT */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Account Status" value={currentStaff.user?.is_active ? "Active" : "Inactive"} trend="System Verified" icon={<Star size={18} className="text-amber-400" />} />
            <StatCard label="Joined" value={new Date(currentStaff.created_at).getFullYear().toString()} trend="Registry Year" icon={<Clock size={18} className="text-cyan-500" />} />
            <StatCard label="Gender" value={currentStaff.gender_display} trend="Biometric Data" icon={<GraduationCap size={18} className="text-purple-500" />} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Column 1: Managed Classes (Form Teacher) */}
  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6">
    <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
      Managed Classes (Form Teacher)
    </h3>
    
    <div className="space-y-3">
      {currentStaff?.managed_classes?.length > 0 ? (
        currentStaff.managed_classes.map((cls: any) => (
          <div key={cls.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-sm font-bold text-slate-700">{cls.class_name}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold">{cls.academic_year_name}</p>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500">
                Room {cls.room_number || "N/A"}
              </span>
            </div>
          </div>
        ))
      ) : (
        <p className="text-xs text-slate-400 italic py-4">No managed classes assigned.</p>
      )}
    </div>
  </div>

  {/* Column 2: Subject Assignments */}
  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6">
    <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
      Teaching Schedule
    </h3>
    
    <div className="space-y-3">
      {currentStaff?.assigned_subjects?.length > 0 ? (
        currentStaff.assigned_subjects.map((sub: any) => (
          <div key={sub.id} className="group flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
              {sub.subject_code.substring(0, 2)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-700">{sub.subject_name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{sub.class_name}</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="text-[10px] font-black text-indigo-600 hover:underline">VIEW LOGS</button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-xs text-slate-400 italic py-4">No subjects assigned for this session.</p>
      )}
    </div>
  </div>
</div>
        </div>
      </div>

      <EditStaffModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        staffData={currentStaff}
        onSuccess={() => fetchStaffDetails()} 
      />
    </div>
  );
}

// Internal Helpers
function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex gap-4 items-center">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-slate-700 leading-tight">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, icon }: { label: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">{icon}</div>
      </div>
      <p className="text-2xl font-black text-slate-800 mb-1">{value}</p>
      <p className="text-[10px] font-bold text-green-500 uppercase tracking-wide">{trend}</p>
    </div>
  );
}