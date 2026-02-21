"use client";

import { useState } from "react";
import { X, Save, Loader2, Briefcase } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
import { useRouter } from "next/navigation";

type StaffFormData = {
  first_name: string;
  last_name: string;
  email: string;
  staff_type: string;
  gender: string;
  phone_number: string;
  address: string;
  specialization: string;
  date_of_birth: string;
  employment_date: string;
  national_id: string;
  health_info: string;
  photo_url: string;
};

const initialData: StaffFormData = {
  first_name: "",
  last_name: "",
  email: "",
  staff_type: "teacher",
  gender: "male",
  phone_number: "",
  address: "",
  specialization: "",
  date_of_birth: "",
  employment_date: "",
  national_id: "",
  health_info: "",
  photo_url: "",
};

export function AddStaffModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [formData, setFormData] = useState<StaffFormData>(initialData);

  if (!isOpen) return null;

  const getFirstError = (value: any) => (Array.isArray(value) ? value[0] : String(value));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const payload = Object.fromEntries(Object.entries(formData).filter(([_, value]) => value !== ""));

      const response = await apiRequest<any>("/staff/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.error || (response.status && response.status >= 400)) {
        setErrors({ general: response.error || "Failed to save staff member. Please try again." });
        return;
      }

      onClose();
      router.refresh();
      setFormData(initialData);
    } catch (err: any) {
      if (err?.response?.data && typeof err.response.data === "object") {
        setErrors(err.response.data);
      } else {
        setErrors({ general: err?.message || "Failed to save staff member. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center bg-slate-900 text-white sticky top-0">
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
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className={`w-full p-2.5 border rounded-lg outline-none transition-all text-sm ${errors.first_name ? "border-red-500 bg-red-50" : "border-slate-200 focus:ring-2 focus:ring-slate-100"}`}
              />
              {errors.first_name && <p className="text-[10px] text-red-500 font-bold">{getFirstError(errors.first_name)}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Last Name</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className={`w-full p-2.5 border rounded-lg outline-none transition-all text-sm ${errors.last_name ? "border-red-500 bg-red-50" : "border-slate-200 focus:ring-2 focus:ring-slate-100"}`}
              />
              {errors.last_name && <p className="text-[10px] text-red-500 font-bold">{getFirstError(errors.last_name)}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full p-2.5 border rounded-lg outline-none transition-all text-sm ${errors.email ? "border-red-500 bg-red-50" : "border-slate-200 focus:ring-2 focus:ring-slate-100"}`}
            />
            {errors.email && <p className="text-[10px] text-red-500 font-bold">{getFirstError(errors.email)}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none bg-white text-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Staff Type</label>
              <select
                value={formData.staff_type}
                onChange={(e) => setFormData({ ...formData, staff_type: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none bg-white text-sm"
              >
                <option value="teacher">Teacher</option>
                <option value="headmaster">Headmaster</option>
                <option value="bursar">Bursar</option>
                <option value="admin_staff">Admin Staff</option>
                <option value="support_staff">Support Staff</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Phone Number</label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className={`w-full p-2.5 border rounded-lg outline-none transition-all text-sm ${errors.phone_number ? "border-red-500 bg-red-50" : "border-slate-200 focus:ring-2 focus:ring-slate-100"}`}
              />
              {errors.phone_number && <p className="text-[10px] text-red-500 font-bold">{getFirstError(errors.phone_number)}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Specialization</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-100 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-100 transition-all text-sm"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-100 transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Employment Date</label>
              <input
                type="date"
                value={formData.employment_date}
                onChange={(e) => setFormData({ ...formData, employment_date: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-100 transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">National ID</label>
              <input
                type="text"
                value={formData.national_id}
                onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                className={`w-full p-2.5 border rounded-lg outline-none transition-all text-sm ${errors.national_id ? "border-red-500 bg-red-50" : "border-slate-200 focus:ring-2 focus:ring-slate-100"}`}
              />
              {errors.national_id && <p className="text-[10px] text-red-500 font-bold">{getFirstError(errors.national_id)}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Photo URL</label>
              <input
                type="url"
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                className={`w-full p-2.5 border rounded-lg outline-none transition-all text-sm ${errors.photo_url ? "border-red-500 bg-red-50" : "border-slate-200 focus:ring-2 focus:ring-slate-100"}`}
              />
              {errors.photo_url && <p className="text-[10px] text-red-500 font-bold">{getFirstError(errors.photo_url)}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Health Info</label>
            <textarea
              value={formData.health_info}
              onChange={(e) => setFormData({ ...formData, health_info: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-100 transition-all text-sm"
              rows={2}
            />
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
