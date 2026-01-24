import React from 'react';
import '@/styles/parentProfile.css';

const WardsData = [
  { id: '2023-8492', name: 'Alex Johnson', grade: 'Grade 10-B', status: 'Excellent (GPA 3.8)', statusType: 'success', color: '#FED7AA' },
  { id: '2024-1105', name: 'Emily Johnson', grade: 'Grade 7-A', status: 'Good (GPA 3.2)', statusType: 'info', color: '#BAE6FD' }
];

export default function ParentProfile() {
  return (
    <div className="dashboard-container">
      <main className="content">
        <header className="main-header">
          <div className="breadcrumb">Directory / <strong>Parent Profile</strong></div>
        </header>

        <section className="parent-profile-card">
          <div className="parent-main-info">
            <div className="parent-avatar">👤</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h1 style={{ margin: 0, fontSize: '24px' }}>Sarah Johnson</h1>
                <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>Active Parent</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Parent ID: <strong>PAR-8821</strong></p>
              
              <div className="contact-grid">
                <div className="contact-item">📞 +1 (555) 012-3456</div>
                <div className="contact-item">✉️ s.johnson@email.com</div>
                <div className="contact-item">📍 452 Willow Creek Rd, Springfield, IL</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary">Message</button>
            <button className="btn-primary">Edit Profile</button>
          </div>
        </section>

        <div style={{ display: 'flex', gap: '40px', margin: '30px 0' }}>
            <SummaryBox label="Total Wards" val="2 Children" />
            <SummaryBox label="Active Enrollments" val="2 Students" />
        </div>

        <section>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Wards / Children</h2>
          <div className="wards-grid">
            {WardsData.map(ward => (
              <WardCard key={ward.id} ward={ward} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

const SummaryBox = ({ label, val }: { label: string, val: string }) => (
    <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</label>
        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-blue)' }}>{val}</span>
    </div>
);

const WardCard = ({ ward }: { ward: any }) => (
  <div className="ward-card">
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: ward.color }} />
      <div>
        <h3 style={{ margin: 0, fontSize: '16px' }}>{ward.name}</h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>ID: {ward.id}</p>
      </div>
      <span className="academic-badge" style={{ marginLeft: 'auto' }}>{ward.grade}</span>
    </div>
    <div style={{ marginBottom: '20px', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
      <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>ACADEMIC STATUS</label>
      <span className={`status-text ${ward.statusType}`} style={{ fontSize: '13px', fontWeight: 600 }}>{ward.status}</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
      <button className="btn-outline">View Profile</button>
      <button className="btn-outline">Results</button>
      <button className="btn-outline">Transcript</button>
    </div>
  </div>
);