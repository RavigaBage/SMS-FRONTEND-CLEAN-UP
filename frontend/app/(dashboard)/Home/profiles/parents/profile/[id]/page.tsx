"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiRequest } from '@/src/lib/apiClient';
import { 
  Phone, Mail, MapPin, User, ShieldCheck, 
  ChevronRight, MessageSquare, Edit3, GraduationCap 
} from 'lucide-react';

/* ---------- Types ---------- */
interface Ward {
  id: number;
  full_name: string;
  admission_number: string;
  class_info: {
    name: string;
    grade_level: string;
    academic_year: string;
  } | null;
  status: string;
}

interface ParentProfileData {
  id: number;
  full_name: string;
  phone_number: string;
  email: string;
  address: string;
  relationship_display: string;
  occupation: string;
  workplace: string;
}

export default function ParentProfile() {
  const { id } = useParams(); // Gets the /12 from URL
  const [parent, setParent] = useState<ParentProfileData | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullProfile = async () => {
      setLoading(true);
      try {
        // 1. Fetch Parent Basic Info
        const parentRes = await apiRequest<ParentProfileData>(`/parents/${id}/`);
        setParent(parentRes.data as any);

        // 2. Fetch Children using the detail action we verified earlier
        const childrenRes = await apiRequest<Ward[]>(`/parents/${id}/children/`);
        setWards(childrenRes.data as any || []);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchFullProfile();
  }, [id]);

  if (loading) return <div className="p-10 text-center animate-pulse">Loading Profile...</div>;
  if (!parent) return <div className="p-10 text-center text-red-500">Parent not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <span>Directory</span>
          <ChevronRight className="w-4 h-4" />
          <span className="font-bold text-slate-900">Parent Profile</span>
        </nav>

        {/* PROFILE HEADER CARD */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <User className="w-32 h-32" />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative">
            <div className="flex gap-6 items-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-200">
                {parent.full_name.charAt(0)}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">{parent.full_name}</h1>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100">
                    {parent.relationship_display}
                  </span>
                </div>
                <p className="text-slate-500 font-medium">#{parent.occupation} at <span className="text-slate-900">{parent.workplace || 'N/A'}</span></p>
                
                <div className="flex flex-wrap gap-4 pt-2">
                  <ContactItem icon={<Phone />} text={parent.phone_number} />
                  <ContactItem icon={<Mail />} text={parent.email} />
                  <ContactItem icon={<MapPin />} text={parent.address} />
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all">
                <MessageSquare className="w-4 h-4" /> Message
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            </div>
          </div>
        </section>

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Wards" value={wards.length} sub="Children linked" />
          <StatBox label="Status" value="Active" sub="Payment Account" />
        </div>

        {/* WARDS SECTION */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Wards / Children</h2>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wards.map((ward) => (
              <WardCard key={ward.id} ward={ward} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
const ContactItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
    {React.cloneElement(icon as React.ReactElement, { className: "w-3.5 h-3.5 text-slate-400" })}
    <span className="font-medium">{text}</span>
  </div>
);

const StatBox = ({ label, value, sub }: { label: string, value: string | number, sub: string }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black text-blue-600">{value}</p>
    <p className="text-xs text-slate-500 font-medium">{sub}</p>
  </div>
);

const WardCard = ({ ward }: { ward: Ward }) => (
  <div className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all">
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-lg leading-none mb-1">{ward.full_name}</h3>
          <p className="text-xs font-bold text-slate-400">ADM: {ward.admission_number}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-lg">
          {ward.class_info?.name || 'Unassigned'}
        </span>
      </div>
    </div>

    <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between mb-6 border border-slate-100">
      <div className="flex items-center gap-3">
        <GraduationCap className="w-5 h-5 text-slate-400" />
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Academic Year</p>
          <p className="text-sm font-bold text-slate-700">{ward.class_info?.academic_year || 'N/A'}</p>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${ward.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
        {ward.status}
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2">
      <button className="py-2.5 rounded-xl border border-slate-200 text-[11px] font-black uppercase text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">Profile</button>
      <button className="py-2.5 rounded-xl border border-slate-200 text-[11px] font-black uppercase text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">Results</button>
      <button className="py-2.5 rounded-xl border border-slate-200 text-[11px] font-black uppercase text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">Fees</button>
    </div>
  </div>
);