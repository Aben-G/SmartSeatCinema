import '../styles/mainPage.css';

function Mainpage() {
  return (
    <main className="dashboardContent">

      <div className="db-header">
        <h1 className="db-title">Dashboard</h1>
        <p className="db-sub">Authorized Personnel Only</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <p className="stat-label">Total Movies</p>
          <p className="stat-value">—</p>
          <p className="stat-meta">Currently in catalog</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Occupied Halls</p>
          <p className="stat-value">—</p>
          <p className="stat-meta">Out of total halls</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Snack Items</p>
          <p className="stat-value">—</p>
          <p className="stat-meta">In stock</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Available Seats</p>
          <p className="stat-value">—</p>
          <p className="stat-meta">Across all halls</p>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <p className="section-title">Now Showing</p>
          <p className="empty-state">Connect your movies data to populate this section</p>
        </div>
        <div className="panel">
          <p className="section-title">System Alerts</p>
          <p className="empty-state">No active alerts</p>
        </div>
      </div>

    </main>
  );
}

export default Mainpage;