// "use client";

// import { useState, useEffect } from "react";
// import { Search, ChevronDown, Plus } from "lucide-react";
// import { AddStudentModal } from "./AddStudentModal";
// import { fetchWithAuth } from "@/src/lib/apiClient";

// export interface Classroom {
//   id: number;
//   class_name: string;
//   academic_year_name: string;
//   class_teacher: Teacher;
//   current_enrollment: number;
//   capacity: number;
// }

// export interface Teacher {
//   id: number;
//   full_name: string;
// }

// export function FilterBar() {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [classData, setClassData] = useState<Classroom[]>([]);

//   const fetchClassData = async () => {
//     try {
//       const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/classes`);
//       const data = await res.json();
//       if (data?.results) setClassData(data.results);
//     } catch (err) {
//       console.error("Failed to load classes", err);
//     }
//   };

//   useEffect(() => {
//     fetchClassData();
//   }, []);

//   return (
//     <div className="bg-white p-6 rounded-t-3xl border border-slate-200 shadow-sm space-y-5">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6" 
//       style={{ width: "100%" }}>
//         {/* Filters */}
//         <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">

//           {/* Grade/Class */}
//           <div className="flex flex-col space-y-1">
//             <label className="text-xs font-semibold text-slate-500 uppercase">Grade / Class</label>
//             <div className="relative">
//               <select className="w-full appearance-none pl-4 pr-10 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition">
//                 <option value="">All Grades</option>
//                 {classData.map((cls) => (
//                   <option key={cls.id} value={cls.id}>
//                     {cls.class_name} ({cls.academic_year_name})
//                   </option>
//                 ))}
//               </select>
//               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
//             </div>
//           </div>

//           {/* Status */}
//           <div className="flex flex-col space-y-1">
//             <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
//             <div className="relative">
//               <select className="w-full appearance-none pl-4 pr-10 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition">
//                 <option value="">All Statuses</option>
//                 <option value="active">Active</option>
//                 <option value="graduated">Graduated</option>
//                 <option value="suspended">Suspended</option>
//                 <option value="transferred">Transferred</option>
//                 <option value="withdrawn">Withdrawn</option>
//               </select>
//               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
//             </div>
//           </div>
//         </div>

//         {/* Add Student Button */}
//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition"
//         >
//           <Plus size={18} /> Add Student
//         </button>
//       </div>

//       {/* Filter Chips */}
//       <div className="flex flex-wrap gap-2">
//         {["All Students", "Active", "Inactive", "New Enrollees"].map((filter, i) => (
//           <button
//             key={filter}
//             className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
//               i === 0
//                 ? "bg-cyan-100 text-cyan-600"
//                 : "bg-slate-100 text-slate-500 hover:bg-slate-200"
//             }`}
//           >
//             {filter}
//           </button>
//         ))}
//       </div>

//       {/* Add Student Modal */}
//       <AddStudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, Plus } from "lucide-react";
import { fetchWithAuth } from "@/src/lib/apiClient";
import { AddStudentModal } from "./AddStudentModal";

export interface Classroom {
  id: number;
  class_name: string;
  academic_year_name: string;
  class_teacher: Teacher;
  current_enrollment: number;
  capacity: number;
}

export interface Teacher {
  id: number;
  full_name: string;
}

interface FilterBarProps {
  onFilterChange: (filters: { classId?: string; status?: string }) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classData, setClassData] = useState<Classroom[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const fetchClassData = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/classes`);
      const data = await res.json();
      if (data?.results) setClassData(data.results);
    } catch (err) {
      console.error("Failed to load classes", err);
    }
  };

  useEffect(() => {
    fetchClassData();
  }, []);

  // Notify parent when filters change
  useEffect(() => {
    onFilterChange({ classId: selectedClass, status: selectedStatus });
  }, [selectedClass, selectedStatus]);

  return (
    <div className="bg-white p-6 rounded-t-3xl border border-slate-200 shadow-sm space-y-5 w-full max-w-[70%] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 w-full" style={{width:"100%"}}>
        {/* Filters */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Grade/Class */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Grade / Class</label>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition"
              >
                <option value="">All Grades</option>
                {classData.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class_name} ({cls.academic_year_name})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="graduated">Graduated</option>
                <option value="suspended">Suspended</option>
                <option value="transferred">Transferred</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>
        </div>

        {/* Add Student Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition"
        >
          <Plus size={18} /> Add Student
        </button>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
