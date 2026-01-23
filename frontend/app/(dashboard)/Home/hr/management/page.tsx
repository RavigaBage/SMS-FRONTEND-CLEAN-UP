import React from 'react';
import '@/styles/management_1.css'; // Adjust the path as needed

export default function StaffProfilePage() {
  return (
    <div className="pageContainer">
      {/* Main Content */}
      <main className="mainContent">
        <header className="header">
          <div className="breadcrumb">Staff / Sarah Jenkins / Profile</div>
          <div className="headerActions">
            <input type="text" className="searchBar" placeholder="Search..." />
            <div className="iconBtn">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
          </div>
        </header>

        {/* Profile Banner */}
        <section className="profileBanner">
          <div className="profileHeader">
            <div className="profileInfo">
              <div className="profileAvatar">
                <img src="https://via.placeholder.com/120" alt="Sarah Jenkins" />
                <div className="onlineStatus"></div>
              </div>
              <div className="profileText">
                <h1>Sarah Jenkins</h1>
                <p className="profileMeta">HOD Science • Senior Faculty • Staff ID: EDU-2025-084</p>
              </div>
            </div>
            <div className="profileActions">
              <button className="btn btnSecondary">Edit Profile</button>
              <button className="btn btnPrimary">Send Message</button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="statsGrid">
          <div className="statCard">
            <div className="statHeader">
              <span className="statTitle">Attendance Rate</span>
              <div className="statIcon" style={{ color: '#48bb78' }}>●</div>
            </div>
            <div className="statValue">98.4%</div>
            <div className="statMeta">
              <span className="statBadge badge-green">+2.4%</span> vs last month
            </div>
          </div>
          <div className="statCard">
            <div className="statHeader">
              <span className="statTitle">Classes Taught</span>
              <div className="statIcon" style={{ color: '#4299e1' }}>■</div>
            </div>
            <div className="statValue">142</div>
            <div className="statMeta">Academic Year 2025-26</div>
          </div>
          <div className="statCard">
            <div className="statHeader">
              <span className="statTitle">Performance Score</span>
              <div className="statIcon" style={{ color: '#ed8936' }}>★</div>
            </div>
            <div className="statValue">4.9/5</div>
            <div className="statMeta">
              <span className="statBadge badge-blue">Top 5%</span> in Department
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="contentGrid">
          <aside>
            <div className="card">
              <div className="cardHeader">Personal Details</div>
              <div className="detailRow">
                <div className="detailIcon">📧</div>
                <div className="detailContent">
                  <div className="detailLabel">Email Address</div>
                  <div className="detailValue">s.jenkins@edumanager.edu</div>
                </div>
              </div>
              <div className="detailRow">
                <div className="detailIcon">📞</div>
                <div className="detailContent">
                  <div className="detailLabel">Phone Number</div>
                  <div className="detailValue">+1 (555) 012-3456</div>
                </div>
              </div>
              <div className="detailRow">
                <div className="detailIcon">📍</div>
                <div className="detailContent">
                  <div className="detailLabel">Office Location</div>
                  <div className="detailValue">Science Block, Room 402</div>
                </div>
              </div>
            </div>
          </aside>

          <section>
            <div className="card">
              <div className="cardHeader">Recent Performance</div>
              <table>
                <thead>
                  <tr>
                    <th>Term</th>
                    <th>Average Grade</th>
                    <th>Students</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Term 1 (2025)</td>
                    <td><span className="grade a">A (92%)</span></td>
                    <td>124</td>
                    <td>Excellent</td>
                  </tr>
                  <tr>
                    <td>Term 2 (2025)</td>
                    <td><span className="grade a">A- (89%)</span></td>
                    <td>118</td>
                    <td>Good</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}