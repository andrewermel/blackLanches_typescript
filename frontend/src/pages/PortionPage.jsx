import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import {
  formatCurrency,
  formatWeight,
} from '../utils/formatters';
import './PortionPage.css';

const API_URL = API_ENDPOINTS.PORTIONS;
const INGREDIENTS_URL = API_ENDPOINTS.INGREDIENTS;

export default function PortionPage() {
  const [portions, setPortions] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState({
    ingredientId: '',
    name: '',
    weightG: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.hash = '#/login';
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
      setError('Erro ao buscar porções');
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
      setError('Erro ao buscar ingredientes');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const url = editingId
      ? `${API_URL}/${editingId}`
      : API_URL;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientId: Number(form.ingredientId),
          name: form.name,
          weightG: Number(form.weightG),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.error || 'Erro ao salvar porção'
        );
      }

      setForm({ ingredientId: '', name: '', weightG: '' });
      setEditingId(null);
      fetchPortions();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Deseja deletar esta porção?')) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao deletar');
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
    setForm({ ingredientId: '', name: '', weightG: '' });
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="card portion-container">
      <h2 className="page-title">Porções</h2>
      <p className="page-description">
        Porções são frações de ingredientes com peso e custo
        calculado automaticamente
      </p>

      <form
        onSubmit={handleSubmit}
        className="portion-form"
      >
        <select
          name="ingredientId"
          value={form.ingredientId}
          onChange={handleChange}
          required
        >
          <option value="">Selecione o ingrediente</option>
          {ingredients.map(ing => (
            <option key={ing.id} value={ing.id}>
              {ing.name} ({formatWeight(ing.weightG)} - R${' '}
              {formatCurrency(ing.cost)})
            </option>
          ))}
        </select>

        <input
          name="name"
          placeholder="Nome da porção"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="weightG"
          placeholder="Peso (g)"
          type="number"
          value={form.weightG}
          onChange={handleChange}
          required
        />

        <button type="submit">
          {editingId ? 'Atualizar' : 'Adicionar'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={handleCancel}
            className="btn-cancel"
          >
            Cancelar
          </button>
        )}
      </form>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : portions.length > 0 ? (
        <table className="portion-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ingrediente</th>
              <th className="text-right">Peso</th>
              <th className="text-right">Custo</th>
              <th className="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {portions.map(portion => (
              <tr key={portion.id}>
                <td>{portion.name}</td>
                <td>{portion.ingredient?.name || 'N/A'}</td>
                <td className="text-right">
                  {formatWeight(portion.weightG)}
                </td>
                <td className="text-right">
                  R$ {formatCurrency(portion.cost, 4)}
                </td>
                <td className="text-center">
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEdit(portion)}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(portion.id)
                      }
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          Nenhuma porção cadastrada
        </div>
      )}

      <div className="back-section">
        <a href="#/home">
          <button>← Voltar ao Menu</button>
        </a>
      </div>
    </div>
  );
}
