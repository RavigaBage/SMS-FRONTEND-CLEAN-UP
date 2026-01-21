// frontend/src/assets/components/management/AddStudentModal.tsx
"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";

export function AddStudentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Example: Handling a responseCode: 1 (Validation Error)
    const mockResponse = {
      responseCode: 1,
      responseMessage: "Please fix the highlighted errors",
      data: { fullName: "Name is required", email: "Invalid email format" }
    };

    if (mockResponse.responseCode === 1) {
      setErrors(mockResponse.data); // Map data object to field errors
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
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
            <input type="text" className={`w-full p-2.5 border rounded-lg outline-none transition-all ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-cyan-100'}`} placeholder="Enter student's full name" />
            {errors.fullName && <p className="text-[10px] text-red-500 font-bold">{errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Grade / Class</label>
              <select className="w-full p-2.5 border border-slate-200 rounded-lg outline-none bg-white text-sm">
                <option>Select Grade</option>
                <option>Grade 10 - A</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Enrollment Date</label>
              <input type="date" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none text-sm" />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-cyan-500 text-white text-sm font-bold rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2">
              <Save size={18} /> Save Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}