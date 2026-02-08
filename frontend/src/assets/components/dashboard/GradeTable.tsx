// frontend/src/components/dashboard/GradeTable.tsx

export function GradeTable({ grades = [] }: { grades: any[] }) {
  const safeGrades = Array.isArray(grades) ? grades : [];

  // 1. Helper for the Status Label and Color
  const getStatusDetails = (letter: string) => {
    const l = letter?.toUpperCase() || '';
    if (['A+', 'A', 'A-'].includes(l)) return { label: 'Excellent', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    if (['B+', 'B', 'B-'].includes(l)) return { label: 'Good', color: 'text-blue-600 bg-blue-50 border-blue-100' };
    if (['C+', 'C'].includes(l)) return { label: 'Satisfactory', color: 'text-amber-600 bg-amber-50 border-amber-100' };
    if (['D'].includes(l)) return { label: 'Pass', color: 'text-orange-600 bg-orange-50 border-orange-100' };
    return { label: 'Fail', color: 'text-red-600 bg-red-50 border-red-100' };
  };

  const getGradeColor = (letter: string) => {
    const l = letter?.toUpperCase();
    if (['A+', 'A', 'A-'].includes(l)) return 'bg-emerald-500 text-white';
    if (['B+', 'B', 'B-'].includes(l)) return 'bg-blue-500 text-white';
    if (['C+', 'C'].includes(l)) return 'bg-amber-500 text-white';
    return 'bg-slate-400 text-white';
  };

  if (safeGrades.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 italic bg-slate-50/50 rounded-xl border-2 border-dashed">
        No academic records found for this term.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-separate border-spacing-0">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-4 font-bold text-slate-400 text-[10px] tracking-widest uppercase border-b">Subject</th>
            <th className="p-4 font-bold text-slate-400 text-[10px] tracking-widest uppercase border-b text-center">Score</th>
            <th className="p-4 font-bold text-slate-400 text-[10px] tracking-widest uppercase border-b text-center">Grade</th>
            <th className="p-4 font-bold text-slate-400 text-[10px] tracking-widest uppercase border-b text-center">Status</th>
            <th className="p-4 font-bold text-slate-400 text-[10px] tracking-widest uppercase border-b text-right">Class Avg</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {safeGrades.map((item, idx) => {
            const status = getStatusDetails(item.grade_letter);
            const percentage = parseFloat(item.percentage) || 0;

            return (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-slate-700">{item.subject?.name || "Subject"}</div>
                  <div className="text-[10px] text-slate-400 uppercase">{item.term}</div>
                </td>

                <td className="p-4 text-center">
                  <span className="font-mono font-bold text-slate-600">{item.total_score}</span>
                  <span className="text-[10px] text-slate-400 ml-1">({percentage}%)</span>
                </td>

                <td className="p-4 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black shadow-sm ${getGradeColor(item.grade_letter)}`}>
                    {item.grade_letter}
                  </span>
                </td>

                <td className="p-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${status.color}`}>
                    {status.label}
                  </span>
                </td>

                <td className="p-4 text-right">
                  <span className="text-slate-500 font-medium">{item.class_average}%</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}