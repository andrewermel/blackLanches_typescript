import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Card, CardBody } from '../components/Card';
import { ImageUpload } from '../components/ImageUpload';
import { Input } from '../components/Input';
import { Loading } from '../components/Loading';
import {
  API_BASE_URL,
  API_ENDPOINTS,
  IMAGE_CONFIG,
  ROUTES,
} from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useResource } from '../hooks/useApi';
import {
  formatCurrency,
  formatWeight,
} from '../utils/formatters';
import './SnackPage.css';

export default function SnackPage() {
  const { isAuthenticated } = useAuth();
  const {
    data: snacks,
    loading,
    error,
    fetchAll,
    create,
    remove,
  } = useResource(API_ENDPOINTS.SNACKS);
  const { data: portions, fetchAll: fetchPortions } =
    useResource(API_ENDPOINTS.PORTIONS);

  const [snackName, setSnackName] = useState('');
  const [snackImage, setSnackImage] = useState(null);
  const [selectedSnack, setSelectedSnack] = useState(null);
  const [selectedPortionId, setSelectedPortionId] =
    useState('');
  const [portionsToAdd, setPortionsToAdd] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSnackId, setEditingSnackId] =
    useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.hash = ROUTES.LOGIN;
      return;
    }
    fetchAll().then(data => {
      console.log('📊 Lanches carregados:', data);
      if (data && data.length > 0) {
        console.log('🔍 Primeiro lanche:', data[0]);
        console.log(
          '💰 totalCost:',
          data[0].totalCost,
          typeof data[0].totalCost
        );
        console.log(
          '⚖️ totalWeightG:',
          data[0].totalWeightG,
          typeof data[0].totalWeightG
        );
        console.log(
          '💵 suggestedPrice:',
          data[0].suggestedPrice,
          typeof data[0].suggestedPrice
        );
      }
    });
    fetchPortions();
  }, [isAuthenticated]);

  const handleAddPortionToList = e => {
    e.preventDefault();
    if (!selectedPortionId) return;

    const portion = portions.find(
      p => p.id === Number(selectedPortionId)
    );
    if (
      portion &&
      !portionsToAdd.find(p => p.id === portion.id)
    ) {
      setPortionsToAdd([...portionsToAdd, portion]);
      setSelectedPortionId('');
    }
  };

  const handleRemovePortionFromList = portionId => {
    setPortionsToAdd(
      portionsToAdd.filter(p => p.id !== portionId)
    );
  };

  const handleCreateSnack = async e => {
    e.preventDefault();
    setActionError('');
    setActionLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', snackName);

      if (snackImage) {
        if (typeof snackImage === 'string') {
          formData.append('imageUrl', snackImage);
        } else {
          formData.append('image', snackImage);
        }
      }

      // Criar o lanche manualmente (sem usar o hook create)
      const fullUrl = `${API_BASE_URL}${API_ENDPOINTS.SNACKS}`;
      console.log('📤 Enviando requisição para:', fullUrl);
      console.log(
        '🔑 Token:',
        token ? 'Presente' : 'Ausente'
      );

      const createResponse = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('📥 Resposta recebida:', {
        status: createResponse.status,
        ok: createResponse.ok,
        statusText: createResponse.statusText,
        contentType:
          createResponse.headers.get('content-type'),
      });

      if (!createResponse.ok) {
        const text = await createResponse.text();
        console.error('❌ Erro na resposta:', {
          status: createResponse.status,
          statusText: createResponse.statusText,
          text: text.substring(0, 200),
        });

        try {
          const errorData = JSON.parse(text);
          throw new Error(
            errorData.error || 'Erro ao criar lanche'
          );
        } catch (parseError) {
          throw new Error(
            `Erro ao criar lanche (${createResponse.status}): ${createResponse.statusText}`
          );
        }
      }

      const newSnack = await createResponse.json();

      // Adicionar porções ao lanche criado
      if (portionsToAdd.length > 0 && newSnack?.id) {
        for (const portion of portionsToAdd) {
          const response = await fetch(
            `${API_BASE_URL}${API_ENDPOINTS.SNACKS}/${newSnack.id}/portions/${portion.id}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                portionId: portion.id,
              }),
            }
          );

          if (!response.ok) {
            const text = await response.text();
            console.error('❌ Erro ao adicionar porção:', {
              status: response.status,
              statusText: response.statusText,
              text: text.substring(0, 200),
            });

            try {
              const errorData = JSON.parse(text);
              throw new Error(
                errorData.error ||
                  'Erro ao adicionar porção ao lanche'
              );
            } catch (parseError) {
              throw new Error(
                `Erro ao adicionar porção (${response.status}): ${response.statusText}`
              );
            }
          }
        }
      }

      setSnackName('');
      setSnackImage(null);
      setPortionsToAdd([]);

      // Recarregar todos os lanches para pegar os valores atualizados
      await fetchAll();

      console.log(
        '✅ Lanche criado com sucesso:',
        newSnack
      );
      console.log(
        '✅ Lanches recarregados:',
        await fetchAll()
      );
    } catch (err) {
      setActionError(err.message);
      console.error('❌ Erro ao criar lanche:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSnack = snack => {
    setIsEditing(true);
    setEditingSnackId(snack.id);
    setSnackName(snack.name);
    setSnackImage(snack.imageUrl);
    // Carregar porções se já existirem
    if (snack.portions && snack.portions.length > 0) {
      setPortionsToAdd(snack.portions);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingSnackId(null);
    setSnackName('');
    setSnackImage(null);
    setPortionsToAdd([]);
    setActionError('');
  };

  const handleUpdateSnack = async e => {
    e.preventDefault();
    setActionError('');
    setActionLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Atualizar nome e imagem do lanche
      const formData = new FormData();
      formData.append('name', snackName);

      if (snackImage) {
        if (typeof snackImage === 'string') {
          formData.append('imageUrl', snackImage);
        } else {
          formData.append('image', snackImage);
        }
      }

      // Buscar porções atuais do lanche
      const currentSnackResponse = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.SNACKS}/${editingSnackId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const currentSnack =
        await currentSnackResponse.json();
      const currentPortions = currentSnack.portions || [];

      // Remover porções que não estão mais na lista
      for (const currentPortion of currentPortions) {
        if (
          !portionsToAdd.find(
            p => p.id === currentPortion.id
          )
        ) {
          await fetch(
            `${API_BASE_URL}${API_ENDPOINTS.SNACKS}/${editingSnackId}/portions/${currentPortion.id}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      }

      // Adicionar novas porções
      for (const portion of portionsToAdd) {
        if (
          !currentPortions.find(p => p.id === portion.id)
        ) {
          await fetch(
            `${API_BASE_URL}${API_ENDPOINTS.SNACKS}/${editingSnackId}/portions/${portion.id}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                portionId: portion.id,
              }),
            }
          );
        }
      }

      handleCancelEdit();
      await fetchAll();

      console.log('✅ Lanche atualizado com sucesso');
    } catch (err) {
      setActionError(err.message);
      console.error('❌ Erro ao atualizar lanche:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSnack = async id => {
    if (!confirm('Deseja deletar este lanche?')) return;

    try {
      await remove(id);
      if (selectedSnack?.id === id) setSelectedSnack(null);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleViewDetails = async snackId => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.SNACKS}/${snackId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setSelectedSnack(data);
      setActionError('');
    } catch (err) {
      setActionError('Erro ao buscar detalhes do lanche');
    }
  };

  const handleAddPortion = async e => {
    e.preventDefault();
    if (!selectedSnack || !selectedPortionId) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.SNACKS}/${selectedSnack.id}/portions/${selectedPortionId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
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
      fetchAll();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemovePortion = async portionId => {
    if (
      !selectedSnack ||
      !confirm('Remover esta porção do lanche?')
    )
      return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.SNACKS}/${selectedSnack.id}/portions/${portionId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.error || 'Erro ao remover porção'
        );
      }

      handleViewDetails(selectedSnack.id);
      fetchAll();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getImageUrl = imageUrl => {
    if (!imageUrl) return null;
    return imageUrl.startsWith('http')
      ? imageUrl
      : `${IMAGE_CONFIG.UPLOAD_PATH}${imageUrl}`;
  };

  return (
    <Card className="snack-container">
      <CardBody>
        <h2 className="page-title">Lanches</h2>
        <p className="page-description">
          Monte lanches com porções e veja o custo total e
          preço sugerido
        </p>

        {isEditing && (
          <div className="edit-mode-banner">
            ✏️ Editando lanche - Faça as alterações e clique
            em Salvar
          </div>
        )}

        <div className="help-message">
          <strong>💡 Como criar um lanche:</strong>
          <br />
          1️⃣ Preencha o nome do lanche e adicione uma imagem
          (opcional)
          <br />
          2️⃣ Adicione as porções que fazem parte do lanche
          <br />
          3️⃣ Clique em "Criar Lanche" para salvar com as
          porções
        </div>

        <form
          onSubmit={
            isEditing
              ? handleUpdateSnack
              : handleCreateSnack
          }
          className="snack-form"
        >
          <div className="form-row">
            <Input
              type="text"
              placeholder="Nome do lanche"
              value={snackName}
              onChange={e => setSnackName(e.target.value)}
              required
            />
          </div>

          <ImageUpload
            value={snackImage}
            onChange={setSnackImage}
            label="Imagem do Lanche (opcional)"
            error={actionError}
          />

          {portions && portions.length > 0 ? (
            <>
              <div className="add-portion-to-form">
                <h4>Adicionar Porções:</h4>
                <div className="form-row">
                  <select
                    value={selectedPortionId}
                    onChange={e =>
                      setSelectedPortionId(e.target.value)
                    }
                    className="input"
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
                  <Button
                    type="button"
                    onClick={handleAddPortionToList}
                    variant="secondary"
                    disabled={!selectedPortionId}
                  >
                    ➕ Adicionar
                  </Button>
                </div>

                {portionsToAdd.length > 0 && (
                  <div className="portions-preview">
                    <h5>Porções selecionadas:</h5>
                    <ul className="portions-list">
                      {portionsToAdd.map(portion => (
                        <li
                          key={portion.id}
                          className="portion-item"
                        >
                          <span className="portion-info">
                            {portion.name} (
                            {formatWeight(portion.weightG)}{' '}
                            - R${' '}
                            {formatCurrency(
                              portion.cost,
                              4
                            )}
                            )
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemovePortionFromList(
                                portion.id
                              )
                            }
                            className="btn-remove-portion"
                          >
                            ❌
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="portions-summary">
                      <strong>Total:</strong>{' '}
                      {portionsToAdd.length} porções • Peso:{' '}
                      {formatWeight(
                        portionsToAdd.reduce(
                          (sum, p) => sum + p.weightG,
                          0
                        )
                      )}{' '}
                      • Custo: R${' '}
                      {formatCurrency(
                        portionsToAdd.reduce(
                          (sum, p) => sum + p.cost,
                          0
                        )
                      )}{' '}
                      • Preço Sugerido: R${' '}
                      {formatCurrency(
                        portionsToAdd.reduce(
                          (sum, p) => sum + p.cost,
                          0
                        ) * 2
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-portions-warning">
              ⚠️ Você precisa cadastrar porções primeiro!
              <br />
              <Button
                type="button"
                onClick={() =>
                  (window.location.hash = ROUTES.PORTIONS)
                }
                variant="secondary"
                style={{ marginTop: '8px' }}
              >
                Ir para Porções
              </Button>
            </div>
          )}

          <div className="form-actions">
            {isEditing && (
              <Button
                type="button"
                onClick={handleCancelEdit}
                variant="secondary"
                fullWidth
              >
                ❌ Cancelar
              </Button>
            )}
            <Button
              type="submit"
              fullWidth
              loading={actionLoading}
              disabled={!snackName.trim()}
            >
              {isEditing
                ? '💾 Salvar Alterações'
                : '✨ Criar Lanche'}
            </Button>
          </div>
        </form>

        {(error || actionError) && (
          <div className="error-message">
            {error || actionError}
          </div>
        )}

        <div className="snack-layout">
          {/* Lista de Lanches */}
          <div className="snack-list">
            <h3>Lanches Cadastrados</h3>
            {loading ? (
              <Loading message="Carregando lanches..." />
            ) : snacks.length === 0 ? (
              <div className="empty-state">
                <p>📋 Nenhum lanche cadastrado ainda.</p>
                <p>
                  Crie seu primeiro lanche no formulário
                  acima!
                </p>
              </div>
            ) : (
              <div className="snack-cards">
                {snacks.map(snack => {
                  console.log(
                    `🍔 Renderizando lanche ${snack.name}:`,
                    {
                      totalCost: snack.totalCost,
                      suggestedPrice: snack.suggestedPrice,
                      totalWeightG: snack.totalWeightG,
                      portions: snack.portions,
                    }
                  );
                  return (
                    <Card
                      key={snack.id}
                      hoverable
                      className={`snack-card ${
                        selectedSnack?.id === snack.id
                          ? 'selected'
                          : ''
                      }`}
                    >
                      <div className="snack-card-header">
                        <div className="snack-card-info">
                          <div className="snack-card-title">
                            {snack.name}
                          </div>
                          <div className="snack-card-meta">
                            Custo: R${' '}
                            {formatCurrency(
                              snack.totalCost
                            )}{' '}
                            | Preço sugerido: R${' '}
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
                          <Button
                            onClick={() =>
                              handleViewDetails(snack.id)
                            }
                            variant="secondary"
                            title="Ver detalhes e adicionar porções"
                          >
                            📋
                          </Button>
                          <Button
                            onClick={() =>
                              handleEditSnack(snack)
                            }
                            variant="primary"
                            title="Editar lanche"
                          >
                            ✏️
                          </Button>
                          <Button
                            onClick={() =>
                              handleDeleteSnack(snack.id)
                            }
                            variant="danger"
                            title="Deletar lanche"
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detalhes do Lanche Selecionado */}
          {selectedSnack && (
            <Card className="snack-details">
              <h3>{selectedSnack.name}</h3>

              {selectedSnack.imageUrl && (
                <div className="snack-image-container">
                  <img
                    src={getImageUrl(
                      selectedSnack.imageUrl
                    )}
                    alt={selectedSnack.name}
                    className="snack-image"
                    onError={e => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

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
                          {formatWeight(portion.weightG)} -
                          R${' '}
                          {formatCurrency(portion.cost, 4)})
                        </span>
                        <Button
                          onClick={() =>
                            handleRemovePortion(portion.id)
                          }
                          variant="danger"
                          loading={actionLoading}
                        >
                          ❌
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-portions">
                    Nenhuma porção adicionada
                  </p>
                )}

                {portions && portions.length > 0 ? (
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
                      className="input"
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
                          {formatWeight(portion.weightG)} -
                          R${' '}
                          {formatCurrency(portion.cost, 4)})
                        </option>
                      ))}
                    </select>
                    <Button
                      type="submit"
                      loading={actionLoading}
                    >
                      Adicionar
                    </Button>
                  </form>
                ) : (
                  <div className="no-portions-warning">
                    ⚠️ Você precisa cadastrar porções
                    primeiro!
                    <br />
                    <Button
                      onClick={() =>
                        (window.location.hash =
                          ROUTES.PORTIONS)
                      }
                      variant="secondary"
                      style={{ marginTop: '8px' }}
                    >
                      Ir para Porções
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
