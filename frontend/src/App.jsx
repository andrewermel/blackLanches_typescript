import { useEffect, useState } from "react";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

export default function App() {
  const [route, setRoute] = useState(window.location.hash || "#/login");

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || "#/login");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div className="app-container">
      <header>
        <h1>BlackLanches</h1>
        <nav>
          <a href="#/login">Login</a>
          <a href="#/register">Cadastro</a>
        </nav>
      </header>
      <main>{route === "#/register" ? <Register /> : <Login />}</main>
    </div>
  );
}
