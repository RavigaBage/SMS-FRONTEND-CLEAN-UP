"use client";

import React, { useState } from 'react';
import '@/styles/attendance.css';

type AttendanceStatus = 'present' | 'absent' | 'none';

interface Student {
  id: string;
  name: string;
  avatar: string;
  bg: string;
  status: AttendanceStatus;
  note: string;
}

export default function AttendanceRoster() {
  const [students, setStudents] = useState<Student[]>([
    { id: '2023-8492', name: 'Alex Johnson', avatar: 'AJ', bg: '#FED7AA', status: 'present', note: '' },
    { id: '2023-9104', name: 'Sarah Miller', avatar: 'SM', bg: '#BAE6FD', status: 'absent', note: 'Medical leave' },
  ]);

  const updateStatus = (id: string, status: AttendanceStatus) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const markAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'present' })));
  };

  return (
    <div className="attendance-wrapper">
      <main className="content">
        <header className="main-header">
          <div>
            <div className="breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Attendance / <strong>Daily Roster</strong>
            </div>
            <div className="title-row">
              <h1>Grade 10-B Attendance</h1>
              <span className="date-badge">Jan 23, 2026</span>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
              First Semester | Total Students: {students.length}
            </p>
          </div>
          <button className="btn-secondary" style={{ padding: '8px 16px' }}>Change Class</button>
        </header>

        <section className="action-bar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Filter by name or ID..." 
              style={{ padding: '10px 15px', borderRadius: '20px', border: '1px solid var(--border)', width: '300px' }} 
            />
          </div>
          <div className="bulk-actions" style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" onClick={markAllPresent}>Mark All Present</button>
            <button className="btn-primary">Save Attendance</button>
          </div>
        </section>

        <section className="table-card">
          <table className="attendance-table">
            <thead>
              <tr>
                <th >Avatar</th>
                <th>Student Name</th>
                <th>Student ID</th>
                <th style={{ textAlign: 'center' }}>Present</th>
                <th style={{ textAlign: 'center' }}>Absent</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className={`student-row is-${student.status}`}>
                  <td>
                    <div className="avatar-circle" style={{ background: student.bg }}>{student.avatar}</div>
                  </td>
                  <td><strong>{student.name}</strong></td>
                  <td>{student.id}</td>
                  <td style={{ textAlign: 'center' }}>
                    <label className="status-toggle">
                      <input 
                        type="radio" 
                        name={`st-${student.id}`} 
                        checked={student.status === 'present'} 
                        onChange={() => updateStatus(student.id, 'present')} 
                      />
                      <span className="icon-box tick">✓</span>
                    </label>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <label className="status-toggle">
                      <input 
                        type="radio" 
                        name={`st-${student.id}`} 
                        checked={student.status === 'absent'} 
                        onChange={() => updateStatus(student.id, 'absent')} 
                      />
                      <span className="icon-box dash">—</span>
                    </label>
                  </td>
                  <td>
                    <input type="text" className="note-input" placeholder="Add note..." defaultValue={student.note} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}