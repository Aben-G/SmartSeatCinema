import { useState, useEffect } from "react";
import '../styles/mainPage.css';

const API_BASE = 'http://localhost:5000/api';

function Mainpage() {
  const [movies, setMovies] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [mRes, sRes, tRes] = await Promise.all([
          fetch(`${API_BASE}/movies`),
          fetch(`${API_BASE}/snacks`),
          fetch(`${API_BASE}/tickets`)
        ]);
        setMovies(await mRes.json());
        setSnacks(await sRes.json());
        setTickets(await tRes.json());
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    loadData();
  }, []);

  const nowShowing = movies.filter(m => m.status === 'Now Showing');
  const activeMovieIds = new Set(nowShowing.map(m => String(m._id)));
  const soldSeatsCount = tickets
    .filter(t => activeMovieIds.has(String(t.movieId?._id || t.movieId)))
    .reduce((sum, t) => sum + (t.seats?.length || 0), 0);

  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const stats = {
    totalMovies: movies.length,
    occupiedHalls: new Set(nowShowing.map(m => m.hall)).size,
    snackItems: snacks.length,
    availableSeats: Math.max(0, (nowShowing.length * 144) - soldSeatsCount)
  };

  return (
    <main className="dashboardContent">
      <div className="db-header">
        <h1 className="db-title">Dashboard</h1>
        <p className="db-sub">Authorized Personnel Only</p>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <p className="stat-label">Total Movies</p>
          <p className="stat-value">{stats.totalMovies}</p>
          <p className="stat-meta">Currently in catalog</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Occupied Halls</p>
          <p className="stat-value">{stats.occupiedHalls}</p>
          <p className="stat-meta">Out of 5 halls</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Snack Items</p>
          <p className="stat-value">{stats.snackItems}</p>
          <p className="stat-meta">Items in menu</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Available Seats</p>
          <p className="stat-value">{stats.availableSeats}</p>
          <p className="stat-meta">Across all halls</p>
        </div>
      </div>
      <div className="two-col">
        <div className="panel">
          <p className="section-title">Now Showing</p>
          {nowShowing.length === 0 ? (
            <p className="empty-state">No movies currently showing</p>
          ) : (
            <div className="db-list">
              {nowShowing.map(m => (
                <div key={m._id} className="db-list-item">
                  <span className="db-list-name">{m.title}</span>
                  <span className="db-badge">{m.hall}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="panel">
          <p className="section-title">Recent Transactions</p>
          {recentTickets.length === 0 ? (
            <p className="empty-state">No recent sales recorded</p>
          ) : (
            <div className="db-list">
              {recentTickets.map(t => (
                <div key={t._id} className="db-list-item">
                  <div className="db-list-info">
                    <span className="db-list-name">{t.movieTitle || 'Ticket Sale'}</span>
                    <span className="db-list-sub">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {t.payment}</span>
                  </div>
                  <span className="db-list-val">ETB {t.total}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </main>
  );
}

export default Mainpage;