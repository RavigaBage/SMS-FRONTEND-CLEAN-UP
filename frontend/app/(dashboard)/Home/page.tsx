"use strict"
import "@/styles/home.css"
export default function HomePage(){
    return(
           <div className="main-view">
  <header className="top-bar">
    <div className="top-bar-left">
      <button className="btn-primary">Main Dashboard</button>
      <button className="btn-secondary">Analytics</button>
    </div>

    <div className="search-container">
      <input type="text" placeholder="Search students, records, or files..." />
    </div>

    <div className="user-profile">
      <div className="user-info">
        <p className="user-name">Alex Sterling</p>
        <p className="user-role">SUPER ADMIN</p>
      </div>
      <img
        src="https://i.pravatar.cc/150?u=admin"
        alt="User"
        className="user-avatar"
      />
    </div>
  </header>

  <div className="dashboard-grid">
    <section className="left-column">
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon icon-blue">👤</div>
            <span className="trend-tag up">+12.5%</span>
          </div>
          <p className="kpi-label">Total Students</p>
          <h2 className="kpi-value">1,240</h2>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon icon-green">🎓</div>
            <span className="trend-tag up">+2%</span>
          </div>
          <p className="kpi-label">Total Staff</p>
          <h2 className="kpi-value">86</h2>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon icon-yellow">📅</div>
            <span className="trend-tag down">-1.2%</span>
          </div>
          <p className="kpi-label">Today's Attendance</p>
          <h2 className="kpi-value">94.2%</h2>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon icon-teal">💰</div>
            <span className="trend-tag up">+8.4%</span>
          </div>
          <p className="kpi-label">Fees Collected</p>
          <h2 className="kpi-value">$45,200</h2>
        </div>
      </div>

      <div className="chart-row">
        <div className="chart-card">
          <h3 className="card-title">Attendance Trends</h3>
          <p className="card-subtitle">Academic performance correlation</p>
          <svg viewBox="0 0 400 150" className="line-chart">
            <path
              d="M0,100 Q50,50 100,100 T200,80 T300,120 T400,60"
              fill="none"
              stroke="var(--primary)"
            />
          </svg>
        </div>

        <div className="chart-card">
          <h3 className="card-title">Fee Collection</h3>
          <p className="card-subtitle">Revenue analytics monthly view</p>
          <div className="bar-chart">
            <div className="bar gray"></div>
            <div className="bar teal"></div>
            <div className="bar primary"></div>
            <div className="bar teal"></div>
            <div className="bar gray"></div>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Recent Fee Transactions</h3>
          <a href="#" className="table-link">View All</a>
        </div>

        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>ID Number</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="bold">Julianne Devis</td>
              <td>#SMS-2024-0492</td>
              <td className="bold">$1,200.00</td>
              <td><span className="status paid">PAID</span></td>
              <td>Oct 12, 2024</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <aside className="right-panel">
      <h4 className="section-title">Quick Actions</h4>

      <div className="quick-actions">
        <div className="action-btn">➕ Add Student</div>
        <div className="action-btn">📄 Invoice</div>
        <div className="action-btn">📝 Exam Result</div>
        <div className="action-btn">💬 Message</div>
      </div>

      <div className="activity-card">
        <h4 className="section-title">Recent Activity</h4>

        <div className="activity-item">
          <span className="dot primary"></span>
          <div>
            <p><strong>Admin</strong> updated exam schedule</p>
            <span className="time">2 minutes ago</span>
          </div>
        </div>

        <div className="activity-item">
          <span className="dot teal"></span>
          <div>
            <p>Payment received from <strong>John Doe</strong></p>
            <span className="time">45 minutes ago</span>
          </div>
        </div>
      </div>

      <div className="system-status">
        <h4>System Status</h4>
        <p className="status-online">● All Modules Online</p>
        <p className="status-note">
          Last scan 20 minutes ago. Latency: 14ms.
        </p>
      </div>
    </aside>
  </div>
</div>

    )
}