import React from 'react';
import '@/styles/blackList.css';

export default function SecurityManagement() {
  const tokenData = [
    { id: 1, user: "Kwame Boateng", token: "abc123tokenxyz", device: "Chrome - Windows 10", issued: "2026-01-20", expires: "2026-07-20", status: "revoked" },
    { id: 2, user: "Akosua Mensah", token: "xyz987tokenabc", device: "Safari - iPhone 14", issued: "2026-01-18", expires: "2026-07-18", status: "active" },
    { id: 3, user: "Josephine Appiah", token: "token456def789", device: "Edge - Windows 11", issued: "2026-01-19", expires: "2026-07-19", status: "alert" },
  ];

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'active': return 'activeLabel';
      case 'revoked': return 'revokedLabel';
      case 'alert': return 'alertLabel';
      default: return '';
    }
  };

  return (
    <div className="dashboardWrapper">
      <div className="dashboard">
        
        <header className="header">
          <h1>Security & Token Management</h1>
          <p>View and manage invalidated tokens and sessions</p>
        </header>

        {/* Summary Statistics */}
        <section className="cardsRow">
          <div className="cardSummary">
            <h3>Active Sessions</h3>
            <p>125</p>
          </div>
          <div className="cardSummary">
            <h3>Revoked Tokens</h3>
            <p>37</p>
          </div>
          <div className="cardSummary">
            <h3>Security Alerts</h3>
            <p style={{ color: 'var(--alert)' }}>4</p>
          </div>
        </section>

        {/* Filter Controls */}
        <div className="controls">
          <input type="text" placeholder="Search user or token ID..." style={{ flex: 1 }} />
          <select>
            <option>All Status</option>
            <option>Active</option>
            <option>Revoked</option>
          </select>
          <select>
            <option>All Devices</option>
            <option>Desktop</option>
            <option>Mobile</option>
          </select>
          <button className="primaryBtn">Bulk Revoke</button>
        </div>

        {/* Main Data Table */}
        <main className="tableCard">
          <table className="tokenTable">
            <thead>
              <tr>
                <th>User</th>
                <th>Token ID</th>
                <th>Device / Browser</th>
                <th>Issued</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tokenData.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.user}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{t.token}</td>
                  <td>{t.device}</td>
                  <td>{t.issued}</td>
                  <td>{t.expires}</td>
                  <td>
                    <span className={`statusLabel ${getStatusClass(t.status)}`}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <button className="btnAction btnReview">Review</button>
                    <button className="btnAction btnRevoke">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
}