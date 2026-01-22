"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Download } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
import { StudentTable } from "@/src/assets/components/management/StudentTable";
import { AddStudentModal } from "@/src/assets/components/management/AddStudentModal";
import { Student } from "@/src/assets/types/api";
import { FilterBar } from "@/src/assets/components/management/FilterBar";

export default function StudentsManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStudents = async () => {
    try {
      const data = await apiRequest("/students/", { method: "GET" });
      
      const formattedData = data.map((s: any) => ({
        id: s.user_id || s.id, 
        fullName: `${s.first_name} ${s.last_name}`,
        email: s.email || "N/A",
        grade: s.grade || "Unassigned",
        enrollmentDate: s.created_at ? new Date(s.created_at).toLocaleDateString() : "N/A",
        status: s.status.charAt(0).toUpperCase() + s.status.slice(1), 
        profileImage: s.profile_image || `https://ui-avatars.com/api/?name=${s.first_name}+${s.last_name}&background=random`,
      }));
      
      setStudents(formattedData);
    } catch (err) {
      console.error("Failed to load students:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <FilterBar />
      </div>

      {/* Control Bar */}
      <div className="bg-white border-x border-t rounded-t-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-cyan-100 transition-all text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-lg border">
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Your Component */}
      <StudentTable students={filteredStudents} />

      {/* Your Modal Component */}
      <AddStudentModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchStudents(); // Refresh data after adding
        }} 
      />
    </div>
  );
}