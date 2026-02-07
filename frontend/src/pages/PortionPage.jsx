import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../config/api";
import { formatCurrency, formatWeight, formatCostPerGram } from "../utils/formatters";

const API_URL = API_ENDPOINTS.PORTIONS;
const INGREDIENTS_URL = API_ENDPOINTS.INGREDIENTS;

export default function PortionPage() {
  const [portions, setPortions] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState({ ingredientId: "", name: "", weightG: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "#/login";
      return;
    }
    fetchPortions();
    fetchIngredients();
  }, []);

  async function fetchPortions() {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setPortions(data);
    } catch (err) {
      setError("Erro ao buscar porções");
    } finally {
      setLoading(false);
    }
  }

  async function fetchIngredients() {
    try {
      const res = await fetch(INGREDIENTS_URL);
      const data = await res.json();
      setIngredients(data);
    } catch (err) {
      setError("Erro ao buscar ingredientes");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const url = editingId ? `${API_URL}/${editingId}` : API_URL;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientId: Number(form.ingredientId),
          name: form.name,
          weightG: Number(form.weightG),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar porção");
      }

      setForm({ ingredientId: "", name: "", weightG: "" });
      setEditingId(null);
      fetchPortions();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Deseja deletar esta porção?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao deletar");
      }
      fetchPortions();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(portion) {
    setEditingId(portion.id);
    setForm({
      ingredientId: portion.ingredientId,
      name: portion.name,
      weightG: portion.weightG,
    });
  }

  function handleCancel() {
    setEditingId(null);
    setForm({ ingredientId: "", name: "", weightG: "" });
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", padding: 20 }}>
      <h2>Porções</h2>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Porções são frações de ingredientes com peso e custo calculado
        automaticamente
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <select
          name="ingredientId"
          value={form.ingredientId}
          onChange={handleChange}
          required
          style={{ marginRight: 8, padding: 8 }}
        >
          <option value="">Selecione o ingrediente</option>
          {ingredients.map((ing) => (
            <option key={ing.id} value={ing.id}>
              {ing.name} ({formatWeight(ing.weightG)} - R$ {formatCurrency(ing.cost)})
            </option>
          ))}
        </select>

        <input
          name="name"
          placeholder="Nome da porção"
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

        <button type="submit">{editingId ? "Atualizar" : "Adicionar"}</button>
        {editingId && (
          <button
            type="button"
            onClick={handleCancel}
            style={{ marginLeft: 8 }}
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
            <tr style={{ borderBottom: "2px solid #ddd" }}>
              <th style={{ textAlign: "left", padding: 8 }}>Nome</th>
              <th style={{ textAlign: "left", padding: 8 }}>Ingrediente</th>
              <th style={{ textAlign: "right", padding: 8 }}>Peso</th>
              <th style={{ textAlign: "right", padding: 8 }}>Custo</th>
              <th style={{ textAlign: "center", padding: 8 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {portions.map((portion) => (
              <tr key={portion.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{portion.name}</td>
                <td style={{ padding: 8 }}>
                  {portion.ingredient?.name || "N/A"}
                </td>
                <td style={{ textAlign: "right", padding: 8 }}>
                  {formatWeight(portion.weightG)}
                </td>
                <td style={{ textAlign: "right", padding: 8 }}>
                  R$ {formatCurrency(portion.cost, 4)}
                </td>
                <td style={{ textAlign: "center", padding: 8 }}>
                  <button
                    onClick={() => handleEdit(portion)}
                    style={{ marginRight: 4 }}
                  >
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(portion.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && portions.length === 0 && (
        <p style={{ textAlign: "center", color: "#999", marginTop: 20 }}>
          Nenhuma porção cadastrada
        </p>
      )}

      <div style={{ marginTop: 30 }}>
        <a href="#/home">
          <button>← Voltar ao Menu</button>
        </a>
      </div>
    </div>
  );
}
