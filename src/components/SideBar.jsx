import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../styles/sidebar.css';

const navItems = [
  { section: 'MAIN' },
  { label: 'Dashboard', to: '/dashboard', end: true },
  { label: 'Sell Ticket', to: '/dashboard/sell-ticket' },
  { section: 'MANAGE' },
  { label: 'Movies', to: '/dashboard/movies' },
  { label: 'Snacks', to: '/dashboard/snacks' },
  { label: 'History', to: '/dashboard/history' },
  { label: 'Settings', to: '/dashboard/settings' },
];

function Sidebar() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <>
      <div className="sidebar">
        {navItems.map((item) =>
          item.section ? (
            <div key={item.section} className="sb-section">
              {item.section}
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => isActive ? 'sb-item active' : 'sb-item'}
            >
              {item.label}
            </NavLink>
          )
        )}

        <div className="sb-footer">
          <button className="sb-logout" onClick={() => setShowLogoutModal(true)}>
            Logout →
          </button>
        </div>
      </div>

    
      {showLogoutModal && (
        <div className="sb-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="sb-modal" onClick={e => e.stopPropagation()}>
            <p className="sb-modal-title">Logout</p>
            <p className="sb-modal-msg">Are you sure you want to logout?</p>
            <div className="sb-modal-actions">
              <button className="sb-modal-cancel" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="sb-modal-confirm" onClick={handleLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;