import { useState } from 'react';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch(
        'http://localhost:3000/api/v1/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setMessage('Login realizado com sucesso.');
      } else {
        setMessage(data.error || 'Erro no login.');
      }
    } catch (err) {
      setMessage('Erro de conexão.');
    }
  };

  return (
    <div className="card login-container">
      <h2 className="login-title">Login</h2>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Senha</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-btn">
          Entrar
        </button>
      </form>
      <div className="register-link">
        Não tem conta? <a href="#/register">Cadastre-se</a>
      </div>
    </div>
  );
}
