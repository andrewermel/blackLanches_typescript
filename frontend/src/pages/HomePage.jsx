import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import './HomePage.css';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.hash = '#/login';
      return;
    }

    // Opcional: validar token com endpoint protegido
    fetch(API_ENDPOINTS.AUTH.PROTECTED, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => setError('Sessão expirada'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.hash = '#/login';
  };

  return (
    <div className="card home-container">
      <h2>BlackLanches</h2>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {user && (
        <div className="welcome-section">
          <p className="welcome-text">
            <strong>Bem-vindo:</strong> {user.email}
          </p>
        </div>
      )}

      <div className="menu-grid">
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

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Sair
        </button>
      </div>
    </div>
  );
}
