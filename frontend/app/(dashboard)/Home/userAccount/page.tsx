"use client";

import React, { useState } from 'react';
import '@/styles/userAcc.css';

export default function UserAccounts() {
  const [isModalOpen, setModalOpen] = useState(false);

  const userData = [
    { id: 1, name: "Kwame Boateng", role: "Teacher", email: "kwame.boateng@example.com", status: "Active", lastLogin: "2026-01-20 08:45" },
    { id: 2, name: "Akosua Mensah", role: "Administrator", email: "akosua.mensah@example.com", status: "Inactive", lastLogin: "2026-01-18 14:32" },
  ];

  return (
    <div className="dashboardWrapper">
      <div className="dashboard">
        
        {/* Header */}
        <header className="header">
          <div>
            <h1>User Accounts</h1>
            <p>Manage system users, roles, and access</p>
          </div>
          <button className="primaryBtn" >
            Create User
          </button>
        </header>

        {/* Search and Filters */}
        <div className="controls">
          <input type="text" placeholder="Search by name or email" />
          <select>
            <option>All Roles</option>
            <option>Administrator</option>
            <option>Teacher</option>
            <option>Student</option>
          </select>
          <select>
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Users Table */}
        <main className="card">
          <table className="userTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userData.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 600 }}>{user.name}</td>
                  <td>{user.role}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`statusBadge ${user.status === 'Active' ? 'activeStatus' : 'inactiveStatus'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.lastLogin}</td>
                  <td>
                    <div className="actionGroup">
                      <button className="actionBtn btnEdit">Edit</button>
                      <button className="actionBtn btnDeactivate">Deactivate</button>
                      <button className="actionBtn btnReset">Reset Password</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button className="pageBtn active">1</button>
            <button className="pageBtn">2</button>
            <button className="pageBtn">3</button>
            <button className="pageBtn">Next</button>
          </div>
        </main>

        {/* Modal Component */}
        {isModalOpen && (
          <div className="modalOverlay" onClick={() => setModalOpen(false)}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              <h2>Create New User</h2>
              
              <label className="modalLabel">Full Name</label>
              <input className="modalInput" type="text" placeholder="Enter full name" />

              <label className="modalLabel">Email</label>
              <input className="modalInput" type="email" placeholder="Enter email" />

              <label className="modalLabel">Role</label>
              <select className="modalInput">
                <option>Select Role</option>
                <option>Administrator</option>
                <option>Teacher</option>
                <option>Student</option>
              </select>

              <label className="modalLabel">Status</label>
              <select className="modalInput">
                <option>Active</option>
                <option>Inactive</option>
              </select>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="secondaryBtn" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="primaryBtn">Create User</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}