import { Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import MainPage from "./components/MainPage";
import MoviesPage from "./pages/Movies.jsx";
import SellTicket from "./pages/SellTicket.jsx";
import Settings from "./pages/Settings.jsx";
import Snacks from "./pages/Snacks.jsx";
import HistoryPage from "./pages/History.jsx"; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<MainPage />} />
        <Route path="movies" element={<MoviesPage />} />
        <Route path="sell-ticket" element={<SellTicket />} />
        <Route path="snacks" element={<Snacks />} />
        <Route path="history" element={<HistoryPage />} /> 
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;