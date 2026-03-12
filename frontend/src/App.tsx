import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Social from "./pages/Social";
import Profile from "./pages/Profile";
import Search from "./pages/Search.tsx";
import RecipeDetails from "./pages/RecipeDetails";
import Pantry from "./pages/Pantry";
import MainLayout from "./components/MainLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/social" element={<Social />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="/despensa" element={<Pantry />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
