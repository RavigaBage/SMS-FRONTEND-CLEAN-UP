// "use client";

// import React, { useState, useEffect } from "react";
// import "@/styles/classResult.css";
// import Link from "next/link";
// import { fetchWithAuth } from "@/src/lib/apiClient";
// import Pagination from '@/src/assets/components/dashboard/Pagnation';

// interface ClassApiResponse {
//   count: number;
//   next: string | null;
//   previous: string | null;
//   results: {
//     id: number;
//     class_name: string;
//     academic_year: string;
//   }[];
// }
// interface SubjectApiResponse {
//   count: number;
//   next: string | null;
//   previous: string | null;
//   results: {
//     id: number;
//     subject_name: string;
//   }[];
// }

// interface ClassType {
//   id: number;
//   name: string;
// }

// interface SubjectType {
//   id: number;
//   name: string;
// }
// interface UserType {
//   id: string;
//   email: string;
//   first_name: string;
//   last_name: string;
//   role: "student" | "teacher" | "admin" | string;
//   is_active: boolean;
//   is_staff: boolean;
//   created_at: string;
// }

// interface StudentType {
//   id: number;
//   user: UserType;
//   parent: number | null;
//   first_name: string;
//   last_name: string;
//   date_of_birth: string; 
//   status: "active" | "inactive" | "graduated" | string;
// }

// interface ResultType {
//   id: number;
//   student: StudentType;
//   assessment_score: number,
//   assessment_total: number,
//   test_score: number,
//   test_total: number,
//   exam_score: number,
//   exam_total: number,
//   weighted_assessment: number,
//   weighted_test: number,
//   weighted_exam: number,
//   total_score: number,
//   grade_letter: string,
//   grade_date: string ,
//   subject_rank: string;
// }

// interface StudentWithGrade {
//   student: StudentType;
//   grade: ResultType | null;
// }
// interface PaginatedResponse<T> {
//   count: number;
//   next: string | null;
//   previous: string | null;
//   results: T[];
// }
// const api = {
//   getTeacherAssignments: async () => {
//     const res = await fetchWithAuth(
//         `${process.env.NEXT_PUBLIC_API_URL}/classes/`);
//     if (!res.ok) throw new Error("Failed to fetch classes");
//     const data = await res.json();
//     return data;
//   },
//   getSubjects: async () => {
//     const res = await fetchWithAuth(
//         `${process.env.NEXT_PUBLIC_API_URL}/subjects/`);
//     if (!res.ok) throw new Error("Failed to fetch subjects for class");
//     return await res.json();
//   },
//   getSubjectsForClass: async (classId: number) => {
//     const res = await fetchWithAuth(
//         `${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}/subjects/`);
//     if (!res.ok) throw new Error("Failed to fetch subjects for class");
//     return await res.json();
//   },

//   getClassesForSubject: async (subjectId: number) => {
//     const res = await fetchWithAuth(
//         `${process.env.NEXT_PUBLIC_API_URL}/subjects/${subjectId}/classes/`);
//     if (!res.ok) throw new Error("Failed to fetch classes for subject");
//     return await res.json();
//   },

//   getResults: async ({
//     classId,
//     subjectId,
//     academicYear,
//     term,
//   }: {
//     classId: number;
//     subjectId: number;
//     academicYear: string;
//     term: string;
//   }) => {
//     const res = await fetchWithAuth(
//          `${process.env.NEXT_PUBLIC_API_URL}/grades/?class=${classId}&subject=${subjectId}&academic_year=${academicYear}&term=${term}`);
//     if (!res.ok) throw new Error("Failed to fetch results");
//     return await res.json(); 
//   },
  
//   getStudentsInClass: async (classId: number) => {
//     const res = await fetchWithAuth(
//         `${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}/students/`);
//     if (!res.ok) throw new Error("Failed to fetch students");
//     return await res.json();
//   },
// };


// export default function ClassResults() {
//   const [assignedClasses, setAssignedClasses] = useState<ClassType[]>([]);
//   const [assignedSubjects, setAssignedSubjects] = useState<SubjectType[]>([]);
//   const [availableClasses, setAvailableClasses] = useState<ClassType[]>([]);
//   const [availableSubjects, setAvailableSubjects] = useState<SubjectType[]>([]);
//   const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
//   const [selectedSubject, setSelectedSubject] = useState<SubjectType | null>(null);
//   const [academicYear, setAcademicYear] = useState<string>("2025-26");
//   const [term, setTerm] = useState<string>("first");

