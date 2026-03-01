import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SocialPage from "./pages/SocialPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/social" element={<SocialPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
