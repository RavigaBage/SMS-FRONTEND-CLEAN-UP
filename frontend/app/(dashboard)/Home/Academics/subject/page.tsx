import React from 'react';
import '@/styles/subjects.css'
export default function SubjectsManagement() {
  const subjectsData = [
    {
      id: 1,
      name: "Mathematics",
      level: "Grade 6",
      teacher: "Mr. Daniel Mensah",
      isActive: true
    },
    {
      id: 2,
      name: "English Language",
      level: "JHS",
      teacher: "Mrs. Linda Asare",
      isActive: true
    },
    {
      id: 3,
      name: "Integrated Science",
      level: "SHS",
      teacher: "—",
      isActive: false
    }
  ];

  return (
    <div className="dashboardWrapper">
      <div className="dashboard">
        
        {/* Header */}
        <header className="header">
          <div>
            <h1>Subjects Management</h1>
            <p>Manage academic subjects and teacher assignments</p>
          </div>
          <button className="primaryBtn">Add Subject</button>
        </header>

        {/* Table Card */}
        <main className="tableCard">
          <table className="subjectTable">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Class Level</th>
                <th>Assigned Teacher</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjectsData.map((subject) => (
                <tr key={subject.id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{subject.name}</td>
                  <td>{subject.level}</td>
                  <td>{subject.teacher}</td>
                  <td>
                    <span className={`status ${subject.isActive ? 'statusActive' : 'statusInactive'}`}>
                      {subject.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="actionGroup">
                      <button className="actionBtn btnEdit">Edit</button>
                      <button className="actionBtn btnAssign">Assign Teacher</button>
                    </div>
                  </td>
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