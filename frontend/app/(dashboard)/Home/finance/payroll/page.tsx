import '@/styles/payroll.css';
export default function payroll(){
    return(
<div className="container">
  <header className="header">
    <div className="header-text">
      <h1 className="page-title">Payroll Management</h1>
      <p className="page-subtitle">
        Manage staff compensations and financial disbursement.
      </p>
    </div>

    <div className="header-actions">
      <select className="month-picker">
        <option>January 2026</option>
        <option>December 2025</option>
        <option>November 2025</option>
      </select>

      <button className="btn btn-outline">
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        Export CSV
      </button>

      <button className="btn btn-teal">
        <svg width="16" height="16" viewBox="0 0 24 24">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
        Run Payroll
      </button>
    </div>
  </header>

  <section className="stats-grid">
    <div className="stat-card">
      <span className="stat-label">Total Gross Payroll</span>
      <div className="stat-value">$142,500.00</div>
      <div className="stat-trend trend-up">▲ 2.4% from last month</div>
    </div>

    <div className="stat-card">
      <span className="stat-label">Total Allowances</span>
      <div className="stat-value">$12,840.00</div>
    </div>

    <div className="stat-card">
      <span className="stat-label">Total Deductions</span>
      <div className="stat-value stat-danger">$8,420.00</div>
    </div>

    <div className="stat-card">
      <span className="stat-label">Net Disbursed</span>
      <div className="stat-value stat-success">$146,920.00</div>
    </div>
  </section>

  <section className="table-card">
    <div className="table-header">
      <h3 className="table-title">Staff Salary Records</h3>

      <div className="table-tools">
        <input
          type="text"
          className="search-input"
          placeholder="Search staff..."
        />
      </div>
    </div>

    <table className="payroll-table">
      <thead>
        <tr>
          <th>Staff Member</th>
          <th>Basic Salary</th>
          <th>Allowances</th>
          <th>Deductions</th>
          <th>Net Pay</th>
          <th>Status</th>
          <th className="align-right">Actions</th>
        </tr>
      </thead>

      <tbody>
   
        <tr>
          <td>
            <div className="staff-info">
              <div className="staff-avatar">MA</div>
              <div className="staff-meta">
                <span className="staff-name">Marcus Aurelius</span>
                <span className="staff-role">School Principal</span>
              </div>
            </div>
          </td>

          <td className="amt">$8,500.00</td>
          <td className="amt">$1,200.00</td>
          <td className="amt deduction">-$450.00</td>
          <td className="amt net-pay">$9,250.00</td>
          <td><span className="badge badge-paid">● Paid</span></td>

          <td className="actions-cell">
            <button className="icon-btn" title="View Payslip">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</div>

    )
}