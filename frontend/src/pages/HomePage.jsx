import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../config/api";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "#/login";
      return;
    }

    // Opcional: validar token com endpoint protegido
    fetch(API_ENDPOINTS.AUTH.PROTECTED, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => setError("Sessão expirada"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.hash = "#/login";
  };

  return (
    <div className="card">
      <h2>Dashboard - BlackLanches</h2>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {user && (
        <div style={{ marginBottom: 20 }}>
          <p>
            <strong>Bem-vindo:</strong> {user.email}
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="menu-card">
          <h3>🥬 Ingredientes</h3>
          <p>Gerencie os ingredientes disponíveis</p>
          <a href="#/ingredients">
            <button>Acessar</button>
          </a>
        </div>

        <div className="menu-card">
          <h3>🍽️ Porções</h3>
          <p>Crie porções a partir dos ingredientes</p>
          <a href="#/portions">
            <button>Acessar</button>
          </a>
        </div>

        <div className="menu-card">
          <h3>🍔 Lanches</h3>
          <p>Monte lanches com porções e calcule custos</p>
          <a href="#/snacks">
            <button>Acessar</button>
          </a>
        </div>

        <button onClick={handleLogout} style={{ marginTop: 20 }}>
          Sair
        </button>
      </div>
    </div>
  );
}