//   const [studentsWithGrades, setStudentsWithGrades] = useState<StudentWithGrade[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [selectedYear, setSelectedYear] = useState('2025-26');
//   const [pagination, setPagination] = useState<PaginatedResponse<StudentWithGrade> | null>(null);
//   const [page, setPage] = useState(1);

//   useEffect(() => {
//   interface ClassApiResponse {
//     count: number;
//     next: string | null;
//     previous: string | null;
//     results: {
//       id: number;
//       class_name: string;
//       academic_year: string;
//     }[];
//   }

//   interface SubjectApiResponse {
//     count: number;
//     next: string | null;
//     previous: string | null;
//     results: {
//       id: number;
//       subject_name: string;
//     }[];
//   }

//   async function initAssignments() {

//     const classResponse: ClassApiResponse = await api.getTeacherAssignments(); 
//     const classes: ClassType[] = classResponse.results.map((c) => ({
//       id: c.id,
//       name: c.class_name,
//     }));
//     setAssignedClasses(classes);
//     setAvailableClasses(classes);

//     const subjectsResponse: SubjectApiResponse = await api.getSubjects(); 
//     const subjects: SubjectType[] = subjectsResponse.results.map((s) => ({
//       id: s.id,
//       name: s.subject_name,
//     }));
//     setAssignedSubjects(subjects);
//     setAvailableSubjects(subjects);

//     if (classes.length && subjects.length) {
//       setMessage("");
//     } else if (classes.length && !subjects.length) {
//       setMessage("No subjects available yet.");
//     } else if (!classes.length && subjects.length) {
//       setMessage("No classes assigned yet.");
//     } else {
//       setMessage("You are not yet assigned to any class or subject.");
//     }
//   }

//     initAssignments();
//   }, []);

//     const generateAcademicYears = (
//     startYear: number,
//     count: number
//     ): string[] => {
//     return Array.from({ length: count }, (_, i) => {
//         const year = startYear - i;
//         return `${year}-${String(year + 1)}`;
//     });
//     };
//     const academicYears = generateAcademicYears(2025, 5);

//   useEffect(() => {
//     async function loadSubjects() {
//       if (!selectedClass) return;

//       if (!assignedSubjects.length) {
//         const subjects = await api.getSubjectsForClass(selectedClass.id);
//         setAvailableSubjects(subjects);
//       }

//       fetchResults();
//     }

//     loadSubjects();
//   }, [selectedClass]);
  
//   useEffect(() => {
//     fetchResults();
//   }, [academicYear, term]);

//   const handleYearSelect = (val: string)=>{
//     setSelectedYear(val);
//      setAcademicYear(val)
//   }
  
//   useEffect(() => {
//     async function loadClasses() {
//       if (!selectedSubject) return;

//       if (!assignedClasses.length) {
//         const classes = await api.getClassesForSubject(selectedSubject.id);
//         setAvailableClasses(classes);
//       }

//       fetchResults();
//     }

//     loadClasses();
//   }, [selectedSubject]);

//   async function fetchResults() {
//     if (!selectedClass || !selectedSubject) return;
//     setLoading(true);
    
//     try {
//       // Fetch both students and grades
//       const [studentsData, gradesData] = await Promise.all([
//         api.getStudentsInClass(selectedClass.id),
//         api.getResults({
//           classId: selectedClass.id,
//           subjectId: selectedSubject.id,
//           academicYear,
//           term,
//         })
//       ]);

//       const students: StudentType[] = studentsData.results || studentsData;
//       const grades: ResultType[] = gradesData.results || [];

//       const gradeMap = new Map<number, ResultType>();
//       grades.forEach(grade => {
//         gradeMap.set(grade.student.id, grade);
//       });

//       const merged: StudentWithGrade[] = students.map(student => ({
//         student,
//         grade: gradeMap.get(student.id) || null
//       }));

