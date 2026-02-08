"use client";

import { useState, useEffect } from "react";
import { X, User, Hash, Calendar, Loader2, MapPin, Activity } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";

interface Student {
  id: number;
  admission_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  current_class: {
    id: number;
    name: string;
    grade_level: number;
    section: string;
    academic_year: string;
  } | null;
}


export function AddStudentModal({ isOpen, onClose, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const initialData = {
    first_name: "",
    last_name: "",
    middle_name: "",
    admission_number: "",
    date_of_birth: "",
    admission_date: new Date().toISOString().split('T')[0], // Default to today
    gender: "male",
    status: "active",
    class_id: "", 
    address: "",
  };

  const [formData, setFormData] = useState(initialData);

  // Fetch classes so user can pick from a list instead of typing an ID
  useEffect(() => {
    if (isOpen) {
      const fetchClasses = async () => {
        try {
          const res = await apiRequest<any>("/classes/");
          setClasses(res.data || []);
        } catch (err) {
          console.error("Failed to load classes");
        }
      };
      fetchClasses();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        class_obj: formData.class_id || null, 
        parents: [] // Keep as empty list per your requirement
      };

     const result = await apiRequest<Student>("/students/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

     console.log("Student created:", result);
      const student = result?.data ?? result;

     setFormData(initialData);
      onSuccess(); // optional
      onClose();
      console.log('creation was a success');

    } catch (err: any) {
      // Simple error handling: extract message from DRF response
      const errorMsg = err.response?.data 
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(", ")
        : "Failed to register student. Please check the fields.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Student Registration</h2>
            {error && <p className="text-[10px] text-red-500 font-bold mt-1">{error}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admission # *</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  required
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500/20 text-sm"
                  value={formData.admission_number}
                  onChange={(e) => setFormData({...formData, admission_number: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class Assignment</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none text-sm"
                value={formData.class_id}
                onChange={(e) => setFormData({...formData, class_id: e.target.value})}
              >
                <option value="">Not Assigned</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
              <input
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
              <input
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DOB *</label>
              <input 
                required
                type="date"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender *</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Home Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-slate-400" size={14} />
              <textarea 
                className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm min-h-[60px]"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-50 text-slate-400 font-black rounded-xl hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-[2] py-3 bg-cyan-600 text-white font-black rounded-xl hover:bg-cyan-700 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={14} /> : "Finalize Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}