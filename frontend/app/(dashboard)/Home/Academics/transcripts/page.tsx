import '@/styles/transcript_home.css'
import Link from "next/link";
export default function transcriptHome(){
    return(
        <div className="dashboard-container">

            <main className="content">
                <header className="main-header">
                    <div className="nav-filters">
                        <div className="filter-group">
                            <label>Select Class</label>
                            <select className="nav-select">
                                <option>Grade 10-B</option>
                                <option>Grade 10-A</option>
                                <option>Grade 9-C</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Year</label>
                            <select className="nav-select short">
                                <option>2025/26</option>
                                <option>2024/25</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="header-right">
                        <div className="search-box">
                            <input type="text" placeholder="Search name or ID..." />
                        </div>
                        <div className="header-icons">🔔</div>
                        <div className="avatar-small"></div>
                    </div>
                </header>

                <section className="summary-grid">
                    <div className="stat-card">
                        <label>TOTAL STUDENTS</label>
                        <div className="val">32</div>
                    </div>
                    <div className="stat-card">
                        <label>ACTIVE STUDENTS</label>
                        <div className="val">31</div>
                        <span className="sub-text">1 On Leave</span>
                    </div>
                    <div className="stat-card">
                        <label>ACADEMIC YEAR</label>
                        <div className="val">2025/26</div>
                    </div>
                </section>

                <section className="table-card">
                    <table className="student-list-table">
                        <thead>
                            <tr>
                                <th>Avatar</th>
                                <th>Student Name</th>
                                <th>Student ID</th>
                                <th>Class</th>
                                <th>Status</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><div className="student-avatar"></div></td>
                                <td><strong>Alex Johnson</strong></td>
                                <td>2023-8492</td>
                                <td>Grade 10-B</td>
                                <td><span className="status-pill active">Active</span></td>
                                <td className="text-right"><Link href="/Home/Academics/transcripts/student"><button className="btn-table" >View Transcript</button></Link></td>
                            </tr>
                            <tr>
                                <td><div className="student-avatar"></div></td>
                                <td><strong>Sarah Miller</strong></td>
                                <td>2023-9104</td>
                                <td>Grade 10-B</td>
                                <td><span className="status-pill active">Active</span></td>
                                <td className="text-right"><Link href="/Home/Academics/transcripts/student"><button className="btn-table" >View Transcript</button></Link></td>
                            </tr>
                            <tr>
                                <td><div className="student-avatar"></div></td>
                                <td><strong>Michael Chen</strong></td>
                                <td>2023-7721</td>
                                <td>Grade 10-B</td>
                                <td><span className="status-pill leave">On Leave</span></td>
                                <td className="text-right"><Link href="/Home/Academics/transcripts/student"><button className="btn-table" >View Transcript</button></Link></td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="pagination">
                        <span className="page-info">Showing 1-10 of 32 Students</span>
                        <div className="page-btns">
                            <button className="page-btn active">1</button>
                            <button className="page-btn">2</button>
                            <button className="page-btn">3</button>
                            <button className="page-btn">Next</button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}