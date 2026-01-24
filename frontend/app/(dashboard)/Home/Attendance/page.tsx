"use client";

import React from 'react';
import '@/styles/attentry.css';

const CLASSES = [
  { id: '1', code: '10B', name: 'Grade 10-B', level: 'Senior Secondary', teacher: 'Mrs. Emily Davis', students: 32, isCompleted: false },
  { id: '2', code: '10A', name: 'Grade 10-A', level: 'Senior Secondary', teacher: 'Mr. Robert Miller', students: 28, isCompleted: false },
  { id: '3', code: '9C', name: 'Grade 9-C', level: 'Junior Secondary', teacher: 'Ms. Sarah Wilson', students: 30, isCompleted: true },
];

export default function AttendanceSelection() {
  return (
    <div className="attendance-container">
      <main className="content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Attendance / <strong>Select Class</strong></div>
            <h1 style={{ margin: '8px 0 4px', fontSize: '28px' }}>Take Daily Attendance</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Select a class to mark attendance for today</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>ATTENDANCE DATE</label>
            <input type="date" defaultValue="2026-01-23" style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600 }} />
          </div>
        </header>

        <section className="filter-bar">
          <FilterItem label="Academic Year" options={['2025 - 2026']} />
          <FilterItem label="Term" options={['First Term', 'Second Term']} />
        </section>

        <section className="class-grid">
          {CLASSES.map((cls) => (
            <ClassCard key={cls.id} cls={cls} />
          ))}
        </section>
      </main>
    </div>
  );
}

function ClassCard({ cls }: { cls: any }) {
  return (
    <div className={`class-card ${cls.isCompleted ? 'completed' : ''}`}>
      <div className="card-top">
        <div className="class-icon">{cls.code}</div>
        <div className="class-meta">
          <h3 style={{ margin: 0, fontSize: '16px' }}>{cls.name}</h3>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{cls.level}</p>
        </div>
      </div>
      
      <div className="card-details">
        {cls.isCompleted ? (
          <div className="detail-row">
            <span>Status:</span>
            <span className="status-pill completed">Completed Today</span>
          </div>
        ) : (
          <>
            <div className="detail-row">
              <span>Assigned Teacher:</span>
              <strong>{cls.teacher}</strong>
            </div>
            <div className="detail-row">
              <span>Student Count:</span>
              <strong>{cls.students} Students</strong>
            </div>
          </>
        )}
      </div>

      <button className={cls.isCompleted ? "btn-secondary" : "btn-attendance"}>
        {cls.isCompleted ? "View Records" : "Take Attendance"}
      </button>
    </div>
  );
}

function FilterItem({ label, options }: { label: string; options: string[] }) {
  return (
    <div className="filter-item">
      <label>{label}</label>
      <select>
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
    </div>
  );
}