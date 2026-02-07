import { useEffect, useState } from "react";
import { API_ENDPOINTS, getSnackPortionUrl } from "../config/api";
import { formatCurrency, formatWeight } from "../utils/formatters";

const API_URL = API_ENDPOINTS.SNACKS;
const PORTIONS_URL = API_ENDPOINTS.PORTIONS;

export default function SnackPage() {
  const [snacks, setSnacks] = useState([]);
  const [portions, setPortions] = useState([]);
  const [snackName, setSnackName] = useState("");
  const [selectedSnack, setSelectedSnack] = useState(null);
  const [selectedPortionId, setSelectedPortionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "#/login";
      return;
    }
    fetchSnacks();
    fetchPortions();
  }, []);

  async function fetchSnacks() {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setSnacks(data);
    } catch (err) {
      setError("Erro ao buscar lanches");
    } finally {
      setLoading(false);
    }
  }

  async function fetchPortions() {
    try {
      const res = await fetch(PORTIONS_URL);
      const data = await res.json();
      setPortions(data);
    } catch (err) {
      setError("Erro ao buscar porções");
    }
  }

  async function handleCreateSnack(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: snackName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar lanche");
      }

      setSnackName("");
      fetchSnacks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteSnack(id) {
    if (!confirm("Deseja deletar este lanche?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao deletar");
      }
      fetchSnacks();
      if (selectedSnack?.id === id) setSelectedSnack(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleViewDetails(snackId) {
    try {
      const res = await fetch(`${API_URL}/${snackId}`);
      const data = await res.json();
      setSelectedSnack(data);
      setError("");
    } catch (err) {
      setError("Erro ao buscar detalhes do lanche");
    }
  }

  async function handleAddPortion(e) {
    e.preventDefault();
    if (!selectedSnack || !selectedPortionId) return;

    try {
      const res = await fetch(
        getSnackPortionUrl(selectedSnack.id, selectedPortionId),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ portionId: Number(selectedPortionId) }),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao adicionar porção");
      }

      setSelectedPortionId("");
      handleViewDetails(selectedSnack.id);
      fetchSnacks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemovePortion(portionId) {
    if (!selectedSnack) return;
    if (!confirm("Remover esta porção do lanche?")) return;

    try {
      const res = await fetch(getSnackPortionUrl(selectedSnack.id, portionId), {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao remover porção");
      }

      handleViewDetails(selectedSnack.id);
      fetchSnacks();
    } catch (err) {
      setError(err.message);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.hash = "#/login";
  };

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: 20 }}>
      <h2>Lanches</h2>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Monte lanches com porções e veja o custo total e preço sugerido
      </p>

      <form onSubmit={handleCreateSnack} style={{ marginBottom: 24 }}>
        <input
          placeholder="Nome do lanche"
          value={snackName}
          onChange={(e) => setSnackName(e.target.value)}
          required
          style={{ marginRight: 8 }}
        />
        <button type="submit">Criar Lanche</button>
      </form>

      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

      <div style={{ display: "flex", gap: 20 }}>
        {/* Lista de Lanches */}
        <div style={{ flex: 1 }}>
          <h3>Lanches Cadastrados</h3>
          {loading ? (
            <div>Carregando...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {snacks.map((snack) => (
                <div
                  key={snack.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor:
                      selectedSnack?.id === snack.id ? "#f0f8ff" : "white",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>{snack.name}</strong>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        Custo: R$ {formatCurrency(snack.totalCost)} | Preço
                        sugerido: R$ {formatCurrency(snack.suggestedPrice)}
                      </div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {snack.portions?.length || 0} porções (
                        {formatWeight(snack.totalWeightG || 0)})
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => handleViewDetails(snack.id)}
                        style={{ marginRight: 4 }}
                      >
                        📋
                      </button>
                      <button onClick={() => handleDeleteSnack(snack.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes do Lanche Selecionado */}
        {selectedSnack && (
          <div
            style={{
              flex: 1,
              border: "1px solid #ddd",
              padding: 15,
              borderRadius: 8,
            }}
          >
            <h3>{selectedSnack.name}</h3>

            <div
              style={{
                marginBottom: 15,
                padding: 10,
                backgroundColor: "#f9f9f9",
                borderRadius: 5,
              }}
            >
              <div>
                <strong>Custo Total:</strong> R${" "}
                {formatCurrency(selectedSnack.totalCost)}
              </div>
              <div>
                <strong>Peso Total:</strong>{" "}
                {formatWeight(selectedSnack.totalWeightG)}
              </div>
              <div style={{ fontSize: 18, color: "green", marginTop: 5 }}>
                <strong>Preço Sugerido:</strong> R${" "}
                {formatCurrency(selectedSnack.suggestedPrice)}
              </div>
            </div>

            <h4>Porções no Lanche:</h4>
            {selectedSnack.portions?.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {selectedSnack.portions.map((portion) => (
                  <li
                    key={portion.id}
                    style={{
                      padding: 8,
                      borderBottom: "1px solid #eee",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      {portion.name} ({formatWeight(portion.weightG)} - R${" "}
                      {formatCurrency(portion.cost, 4)})
                    </span>
                    <button onClick={() => handleRemovePortion(portion.id)}>
                      ❌
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#999" }}>Nenhuma porção adicionada</p>
            )}

            <form onSubmit={handleAddPortion} style={{ marginTop: 15 }}>
              <select
                value={selectedPortionId}
                onChange={(e) => setSelectedPortionId(e.target.value)}
                required
                style={{ marginRight: 8, padding: 8, width: "70%" }}
              >
                <option value="">Selecione uma porção</option>
                {portions.map((portion) => (
                  <option key={portion.id} value={portion.id}>
                    {portion.name} ({formatWeight(portion.weightG)} - R${" "}
                    {formatCurrency(portion.cost, 4)})
                  </option>
                ))}
              </select>
              <button type="submit">Adicionar</button>
            </form>
          </div>
        )}
      </div>

      <div style={{ marginTop: 30 }}>
        <a href="#/home">
          <button>← Voltar ao Menu</button>
        </a>
        <button
          onClick={handleLogout}
          style={{ marginLeft: 8, backgroundColor: "#f44336", color: "white" }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}
