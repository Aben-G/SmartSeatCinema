import { useLocation } from 'react-router-dom';
import '../styles/nav.css';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/movies': 'Movies',
  '/dashboard/sell-ticket': 'Sell Ticket',
  '/dashboard/snacks': 'Snacks',
  '/dashboard/history': 'History',
  '/dashboard/settings': 'Settings',
};

// Get initials from a name e.g. "John Doe" → "JD", "admin" → "AD"
function getInitials(name) {
  if (!name) return 'EM';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Navbar({ searchQuery, onSearchChange }) {
  const location = useLocation();
  const pageTitle = routeTitles[location.pathname] || 'Dashboard';

  const user = localStorage.getItem('ssc_user') || 'Employee';
  const initials = getInitials(user);

  return (
    <nav className="Navbar">
      <div className="NavBrand">
        SMART<span className="NavBrandHalf">SEAT</span>CINEMA
      </div>

      <div className="NavTitle">{pageTitle}</div>

      <div className="NavRight">
        {/* <div className="NavSearch">
          
          <input
            type="text"
            placeholder={`Search in ${pageTitle}...`}
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className="NavSearchClear" onClick={() => onSearchChange('')}>✕</button>
          )}
        </div> */}

        <div className="NavUser">
          <span className="NavWelcome">Welcome, {user}</span>
          
        </div>
      </div>
    </nav>
  );
}

export default Navbar;