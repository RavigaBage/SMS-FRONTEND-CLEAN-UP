// frontend/src/components/dashboard/GradeTable.tsx
export function GradeTable({ grades }: { grades: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50">
          <tr>
            <th className="p-4 font-semibold">Subject</th>
            <th className="p-4 font-semibold">Teacher</th>
            <th className="p-4 font-semibold">Grade</th>
            <th className="p-4 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((item, idx) => (
            <tr key={idx} className="border-b last:border-0 hover:bg-slate-50">
              <td className="p-4 font-medium">{item.subjectName}</td>
              <td className="p-4 text-slate-600">{item.teacherName}</td>
              <td className="p-4 font-bold">{item.gradeLetter}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}