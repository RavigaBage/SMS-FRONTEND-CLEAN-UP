"use client";

import { useState, useEffect } from "react";
import { X, Loader2, School, UserCheck, Calendar } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddClassModal({ isOpen, onClose, onSuccess }: AddClassModalProps) {
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    academic_year: "2024/2025",
    level: "primary",
    teacher: "",
    status: "active",
  });
  useEffect(() => {
    if (isOpen) {
      const fetchTeachers = async () => {
        try {
          const data = await apiRequest("/staff/?role=teacher", { method: "GET" });
          setTeachers(data.results || []);
        } catch (err) {
          console.error("Error loading teachers:", err);
        }
      };
      fetchTeachers();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest("/classes/", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      onSuccess();
      onClose();
      setFormData({ name: "", academic_year: "2024/2025", level: "primary", teacher: "", status: "active" });
    } catch (err) {
      alert("Failed to create class. Please check your data.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Create New Class</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Academic Management</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Class Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Class Name</label>
            <div className="relative">
              <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                required
                type="text"
                placeholder="e.g. Grade 6A or JHS 1"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-bold text-slate-700"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Academic Year */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Academic Year</label>
              <select 
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-cyan-500/10"
                value={formData.academic_year}
                onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
              >
                <option value="2024/2025">2024 / 2025</option>
                <option value="2023/2024">2023 / 2024</option>
              </select>
            </div>

            {/* Level */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Class Level</label>
              <select 
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-cyan-500/10"
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
              >
                <option value="primary">Primary</option>
                <option value="jhs">Junior High</option>
                <option value="shs">Senior High</option>
              </select>
            </div>
          </div>

          {/* Teacher Assignment */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Assign Class Teacher</label>
            <div className="relative">
              <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-cyan-500/10 appearance-none"
                value={formData.teacher}
                onChange={(e) => setFormData({...formData, teacher: e.target.value})}
              >
                <option value="">Select a Teacher (Optional)</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Confirm & Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}