//       setStudentsWithGrades(merged);
//     } catch (error) {
//       console.error("Error fetching results:", error);
//       setStudentsWithGrades([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const getRanking = (rankStr: string | null | undefined) => {
//     const baseStyle = {
//       padding: "6px 12px",
//       borderRadius: "8px",
//       fontWeight: "bold",
//       display: "inline-block",
//       minWidth: "45px",
//       textAlign: "center" as const,
//       fontSize: "0.85rem",
//       boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
//     };
//     const suffixes: Record<number, string> = { 1:'st', 2: "nd", 3: "rd", 4: "th", 5: "th" };
//     const rankNum = rankStr ? parseInt(rankStr, 10) : 'N/A';
//     const rankNumParsed = typeof rankNum === 'string' ? NaN : rankNum;

//     if (rankNumParsed === 1) {
//       return (
//         <div style={{ 
//           ...baseStyle, 
//           background: "linear-gradient(135deg, #FFD700, #FDB931)", 
//           color: "#78350F",
//           border: "1px solid #B45309",
//           transform: "scale(1.1)" 
//         }}>
//           {rankNumParsed}{suffixes[rankNumParsed]}
//         </div>
//       );
//     }
//     if (rankNumParsed === 2 ) {
      
//       return (
//         <div style={{ 
//           ...baseStyle, 
//           background: "#045ce0", 
//           color: "#ffffff", 
//           border: "1px solid #DBEAFE" 
//         }}>
//           {rankNumParsed}{suffixes[rankNumParsed]}
//         </div>
//       );
//     }
//     if (rankNumParsed === 3 ) {
      
//       return (
//         <div style={{ 
//           ...baseStyle, 
//           background: "#b3721e", 
//           color: "#ffffff", 
//           border: "1px solid #dce709" 
//         }}>
//           {rankNumParsed}{suffixes[rankNumParsed]}
//         </div>
//       );
//     }

//     if (rankNumParsed === 4 ) {
      
//       return (
//         <div style={{ 
//           ...baseStyle, 
//           background: "#0e9165", 
//           color: "#ffffff", 
//           border: "1px solid #DBEAFE" 
//         }}>
//           {rankNumParsed}{suffixes[rankNumParsed]}
//         </div>
//       );
//     }

//         if (rankNumParsed === 5 ) {
      
//       return (
//         <div style={{ 
//           ...baseStyle, 
//           background: "#077692", 
//           color: "#ffffff", 
//           border: "1px solid #DBEAFE" 
//         }}>
//           {rankNumParsed}{suffixes[rankNumParsed]}
//         </div>
//       );
//     }
    

//     return (
//       <div style={{ ...baseStyle, background: "#F1F5F9", color: "#475569" }}>
//         {rankNum}th
//       </div>
//     );
// };

//   const getGradeClass = (gradeLetter: string): string => {
//     const grade = gradeLetter.toLowerCase();
//     if (grade.startsWith('a')) return 'a';
//     if (grade.startsWith('b')) return 'b';
//     if (grade.startsWith('c')) return 'c';
//     if (grade.startsWith('d')) return 'd';
//     return 'f';
//   };

//   return (
//     <div className="results-container">
//       <main className="content">
//         {/* Header */}
//         <header className="main-header">
//           <div className="breadcrumb">
//             Reports / <strong>Class Results & Grading</strong>
//           </div>
//           <div className="header-right">
//             <div className="header-icons" style={{ marginRight: 20, cursor: "pointer" }}>🔔 ⚙️</div>
//             <div className="profile-chip">
//               <div className="profile-info" style={{ textAlign: "right" }}>
//                 <span className="name" style={{ display: "block", fontWeight: 600 }}>Alex Sterling</span>
//                 <span className="role" style={{ fontSize: 10, color: "var(--text-muted)" }}>ADMINISTRATOR</span>
//               </div>
//               <div className="avatar"></div>
//             </div>
//           </div>
//         </header>

