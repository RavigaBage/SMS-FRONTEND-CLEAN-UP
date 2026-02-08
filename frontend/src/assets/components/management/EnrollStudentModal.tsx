"use client";

import { useState, useEffect } from "react";
import { X, User, School, Calendar, Mail, Phone, GraduationCap, Loader2, Check } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";

interface EnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EnrollStudentModal({ isOpen, onClose, onSuccess }: EnrollModalProps) {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    // Student Profile Details
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "male",
    
    // Enrollment Details
    class_id: "",
    enrollment_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (isOpen) {
      const fetchClasses = async () => {
        try {
          const data = await apiRequest("/classes/", { method: "GET" });
          setClasses(data.results || data);
        } catch (err) { console.error("Error loading classes:", err); }
      };
      fetchClasses();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create the Student first
      const student = await apiRequest("/students/", {
        method: "POST",
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender
        }),
      });

      // 2. Use the returned student ID to create the enrollment
      if (student && student.id) {
        await apiRequest("/enrollments/", {
          method: "POST",
          body: JSON.stringify({
            student_id: student.id,
            class_id: formData.class_id,
            enrollment_date: formData.enrollment_date,
            status: "Active"
          }),
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      alert("Error: Ensure email is unique and all fields are valid.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">New Student Enrollment</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Profile Creation & Class Placement</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          
          {/* Section 1: Personal Details */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <User size={14} /> Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="First Name" placeholder="John" value={formData.first_name} onChange={(v : any) => setFormData({...formData, first_name: v})} />
              <FormInput label="Last Name" placeholder="Doe" value={formData.last_name} onChange={(v : any) => setFormData({...formData, last_name: v})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Email Address" type="email" placeholder="john.doe@example.com" value={formData.email} onChange={(v : any) => setFormData({...formData, email: v})} />
              <FormInput label="Date of Birth" type="date" value={formData.date_of_birth} onChange={(v : any) => setFormData({...formData, date_of_birth: v})} />
            </div>
          </div>

          {/* Section 2: Academic Placement */}
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <GraduationCap size={14} /> Academic Placement
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assign Class</label>
                <select 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10"
                  value={formData.class_id}
                  onChange={(e) => setFormData({...formData, class_id: e.target.value})}
                >
                  <option value="">Select a Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <FormInput label="Enrollment Date" type="date" value={formData.enrollment_date} onChange={(v : any) => setFormData({...formData, enrollment_date: v})} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-2 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <><Check size={18} /> Complete Enrollment</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Internal Helper
function FormInput({ label, type = "text", placeholder, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <input
        required
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}