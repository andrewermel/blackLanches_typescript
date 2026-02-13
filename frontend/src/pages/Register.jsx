import { useState } from 'react';
import './Register.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch(
        'http://localhost:3000/users',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessage(
          'Cadastro realizado. Você pode fazer login agora.'
        );
        window.location.hash = '#/login';
      } else {
        setMessage(data.error || 'Erro no cadastro.');
      }
    } catch (err) {
      setMessage('Erro de conexão.');
    }
  };

  return (
    <div className="card register-container">
      <h2 className="register-title">Cadastro</h2>
      {message && <div className="message">{message}</div>}
      <form
        onSubmit={handleSubmit}
        className="register-form"
      >
        <div className="form-group">
          <label>Nome</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
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
          Cadastrar
        </button>
      </form>
      <div className="login-link">
        Já tem conta? <a href="#/login">Faça login</a>
      </div>
    </div>
  );
}