//         {/* Filters */}
//         <section className="controls-card">
//           <div className="dropdown-group">
//            <select
//               className="nav-select short"
//               value={selectedYear}
//               onChange={(e) => handleYearSelect(e.target.value)}
//           >
//               {academicYears.map((year) => (
//               <option key={year} value={year}>
//                   {year}
//               </option>
//               ))}
//           </select>
//             <select
//               value={term}
//               onChange={(e) => setTerm(e.target.value)}
//             >
//               <option value="first">First Term</option>
//               <option value="second">Second Term</option>
//               <option value="third">Third Term</option>
//             </select>
//             <select
//               value={selectedClass?.id || ""}
//               onChange={(e) => {
//                 const cls = availableClasses.find(c => c.id === Number(e.target.value)) || null;
//                 setSelectedClass(cls);
//               }}
//             >
//               <option value="">Select Class</option>
//               {availableClasses.map(cls => (
//                 <option key={cls.id} value={cls.id}>{cls.name}</option>
//               ))}
//             </select>
//             <select
//               value={selectedSubject?.id || ""}
//               onChange={(e) => {
//                 const subj = availableSubjects.find(s => s.id === Number(e.target.value)) || null;
//                 setSelectedSubject(subj);
//               }}
//             >
//               <option value="">Select Subject</option>
//               {availableSubjects.map(subj => (
//                 <option key={subj.id} value={subj.id}>{subj.name}</option>
//               ))}
//             </select>
//           </div>
//         </section>

//         {message && <p style={{ padding: 10, color: "#555" }}>{message}</p>}

//         {/* Table */}
//         <section className="table-container">
//           <div className="table-wrapper">
//             {loading ? (
//               <p style={{ padding: 20, textAlign: 'center' }}>Loading results...</p>
//             ) : studentsWithGrades.length > 0 ? (
//               <table className="results-table">
//                 <thead>
//                   <tr>
//                     <th className="sticky-col">Student Name</th>
//                     <th>Status</th>
//                     <th>Asmt Score</th>
//                     <th>Asmt Total</th>
//                     <th>Test Score</th>
//                     <th>Test Total</th>
//                     <th>Exam Score</th>
//                     <th>Exam Total</th>
//                     <th className="weighted">Asmt (20%)</th>
//                     <th className="weighted">Test (30%)</th>
//                     <th className="weighted">Exam (50%)</th>
//                     <th className="total-col">Overall Total</th>
//                     <th>Grade</th>
//                     <th>Rank</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {studentsWithGrades.map(({ student, grade }) => (
//                     <tr key={student.id} style={{ backgroundColor: grade ? 'white' : '#fef9e7' }}>
//                       <td className="sticky-col">
//                         <Link 
//                           href={{
//                             pathname: `/Home/Academics/grades/student`,
//                             query: {
//                               studentId: student.id,
//                               studentName: `${student.first_name} ${student.last_name}`,
//                               classId: selectedClass?.id,
//                               className: selectedClass?.name,
//                               academicYear: academicYear,
//                               subjectId: selectedSubject?.id,  
//                               term: term 
//                             }
//                           }}
//                         >
//                           <strong>{student.first_name} {student.last_name}</strong>
//                         </Link>
//                       </td>
//                       <td>
//                         {grade ? (
//                           <span style={{
//                             padding: "4px 8px",
//                             background: "#d1fae5",
//                             color: "#065f46",
//                             borderRadius: "6px",
//                             fontSize: "0.75rem",
//                             fontWeight: 600
//                           }}>
//                             Graded
//                           </span>
//                         ) : (
//                           <span style={{
//                             padding: "4px 8px",
//                             background: "#fee2e2",
//                             color: "#991b1b",
//                             borderRadius: "6px",
//                             fontSize: "0.75rem",
//                             fontWeight: 600
//                           }}>
//                             Pending
//                           </span>
//                         )}
//                       </td>
//                       <td>{grade?.assessment_score ?? '-'}</td>
//                       <td>{grade?.assessment_total ?? '-'}</td>
//                       <td>{grade?.test_score ?? '-'}</td>
//                       <td>{grade?.test_total ?? '-'}</td>
//                       <td>{grade?.exam_score ?? '-'}</td>
//                       <td>{grade?.exam_total ?? '-'}</td>
//                       <td className="weighted">{grade?.weighted_assessment ?? '-'}</td>
//                       <td className="weighted">{grade?.weighted_test ?? '-'}</td>
//                       <td className="weighted">{grade?.weighted_exam ?? '-'}</td>
//                       <td className="total-val">{grade?.total_score ?? '-'}</td>
//                       <td>
//                         {grade ? (
//                           <span className={`grade-pill ${getGradeClass(grade.grade_letter)}`}>
//                             {grade.grade_letter}
//                           </span>
//                         ) : (
//                           '-'
//                         )}
//                       </td>
//                       <td className="rank">{grade?.subject_rank ? getRanking(grade.subject_rank) : '-'}</td>
//                       <td>
//                         <Link 
//                           href={{
//                             pathname: `/Home/Academics/grades/student`,
//                             query: {
//                               studentId: student.id,
//                               studentName: `${student.first_name} ${student.last_name}`,
//                               classId: selectedClass?.id,
//                               className: selectedClass?.name,
//                               academicYear: academicYear,
//                               subjectId: selectedSubject?.id,  
//                               term: term 
//                             }
//                           }}
//                           style={{
//                             padding: "6px 12px",
//                             background: grade ? "#6366f1" : "#3B82F6",
//                             color: "white",
//                             borderRadius: "6px",
//                             textDecoration: "none",
//                             display: "inline-block",
//                             fontWeight: 500,
//                             fontSize: "0.75rem"
//                           }}
//                         >
//                           {grade ? 'Edit' : 'Add'}
//                         </Link>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ) : (
//               <p style={{ padding: 20, textAlign: 'center', color: '#666' }}>
//                 {selectedClass && selectedSubject 
//                   ? "No students found in this class" 
//                   : "Please select a class and subject to view results"}
//               </p>
//             )}
//           </div>
//         </section>
//       </main>
//       <div className="footerSpace">
//         <div className="footerSpace">
//           {pagination && (
//             <Pagination
//               count={pagination.count}
//               next={pagination.next}
//               previous={pagination.previous}
//               currentPage={page}
//               onPageChange={(newPage) => setPage(newPage)}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useState, useEffect } from "react";
import "@/styles/classResult.css";
import Link from "next/link";
import { fetchWithAuth } from "@/src/lib/apiClient";
import Pagination from '@/src/assets/components/dashboard/Pagnation';

