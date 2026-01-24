import styles from '@/styles/invoice.module.css';
export default function InvoiceEntry() {
  return (
    <div className={styles.dashboardContainer}>
      <main className={styles.content}>
        {/* Top Section: Invoice Header */}
        <header className={styles.mainHeader}>
          <div className={styles.headerTitles}>
            <div className={styles.breadcrumb}>Finance / <strong>New Invoice</strong></div>
            <div className={styles.invoiceMeta}>
              <h1>Invoice #INV-2026-001</h1>
              <span className={styles.statusBadge}>Draft</span>
            </div>
          </div>
          <div className={styles.headerDates}>
            <div className={styles.dateGroup}>
              <label>INVOICE DATE</label>
              <input type="date" defaultValue="2026-01-23" />
            </div>
            <div className={styles.dateGroup}>
              <label>DUE DATE</label>
              <input type="date" />
            </div>
          </div>
        </header>

        {/* Recipient Selection */}
        <section className={styles.card}>
          <div className={styles.sectionTitle}>Recipient Information</div>
          <div className={styles.recipientGrid}>
            <div className={styles.searchWrapper}>
              <label>Search Student or Parent</label>
              <input type="text" placeholder="Type student name or ID..." className={styles.searchInput} />
            </div>
            <div className={styles.selectedDetails}>
              <div className={styles.detailItem}>
                <span>Student:</span> <strong>Alex Johnson</strong>
              </div>
              <div className={styles.detailItem}>
                <span>ID:</span> <strong>2023-8492</strong>
              </div>
              <div className={styles.detailItem}>
                <span>Class:</span> <strong>Grade 10-B</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Invoice Items Table */}
        <section className={styles.tableCard}>
          <table className={styles.invoiceTable}>
            <thead>
              <tr>
                <th>Item / Fee Description</th>
                <th>Fee Type</th>
                <th>Qty</th>
                <th>Unit Amount</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input type="text" defaultValue="First Term Tuition Fees" /></td>
                <td>
                  <select>
                    <option>Tuition</option>
                    <option>PTA</option>
                    <option>Transport</option>
                  </select>
                </td>
                <td><input type="number" defaultValue="1" className={styles.shortInput} /></td>
                <td><input type="number" defaultValue="1200.00" /></td>
                <td className={styles.rowTotal}>$1,200.00</td>
                <td><button className={styles.btnRemove}>×</button></td>
              </tr>
            </tbody>
          </table>
          <button className={styles.btnAddItem}>+ Add Fee Item</button>
        </section>

        {/* Bottom Section: Notes & Summary */}
        <div className={styles.bottomGrid}>
          <section className={styles.notesPanel}>
            <div className={styles.inputGroup}>
              <label>Payment Terms</label>
              <select>
                <option>Bank Transfer / Cheque</option>
                <option>Cash only</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Notes / Remarks</label>
              <textarea placeholder="Add any specific instructions here..."></textarea>
            </div>
          </section>

          <section className={styles.summaryPanel}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>$1,200.00</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Discount</span>
              <input type="number" placeholder="0.00" />
            </div>
            <hr />
            <div className={`${styles.summaryRow} ${styles.grandTotal}`}>
              <label>GRAND TOTAL</label>
              <div className={styles.totalValue}>$1,200.00</div>
            </div>
            <div className={styles.actionArea}>
              <button className={styles.btnPrimary}>Issue Invoice</button>
              <button className={styles.btnSecondary}>Save Draft</button>
              <button className={styles.btnText}>Preview Invoice</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}