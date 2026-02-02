import { useState } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Cadastro realizado. Você pode fazer login agora.");
        window.location.hash = "#/login";
      } else {
        setMessage(data.error || "Erro no cadastro.");
      }
    } catch (err) {
      setMessage("Erro de conexão.");
    }
  };

  return (
    <div className="card">
      <h2>Cadastro</h2>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          Nome
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}
