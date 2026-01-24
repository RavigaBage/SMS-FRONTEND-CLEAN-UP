'use client'
import React from 'react';
import styles from '@/styles/Expenditure.module.css';

const ExpenditureManagement = () => {
  const categories = [
    { label: 'Infrastructure', value: '$12,450.00', color: 'blue', icon: '🏠' },
    { label: 'Academic Resources', value: '$8,200.00', color: 'teal', icon: '📚' },
    { label: 'Utilities', value: '$3,140.00', color: 'amber', icon: '⚡' },
    { label: 'Maintenance', value: '$1,850.00', color: 'green', icon: '🛠️' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1>Expenditure Management</h1>
          <p>Track school spending, utility costs, and resource procurement.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnOutline}>Generate Report</button>
          <button className={styles.btnPrimary}>
            <span className={styles.plusIcon}>+</span> Record Expense
          </button>
        </div>
      </header>

      {/* Analytics Category Grid */}
      <section className={styles.categoryGrid}>
        {categories.map((cat, index) => (
          <div key={index} className={styles.categoryCard}>
            <div className={styles.catInfo}>
              <span className={styles.catLabel}>{cat.label}</span>
              <div className={`${styles.catIcon} ${styles[cat.color]}`}>
                {cat.icon}
              </div>
            </div>
            <div className={styles.catValue}>{cat.value}</div>
          </div>
        ))}
      </section>

      {/* Visual Trend Section */}
      <section className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h3>Monthly Expenditure Trend</h3>
          <span className={styles.yearTag}>Year 2025</span>
        </div>
        <div className={styles.chartBars}>
          {['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'].map((month, i) => (
            <div key={i} className={styles.barWrapper}>
              <div 
                className={`${styles.bar} ${month === 'Dec' ? styles.active : ''}`} 
                style={{ height: `${[60, 45, 80, 55, 95, 30][i]}%` }}
              ></div>
              <span className={styles.barLabel}>{month}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Data Table Section */}
      <main className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <input type="text" className={styles.searchBox} placeholder="Search by description, staff, or category..." />
          <button className={styles.btnFilter}>Filter</button>
        </div>

        <table className={styles.expTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Responsible Staff</th>
              <th>Status</th>
              <th className={styles.textRight}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Jan 18, 2026</td>
              <td><span className={styles.catTag}>Infrastructure</span></td>
              <td className={styles.description}>Classroom AC Repair (Block B)</td>
              <td className={styles.amount}>$420.00</td>
              <td>
                <div className={styles.staffInfo}>
                  <div className={styles.staffAvatar}>RT</div>
                  <span>Robert Taylor</span>
                </div>
              </td>
              <td><span className={`${styles.badge} ${styles.statusApproved}`}>Approved</span></td>
              <td className={styles.textRight}>
                <button className={styles.btnView}>View</button>
              </td>
            </tr>
            {/* Additional rows would follow the same pattern */}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default ExpenditureManagement;