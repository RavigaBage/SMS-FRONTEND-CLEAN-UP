import React from 'react';
import '@/styles/transcripts.css'

export default function StudentTranscript() {
  const academicRecords = [
    { subject: "Mathematics", term: "Term 1", score: 88, grade: "A", remark: "Excellent" },
    { subject: "English Language", term: "Term 1", score: 74, grade: "B", remark: "Very Good" },
    { subject: "Integrated Science", term: "Term 1", score: 61, grade: "C", remark: "Good Effort" },
    { subject: "Social Studies", term: "Term 1", score: 92, grade: "A", remark: "Outstanding" },
  ];

  const student = {
    name: "Kwame Boateng",
    class: "Grade 6A",
    year: "2024 / 2025",
    admissionNo: "2024/06A/015",
    gpa: "3.8",
    rank: "5 / 60",
    status: "Promoted to next grade"
  };

  return (
    <div className="dashboardWrapper">
      <div className="dashboard">
        
        {/* Header */}
        <header className="header">
          <div>
            <h1>Student Transcripts</h1>
            <p>View, generate, and export student academic transcripts</p>
          </div>
          <div className="actions">
            <button className="secondaryBtn">Generate New</button>
            <button className="primaryBtn">Download PDF</button>
            <button className="secondaryBtn" >Print</button>
          </div>
        </header>

        {/* Transcript Card */}
        <main className="card">
          
          {/* Student Info Section */}
          <section className="studentInfo">
            <div className="studentPhoto">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="studentDetails">
              <h2>{student.name}</h2>
              <p>{student.class} | Academic Year: {student.year}</p>
              <p>Admission No: {student.admissionNo}</p>
            </div>
          </section>

          {/* Table */}
          <table className="transcriptTable">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Term</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {academicRecords.map((record, index) => (
                <tr key={index}>
                  <td>{record.subject}</td>
                  <td>{record.term}</td>
                  <td className="gradeCell">{record.score}</td>
                  <td className="gradeCell">{record.grade}</td>
                  <td className="remarkCell">{record.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* GPA and Summary Footer */}
          <footer className="summarySection">
            <div className="summaryItem">
              <h3>GPA</h3>
              <p>{student.gpa}</p>
            </div>
            <div className="summaryItem">
              <h3>Class Rank</h3>
              <p>{student.rank}</p>
            </div>
            <div className="summaryItem">
              <h3>Final Status</h3>
              <p style={{ color: 'var(--emerald)' }}>{student.status}</p>
            </div>
          </footer>
        </main>

        <div className="footerSpace"></div>
      </div>
    </div>
  );
}