"use client";

import { useState, useEffect } from "react";
import { X, Loader2, School, UserCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddClassModal({
  isOpen,
  onClose,
  onSuccess,
}: AddClassModalProps) {
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
          const data = await apiRequest("/staff/?role=teacher", {
            method: "GET",
          });
          setTeachers(data.results || []);
        } catch (err) {
          console.error("Error loading teachers:", err);
        }
      };
      fetchTeachers();
    }
    setErrors({}); 
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (!formData.name?.trim()) {
        setErrors({ name: "Class name cannot be empty" });
        setLoading(false);
        return;
      }

      if (formData.name.length < 2) {
        setErrors({ name: "Class name too short (minimum 2 characters)" });
        setLoading(false);
        return;
      }

      if (!formData.academic_year) {
        setErrors({ academic_year: "Academic year is required" });
        setLoading(false);
        return;
      }

      if (!formData.level) {
        setErrors({ level: "Class level is required" });
        setLoading(false);
        return;
      }

      await apiRequest("/classes/", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      onSuccess();
      onClose();
      setFormData({
        name: "",
        academic_year: "2024/2025",
        level: "primary",
        teacher: "",
        status: "active",
      });

    } catch (err: any) {
      const status = err.response?.status;
      const errorData = err.response?.data || err;

      if (status === 400) {
        if (errorData.name) {
          setErrors({ name: errorData.name });
        } else if (errorData.detail) {
          setErrors({ general: errorData.detail });
        } else {
          setErrors({ general: "Please check your data" });
        }
        return;
      }

      if (status === 409) {
        setErrors({ name: "Class name already exists" });
        return;
      }

      if (status === 400 && errorData.detail?.includes("teacher")) {
        setErrors({ teacher: "Selected teacher not found" });
        return;
      }

      if (status === 403) {
        setErrors({ general: "You don't have permission" });
        return;
      }
      if (status === 401) {
        window.location.href = "/login";
        return;
      }

      if (status >= 500) {
        setErrors({ general: "Server error. Try again later" });
        return;
      }

      if (err instanceof TypeError) {
        setErrors({ general: "Network connection error" });
        return;
      }

      console.error("Error:", err);
      setErrors({ general: errorData.detail || "Failed to create class" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              Create New Class
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Academic Management
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
    
          {errors.general && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl animate-in slide-in-from-top-2 duration-200">
              <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-sm font-semibold text-red-700">{errors.general}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
              Class Name
            </label>
            <div className="relative">
              <School
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                required
                type="text"
                placeholder="e.g. Grade 6A or JHS 1"
                className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl outline-none focus:ring-4 transition-all font-bold text-slate-700 ${
                  errors.name
                    ? "border-red-400 focus:ring-red-500/10 focus:border-red-500"
                    : "border-slate-200 focus:ring-cyan-500/10 focus:border-cyan-500"
                }`}
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
              
                  if (errors.name) {
                    setErrors({ ...errors, name: "" });
                  }
                }}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-600 font-semibold ml-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                Academic Year
              </label>
              <select
                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 transition-all ${
                  errors.academic_year
                    ? "border-red-400 focus:ring-red-500/10"
                    : "border-slate-200 focus:ring-cyan-500/10"
                }`}
                value={formData.academic_year}
                onChange={(e) => {
                  setFormData({ ...formData, academic_year: e.target.value });
                  if (errors.academic_year) {
                    setErrors({ ...errors, academic_year: "" });
                  }
                }}
              >
                <option value="2024/2025">2024 / 2025</option>
                <option value="2023/2024">2023 / 2024</option>
              </select>
              {errors.academic_year && (
                <p className="text-xs text-red-600 font-semibold ml-1">{errors.academic_year}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                Class Level
              </label>
              <select
                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 transition-all ${
                  errors.level
                    ? "border-red-400 focus:ring-red-500/10"
                    : "border-slate-200 focus:ring-cyan-500/10"
                }`}
                value={formData.level}
                onChange={(e) => {
                  setFormData({ ...formData, level: e.target.value });
                  if (errors.level) {
                    setErrors({ ...errors, level: "" });
                  }
                }}
              >
                <option value="primary">Primary</option>
                <option value="jhs">Junior High</option>
                <option value="shs">Senior High</option>
              </select>
              {errors.level && (
                <p className="text-xs text-red-600 font-semibold ml-1">{errors.level}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
              Assign Class Teacher
            </label>
            <div className="relative">
              <UserCheck
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <select
                className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 appearance-none transition-all ${
                  errors.teacher
                    ? "border-red-400 focus:ring-red-500/10"
                    : "border-slate-200 focus:ring-cyan-500/10"
                }`}
                value={formData.teacher}
                onChange={(e) => {
                  setFormData({ ...formData, teacher: e.target.value });
                  if (errors.teacher) {
                    setErrors({ ...errors, teacher: "" });
                  }
                }}
              >
                <option value="">Select a Teacher (Optional)</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.first_name} {t.last_name}
                  </option>
                ))}
              </select>
            </div>
            {errors.teacher && (
              <p className="text-xs text-red-600 font-semibold ml-1">{errors.teacher}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Creating...</span>
                </>
              ) : (
                "Confirm & Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}