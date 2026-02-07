import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000/api/v1/ingredients";

export default function IngredientPage() {
  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState({ name: "", weightG: "", cost: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchIngredients();
  }, []);

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
      setForm({ name: "", weightG: "", cost: "" });
      fetchIngredients();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", padding: 20 }}>
      <h2>Ingredientes</h2>
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
      {error && <div style={{ color: "red" }}>{error}</div>}
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
}
