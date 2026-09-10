import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import ArtistDetails from "./Pages/ArtistDetails";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import DashboardRedirect from "./Pages/DashboardRedirect";
import Settings from "./Pages/Settings";
import Artists from "./Pages/Artists";
import { AuthProvider } from "./context/AuthContext";
import MobileBottomNav from "./components/MobileBottomNav";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/artists/:id" element={<ArtistDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/dashboard/settings" element={<Settings />} />
        </Routes>
        <MobileBottomNav />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
