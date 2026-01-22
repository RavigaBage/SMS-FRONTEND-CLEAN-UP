// frontend/src/app/dashboard/profile/page.tsx
import { mockStudentProfile, mockValidationError, mockNotFoundError } from "@/src/lib/mock-data";
import { StatsCard } from "@/src/assets/components/dashboard/StatsCard";
import { GradeTable } from "@/src/assets/components/dashboard/GradeTable";
import { ErrorState } from "@/src/assets/components/dashboard/ErrorState";
import { QuickNotes } from "@/src/assets/components/dashboard/QuickNotesCard";

export default function StudentProfilePage() {
  const response = mockStudentProfile;

  // 1. Handle Response Errors (Code 1-8) [cite: 24, 59, 61]
  if (response.responseCode !== 0) {
    return (
      <div className="p-20 max-w-xl mx-auto">
        <ErrorState 
          code={response.responseCode} 
          message={response.responseMessage} 
        />
      </div>
    );
  }

  // 2. Handle Empty Success State (dataCount: 0) [cite: 11, 68]
  if (response.dataCount === 0 || !response.data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h3 className="text-lg font-medium text-slate-900">No Student Records Found</h3>
        <p className="text-slate-500">The profile you are looking for is currently empty.</p>
      </div>
    );
  }
    
  const student = response.data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* 1. Header Section */}
      <section className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <div className="h-32 bg-linear-to-r from-blue-400 to-cyan-400" />
        <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-end -mt-12">
          <img src={student.profileImage} className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white" />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{student.fullName}</h1>
            <p className="text-slate-500">ID: {student.studentId} • {student.gradeLevel} • {student.stream}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-slate-50">Message Parent</button>
            <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-600">Edit Profile</button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="font-bold mb-4">Personal Details</h3>
            <div className="space-y-4">
              <DetailItem label="DATE OF BIRTH" value={student.personalDetails.dateOfBirth} />
              <DetailItem label="PHONE" value={student.personalDetails.phone} />
              <DetailItem label="EMAIL" value={student.personalDetails.email} />
              <DetailItem label="ADDRESS" value={student.personalDetails.address} />
            </div>
          </div>
            <QuickNotes note={student.quickNote} />
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard label="GPA" value={student.currentGpa} subValue={`${student.gpaTrend} vs last semester`} color="cyan" />
            <StatsCard label="Attendance" value={`${student.attendancePercentage}%`} subValue="Good" color="blue" />
            <StatsCard label="Pending Tasks" value={student.pendingTasks} color="orange" />
          </div>

          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b">
              <h3 className="font-bold">Academic History</h3>
              <button className="text-cyan-600 text-sm font-bold">Download Report</button>
            </div>
            <GradeTable grades={student.academicHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{label}</p>
      <p className="text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}