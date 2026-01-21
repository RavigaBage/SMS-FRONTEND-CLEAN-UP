// frontend/src/assets/components/management/FilterBar.tsx
"use client";

import { useState } from "react"; // 1. Import useState
import { Search, ChevronDown, Plus } from "lucide-react";
import { AddStudentModal } from "./AddStudentModal";

export function FilterBar() {
  // 2. Define state to track if modal is open
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white p-6 rounded-t-2xl border-x border-t space-y-4">
      <div className="flex justify-between items-end">
        <div className="flex-1 grid grid-cols-3 gap-4 max-w-4xl">
          {/* ... Search, Grade, Status inputs remain the same ... */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Search Students</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search by name, ID, or email..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-100" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Grade / Class</label>
            <div className="relative">
              <select className="w-full appearance-none pl-4 pr-10 py-2 bg-slate-50 border rounded-lg text-sm outline-none">
                <option>All Grades</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
            <div className="relative">
              <select className="w-full appearance-none pl-4 pr-10 py-2 bg-slate-50 border rounded-lg text-sm outline-none">
                <option>All Statuses</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>
        </div>

        {/* 3. Update onClick to set state to true */}
        <button 
          className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-cyan-600 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} /> Add Student
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2">
        {["All Students", "Active", "Inactive", "New Enrollees"].map((filter, i) => (
          <button key={filter} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${i === 0 ? "bg-cyan-100 text-cyan-600" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
            {filter}
          </button>
        ))}
      </div>

      {/* 4. Render the Modal component and pass the state/close handler */}
      <AddStudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}