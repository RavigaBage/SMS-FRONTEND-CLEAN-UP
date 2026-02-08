
import Link from "next/dist/client/link";
import { Student } from "../../types/api";
import { Trash2 } from "lucide-react";
interface StudentTableProps {
  students: Student[];
  onDelete: (id: number) => void; 
}
export function StudentTable({ students, onDelete }: StudentTableProps) {
  console.log(students);
  
  return (
    <div className="bg-white border-x border-b rounded-b-2xl overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-y text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <tr>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Student Profile</th>
            <th className="px-6 py-4">Gender</th>
            <th className="px-6 py-4 text-center">Class / Grade</th>
            <th className="px-6 py-4">Enrollment Date</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y text-sm">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 font-bold text-cyan-600">{student.id}</td>
              <td className="px-6 py-4">
                    <Link 
                  href={`/Home/profiles/students/students/${student.id}`}
                  className="flex items-center gap-3 hover:text-cyan-600 transition-colors"
                >
                  <img src={student.profileImage} className="w-9 h-9 rounded-full bg-slate-100" />
                  <span className="font-bold text-slate-700">{student.fullName}</span>
                </Link>
              </td>
              <td className="px-6 py-4 text-slate-500">{student.gender_display}</td>
              <td className="px-6 py-4 text-center">
                <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded text-[10px] font-bold">
                  {student.classInfo}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-500">{student.enrollmentDate}</td>
              <td className="px-6 py-4">
                <StatusBadge status={student.status} />
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => onDelete(student.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    Active: "bg-green-50 text-green-600 before:bg-green-500",
    Inactive: "bg-amber-50 text-amber-600 before:bg-amber-500",
    Suspended: "bg-red-50 text-red-600 before:bg-red-500",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2 w-fit ${styles[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}