import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage.jsx';
import IngredientPage from './pages/IngredientPage.jsx';
import Login from './pages/Login.jsx';
import PortionPage from './pages/PortionPage.jsx';
import Register from './pages/Register.jsx';
import SnackPage from './pages/SnackPage.jsx';

export default function App() {
  const [route, setRoute] = useState('');
  const [isAuthenticated, setIsAuthenticated] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Verifica se tem token no localStorage
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    // Define a rota inicial baseado na autenticação
    const hash = window.location.hash || '';
    if (token && !hash) {
      // Se autenticado e sem rota, vai para lanches
      setRoute('#/snacks');
      window.location.hash = '#/snacks';
    } else if (!token && !hash) {
      // Se não autenticado e sem rota, vai para login
      setRoute('#/login');
    } else {
      setRoute(hash);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/login';
      const token = localStorage.getItem('token');

      setIsAuthenticated(!!token);

      // Se não está autenticado e tenta acessar rota protegida
      if (
        !token &&
        !['#/login', '#/register'].includes(hash)
      ) {
        window.location.hash = '#/login';
        setRoute('#/login');
        return;
      }

      setRoute(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () =>
      window.removeEventListener(
        'hashchange',
        handleHashChange
      );
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.location.hash = '#/login';
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="app-container">
      <header>
        <button
          className="hamburger-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1 className="title">BlackLanches</h1>
        {isAuthenticated && (
          <button
            className="btn-logout-header"
            onClick={handleLogout}
          >
            Sair
          </button>
        )}
      </header>

      {/* Menu Lateral */}
      <div
        className={`side-menu ${menuOpen ? 'open' : ''}`}
      >
        <button
          className="close-menu"
          onClick={() => setMenuOpen(false)}
        >
          ✕
        </button>
        <nav>
          {!isAuthenticated ? (
            <>
              <a
                href="#/login"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </a>
              <a
                href="#/register"
                onClick={() => setMenuOpen(false)}
              >
                Cadastro
              </a>
            </>
          ) : (
            <>
              <a
                href="#/snacks"
                onClick={() => setMenuOpen(false)}
              >
                🍔 Lanches
              </a>
              <a
                href="#/home"
                onClick={() => setMenuOpen(false)}
              >
                🏠 Home
              </a>
              <a
                href="#/ingredients"
                onClick={() => setMenuOpen(false)}
              >
                🥬 Ingredientes
              </a>
              <a
                href="#/portions"
                onClick={() => setMenuOpen(false)}
              >
                🍽️ Porções
              </a>
            </>
          )}
        </nav>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
      <main>
        {route === '#/register' ? (
          <Register />
        ) : route === '#/login' ? (
          <Login />
        ) : route === '#/home' ? (
          <HomePage />
        ) : route === '#/ingredients' ? (
          <IngredientPage />
        ) : route === '#/portions' ? (
          <PortionPage />
        ) : (
          <SnackPage />
        )}
      </main>
    </div>
  );
}
