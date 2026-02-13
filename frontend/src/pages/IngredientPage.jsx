import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import {
  formatCostPerGram,
  formatCurrency,
  formatWeight,
} from '../utils/formatters';
import './IngredientPage.css';

const API_URL = API_ENDPOINTS.INGREDIENTS;

export default function IngredientPage() {
  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState({
    name: '',
    weightG: '',
    cost: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.hash = '#/login';
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
      setError('Erro ao buscar ingredientes');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const payload = {
      name: form.name,
      weightG: Number(form.weightG),
      cost: Number(form.cost),
    };

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.error || 'Erro ao salvar ingrediente'
        );
      }

      setForm({ name: '', weightG: '', cost: '' });
      setEditingId(null);
      fetchIngredients();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Deseja deletar este ingrediente?'))
      return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao deletar');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancel() {
    setEditingId(null);
    setForm({ name: '', weightG: '', cost: '' });
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="card ingredient-container">
      <h2 className="page-title">Ingredientes</h2>
      <p className="page-description">
        Gerencie os ingredientes com peso e custo
      </p>

      <form
        onSubmit={handleSubmit}
        className="ingredient-form"
      >
        <input
          name="name"
          placeholder="Nome"
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
        <input
          name="cost"
          placeholder="Custo"
          type="number"
          step="0.01"
          value={form.cost}
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
      ) : ingredients.length > 0 ? (
        <table className="ingredient-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th className="text-right">Peso (g)</th>
              <th className="text-right">Custo (R$)</th>
              <th className="text-right">Custo/g</th>
              <th className="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map(ing => (
              <tr
                key={ing.id}
                className={
                  editingId === ing.id ? 'editing' : ''
                }
              >
                <td>{ing.name}</td>
                <td className="text-right">
                  {formatWeight(ing.weightG)}
                </td>
                <td className="text-right">
                  R$ {formatCurrency(ing.cost)}
                </td>
                <td className="text-right">
                  R${' '}
                  {formatCostPerGram(
                    Number(ing.cost),
                    ing.weightG
                  )}
                </td>
                <td className="text-center">
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(ing)}>
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(ing.id)}
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
          Nenhum ingrediente cadastrado
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
