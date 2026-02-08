"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, User, Mail, Briefcase, FileText, Phone, MapPin, HeartPulse } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";

export function EditStaffModal({ 
  isOpen, 
  onClose, 
  staffData, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  staffData: any; 
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    gender: "",
    staff_type: "",
    specialization: "",
    health_info: "",
  });

  // 2. Load existing data (Hook must be at the top)
  useEffect(() => {
    if (staffData && isOpen) {
      setFormData({
        first_name: staffData.first_name || "",
        last_name: staffData.last_name || "",
        email: staffData.email || "",
        phone_number: staffData.phone_number || "",
        address: staffData.address || "",
        gender: staffData.gender || "male",
        staff_type: staffData.staff_type || "teacher",
        specialization: staffData.specialization || "",
        health_info: staffData.health_info || "",
      });
    }
  }, [staffData, isOpen]);

  if (!isOpen) return null;

 // Add this state at the top

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null); // Clear previous errors

    try {
      await apiRequest(`/staff/${staffData.id}/`, {
        method: "PATCH",
        body: JSON.stringify(formData),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      // Logic to strip "django.core.exceptions.ValidationError"
      const rawError = err.message || "An error occurred";
      
      // If Django sends an object like { email: ["..."] }
      if (typeof err === 'object' && err !== null) {
          const firstKey = Object.keys(err)[0];
          const message = Array.isArray(err[firstKey]) ? err[firstKey][0] : err[firstKey];
          // Remove potential bracket/quote residue from Django's string representation
          setErrorMsg(message.replace(/[\[\]']+/g, ''));
      } else {
          setErrorMsg(rawError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
              <User size={20} />
            </div>
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
                <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">!</div>
                <p className="text-xs font-bold text-rose-600 leading-tight">
                  {errorMsg}
                </p>
              </div>
            )}
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Edit Staff Profile</h2>
              <p className="text-xs text-slate-500 font-medium">System ID: {staffData?.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Section: Names */}
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="First Name" value={formData.first_name} onChange={(val: string) => setFormData({...formData, first_name: val})} />
            <FormInput label="Last Name" value={formData.last_name} onChange={(val: string) => setFormData({...formData, last_name: val})} />
          </div>

          {/* Section: Contact */}
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Email Address" icon={<Mail size={12}/>} value={formData.email} onChange={(val: string) => setFormData({...formData, email: val})} />
            <FormInput label="Phone (e.g. +233...)" icon={<Phone size={12}/>} value={formData.phone_number} onChange={(val: string) => setFormData({...formData, phone_number: val})} />
          </div>

          <hr className="border-slate-100" />

          {/* Section: Professional (Using Django StaffType Choices) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Briefcase size={10}/> Staff Role
              </label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-cyan-100"
                value={formData.staff_type}
                onChange={(e) => setFormData({...formData, staff_type: e.target.value})}
              >
                <option value="teacher">Teacher</option>
                <option value="headmaster">Headmaster</option>
                <option value="bursar">Bursar</option>
                <option value="admin_staff">Admin Staff</option>
                <option value="support_staff">Support Staff</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Gender
              </label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-cyan-100"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <FormInput label="Specialization (Subject/Area)" value={formData.specialization} onChange={(val: string) => setFormData({...formData, specialization: val})} />

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={10}/> Residential Address
            </label>
            <textarea 
              rows={2}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-cyan-100 resize-none"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>

          {/* Section: Health Info */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 text-rose-500">
              <HeartPulse size={10}/> Medical / Health Info
            </label>
            <textarea 
              rows={2}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-rose-100 resize-none"
              placeholder="Blood group, allergies, etc."
              value={formData.health_info}
              onChange={(e) => setFormData({...formData, health_info: e.target.value})}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-black text-slate-500 hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-4 bg-slate-900 text-white text-sm font-black rounded-2xl hover:bg-slate-800 shadow-xl flex items-center justify-center gap-2 transition-all uppercase tracking-widest">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {loading ? "Saving..." : "Update Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, icon }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        {icon} {label}
      </label>
      <input 
        type="text"
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-cyan-100 transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}