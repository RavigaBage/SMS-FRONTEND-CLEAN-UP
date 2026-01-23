import '@/styles/syllabi.css'
export default function syllabi(){
    return(

        <div className="container">
            <header className="header">
                <div>
                    <h1>Syllabi Management</h1>
                    <p>Academic Year 2025-2026 • 24 Active Syllabuses</p>
                </div>
                <div className="header-div">
                    <button className="btn btn-outline">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                        Bulk Download
                    </button>
                    <button className="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                        Upload New Syllabus
                    </button>
                </div>
            </header>

            <main className="syllabus-grid">
                <aside className="list-panel">
                    <div className="panel-header">
                        <h3>Subjects</h3>
                        <input type="text" className="search-box" placeholder="Search class or subject..." />
                    </div>
                    <div className="scroll-area">
                        <div className="class-group">
                            <div className="class-label">Grade 10 - Science Stream</div>
                            <div className="syllabus-item active">
                                <div className="item-info">
                                    <h4>Advanced Mathematics</h4>
                                    <span>Last updated 2 days ago</span>
                                </div>
                                <span className="version-tag">v2.4</span>
                            </div>
                            <div className="syllabus-item">
                                <div className="item-info">
                                    <h4>Physics Theory</h4>
                                    <span>Last updated 1 week ago</span>
                                </div>
                                <span className="version-tag">v1.8</span>
                            </div>
                            <div className="syllabus-item">
                                <div className="item-info">
                                    <h4>Organic Chemistry</h4>
                                    <span>Last updated 3 weeks ago</span>
                                </div>
                                <span className="version-tag">v2.0</span>
                            </div>
                        </div>

                        <div className="class-group">
                            <div className="class-label">Grade 11 - Humanities</div>
                            <div className="syllabus-item">
                                <div className="item-info">
                                    <h4>World History</h4>
                                    <span>Last updated 1 month ago</span>
                                </div>
                                <span className="version-tag">v3.1</span>
                            </div>
                            <div className="syllabus-item">
                                <div className="item-info">
                                    <h4>Modern Literature</h4>
                                    <span>Last updated 2 days ago</span>
                                </div>
                                <span className="version-tag">v1.2</span>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="detail-panel">
                    <div className="detail-hero">
                        <div className="detail-hero-flex">
                            <div>
                                <h2 className="detail-hero-flex-h2">Advanced Mathematics</h2>
                                <div className="meta-badges">
                                    <span className="badge badge-blue">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                        Grade 10-A
                                    </span>
                                    <span className="badge badge-teal">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                        120 Total Hours
                                    </span>
                                </div>
                            </div>
                            <button className="btn btn-outline">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                                Download PDF
                            </button>
                        </div>
                    </div>

                    <div className="content-body">
                        <div className="main-content">
                            <h3 className="section-title">Course Topics</h3>
                            <table className="topic-list">
                                <tr>
                                    <td className="topic-num">01</td>
                                    <td className="topic-content">
                                        <h5>Calculus Fundamentals</h5>
                                        <p>Introduction to limits, continuity, and basic differentiation rules for algebraic functions.</p>
                                    </td>
                                    <td className="topic-duration">15 Hours</td>
                                </tr>
                                <tr>
                                    <td className="topic-num">02</td>
                                    <td className="topic-content">
                                        <h5>Trigonometric Functions</h5>
                                        <p>Advanced identities, radian measures, and periodic function modeling in real-world contexts.</p>
                                    </td>
                                    <td className="topic-duration">20 Hours</td>
                                </tr>
                                <tr>
                                    <td className="topic-num">03</td>
                                    <td className="topic-content">
                                        <h5>Vector Geometry</h5>
                                        <p>3D coordinate systems, dot product, cross product, and application in physical space.</p>
                                    </td>
                                    <td className="topic-duration">18 Hours</td>
                                </tr>
                            </table>
                        </div>

                        <aside className="detail-sidebar">
                            <div className="version-card">
                                <h4 className="verson-card-h4">Version Control</h4>
                                <p className="version-card-p">Current active version: <strong>2.4</strong></p>
                                <ul className="version-history">
                                    <li><span>v2.4 (Current)</span> <span className="version-history-span-1">Active</span></li>
                                    <li><span>v2.3 (Sept 2025)</span> <span className="version-history-span-2">Archived</span></li>
                                    <li><span>v2.0 (June 2025)</span> <span className="version-history-span-3">Archived</span></li>
                                </ul>
                            </div>

                            <h4 className="section-title">Learning Objectives</h4>
                            <ul className="objectives-list">
                                <li>Master differential calculus techniques.</li>
                                <li>Apply algebraic modeling to complex engineering problems.</li>
                                <li>Develop spatial reasoning through 3D vector analysis.</li>
                                <li>Prepare for Advanced Placement (AP) examinations.</li>
                            </ul>
                        </aside>
                    </div>
                </section>
            </main>
        </div>

    )
}