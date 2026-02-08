'use client';
import '@/styles/transcript_home.css'
import Link from "next/link";

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/src/lib/apiClient';

type StudentRow = {
  id: number;
  full_name: string;
  student_id: string;
  class_name: string;
  status: "active" | "on_leave";
};
type SummaryRow = {
    total: number;
    active: number;
    on_leave: number;
};
export type StudentResponse = {
  summary: {
    total: number;
    active: number;
    on_leave: number;
  };
  students: {
    id: number;
    full_name: string;
    student_id: string;
    class_name: string;
    status: "active" | "on_leave";
  }[];
};
export interface UserInfo {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
}
export interface Teacher {
  id: number;
  user: UserInfo;
  first_name: string;
  last_name: string;
  specialization: string;
}
export interface ClassData {
  id: number;
  class_name: string;
  teachers: Teacher[];
}

export interface ClassesBase {
  count: number;
  next: string | null;
  previous: string | null;
  results: ClassData[];
}


export async function fetchStudentsByClass(
  className: string,
  academicYear: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const url =
    `${baseUrl}/enrollments/` +
    `?class=${encodeURIComponent(className)}` +
    `&academic_year=${encodeURIComponent(academicYear)}`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    throw new Error("Failed to fetch students");
  }

  return response.json();
}


export default function TranscriptHome() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [Classes, setClasses] = useState<ClassData[]>([]);
  const [summary, setSummary] = useState<SummaryRow>({ total: 0, active: 0, on_leave: 0 });
  const [selectedClass, setSelectedClass] = useState('Grade 10-B');
  const [selectedYear, setSelectedYear] = useState('2025/26');
  const [Pagnation,setPagnation] = useState("")
  useEffect(() => {
    loadData();
  }, [selectedClass, selectedYear]);

    const fetchClasses = async () => {
      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/classes/`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN_VAL}`,
              "Content-Type": "application/json",
            },
          }
        );
    
        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }
    
        const data: ClassesBase = await res.json();
        
    
        if (data && data.results) {
          setClasses(data.results);
        } else {
          console.warn("API returned success but results array is missing:", data);
        }
        
      } catch (err) {
        console.error("Failed to load Classes:", err);
      }
    };
    useEffect(()=>{
        fetchClasses();
    })

    const loadData = async () => {
        try {
            const data = await fetchStudentsByClass(selectedClass, selectedYear);

            setStudents(data.results);
            setPagnation(data.next);
            setSummary({
            total: data.count,
            active: data.results.filter((s: any) => s.status === "active").length,
            on_leave: data.results.filter((s: any) => s.status === "on_leave").length,
            });
        } catch (err) {
            console.error("Error loading students:", err);
        }
    };
    const generateAcademicYears = (
    startYear: number,
    count: number
    ): string[] => {
    return Array.from({ length: count }, (_, i) => {
        const year = startYear - i;
        return `${year}-${String(year + 1)}`;
    });
    };
    const academicYears = generateAcademicYears(2030, 10);


    return(
        <div className="dashboard-container">

            <main className="content">
                <header className="main-header">
                    <div className="nav-filters">
                        <div className="filter-group">
                            <label>Select Class</label>
                            <select className="nav-select">
                                <option>Select Class</option>
                                {
                                    Classes && (
                                        Classes.map((c,index)=>(
                                            <option key={`peskey${c.id} paskey${index}`} value={c.id}>
                                                {c.class_name}
                                            </option>
                                        ))
                                    )}:(
                                        <option>No classes to show, add contact administration to add a class</option>
                                    )
                            </select>
                        </div>
                        <div className="filter-group">
                        <label>Year</label>
                        <select
                            className="nav-select short"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            {academicYears.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                            ))}
                        </select>
                        </div>

                    </div>
                    
                    <div className="header-right">
                        <div className="search-box">
                            <input type="text" placeholder="Search name or ID..." />
                        </div>
                        <div className="header-icons">🔔</div>
                        <div className="avatar-small"></div>
                    </div>
                </header>

                <section className="summary-grid">
                    <div className="stat-card">
                        <label>TOTAL STUDENTS</label>
                        <div className="val">{summary?.total ?? 0}</div>
                    </div>

                    <div className="stat-card">
                        <label>ACTIVE STUDENTS</label>
                        <div className="val">{summary?.active ?? 0}</div>
                        {summary?.on_leave > 0 && (
                        <span className="sub-text">{summary.on_leave} On Leave</span>
                        )}
                    </div>

                    <div className="stat-card">
                        <label>ACADEMIC YEAR</label>
                        <div className="val">{selectedYear}</div>
                    </div>
                </section>


                <section className="table-card">
                    <table className="student-list-table">
                        <thead>
                            <tr>
                                <th>Avatar</th>
                                <th>Student Name</th>
                                <th>Student ID</th>
                                <th>Class</th>
                                <th>Status</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student: any) => (
                                <tr key={student.id}>
                                <td>
                                    <div className="student-avatar">
                                        <img src={`https://ui-avatars.com/api/?name=${student.student.first_name}+${student.student.last_name}&background=random`} />
                                    </div>
                                </td>

                                <td>
                                    <strong>
                                    {student.student.first_name} {student.student.last_name}
                                    </strong>
                                </td>

                                <td>
                                    {}{student.student.admission_number ?? "—"}
                                </td>

                                <td>
                                    {selectedClass}
                                </td>

                                <td>
                                    <span
                                    className={`status-pill ${
                                        student.student.status === "active" ? "active" : "leave"
                                    }`}
                                    >
                                    {student.student.status === "active" ? "Active" : "On Leave"}
                                    </span>
                                </td>

                                <td className="text-right">
                                    <Link
                                    href={`/Home/Academics/transcripts/student/${student.student.id}`}
                                    >
                                    <button className="btn-table">View Transcript</button>
                                    </Link>
                                </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="pagination">
                        <span className="page-info">Showing 1-10 of 32 Students</span>
                        <div className="page-btns">
                            <button className="page-btn active">1</button>
                            <Link href={`/Home/Academics/transcripts?page=2`}><button className="page-btn">2</button></Link>
                            <button className="page-btn">3</button>
                            <button className="page-btn">Next</button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
