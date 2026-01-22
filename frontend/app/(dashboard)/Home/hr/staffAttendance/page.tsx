import '@/styles/staffAttendance.css'
export default function StaffAttendancePage() {
  return (
<div className="container">
  <header className="page-header">
    <div className="header-left">
      <h1>Staff Attendance</h1>
      <p>Monitoring daily presence and punctuality for Academic Year 2025-26</p>
    </div>
    <div className="controls-row">
      <div className="date-picker">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        January 21, 2026
      </div>
      <button className="btn btn-outline">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        Export Report
      </button>
      <button className="className btn-primary">Bulk Mark Attendance</button>
    </div>
  </header>

  <section className="summary-grid">
    <div className="summary-card">
      <span className="label">Total Staff</span>
      <div className="value">124</div>
      <div className="mini-chart"><div className="chart-fill" style={{ width: '100%' }}></div></div>
    </div>
    <div className="summary-card">
      <span className="label">Present Today</span>
      <div className="value" style={{ color: 'var(--primary-teal)' }}>112</div>
      <div className="mini-chart"><div className="chart-fill" style={{ width: '90%' }}></div></div>
    </div>
    <div className="summary-card">
      <span className="label">Late Arrivals</span>
      <div className="value" style={{ color: '#ff9800' }}>08</div>
      <div className="mini-chart"><div className="chart-fill" style={{ width: '15%', background: '#ff9800' }}></div></div>
    </div>
    <div className="summary-card">
      <span className="label">On Leave</span>
      <div className="value" style={{ color: 'var(--primary-blue)' }}>04</div>
      <div className="mini-chart"><div className="chart-fill" style={{ width: '8%', background: 'var(--primary-blue)' }}></div></div>
    </div>
  </section>

  <main className="content-card">
    <div className="filter-bar">
      <input type="text" className="search-input" placeholder="Search staff by name or ID..." />
      <div style={{ display: 'flex', gap: '10px' }}>
        <select className="date-picker" style={{ fontSize: '0.85rem' }}>
          <option>All Departments</option>
          <option>Science</option>
          <option>Humanities</option>
          <option>Administration</option>
        </select>
        <select className="date-picker" style={{ fontSize: '0.85rem' }}>
          <option>All Statuses</option>
          <option>Present</option>
          <option>Late</option>
          <option>Absent</option>
        </select>
      </div>
    </div>

    <table className="attendance-table">
      <thead>
        <tr>
          <th>Staff Member</th>
          <th>Check-In</th>
          <th>Check-Out</th>
          <th>Status</th>
          <th>Punctuality</th>
          <th>Remarks</th>
          <th style={{ textAlign: 'right' }}>Action</th>
        </tr>
      </thead>
      <tbody>
        {/* Row 1 */}
        <tr>
          <td>
            <div className="staff-cell">
              <div className="avatar">SJ</div>
              <div>
                <span style={{ fontWeight: 600 }}>Sarah Jenkins</span>
                <span className="role-tag">HOD Science</span>
              </div>
            </div>
          </td>
          <td><span className="time-text">07:45 AM</span></td>
          <td><span className="time-text">04:15 PM</span></td>
          <td><span className="status status-present">Present</span></td>
          <td>
            <div className="mini-chart" style={{ width: '80px', height: '6px' }}><div className="chart-fill" style={{ width: '100%' }}></div></div>
          </td>
          <td className="remarks">Early arrival for lab prep</td>
          <td style={{ textAlign: 'right' }}>
            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Edit</button>
          </td>
        </tr>
        {/* Row 2 */}
        <tr>
          <td>
            <div className="staff-cell">
              <div className="avatar" style={{ background: 'var(--soft-teal-bg)', color: 'var(--primary-teal)' }}>MA</div>
              <div>
                <span style={{ fontWeight: 600 }}>Marcus Aurelius</span>
                <span className="role-tag">Senior Lecturer</span>
              </div>
            </div>
          </td>
          <td><span className="time-text">08:15 AM</span></td>
          <td><span className="time-text">-- : --</span></td>
          <td><span className="status status-late">Late</span></td>
          <td>
            <div className="mini-chart" style={{ width: '80px', height: '6px' }}><div className="chart-fill" style={{ width: '40%', background: '#ff9800' }}></div></div>
          </td>
          <td className="remarks">Heavy traffic on highway</td>
          <td style={{ textAlign: 'right' }}>
            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Edit</button>
          </td>
        </tr>
        {/* Row 3 */}
        <tr>
          <td>
            <div className="staff-cell">
              <div className="avatar">RT</div>
              <div>
                <span style={{ fontWeight: 600 }}>Robert Taylor</span>
                <span className="role-tag">IT Administrator</span>
              </div>
            </div>
          </td>
          <td><span className="time-text">-- : --</span></td>
          <td><span className="time-text">-- : --</span></td>
          <td><span className="status status-leave">Medical Leave</span></td>
          <td>
            <div className="mini-chart" style={{ width: '80px', height: '6px', background: '#eee' }}></div>
          </td>
          <td className="remarks">Approved medical certificate</td>
          <td style={{ textAlign: 'right' }}>
            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Edit</button>
          </td>
        </tr>
      </tbody>
    </table>
  </main>
</div>
  );
}
