import { useState } from 'react';
import '../styles/settings.css';

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

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

      <button className="sg-save" onClick={save}>
        {saved ? '✓ Saved' : 'Save Changes'}
      </button>
    </div>
  );
}