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
    return <div>Carregando...</div>;
  }

  return (
    <div className="app-container w-full flex flex-col items-center pt-4">
      <header>
        <h1 className="title text-2xl font-bold text-amber-500 text-center m-0">
          BlackLanches
        </h1>
        <nav className="menu">
          {!isAuthenticated ? (
            <>
              <a href="#/login">Login</a>
              <a href="#/register">Cadastro</a>
            </>
          ) : (
            <>
              <a href="#/snacks">Lanches</a>
              <a href="#/home">Home</a>
              <a href="#/ingredients">Ingredientes</a>
              <a href="#/portions">Porções</a>
              <button
                className="bt-exit"
                onClick={handleLogout}
              >
                Sair
              </button>
            </>
          )}
        </nav>
      </header>
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
