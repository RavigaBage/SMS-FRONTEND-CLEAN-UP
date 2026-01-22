import '@/styles/payment.css'

export default function payments(){
    return(
        <div className="container">
  <header className="page-header">
    <div className="header-title">
      <h1 className="page-title">Payments Management</h1>
      <p className="page-subtitle">
        Overview of school fee transactions and records.
      </p>
    </div>

    <button className="btn btn-primary">
      <svg width="20" height="20" viewBox="0 0 24 24">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      Record New Payment
    </button>
  </header>

  <section className="summary-grid">
    <div className="summary-card">
      <div className="summary-icon icon-blue">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>

      <div className="summary-data">
        <span className="summary-value">$124,500</span>
        <span className="summary-label">Total Revenue (YTD)</span>
      </div>
    </div>

    <div className="summary-card">
      <div className="summary-icon icon-teal">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>

      <div className="summary-data">
        <span className="summary-value">345</span>
        <span className="summary-label">Completed Transactions</span>
      </div>
    </div>

    <div className="summary-card">
      <div className="summary-icon icon-blue">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>

      <div className="summary-data">
        <span className="summary-value">$8,250</span>
        <span className="summary-label">Pending Payments</span>
      </div>
    </div>
  </section>

  <section className="table-container">
    <div className="table-actions-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search by student, invoice ref..."
      />

      <div className="filter-group">
        <select className="filter-select">
          <option value="">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        <select className="filter-select">
          <option value="">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="ytd">Year to Date</option>
        </select>

        <button className="btn btn-outline">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export
        </button>
      </div>
    </div>

    <table className="data-table">
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Invoice Ref</th>
          <th>Amount Paid</th>
          <th>Payment Method</th>
          <th>Date</th>
          <th>Status</th>
          <th className="align-right">Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td className="student-name">Alice Smith</td>
          <td className="invoice-ref">INV-2023-001</td>
          <td className="amount">$1,200.00</td>
          <td>Credit Card (Visa)</td>
          <td>Oct 25, 2023</td>
          <td><span className="status-badge status-paid">Paid</span></td>
          <td className="align-right">
            <div className="action-buttons">
              <button className="btn-icon" title="View Receipt">👁</button>
              <button className="btn-icon refund" title="Refund Payment">↩</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</div>

    )
}