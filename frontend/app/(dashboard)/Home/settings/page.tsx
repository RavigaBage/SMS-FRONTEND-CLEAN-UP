import '@/styles/settings.css'

export default function settings(){
    return(

  <div className="container">
    <header className="page-header">
      <h1 className="page-title">Settings</h1>
      <button className="btn btn-primary">Save Changes</button>
    </header>

    <div className="settings-layout">
      <nav className="settings-nav">
        <a className="nav-item active" href="#">School Profile</a>
        <a className="nav-item" href="#">Academic Settings</a>
        <a className="nav-item" href="#">Users & Roles</a>
        <a className="nav-item" href="#">Notifications</a>
        <a className="nav-item" href="#">Security</a>
        <a className="nav-item" href="#">Backup & Data</a>
      </nav>

      <main className="settings-content">
        <section className="settings-card">
          <header className="section-header">
            <h2>School Profile</h2>
            <p>Update your institution's public information and branding.</p>
          </header>

          <div className="form-grid">
            <div className="form-group">
              <label>Institution Name</label>
              <input type="text" />
            </div>

            <div className="form-group">
              <label>School Code</label>
              <input type="text" />
            </div>

            <div className="form-group">
              <label>Primary Email Address</label>
              <input type="email" />
            </div>

            <div className="form-group">
              <label>Contact Number</label>
              <input type="text" />
            </div>

            <div className="form-group full-width">
              <label>Mailing Address</label>
              <textarea rows={3}></textarea>
            </div>

            <div className="form-group">
              <label>Timezone</label>
              <select>
                <option>GMT</option>
              </select>
            </div>

            <div className="form-group">
              <label>Currency</label>
              <select>
                <option>USD</option>
              </select>
            </div>
          </div>
          <header className="section-header section-divider">
            <h3>System Preferences</h3>
            <p>Control how your dashboard behaves and alerts you.</p>
          </header>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Enable SMS Notifications</h4>
              <p>Send automated alerts to parents.</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Auto-Generate Invoices</h4>
              <p>Create monthly invoices automatically.</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Maintenance Mode</h4>
              <p>Disable portals during system updates.</p>
            </div>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>

          <div className="danger-zone">
            <h4>Archive Academic Year</h4>
            <p className="danger-text">
              Closing the academic year will archive all student data.
            </p>
            <button className="btn btn-danger">Archive Academic Data</button>
          </div>
        </section>
      </main>
    </div>
  </div>


    )
}