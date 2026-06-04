import { useState, useEffect } from 'react';
import '../styles/settings.css';

const API_BASE = 'http://localhost:5000/api';

const THEMES = [
  { id: 'red',    label: 'Crimson',  color: '#cc1a1a' },
  { id: 'blue',   label: 'Electric', color: '#1a6acc' },
  { id: 'green',  label: 'Emerald',  color: '#1acc6a' },
  { id: 'gold',   label: 'Gold',     color: '#cc991a' },
  { id: 'purple', label: 'Violet',   color: '#7a1acc' },
];

function Toggle({ checked, onChange }) {
  return (
    <button className={`sg-toggle ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}>
      <span className="sg-knob" />
    </button>
  );
}

export default function Settings() {
  const [theme, setTheme]       = useState('red');
  const [compact, setCompact]   = useState(false);
  const [sound, setSound]       = useState(true);
  const [currency, setCurrency] = useState('ETB');
  const [saved, setSaved]       = useState(false);

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [users, setUsers] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [userError, setUserError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Unable to load users:', error);
      setUserError('Unable to load users.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserError('');
    setUserMessage('');

    if (!newUsername.trim() || !newPassword) {
      setUserError('Username and password are required.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setUserError(data.error || 'Unable to create user.');
        return;
      }

      setUserMessage(`User ${data.user.username} created.`);
      setNewUsername('');
      setNewPassword('');
      setNewRole('user');
      fetchUsers();
    } catch (error) {
      console.error('Create user error:', error);
      setUserError('Unable to create user.');
    }
  };

  return (
    <div className="sg-page">
    

      <div className="sg-card">
        <p className="sg-card-title">Accent Color</p>
        <div className="sg-swatches">
          {THEMES.map(t => (
            <button
              key={t.id}
              className={`sg-swatch ${theme === t.id ? 'active' : ''}`}
              style={{ background: t.color }}
              onClick={() => setTheme(t.id)}
              title={t.label}
            />
          ))}
        </div>
      </div>

      <div className="sg-card">
        <div className="sg-row">
          <div>
            <p className="sg-row-label">Compact Mode</p>
            <p className="sg-row-hint">Reduce spacing across the UI</p>
          </div>
          <Toggle checked={compact} onChange={setCompact} />
        </div>

        <div className="sg-divider" />

        <div className="sg-row">
          <div>
            <p className="sg-row-label">Sound Alerts</p>
            <p className="sg-row-hint">Play sound on ticket confirmation</p>
          </div>
          <Toggle checked={sound} onChange={setSound} />
        </div>

        <div className="sg-divider" />

        <div className="sg-row">
          <div>
            <p className="sg-row-label">Currency</p>
            <p className="sg-row-hint">Used in all pricing and receipts</p>
          </div>
          <select
            className="sg-select"
            value={currency}
            onChange={e => setCurrency(e.target.value)}
          >
            {['ETB', 'USD', 'EUR', 'GBP'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="sg-card">
        <p className="sg-card-title">Add New User</p>
        <form className="sg-form" onSubmit={handleCreateUser}>
          <div className="sg-row">
            <label>Username</label>
            <input
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              placeholder="New username"
            />
          </div>

          <div className="sg-row">
            <label>Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password"
            />
          </div>

          <div className="sg-row">
            <label>Role</label>
            <select value={newRole} onChange={e => setNewRole(e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button className="sg-save" type="submit">Create User</button>
          {userMessage && <p className="sg-success">{userMessage}</p>}
          {userError && <p className="sg-error">{userError}</p>}
        </form>
      </div>

      <div className="sg-card">
        <p className="sg-card-title">Existing Users</p>
        <div className="sg-user-list">
          {users.length === 0 ? (
            <p>No users loaded yet.</p>
          ) : (
            users.map(user => (
              <div key={user._id} className="sg-user-item">
                <strong>{user.username}</strong>
                <span>{user.role}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <button className="sg-save" onClick={save}>
        {saved ? '✓ Saved' : 'Save Changes'}
      </button>
    </div>
  );
}