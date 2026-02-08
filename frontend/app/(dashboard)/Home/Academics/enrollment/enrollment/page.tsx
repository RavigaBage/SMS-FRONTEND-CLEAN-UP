// "use client";

// import { useState, useEffect } from "react";
// import { Search, UserPlus, Filter, FileText, MoreVertical, Loader2, UserMinus, Eye, Edit2 } from "lucide-react";
// import { fetchWithAuth } from "@/src/lib/apiClient";
// import Link from "next/link";
// import { EnrollStudentModal } from "@/src/assets/components/management/EnrollStudentModal";

// export default function EnrollmentsPage() {
//   const [enrollments, setEnrollments] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filters, setFilters] = useState({ year: "", className: "", status: "" });
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const fetchEnrollments = async () => {
//     setLoading(true);
//     try {
//       const query = new URLSearchParams({
//         search: searchTerm,
//         year: filters.year,
//         class: filters.className,
//         status: filters.status
//       }).toString();

//       const data = await fetchWithAuth(`/enrollments/?${query}`, { method: "GET" });
//       setEnrollments(data.results || data);
//     } catch (err) {
//       console.error("Failed to load enrollments:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const delayDebounce = setTimeout(fetchEnrollments, 300);
//     return () => clearTimeout(delayDebounce);
//   }, [searchTerm, filters]);

//   return (
//     <div className="p-8 bg-slate-50 min-h-screen space-y-6 animate-in fade-in duration-500">
      
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Enrollments Management</h1>
//           <p className="text-slate-500 text-sm font-medium">Track and manage student enrollments across academic years</p>
//         </div>
//         <button onClick={() => {setIsModalOpen(true)}} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all text-sm">
//           <UserPlus size={18} /> Enroll Student
//         </button>
//       </div>

//       {/* Controls Bar */}
//       <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm">
//         <div className="relative w-full lg:max-w-xs">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//           <input 
//             type="text"
//             placeholder="Search student name..."
//             className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-sm transition-all"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
//           <FilterSelect 
//             options={["2024 / 2025", "2023 / 2024"]} 
//             label="Academic Year" 
//             value={filters.year}
//             onChange={(val : any) => setFilters({...filters, year: val})}
//           />
//           <FilterSelect 
//             options={["Grade 6A", "JHS 2B", "SHS 1 Science"]} 
//             label="Class" 
//             value={filters.className}
//             onChange={(val : any) => setFilters({...filters, className: val})}
//           />
//           <FilterSelect 
//             options={["Active", "Pending", "Withdrawn"]} 
//             label="Status" 
//             value={filters.status}
//             onChange={(val : any) => setFilters({...filters, status: val})}
//           />
//         </div>
//       </div>

//       {/* Table Card */}
//       <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left">
//             <thead className="bg-slate-50/50 border-b border-slate-100">
//               <tr>
//                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</th>
//                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
//                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment Date</th>
//                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Year</th>
//                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
//                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {loading ? (
//                 <tr>
//                   <td colSpan={6} className="py-20 text-center">
//                     <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={32} />
//                     <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Fetching Enrollments...</span>
//                   </td>
//                 </tr>
//               ) : enrollments.length > 0 ? (
//                 enrollments.map((enroll) => (
//                   <tr key={enroll.id} className="hover:bg-slate-50/50 transition-colors group">
//                     <td className="px-8 py-5">
//                       <div className="font-black text-slate-800 text-sm">{enroll.student_name}</div>
//                       <div className="text-[10px] text-slate-400 font-bold uppercase">{enroll.student_id || "STD-000"}</div>
//                     </td>
//                     <td className="px-8 py-5 font-bold text-slate-600 text-sm">{enroll.class_name}</td>
//                     <td className="px-8 py-5 text-slate-500 text-sm font-medium">{enroll.enrollment_date}</td>
//                     <td className="px-8 py-5 text-slate-500 text-sm font-medium">{enroll.academic_year}</td>
//                     <td className="px-8 py-5">
//                       <StatusTag status={enroll.status} />
//                     </td>
//                     <td className="px-8 py-5">
//                       <div className="flex items-center justify-center gap-2">
//                         <TableAction icon={<Eye size={14} />} color="text-blue-600" label="View" />
//                         <TableAction icon={<Edit2 size={14} />} color="text-slate-600" label="Edit" />
//                         <TableAction icon={<UserMinus size={14} />} color="text-red-600" label="Withdraw" />
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={6} className="px-8 py-10 text-center text-slate-400 italic">No enrollment records found.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//         <EnrollStudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchEnrollments} />
//       </div>
//     </div>
//   );
// }

// // Helper Components
// function FilterSelect({ options, label, value, onChange }: any) {
//   return (
//     <select 
//       className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//     >
//       <option value="">{label}</option>
//       {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
//     </select>
//   );
// }

// function StatusTag({ status }: { status: string }) {
//   const styles: any = {
//     Active: "bg-emerald-50 text-emerald-600 border-emerald-100",
//     Pending: "bg-amber-50 text-amber-600 border-amber-100",
//     Withdrawn: "bg-red-50 text-red-600 border-red-100",
//   };
//   return (
//     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status] || "bg-slate-50"}`}>
//       {status}
//     </span>
//   );
// }

// function TableAction({ icon, color, label }: any) {
//   return (
//     <button className={`p-2 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-1.5 font-bold text-[10px] uppercase ${color}`}>
//       {icon}
//       <span className="hidden xl:inline">{label}</span>
//     </button>
//   );
// }