import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "./context/UserContext";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Perfil from "./components/Perfil";
import PostDetail from "./pages/PostDetail";
import CrearPost from "./pages/CrearPost";

function App() {
  const { user } = useContext(UserContext);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Cambié para que la ruta "/" muestre Home sin validar usuario */}
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Las rutas protegidas siguen validando usuario */}
          <Route
            path="/home"
            element={user ? <Home /> : <Navigate to="/login" replace />}
          />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route
            path="/crear-post"
            element={user ? <CrearPost /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/perfil"
            element={user ? <Perfil /> : <Navigate to="/login" replace />}
          />

          {/* Cualquier otra ruta va a home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;



