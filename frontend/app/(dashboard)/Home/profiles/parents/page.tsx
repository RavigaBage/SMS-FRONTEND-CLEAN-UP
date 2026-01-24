import '@/styles/parent_entry.css'
export default function ParentEntry(){
    return(
    <div className="dashboard-container">
        <main className="content">
            <header className="main-header">
                <div className="nav-controls">
                    <div className="header-filter">
                        <label>Select Class</label>
                        <select className="nav-dropdown">
                            <option>Grade 10-B</option>
                            <option>Grade 10-A</option>
                            <option>Grade 9-C</option>
                        </select>
                    </div>
                    <div className="header-filter">
                        <label>Academic Year</label>
                        <select className="nav-dropdown">
                            <option>2025 - 2026</option>
                            <option>2024 - 2025</option>
                        </select>
                    </div>
                </div>
                
                <div className="header-right">
                    <div className="search-box">
                        <input type="text" placeholder="Search teacher name..." />
                    </div>
                    <div className="notif-badge">🔔</div>
                    <div className="avatar-circle"></div>
                </div>
            </header>

            <section className="summary-cards">
                <div className="s-card">
                    <label>TOTAL TEACHERS</label>
                    <div className="s-val">12</div>
                </div>
                <div className="s-card">
                    <label>SUBJECTS COVERED</label>
                    <div className="s-val">8 / 8</div>
                    <span className="s-tag">Complete</span>
                </div>
                <div className="s-card">
                    <label>CLASS TEACHER</label>
                    <div className="s-val teacher-link">Mrs. Emily Davis</div>
                </div>
            </section>

            <section className="table-container">
                <table className="faculty-table">
                    <thead>
                        <tr>
                            <th>Teacher</th>
                            <th>Teacher ID</th>
                            <th>Assigned Subject(s)</th>
                            <th>Class</th>
                            <th>Status</th>
                            <th className="actions-header">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div className="user-cell">
                                    <div className="user-avatar" style={{background:"#E0F2FE"}}>ED</div>
                                    <div className="user-name"><strong>Emily Davis</strong><span>English Literature</span></div>
                                </div>
                            </td>
                            <td>TCH-2022-045</td>
                            <td><span className="subject-tag">English</span> <span className="subject-tag">Drama</span></td>
                            <td>Grade 10-B</td>
                            <td><span className="status-pill available">Active</span></td>
                            <td className="actions-cell">
                                <button className="btn-icon-label">View Profile</button>
                                <button className="btn-icon-label">Subjects</button>
                                <button className="btn-icon-label primary">Manage Class</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="user-cell">
                                    <div className="user-avatar" style={{background: "#FEE2E2"}}>RM</div>
                                    <div className="user-name"><strong>Robert Miller</strong><span>Mathematics</span></div>
                                </div>
                            </td>
                            <td>TCH-2021-112</td>
                            <td><span className="subject-tag">Advanced Math</span></td>
                            <td>Grade 10-B</td>
                            <td><span className="status-pill available">Active</span></td>
                            <td className="actions-cell">
                                <button className="btn-icon-label">View Profile</button>
                                <button className="btn-icon-label">Subjects</button>
                                <button className="btn-icon-label">Manage Class</button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="pagination-footer">
                    <p>Showing 1-10 of 12 faculty members</p>
                    <div className="page-controls">
                        <button className="p-btn">&lt;</button>
                        <button className="p-btn active">1</button>
                        <button className="p-btn">2</button>
                        <button className="p-btn">&gt;</button>
                    </div>
                </div>
            </section>
        </main>
    </div>
    )
}

