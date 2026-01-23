// frontend/src/assets/components/management/AddStudentModal.tsx
"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
import { useRouter } from "next/navigation";

export function AddStudentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, any>>({});

  // Match these exactly to your Django Student model/serializer fields
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    status: "active",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Sending as a single dictionary/object {} to match Django's default expectation
      await apiRequest("/students/", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      onClose();
      router.refresh(); // Refresh the table data
      setFormData({ first_name: "", last_name: "", date_of_birth: "", status: "active" });
    } catch (err: any) {
      // err.message contains the JSON string of errors from Django
      try {
        const backendErrors = JSON.parse(err.message);
        setErrors(backendErrors);
      } catch {
        setErrors({ general: "Something went wrong. Please check your connection." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Add New Student</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
              <input 
                type="text" 
                required
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className={`w-full p-2.5 border rounded-lg outline-none transition-all ${errors.first_name ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-cyan-100'}`} 
              />
              {errors.first_name && <p className="text-[10px] text-red-500 font-bold">{errors.first_name[0]}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
              <input 
                type="text" 
                required
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className={`w-full p-2.5 border rounded-lg outline-none transition-all ${errors.last_name ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-cyan-100'}`} 
              />
              {errors.last_name && <p className="text-[10px] text-red-500 font-bold">{errors.last_name[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Date of Birth</label>
              <input 
                type="date" 
                value={formData.date_of_birth}
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none text-sm" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none bg-white text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>
          </div>

          {errors.general && <p className="text-center text-red-500 text-xs font-bold">{errors.general}</p>}

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-cyan-500 text-white text-sm font-bold rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
              {loading ? "Saving..." : "Save Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}