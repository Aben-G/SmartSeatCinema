import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/login.css';

const API_BASE = 'http://localhost:5000/api';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setError('Enter a username to continue.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password }),
      });
      const data = await response.json();
      if (data.success) {
        setError('');
        localStorage.setItem('ssc_user', cleanUsername);
        navigate("/dashboard");
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed');
    }
  };

  return (
    <div className="LoginOverlay">

      <div className="BrandLogo">SMART<span className='BrandHalf'>SEAT</span>CINEMA</div>

      <form className="LoginContainer" onSubmit={handleLogin}>

        <h3 className='LoginHeader'>Theater Access</h3>
        <p className='LoginP'>Premium Cinema Control Systems</p>

        <div className="InputGroup">
          <label>USERNAME</label>
          <input
            type="text"
            name="username"
            placeholder="Please Enter Your Employee UserName"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>

        <div className="InputGroup">
          <label>PASSWORD</label>
          <input
            type="password"
            name="password"
            placeholder="**************"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <div className="LoginUtils">
          <label className="CheckboxContainer">
            <input type="checkbox" />
            Stay logged in
          </label>
          
        </div>

        <button className="LoginBtn" type="submit">Login →</button>

        <p className='AdminText'>Don't Have An Account? <span className='LoginAdminSpan'>Please Contact Admin</span></p>
      </form>

      <div className="LoginFooter">
        <p className='MutedText'>Authorized personnel only.</p>
        <p className='MutedText'>
          System version 4.2.0-<span className='RedAccent'>PREMIUM</span>
        </p>
      </div>

      {error ? <p className="LoginError" role="alert" aria-live="polite">{error}</p> : null}

    </div>
  );
}

export default Login;