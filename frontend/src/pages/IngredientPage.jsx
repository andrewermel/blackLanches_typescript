// Importa hooks do React para manipular estado e efeitos colaterais
import { useEffect, useState } from "react";

// URL base da API de ingredientes
const API_URL = "http://localhost:3000/ingredients"; // ajuste se necessário

// Lista de ingredientes
const [ingredients, setIngredients] = useState([]);
// Estado do formulário
const [form, setForm] = useState({ name: "", weightG: "", cost: "" });
// Estado de carregamento
const [loading, setLoading] = useState(false);
// Estado de erro
const [error, setError] = useState("");

// Busca ingredientes ao carregar a página
useEffect(() => {
  fetchIngredients();
}, []);

// Função para buscar todos os ingredientes da API
async function fetchIngredients() {
  setLoading(true);
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    setIngredients(data);
  } catch (err) {
    setError("Erro ao buscar ingredientes");
  } finally {
    setLoading(false);
  }
}

// Função chamada ao enviar o formulário para adicionar ingrediente
async function handleSubmit(e) {
  e.preventDefault();
  setError("");
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        weightG: Number(form.weightG),
        cost: Number(form.cost),
      }),
    });
    if (!res.ok) throw new Error("Erro ao adicionar ingrediente");
    setForm({ name: "", weightG: "", cost: "" }); // Limpa o formulário
    fetchIngredients(); // Atualiza a lista
  } catch (err) {
    setError(err.message);
  }
}

// Atualiza o estado do formulário conforme o usuário digita
function handleChange(e) {
  setForm({ ...form, [e.target.name]: e.target.value });
}

return (
  <div style={{ maxWidth: 500, margin: "2rem auto", padding: 20 }}>
    <h2>Ingredientes</h2>
    {/* Formulário para adicionar ingrediente */}
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <input
        name="name"
        placeholder="Nome"
        value={form.name}
        onChange={handleChange}
        required
        style={{ marginRight: 8 }}
      />
      <input
        name="weightG"
        placeholder="Peso (g)"
        type="number"
        value={form.weightG}
        onChange={handleChange}
        required
        style={{ marginRight: 8 }}
      />
      <input
        name="cost"
        placeholder="Custo"
        type="number"
        value={form.cost}
        onChange={handleChange}
        required
        style={{ marginRight: 8 }}
      />
      <button type="submit">Adicionar</button>
    </form>
    {/* Exibe erro, se houver */}
    {error && <div style={{ color: "red" }}>{error}</div>}
    {/* Exibe loading ou lista de ingredientes */}
    {loading ? (
      <div>Carregando...</div>
    ) : (
      <ul>
        {ingredients.map((ing) => (
          <li key={ing.id}>
            {ing.name} - {ing.weightG}g - R$ {Number(ing.cost).toFixed(2)}
          </li>
        ))}
      </ul>
    )}
  </div>
);
