import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../constants';
import { apiService } from '../services/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.ME}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } catch (error) {
      console.error(
        'Erro ao verificar autenticação:',
        error
      );
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await apiService.post(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        email,
        password,
      }
    );
    localStorage.setItem('token', data.token);

    // Buscar dados do usuário após login
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.ME}`,
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error(
        'Erro ao buscar dados do usuário:',
        error
      );
    }

    setIsAuthenticated(true);
    return data;
  };

  const register = async (name, email, password) => {
    const userData = await apiService.post(
      API_ENDPOINTS.AUTH.REGISTER,
      {
        name,
        email,
        password,
      }
    );

    // Após criar usuário, fazer login
    return await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    window.location.hash = '#/login';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuth deve ser usado dentro de um AuthProvider'
    );
  }
  return context;
};
