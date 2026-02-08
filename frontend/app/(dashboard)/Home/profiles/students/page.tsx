"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Download } from "lucide-react";
import { apiRequest, fetchWithAuth } from "@/src/lib/apiClient";
import { StudentTable } from "@/src/assets/components/management/StudentTable";
import { AddStudentModal } from "@/src/assets/components/management/AddStudentModal";
import { Student } from "@/src/assets/types/api";
import { FilterBar } from "@/src/assets/components/management/FilterBar";
import '@/styles/student_page.css';
export default function StudentsManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStudents = async () => {
    try {
      const data = await apiRequest("/students/", { method: "GET" });
      const result:any = data.data;
      
      const formattedData = result.map((s: any) => ({
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
const handleDelete = async (studentId: number) => {
  if (!confirm('Are you sure you want to delete this student?')) {
    return;
  }
  
  try {
    await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/students/${studentId}/`, {
      method: 'DELETE',
    });
    
    fetchStudents();
  } catch (error) {
    console.error('Failed to delete student:', error);
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
 <div className="students-page">

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">Manage and track student records</p>
        </div>

        <div className="page-actions">
          <button 
            className="primary-button"
            onClick={() => setIsModalOpen(true)}
          >
            + Add Student
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="control-bar">

        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="control-actions">
          <button className="secondary-button">Filters</button>
          <button className="ghost-button">Export</button>
        </div>

      </div>

    <div className="table-card">
      <StudentTable 
        students={filteredStudents}
        onDelete={handleDelete}
      />
    </div>

    {/* Modal */}
    <AddStudentModal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        fetchStudents();
      }}
      onSuccess={() => {         
        fetchStudents();  
        setIsModalOpen(false); 
      }}
    />

    </div>

  );
}