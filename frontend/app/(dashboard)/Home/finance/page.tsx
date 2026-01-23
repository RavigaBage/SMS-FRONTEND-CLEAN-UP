"use client";

import { useEffect } from "react";
import "@/styles/finance.css";

export default function FinancePage() {
  useEffect(() => {
    // Chart.js setup can go here later
    // Example: initialize charts after mount
  }, []);

  return(
    <div className="main-content">
        <div className="header">
            <h2>Financial Transactions</h2>
            <div className="header-right">
                <div className="search-box">
                    <svg className="search-icon" width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                    <input type="text" placeholder="Search transactions..." />
                </div>
                <button className="icon-btn">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
                </button>
                <button className="icon-btn">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path></svg>
                </button>
                <div className="user-profile">
                    <div className="user-info">
                        <div className="user-name">Alex Sterling</div>
                        <div className="user-role">ADMINISTRATOR</div>
                    </div>
                    <div className="user-avatar">AS</div>
                </div>
            </div>
        </div>

        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-header">Total Income</div>
                <div className="stat-value">$450,230.00</div>
                <div className="stat-change positive">
                    <span>↗</span>
                    <span>+12.5%</span>
                </div>
                <canvas id="incomeChart" className="stat-chart"></canvas>
            </div>
            <div className="stat-card">
                <div className="stat-header">Total Expenditure</div>
                <div className="stat-value">$120,540.00</div>
                <div className="stat-change positive">
                    <span>↗</span>
                    <span>+5.2%</span>
                </div>
                <canvas id="expenditureChart" className="stat-chart"></canvas>
            </div>
            <div className="stat-card">
                <div className="stat-header">Net Balance</div>
                <div className="stat-value">$329,690.00</div>
                <span className="balance-status">
                    <span className="status-dot"></span>
                    Healthy
                </span>
                <canvas id="balanceChart" className="stat-chart"></canvas>
            </div>
        </div>

        <div className="transactions-section">
            <div className="transactions-header">
                <div className="tabs">
                    <div className="tab active">All Transactions</div>
                    <div className="tab">Fees</div>
                    <div className="tab">Salary</div>
                    <div className="tab">Misc</div>
                </div>
                <div className="filters">
                    <button className="filter-btn">📅 Oct 1, 2023 - Oct 31, 2023</button>
                    <button className="filter-btn">⚙ More Filters</button>
                    <button className="export-btn">⬇ Export</button>
                </div>
            </div>

            <table className="transactions-table">
                <thead>
                    <tr>
                        <th>DATE</th>
                        <th>REFERENCE ID</th>
                        <th>PAYER / PAYEE</th>
                        <th>TYPE</th>
                        <th>AMOUNT</th>
                        <th>METHOD</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Oct 24, 2023</td>
                        <td className="reference-id">#TRX-9921</td>
                        <td>
                            <div className="payer-info">
                                <div className="payer-avatar" style={{ background: "#4caf50" }}>JD</div>
                                <div className="payer-details">
                                    <span className="payer-name">John Doe</span>
                                    <span className="payer-meta">Grade 10</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="type-badge type-fees">FEES</span></td>
                        <td className="amount positive">+$1,200.00</td>
                        <td>Bank Transfer</td>
                        <td>
                            <span className="status-badge status-success">
                                <span className="status-dot"></span>
                                Success
                            </span>
                        </td>
                        <td><button className="actions-btn">⋯</button></td>
                    </tr>
                    <tr>
                        <td>Oct 23, 2023</td>
                        <td className="reference-id">#TRX-9844</td>
                        <td>
                            <div className="payer-info">
                                <div className="payer-avatar" style={{background:" #ff9800;"}}>RS</div>
                                <div className="payer-details">
                                    <span className="payer-name">Robert Smith</span>
                                    <span className="payer-meta">Faculty</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="type-badge type-salary">SALARY</span></td>
                        <td className="amount negative">-$3,500.00</td>
                        <td>Direct Deposit</td>
                        <td>
                            <span className="status-badge status-pending">
                                <span className="status-dot"></span>
                                Pending
                            </span>
                        </td>
                        <td><button className="actions-btn">⋯</button></td>
                    </tr>
                    <tr>
                        <td>Oct 22, 2023</td>
                        <td className="reference-id">#TRX-9812</td>
                        <td>
                            <div className="payer-info">
                                <div className="payer-avatar" style={{background:" #2196f3;"}}>SU</div>
                                <div className="payer-details">
                                    <span className="payer-name">Supply Unit</span>
                                    <span className="payer-meta">04</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="type-badge type-misc">MISC</span></td>
                        <td className="amount negative">-$450.00</td>
                        <td>Credit Card</td>
                        <td>
                            <span className="status-badge status-failed">
                                <span className="status-dot"></span>
                                Failed
                            </span>
                        </td>
                        <td><button className="actions-btn">⋯</button></td>
                    </tr>
                    <tr>
                        <td>Oct 22, 2023</td>
                        <td className="reference-id">#TRX-9810</td>
                        <td>
                            <div className="payer-info">
                                <div className="payer-avatar" style={{background: "#9c27b0;"}}>SM</div>
                                <div className="payer-details">
                                    <span className="payer-name">Sarah Miller</span>
                                    <span className="payer-meta">Grade 8</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="type-badge type-fees">FEES</span></td>
                        <td className="amount positive">+$1,200.00</td>
                        <td>Cash</td>
                        <td>
                            <span className="status-badge status-success">
                                <span className="status-dot"></span>
                                Success
                            </span>
                        </td>
                        <td><button className="actions-btn">⋯</button></td>
                    </tr>
                </tbody>
            </table>

            <div className="pagination">
                <div className="pagination-info">SHOWING 1-10 OF 250</div>
                <div className="pagination-controls">
                    <button className="page-btn">‹</button>
                    <button className=""></button>
                </div>
            </div>
        </div>
    </div>
  );
}