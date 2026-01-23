"use client";

import React, { useState } from 'react';
import '@/styles/permission.css';

export default function PermissionsManagement() {
  const [isModalOpen, setModalOpen] = useState(false);

  const modules = [
    "Students", "Staff", "Classes", "Attendance", 
    "Exams", "Finance", "Reports", "Settings"
  ];

  const rolesData = [
    { role: "Administrator", perms: [true, true, true, true, true, true, true, true] },
    { role: "Teacher", perms: [true, false, true, true, true, false, false, false] },
    { role: "Accountant", perms: [false, false, false, false, false, true, false, false] },
  ];

  return (
    <div className="dashboardWrapper">
      <div className="dashboard">
        
        {/* Header */}
        <header className="header">
          <div>
            <h1>Permissions Management</h1>
            <p>Configure roles and module access for users</p>
          </div>
          <button className="primaryBtn" onClick={() => setModalOpen(true)}>
            Create Role
          </button>
        </header>

        {/* Permissions Matrix */}
        <main className="card">
          <table className="permissionsTable">
            <thead>
              <tr>
                <th>Role</th>
                {modules.map(mod => <th key={mod}>{mod}</th>)}
              </tr>
            </thead>
            <tbody>
              {rolesData.map((data, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{data.role}</td>
                  {data.perms.map((val, pIdx) => (
                    <td key={pIdx}>
                      <label className="switch">
                        <input type="checkbox" defaultChecked={val} />
                        <span className="slider"></span>
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </main>

        {/* Create Role Modal */}
        {isModalOpen && (
          <div className="modalOverlay" onClick={() => setModalOpen(false)}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              <h2>Create Custom Role</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                Define the role name and initial module access.
              </p>

              <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '8px' }}>
                Role Name
              </label>
              <input 
                type="text" 
                placeholder="e.g. Librarian" 
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '20px' }} 
              />

              <div className="permissionGrid">
                {modules.map(mod => (
                  <div key={mod} className="permissionItem">
                    <span>{mod}</span>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button className="secondaryBtn" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="primaryBtn" onClick={() => setModalOpen(false)}>Create Role</button>
              </div>
            </div>
          </div>
        )}

        <div className="footerSpace"></div>
      </div>
    </div>
  );
}