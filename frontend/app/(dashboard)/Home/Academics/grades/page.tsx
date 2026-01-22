import React from 'react';
import '@/styles/grades.css';

export default function GradesManagement() {
  const gradesData = [
    { id: 1, name: "Kwame Boateng", class: "Grade 6A", subject: "Mathematics", score: 88, grade: "A", remark: "Excellent performance" },
    { id: 2, name: "Akosua Mensah", class: "JHS 2B", subject: "English Language", score: 74, grade: "B", remark: "Very good" },
    { id: 3, name: "Yaw Owusu", class: "SHS 1 Science", subject: "Integrated Science", score: 61, grade: "C", remark: "Good effort" },
    { id: 4, name: "Adwoa Serwaa", class: "JHS 2B", subject: "Mathematics", score: 49, grade: "D", remark: "Needs improvement" },
  ];

  // Helper to apply specific grade styles
  const getGradeClass = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A': return 'gradeA';
      case 'B': return 'gradeB';
      case 'C': return 'gradeC';
      case 'D': return 'gradeD';
      default: return '';
    }
  };

  return (
    <div className="dashboardWrapper">
      <div className="dashboard">
        
        {/* Header */}
        <header className="header">
          <h1>Grades Management</h1>
          <p>View and analyze student academic performance</p>
        </header>

        {/* Filters */}
        <section className="filters">
          <select aria-label="Term">
            <option>Term</option>
            <option>Term 1</option>
            <option>Term 2</option>
            <option>Term 3</option>
          </select>

          <select aria-label="Class">
            <option>Class</option>
            <option>Grade 6A</option>
            <option>JHS 2B</option>
            <option>SHS 1 Science</option>
          </select>

          <select aria-label="Subject">
            <option>Subject</option>
            <option>Mathematics</option>
            <option>English Language</option>
            <option>Integrated Science</option>
          </select>
        </section>

        {/* Table */}
        <main className="tableCard">
          <table className="gradesTable">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {gradesData.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600 }}>{row.name}</td>
                  <td>{row.class}</td>
                  <td>{row.subject}</td>
                  <td className="score">{row.score}</td>
                  <td>
                    <span className={`grade ${getGradeClass(row.grade)}`}>
                      {row.grade}
                    </span>
                  </td>
                  <td className="remark">{row.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>

        <div className="footerSpace"></div>
      </div>
    </div>
  );
}