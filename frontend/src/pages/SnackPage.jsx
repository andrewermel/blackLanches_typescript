import { useEffect, useState } from 'react';
import {
  API_ENDPOINTS,
  getSnackPortionUrl,
} from '../config/api';
import {
  formatCurrency,
  formatWeight,
} from '../utils/formatters';
import './SnackPage.css';

const API_URL = API_ENDPOINTS.SNACKS;
const PORTIONS_URL = API_ENDPOINTS.PORTIONS;

export default function SnackPage() {
  const [snacks, setSnacks] = useState([]);
  const [portions, setPortions] = useState([]);
  const [snackName, setSnackName] = useState('');
  const [selectedSnack, setSelectedSnack] = useState(null);
  const [selectedPortionId, setSelectedPortionId] =
    useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.hash = '#/login';
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
      setError('Erro ao buscar lanches');
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
      setError('Erro ao buscar porções');
    }
  }

  async function handleCreateSnack(e) {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: snackName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.error || 'Erro ao criar lanche'
        );
      }

      setSnackName('');
      fetchSnacks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteSnack(id) {
    if (!confirm('Deseja deletar este lanche?')) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao deletar');
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
      setError('');
    } catch (err) {
      setError('Erro ao buscar detalhes do lanche');
    }
  }

  async function handleAddPortion(e) {
    e.preventDefault();
    if (!selectedSnack || !selectedPortionId) return;

    try {
      const res = await fetch(
        getSnackPortionUrl(
          selectedSnack.id,
          selectedPortionId
        ),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            portionId: Number(selectedPortionId),
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.error || 'Erro ao adicionar porção'
        );
      }

      setSelectedPortionId('');
      handleViewDetails(selectedSnack.id);
      fetchSnacks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemovePortion(portionId) {
    if (!selectedSnack) return;
    if (!confirm('Remover esta porção do lanche?')) return;

    try {
      const res = await fetch(
        getSnackPortionUrl(selectedSnack.id, portionId),
        {
          method: 'DELETE',
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.error || 'Erro ao remover porção'
        );
      }

      handleViewDetails(selectedSnack.id);
      fetchSnacks();
    } catch (err) {
      setError(err.message);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.hash = '#/login';
  };

  return (
    <div className="card snack-container">
      <h2 className="page-title">Lanches</h2>
      <p className="page-description">
        Monte lanches com porções e veja o custo total e
        preço sugerido
      </p>

      <form
        onSubmit={handleCreateSnack}
        className="snack-form"
      >
        <input
          placeholder="Nome do lanche"
          value={snackName}
          onChange={e => setSnackName(e.target.value)}
          required
        />
        <button type="submit">Criar Lanche</button>
      </form>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="snack-layout">
        {/* Lista de Lanches */}
        <div className="snack-list">
          <h3>Lanches Cadastrados</h3>
          {loading ? (
            <div className="loading">Carregando...</div>
          ) : (
            <div className="snack-cards">
              {snacks.map(snack => (
                <div
                  key={snack.id}
                  className={`snack-card ${selectedSnack?.id === snack.id ? 'selected' : ''}`}
                >
                  <div className="snack-card-header">
                    <div className="snack-card-info">
                      <div className="snack-card-title">
                        {snack.name}
                      </div>
                      <div className="snack-card-meta">
                        Custo: R${' '}
                        {formatCurrency(snack.totalCost)} |
                        Preço sugerido: R${' '}
                        {formatCurrency(
                          snack.suggestedPrice
                        )}
                      </div>
                      <div className="snack-card-meta">
                        {snack.portions?.length || 0}{' '}
                        porções (
                        {formatWeight(
                          snack.totalWeightG || 0
                        )}
                        )
                      </div>
                    </div>
                    <div className="snack-card-actions">
                      <button
                        onClick={() =>
                          handleViewDetails(snack.id)
                        }
                      >
                        📋
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteSnack(snack.id)
                        }
                      >
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
          <div className="snack-details">
            <h3>{selectedSnack.name}</h3>

            <div className="snack-summary">
              <div className="snack-summary-item">
                <strong>Custo Total:</strong> R${' '}
                {formatCurrency(selectedSnack.totalCost)}
              </div>
              <div className="snack-summary-item">
                <strong>Peso Total:</strong>{' '}
                {formatWeight(selectedSnack.totalWeightG)}
              </div>
              <div className="snack-summary-item">
                <strong>Preço Sugerido:</strong> R${' '}
                {formatCurrency(
                  selectedSnack.suggestedPrice
                )}
              </div>
            </div>

            <div className="portions-section">
              <h4>Porções no Lanche:</h4>
              {selectedSnack.portions?.length > 0 ? (
                <ul className="portions-list">
                  {selectedSnack.portions.map(portion => (
                    <li
                      key={portion.id}
                      className="portion-item"
                    >
                      <span className="portion-info">
                        {portion.name} (
                        {formatWeight(portion.weightG)} - R${' '}
                        {formatCurrency(portion.cost, 4)})
                      </span>
                      <button
                        onClick={() =>
                          handleRemovePortion(portion.id)
                        }
                      >
                        ❌
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-portions">
                  Nenhuma porção adicionada
                </p>
              )}

              <form
                onSubmit={handleAddPortion}
                className="add-portion-form"
              >
                <select
                  value={selectedPortionId}
                  onChange={e =>
                    setSelectedPortionId(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Selecione uma porção
                  </option>
                  {portions.map(portion => (
                    <option
                      key={portion.id}
                      value={portion.id}
                    >
                      {portion.name} (
                      {formatWeight(portion.weightG)} - R${' '}
                      {formatCurrency(portion.cost, 4)})
                    </option>
                  ))}
                </select>
                <button type="submit">Adicionar</button>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="bottom-actions">
        <a href="#/home">
          <button className="btn-back">
            ← Voltar ao Menu
          </button>
        </a>
        <button
          onClick={handleLogout}
          className="btn-logout"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
