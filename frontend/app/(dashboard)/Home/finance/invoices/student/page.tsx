"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/src/lib/apiClient";
interface Student {
  id: number;
  full_name: string;
  admission_number: string;
  class_obj?: { id: number; class_name: string };
  active?: boolean;
}

export default function ProfilesList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch students from DRF backend
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetchWithAuth(`${baseUrl}/students/`); 
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error("Error fetching students:", err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filtered list based on search query
  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Students</h1>
        <p className="text-sm text-gray-500">
          Select a student to create or view an invoice
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or admission number..."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white font-medium text-gray-700 outline-none focus:ring-2 focus:ring-cyan-500/20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading students...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Admission No</th>
                <th className="px-6 py-3 text-left">Class</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">{student.full_name}</td>
                  <td className="px-6 py-4 text-gray-600">{student.admission_number}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {student.class_obj?.class_name || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        student.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {student.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() =>
                        router.push(`/Home/finance/invoices/create?student_id=${student.id}`)
                      }
                      className="text-cyan-600 hover:underline font-medium"
                    >
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
