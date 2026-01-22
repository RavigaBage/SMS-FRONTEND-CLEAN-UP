import '@/styles/logout.css'

export default function LogoutConfirmation() {
  return (
    <div className="logout-page">
      <div className="logout-card">

        <div className="brand-logo">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="brand-icon"
          >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
          </svg>
          <span className="brand-name">EduFlow Pro</span>
        </div>

        <div className="avatar-wrapper">
          <img
            src="https://i.pravatar.cc/150?u=admin"
            alt="User Avatar"
            className="user-avatar"
          />
          <div className="status-indicator"></div>
        </div>

        <h2 className="logout-title">Ready to leave?</h2>

        <p className="logout-message">
          Are you sure you want to log out, <strong>Admin Sarah</strong>? Make sure
          you've saved all pending grade entries.
        </p>

        <div className="session-summary">
          <div className="stat-item">
            <span className="stat-value">4h 12m</span>
            <span className="stat-label">Session</span>
          </div>

          <div className="stat-item stat-item-bordered">
            <span className="stat-value">24</span>
            <span className="stat-label">Updates</span>
          </div>

          <div className="stat-item">
            <span className="stat-value">0</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>

        <div className="action-group">
          <button className="btn btn-logout">Confirm Logout</button>
          <button className="btn btn-cancel">Stay Logged In</button>
        </div>

      </div>
    </div>
  );
}
