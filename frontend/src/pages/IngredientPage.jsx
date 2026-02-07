import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../config/api";
import { formatCurrency, formatWeight, formatCostPerGram } from "../utils/formatters";

const API_URL = API_ENDPOINTS.INGREDIENTS;

export default function IngredientPage() {
  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState({ name: "", weightG: "", cost: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "#/login";
      return;
    }
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

    const payload = {
      name: form.name,
      weightG: Number(form.weightG),
      cost: Number(form.cost),
    };

    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar ingrediente");
      }

      setForm({ name: "", weightG: "", cost: "" });
      setEditingId(null);
      fetchIngredients();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Deseja deletar este ingrediente?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao deletar");
      }
      fetchIngredients();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(ing) {
    setEditingId(ing.id);
    setForm({
      name: ing.name,
      weightG: ing.weightG,
      cost: ing.cost,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancel() {
    setEditingId(null);
    setForm({ name: "", weightG: "", cost: "" });
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: 20 }}>
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
          step="0.01"
          value={form.cost}
          onChange={handleChange}
          required
          style={{ marginRight: 8 }}
        />
        <button type="submit">{editingId ? "Atualizar" : "Adicionar"}</button>
        {editingId && (
          <button
            type="button"
            onClick={handleCancel}
            style={{ marginLeft: 4 }}
          >
            Cancelar
          </button>
        )}
      </form>

      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc" }}>
              <th style={{ textAlign: "left", padding: 8 }}>Nome</th>
              <th style={{ textAlign: "right", padding: 8 }}>Peso (g)</th>
              <th style={{ textAlign: "right", padding: 8 }}>Custo (R$)</th>
              <th style={{ textAlign: "right", padding: 8 }}>Custo/g</th>
              <th style={{ textAlign: "center", padding: 8 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing) => (
              <tr
                key={ing.id}
                style={{
                  borderBottom: "1px solid #eee",
                  backgroundColor:
                    editingId === ing.id ? "#fff9e6" : "transparent",
                }}
              >
                <td style={{ padding: 8 }}>{ing.name}</td>
                <td style={{ textAlign: "right", padding: 8 }}>
                  {formatWeight(ing.weightG)}
                </td>
                <td style={{ textAlign: "right", padding: 8 }}>
                  R$ {formatCurrency(ing.cost)}
                </td>
                <td style={{ textAlign: "right", padding: 8 }}>
                  R$ {formatCostPerGram(Number(ing.cost), ing.weightG)}
                </td>
                <td style={{ textAlign: "center", padding: 8 }}>
                  <button
                    onClick={() => handleEdit(ing)}
                    style={{ marginRight: 4 }}
                  >
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(ing.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 30 }}>
        <a href="#/home">
          <button>← Voltar ao Menu</button>
        </a>
      </div>
    </div>
  );
}
