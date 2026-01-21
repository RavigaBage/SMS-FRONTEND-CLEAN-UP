import { FilterBar } from "@/src/assets/components/management/FilterBar";
import { StudentTable } from "@/src/assets/components/management/StudentTable";
import { mockStudentManagement } from "@/src/lib/mock-student-management";
import { Pagination } from "@/src/assets/components/management/Pagination";
import { ErrorState } from "@/src/assets/components/dashboard/ErrorState";
import { apiRequest } from "@/src/lib/apiClient";

export default async function StudentManagementPage() {
  try {
    // Fetch real data from Django endpoint
    const response = await apiRequest("/students/");
    const students = response.data;

    // Handle Empty Success State (dataCount: 0)
    if (response.dataCount === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h3 className="text-lg font-medium text-slate-900">No Records</h3>
          <p className="text-slate-500">The student database is currently empty.</p>
        </div>
      );
    }

    return (
      <div className="p-8 space-y-4">
        <FilterBar />
        <StudentTable students={students} />
        <Pagination totalItems={response.dataCount} itemsPerPage={10} currentPage={1} />
      </div>
    );

  } catch (error: any) {
    // This catches responseCode 1-8 and displays the user-safe message
    return (
      <div className="p-10 max-w-xl mx-auto">
        <ErrorState code={error.code} message={error.message} />
      </div>
    );
  }
}