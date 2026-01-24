import '@/styles/enrollment.css';

export default function StaffManagement() {
  const enrollmentData = [
    {
      id: 1,
      name: "Kwame Boateng",
      role: "Grade 6A",
      date: "12 Sept 2024",
      status: "active",
      statusLabel: "Active"
    },
    {
      id: 2,
      name: "Akosua Mensah",
      role: "JHS 2B",
      date: "14 Sept 2024",
      status: "pending",
      statusLabel: "Pending"
    },
    {
      id: 3,
      name: "Yaw Owusu",
      role: "SHS 1 Science",
      date: "04 Jan 2024",
      status: "withdrawn",
      statusLabel: "Withdrawn"
    }
  ];

  // Helper to determine status class
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'statusActive';
      case 'pending': return 'statusPending';
      case 'withdrawn': return 'statusWithdrawn';
      default: return '';
    }
  };

  return (
    <div className="dashboardWrapper">
      <div className="dashboard">
        
        {/* Header */}
        <header className="header">
          <div>
            <h1>Staff Management</h1>
            <p>Track and manage student Staff across academic years</p>
          </div>
          <button className="primaryBtn">Enroll Student</button>
        </header>

        {/* Controls */}
        <section className="controls">
          <div className="searchBox">
            <input type="text" placeholder="Search student name..." aria-label="Search student name" />
          </div>

          <div className="filters">
            <select aria-label="Class">
              <option>role</option>
              <option>Grade 6A</option>
              <option>JHS 2B</option>
              <option>SHS 1 Science</option>
            </select>

            <select aria-label="Status">
              <option>Status</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Withdrawn</option>
            </select>
          </div>
        </section>

        {/* Table */}
        <main className="tableCard">
          <table className="enrollmentTable">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>role</th>
                <th>Enrollment Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollmentData.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{row.name}</td>
                  <td>{row.role}</td>
                  <td>{row.date}</td>
                  <td>
                    <span className={`status ${getStatusClass(row.status)}`}>
                      {row.statusLabel}
                    </span>
                  </td>
                  <td>
                    <div className="actionGroup">
                      <button className="actionBtn btnView">View</button>
                      <button className="actionBtn btnEdit">Edit</button>
                      <button className="actionBtn btnRemove">
                        {row.status === 'withdrawn' ? 'Remove' : 'Withdraw'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>

        <div className="footerSpace"></div>
      </div>
    </div>
  );
}