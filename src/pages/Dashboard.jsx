import { Outlet } from 'react-router-dom';
import '../styles/dashboard.css';
import Nav from '../components/Nav.jsx';
import Sidebar from '../components/SideBar.jsx';

function Dashboard() {
  return (
    <div className='page'>
      <Nav />
      <div className='pageBody'>
        <Sidebar />
        <Outlet /> 
      </div>
    </div>
  );
}

export default Dashboard;