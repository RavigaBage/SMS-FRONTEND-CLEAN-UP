"use client";

import { useState } from "react";
import { X, Save, Loader2, Briefcase } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
import { useRouter } from "next/navigation";

export function AddStaffModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, any>>({});
  const InitialData = {
    first_name: "",
    last_name: "",
    user_id: GenerateStudentAdmissionNumber(),
    email: "",
    staff_type: "teacher",
    status: "Active",
    gender: "male",
  }
  
  const [formData, setFormData] = useState(InitialData);


  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await apiRequest("/staff/", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      onClose();
      router.refresh();
      setFormData(InitialData);
    } catch (err: any) {
      console.log(err);
try {
  if (err.response && err.response.data) {
    const backendErrors = err.response.data;
    console.log(backendErrors);
    // Handle different error formats from backend
    if (backendErrors.detail) {
      setErrors({ general: backendErrors.detail });
    } else if (backendErrors.error && backendErrors.detail) {
      // Structured error with error type and detail
      setErrors({ general: `${backendErrors.error}: ${backendErrors.detail}` });
    } else if (typeof backendErrors === 'object') {
      // Field-specific errors
      setErrors(backendErrors);
    } else {
      // Fallback for unexpected error format
      setErrors({ general: String(backendErrors) });
    }
  } else if (err.message) {
    try {
      const parsedErrors = JSON.parse(err.message);
      setErrors(parsedErrors);
    } catch {
      setErrors({ general: err.message });
    }
  } else {
    // Complete fallback
    setErrors({ general: "Failed to save staff member. Please try again." });
  }
} catch (parseError) {
  console.error("Error parsing backend error:", parseError);
  setErrors({ general: "Failed to save staff member. Please try again." });
}
    } finally {
      setLoading(false);
    }
  };
  function GenerateStudentAdmissionNumber(classCode='TNS', lastNumber = 0){
    const year = new Date().getFullYear();         
      const seq = String(lastNumber + 1).padStart(3, '0'); 
      return `${year}${classCode}${seq}`;
      
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Briefcase size={20} />
            </div>
            <h2 className="text-xl font-bold">Add Staff Member</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">First Name</label>
              <input 
                type="text" 
                required
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-100 transition-all text-sm" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Last Name</label>
              <input 
                type="text" 
                required
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-100 transition-all text-sm" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Staff ID (Manual)</label>
            <input 
              type="text" 
              required
              placeholder="e.g. STF-2024-001"
              value={formData.user_id}
              onChange={(e) => setFormData({...formData, user_id: e.target.value})}
              className={`w-full p-2.5 border rounded-lg outline-none transition-all text-sm ${errors.user_id ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-slate-100'}`} 
            />
            {errors.user_id && <p className="text-[10px] text-red-500 font-bold">{errors.user_id[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-100 transition-all text-sm" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">System Role</label>
              <select 
                value={formData.gender?.toLowerCase() || ""}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none bg-white text-sm"
              >
                <option value="" >Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">System Role</label>
              <select 
                  value={formData.staff_type}
                  onChange={(e) => setFormData({...formData, staff_type: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg outline-none bg-white text-sm"
                >
                  <option value="teacher">Teacher</option>
                  <option value="headmaster">Headmaster</option>
                  <option value="bursar">Bursar</option>
                  <option value="admin_staff">Admin Staff</option>
                  <option value="support_staff">Support Staff</option>
                </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none bg-white text-sm"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {errors.general && <p className="text-center text-red-500 text-xs font-bold">{errors.general}</p>}

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
              {loading ? "Saving..." : "Save Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}