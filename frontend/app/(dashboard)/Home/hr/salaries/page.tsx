import '@/styles/payroll_staff.css';
import Link from 'next/link';
export default function SalaryProfile(){
  return(
    <main className="content">
            <header className="main-header">
                <div className="breadcrumb">Payroll / <strong>Salary Profile</strong></div>
                <div className="header-right">
                    <button className="btn-export">Download Annual Report</button>
                    <div className="avatar-small"></div>
                </div>
            </header>

            <section className="staff-header-card">
                <div className="staff-info">
                    <div className="staff-avatar-lg" style={{background: "#E0F2FE"}}>RM</div>
                    <div className="staff-details">
                        <div className="name-badge-row">
                            <h1>Robert Miller</h1>
                            <span className="status-pill active">Active Payroll</span>
                        </div>
                        <p>ID: <strong>TCH-2021-112</strong> • Mathematics Dept • Senior Teacher</p>
                    </div>
                </div>
                <div className="staff-actions">
                    <button className="btn-secondary btn-export">Adjust Salary</button>
                </div>
            </section>

            <section className="summary-grid">
                <div className="stat-card">
                    <label>BASIC SALARY</label>
                    <div className="val">$3,500.00</div>
                </div>
                <div className="stat-card">
                    <label>AVG. ALLOWANCES</label>
                    <div className="val">$650.00</div>
                </div>
                <div className="stat-card">
                    <label>AVG. DEDUCTIONS</label>
                    <div className="val red">-$500.00</div>
                </div>
                <div className="stat-card highlight">
                    <label>CURRENT NET PAY</label>
                    <div className="val">$3,650.00</div>
                </div>
            </section>

            <section className="chart-container card">
                <h3>Salary Trend (Last 6 Months)</h3>
                <div className="chart-placeholder">
                    <div className="trend-line-mock"></div>
                </div>
            </section>
            

            <section className="table-card">
                <div className="card-header">
                    <h3>Payment History</h3>
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
                            <th className="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Oct 2025</strong></td>
                            <td>$3,500.00</td>
                            <td>$650.00</td>
                            <td>$500.00</td>
                            <td><strong>$3,650.00</strong></td>
                            <td><span className="paid-badge">Paid</span></td>
                            <td className="text-right"><Link href="/Home/hr/salaries/profile/"><button className="btn-text">View Payslip</button></Link></td>
                        </tr>
                        <tr>
                            <td><strong>Sep 2025</strong></td>
                            <td>$3,500.00</td>
                            <td>$420.00</td>
                            <td>$500.00</td>
                            <td><strong>$3,420.00</strong></td>
                            <td><span className="paid-badge">Paid</span></td>
                            <td className="text-right"><Link href="/Home/hr/salaries/profile/"><button className="btn-text">View Payslip</button></Link></td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </main>
  )
}
        
