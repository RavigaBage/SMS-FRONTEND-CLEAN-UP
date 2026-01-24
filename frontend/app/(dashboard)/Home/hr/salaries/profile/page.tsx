import React from 'react';
import '@/styles/salariesmain.css';

const PaymentHistory = [
  { month: 'Oct 2025', basic: 3500, allowance: 650, deduction: 500, net: 3650, status: 'Paid' },
  { month: 'Sep 2025', basic: 3500, allowance: 420, deduction: 500, net: 3420, status: 'Paid' },
];

const SalaryProfile = () => {
  return (
    <div className="dashboard-container">
      <main className="content">
        <header style={{ marginBottom: '20px' }}>
          <div className="breadcrumb">Payroll / <strong>Salary Profile</strong></div>
        </header>

        <section className="staff-header-card">
          <div className="staff-info">
            <div className="staff-avatar-lg" style={{ background: '#E0F2FE', width: 64, height: 64, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary-blue)' }}>RM</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{ fontSize: '22px', margin: 0 }}>Robert Miller</h1>
                <span className="status-pill">Active Payroll</span>
              </div>
              <p style={{ margin: '5px 0', color: 'var(--text-muted)' }}>ID: <strong>TCH-2021-112</strong> • Mathematics • Senior Teacher</p>
            </div>
          </div>
          <button style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border)', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Adjust Salary</button>
        </section>

        <section className="summary-grid">
          <StatCard label="Basic Salary" value="$3,500.00" />
          <StatCard label="Avg. Allowances" value="$650.00" />
          <StatCard label="Avg. Deductions" value="-$500.00" isNegative />
          <StatCard label="Current Net Pay" value="$3,650.00" isHighlight />
        </section>

        

        <section className="table-card">
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0 }}>Payment History</h3>
          </div>
          <table className="history-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Basic Salary</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {PaymentHistory.map((row, idx) => (
                <tr key={idx}>
                  <td><strong>{row.month}</strong></td>
                  <td>${row.basic.toLocaleString()}</td>
                  <td>${row.allowance.toLocaleString()}</td>
                  <td>${row.deduction.toLocaleString()}</td>
                  <td><strong>${row.net.toLocaleString()}</strong></td>
                  <td><span className="paid-badge">{row.status}</span></td>
                  <td style={{ textAlign: 'right' }}><button style={{ color: 'var(--primary-blue)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>View Payslip</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, isHighlight, isNegative }: any) => (
  <div className={`stat-card ${isHighlight ? 'highlight' : ''}`}>
    <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>{label}</label>
    <div className={`val ${isNegative ? 'red' : ''}`}>{value}</div>
  </div>
);

export default SalaryProfile;