interface ClassApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    id: number;
    class_name: string;
    academic_year: string;
  }[];
}
interface SubjectApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    id: number;
    subject_name: string;
  }[];
}

interface ClassType {
  id: number;
  name: string;
}

interface SubjectType {
  id: number;
  name: string;
}
interface UserType {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "teacher" | "admin" | string;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
}

interface StudentType {
  id: number;
  user: UserType;
  parent: number | null;
  first_name: string;
  last_name: string;
  date_of_birth: string; 
  status: "active" | "inactive" | "graduated" | string;
}

interface ResultType {
  id: number;
  student: StudentType;
  assessment_score: number,
  assessment_total: number,
  test_score: number,
  test_total: number,
  exam_score: number,
  exam_total: number,
  weighted_assessment: number,
  weighted_test: number,
  weighted_exam: number,
  total_score: number,
  grade_letter: string,
  grade_date: string ,
  subject_rank: string;
}

interface StudentWithGrade {
  student: StudentType;
  grade: ResultType | null;
}
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
const api = {
  getTeacherAssignments: async () => {
    const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/`);
    if (!res.ok) throw new Error("Failed to fetch classes");
    const data = await res.json();
    return data;
  },
  getSubjects: async () => {
    const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects/`);
    if (!res.ok) throw new Error("Failed to fetch subjects for class");
    return await res.json();
  },
  getSubjectsForClass: async (classId: number) => {
    const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}/subjects/`);
    if (!res.ok) throw new Error("Failed to fetch subjects for class");
    return await res.json();
  },

  getClassesForSubject: async (subjectId: number) => {
    const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects/${subjectId}/classes/`);
    if (!res.ok) throw new Error("Failed to fetch classes for subject");
    return await res.json();
  },

  getResults: async ({
    classId,
    subjectId,
    academicYear,
    term,
  }: {
    classId: number;
    subjectId: number;
    academicYear: string;
    term: string;
  }) => {
    const res = await fetchWithAuth(
         `${process.env.NEXT_PUBLIC_API_URL}/grades/?class=${classId}&subject=${subjectId}&academic_year=${academicYear}&term=${term}`);
    if (!res.ok) throw new Error("Failed to fetch results");
    return await res.json(); 
  },
  
  getStudentsInClass: async (classId: number, page: number = 1) => {
    const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}/students/?page=${page}`);
    if (!res.ok) throw new Error("Failed to fetch students");
    return await res.json();
  },
};


export default function ClassResults() {
  const [assignedClasses, setAssignedClasses] = useState<ClassType[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<SubjectType[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassType[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<SubjectType[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | null>(null);
  const [academicYear, setAcademicYear] = useState<string>("2025-26");
  const [term, setTerm] = useState<string>("first");

  const [studentsWithGrades, setStudentsWithGrades] = useState<StudentWithGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedYear, setSelectedYear] = useState('2025-26');
  const [pagination, setPagination] = useState<PaginatedResponse<StudentWithGrade> | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
  interface ClassApiResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: {
      id: number;
      class_name: string;
      academic_year: string;
    }[];
  }

  interface SubjectApiResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: {
      id: number;
      subject_name: string;
    }[];
  }

  async function initAssignments() {

    const classResponse: ClassApiResponse = await api.getTeacherAssignments(); 
    const classes: ClassType[] = classResponse.results.map((c) => ({
      id: c.id,
      name: c.class_name,
    }));
    setAssignedClasses(classes);
    setAvailableClasses(classes);

    const subjectsResponse: SubjectApiResponse = await api.getSubjects(); 
    const subjects: SubjectType[] = subjectsResponse.results.map((s) => ({
      id: s.id,
      name: s.subject_name,
    }));
    setAssignedSubjects(subjects);
    setAvailableSubjects(subjects);

    if (classes.length && subjects.length) {
      setMessage("");
    } else if (classes.length && !subjects.length) {
      setMessage("No subjects available yet.");
    } else if (!classes.length && subjects.length) {
      setMessage("No classes assigned yet.");
    } else {
      setMessage("You are not yet assigned to any class or subject.");
    }
  }

    initAssignments();
  }, []);

    const generateAcademicYears = (
    startYear: number,
    count: number
    ): string[] => {
    return Array.from({ length: count }, (_, i) => {
        const year = startYear - i;
        return `${year}-${String(year + 1)}`;
    });
    };
    const academicYears = generateAcademicYears(2025, 5);

  useEffect(() => {
    async function loadSubjects() {
      if (!selectedClass) return;

      if (!assignedSubjects.length) {
        const subjects = await api.getSubjectsForClass(selectedClass.id);
        setAvailableSubjects(subjects);
      }

      fetchResults();
    }

    loadSubjects();
  }, [selectedClass]);
  
  useEffect(() => {
    fetchResults();
  }, [academicYear, term, page]);

  const handleYearSelect = (val: string)=>{
    setSelectedYear(val);
     setAcademicYear(val)
  }
  
  useEffect(() => {
    async function loadClasses() {
      if (!selectedSubject) return;

      if (!assignedClasses.length) {
        const classes = await api.getClassesForSubject(selectedSubject.id);
        setAvailableClasses(classes);
      }

      fetchResults();
    }

    loadClasses();
  }, [selectedSubject]);

  async function fetchResults() {
    if (!selectedClass || !selectedSubject) return;
    setLoading(true);
    
    try {
      // Fetch both students and grades with pagination
      const [studentsData, gradesData] = await Promise.all([
        api.getStudentsInClass(selectedClass.id, page),
        api.getResults({
          classId: selectedClass.id,
          subjectId: selectedSubject.id,
          academicYear,
          term,
        })
      ]);

      const students: StudentType[] = studentsData.results || studentsData;
      const grades: ResultType[] = gradesData.results || [];

      const gradeMap = new Map<number, ResultType>();
      grades.forEach(grade => {
        gradeMap.set(grade.student.id, grade);
      });

      const merged: StudentWithGrade[] = students.map(student => ({
        student,
        grade: gradeMap.get(student.id) || null
      }));

      setStudentsWithGrades(merged);
      
      // Set pagination metadata
      setPagination({
        count: studentsData.count,
        next: studentsData.next,
        previous: studentsData.previous,
        results: merged
      });
    } catch (error) {
      console.error("Error fetching results:", error);
      setStudentsWithGrades([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getRanking = (rankStr: string | null | undefined) => {
    const baseStyle = {
      padding: "6px 12px",
      borderRadius: "8px",
      fontWeight: "bold",
      display: "inline-block",
      minWidth: "45px",
      textAlign: "center" as const,
      fontSize: "0.85rem",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
    };
    const suffixes: Record<number, string> = { 1:'st', 2: "nd", 3: "rd", 4: "th", 5: "th" };
    const rankNum = rankStr ? parseInt(rankStr, 10) : 'N/A';
    const rankNumParsed = typeof rankNum === 'string' ? NaN : rankNum;

    if (rankNumParsed === 1) {
      return (
        <div style={{ 
          ...baseStyle, 
          background: "linear-gradient(135deg, #FFD700, #FDB931)", 
          color: "#78350F",
          border: "1px solid #B45309",
          transform: "scale(1.1)" 
        }}>
          {rankNumParsed}{suffixes[rankNumParsed]}
        </div>
      );
    }
    if (rankNumParsed === 2 ) {
      
      return (
        <div style={{ 
          ...baseStyle, 
          background: "#045ce0", 
          color: "#ffffff", 
          border: "1px solid #DBEAFE" 
        }}>
          {rankNumParsed}{suffixes[rankNumParsed]}
        </div>
      );
    }
    if (rankNumParsed === 3 ) {
      
      return (
        <div style={{ 
          ...baseStyle, 
          background: "#b3721e", 
          color: "#ffffff", 
          border: "1px solid #dce709" 
        }}>
          {rankNumParsed}{suffixes[rankNumParsed]}
        </div>
      );
    }

    if (rankNumParsed === 4 ) {
      
      return (
        <div style={{ 
          ...baseStyle, 
          background: "#0e9165", 
          color: "#ffffff", 
          border: "1px solid #DBEAFE" 
        }}>
          {rankNumParsed}{suffixes[rankNumParsed]}
        </div>
      );
    }

        if (rankNumParsed === 5 ) {
      
      return (
        <div style={{ 
          ...baseStyle, 
          background: "#077692", 
          color: "#ffffff", 
          border: "1px solid #DBEAFE" 
        }}>
          {rankNumParsed}{suffixes[rankNumParsed]}
        </div>
      );
    }
    

    return (
      <div style={{ ...baseStyle, background: "#F1F5F9", color: "#475569" }}>
        {rankNum}th
      </div>
    );
};

  const getGradeClass = (gradeLetter: string): string => {
    const grade = gradeLetter.toLowerCase();
    if (grade.startsWith('a')) return 'a';
    if (grade.startsWith('b')) return 'b';
    if (grade.startsWith('c')) return 'c';
    if (grade.startsWith('d')) return 'd';
    return 'f';
  };

  return (
    <div className="results-container">
      <main className="content">
        {/* Header */}
        <header className="main-header">
          <div className="breadcrumb">
            Reports / <strong>Class Results & Grading</strong>
          </div>
          <div className="header-right">
            <div className="header-icons" style={{ marginRight: 20, cursor: "pointer" }}>🔔 ⚙️</div>
            <div className="profile-chip">
              <div className="profile-info" style={{ textAlign: "right" }}>
                <span className="name" style={{ display: "block", fontWeight: 600 }}>Alex Sterling</span>
                <span className="role" style={{ fontSize: 10, color: "var(--text-muted)" }}>ADMINISTRATOR</span>
              </div>
              <div className="avatar"></div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <section className="controls-card">
          <div className="dropdown-group">
           <select
              className="nav-select short"
              value={selectedYear}
              onChange={(e) => handleYearSelect(e.target.value)}
          >
              {academicYears.map((year) => (
              <option key={year} value={year}>
                  {year}
              </option>
              ))}
          </select>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            >
              <option value="first">First Term</option>
              <option value="second">Second Term</option>
              <option value="third">Third Term</option>
            </select>
            <select
              value={selectedClass?.id || ""}
              onChange={(e) => {
                const cls = availableClasses.find(c => c.id === Number(e.target.value)) || null;
                setSelectedClass(cls);
                setPage(1); // Reset to page 1 when class changes
              }}
            >
              <option value="">Select Class</option>
              {availableClasses.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            <select
              value={selectedSubject?.id || ""}
              onChange={(e) => {
                const subj = availableSubjects.find(s => s.id === Number(e.target.value)) || null;
                setSelectedSubject(subj);
                setPage(1); // Reset to page 1 when subject changes
              }}
            >
              <option value="">Select Subject</option>
              {availableSubjects.map(subj => (
                <option key={subj.id} value={subj.id}>{subj.name}</option>
              ))}
            </select>
          </div>
        </section>

        {message && <p style={{ padding: 10, color: "#555" }}>{message}</p>}

        {/* Table */}
        <section className="table-container">
          <div className="table-wrapper">
            {loading ? (
              <p style={{ padding: 20, textAlign: 'center' }}>Loading results...</p>
            ) : studentsWithGrades.length > 0 ? (
              <table className="results-table">
                <thead>
                  <tr>
                    <th className="sticky-col">Student Name</th>
                    <th>Status</th>
                    <th>Asmt Score</th>
                    <th>Asmt Total</th>
                    <th>Test Score</th>
                    <th>Test Total</th>
                    <th>Exam Score</th>
                    <th>Exam Total</th>
                    <th className="weighted">Asmt (20%)</th>
                    <th className="weighted">Test (30%)</th>
                    <th className="weighted">Exam (50%)</th>
                    <th className="total-col">Overall Total</th>
                    <th>Grade</th>
                    <th>Rank</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsWithGrades.map(({ student, grade }) => (
                    <tr key={student.id} style={{ backgroundColor: grade ? 'white' : '#fef9e7' }}>
                      <td className="sticky-col">
                        <Link 
                          href={{
                            pathname: `/Home/Academics/grades/student`,
                            query: {
                              studentId: student.id,
                              studentName: `${student.first_name} ${student.last_name}`,
                              classId: selectedClass?.id,
                              className: selectedClass?.name,
                              academicYear: academicYear,
                              subjectId: selectedSubject?.id,  
                              term: term 
                            }
                          }}
                        >
                          <strong>{student.first_name} {student.last_name}</strong>
                        </Link>
                      </td>
                      <td>
                        {grade ? (
                          <span style={{
                            padding: "4px 8px",
                            background: "#d1fae5",
                            color: "#065f46",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 600
                          }}>
                            Graded
                          </span>
                        ) : (
                          <span style={{
                            padding: "4px 8px",
                            background: "#fee2e2",
                            color: "#991b1b",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 600
                          }}>
                            Pending
                          </span>
                        )}
                      </td>
                      <td>{grade?.assessment_score ?? '-'}</td>
                      <td>{grade?.assessment_total ?? '-'}</td>
                      <td>{grade?.test_score ?? '-'}</td>
                      <td>{grade?.test_total ?? '-'}</td>
                      <td>{grade?.exam_score ?? '-'}</td>
                      <td>{grade?.exam_total ?? '-'}</td>
                      <td className="weighted">{grade?.weighted_assessment ?? '-'}</td>
                      <td className="weighted">{grade?.weighted_test ?? '-'}</td>
                      <td className="weighted">{grade?.weighted_exam ?? '-'}</td>
                      <td className="total-val">{grade?.total_score ?? '-'}</td>
                      <td>
                        {grade ? (
                          <span className={`grade-pill ${getGradeClass(grade.grade_letter)}`}>
                            {grade.grade_letter}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="rank">{grade?.subject_rank ? getRanking(grade.subject_rank) : '-'}</td>
                      <td>
                        <Link 
                          href={{
                            pathname: `/Home/Academics/grades/student`,
                            query: {
                              studentId: student.id,
                              studentName: `${student.first_name} ${student.last_name}`,
                              classId: selectedClass?.id,
                              className: selectedClass?.name,
                              academicYear: academicYear,
                              subjectId: selectedSubject?.id,  
                              term: term 
                            }
                          }}
                          style={{
                            padding: "6px 12px",
                            background: grade ? "#6366f1" : "#3B82F6",
                            color: "white",
                            borderRadius: "6px",
                            textDecoration: "none",
                            display: "inline-block",
                            fontWeight: 500,
                            fontSize: "0.75rem"
                          }}
                        >
                          {grade ? 'Edit' : 'Add'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                {selectedClass && selectedSubject 
                  ? "No students found in this class" 
                  : "Please select a class and subject to view results"}
              </p>
            )}
          </div>
        </section>
      </main>
      <div className="footerSpace">
        {pagination && pagination.count > 0 && (
          <Pagination
            count={pagination.count}
            next={pagination.next}
            previous={pagination.previous}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}