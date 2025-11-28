import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Institution } from '../types/hierarchical';
import '../styles/Institutions.css';

const Institutions: React.FC = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    acronym: '',
    type: 'Universidade',
    cnpj: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    rector: '',
    description: '',
  });

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    try {
      const response = await api.get('/institutions');
      setInstitutions(response.data);
    } catch (error) {
      console.error('Erro ao carregar instituições:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/institutions/${editingId}`, formData);
      } else {
        await api.post('/institutions', formData);
      }
      loadInstitutions();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar instituição:', error);
      alert('Erro ao salvar instituição');
    }
  };

  const handleEdit = (institution: Institution) => {
    setEditingId(institution.id);
    setFormData({
      name: institution.name,
      acronym: institution.acronym || '',
      type: institution.type,
      cnpj: institution.cnpj,
      address: institution.address || '',
      city: institution.city || '',
      state: institution.state || '',
      zipCode: institution.zipCode || '',
      phone: institution.phone || '',
      email: institution.email || '',
      website: institution.website || '',
      rector: institution.rector || '',
      description: institution.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta instituição?')) {
      try {
        await api.delete(`/institutions/${id}`);
        loadInstitutions();
      } catch (error) {
        console.error('Erro ao excluir instituição:', error);
        alert('Erro ao excluir instituição');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      acronym: '',
      type: 'Universidade',
      cnpj: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      website: '',
      rector: '',
      description: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleViewProjects = (institutionId: string) => {
    navigate(`/research-projects?institutionId=${institutionId}`);
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="institutions-container">
      <div className="header">
        <h1>🏛️ Instituições de Pesquisa</h1>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancelar' : '+ Nova Instituição'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editingId ? 'Editar Instituição' : 'Nova Instituição'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome da Instituição *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Sigla</label>
                <input
                  type="text"
                  value={formData.acronym}
                  onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Tipo *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="Universidade">Universidade</option>
                  <option value="Instituto de Pesquisa">Instituto de Pesquisa</option>
                  <option value="Centro de Estudos">Centro de Estudos</option>
                  <option value="Faculdade">Faculdade</option>
                  <option value="Hospital Universitário">Hospital Universitário</option>
                </select>
              </div>

              <div className="form-group">
                <label>CNPJ *</label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Endereço</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Cidade</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Estado (UF)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="form-group">
                <label>CEP</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Reitor/Diretor</label>
                <input
                  type="text"
                  value={formData.rector}
                  onChange={(e) => setFormData({ ...formData, rector: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn-cancel">
                Cancelar
              </button>
              <button type="submit" className="btn-save">
                {editingId ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="institutions-list">
        {institutions.length === 0 ? (
          <div className="empty-state">
            <p>📚 Nenhuma instituição cadastrada</p>
            <button onClick={() => setShowForm(true)}>Cadastrar primeira instituição</button>
          </div>
        ) : (
          institutions.map((institution) => (
            <div key={institution.id} className="institution-card">
              <div className="card-header">
                <div>
                  <h3>{institution.name}</h3>
                  {institution.acronym && <span className="acronym">{institution.acronym}</span>}
                </div>
                <span className={`badge ${institution.isActive ? 'active' : 'inactive'}`}>
                  {institution.isActive ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">Tipo:</span>
                  <span>{institution.type}</span>
                </div>
                <div className="info-row">
                  <span className="label">CNPJ:</span>
                  <span>{institution.cnpj}</span>
                </div>
                {institution.city && institution.state && (
                  <div className="info-row">
                    <span className="label">Local:</span>
                    <span>{institution.city}/{institution.state}</span>
                  </div>
                )}
                {institution.rector && (
                  <div className="info-row">
                    <span className="label">Reitor/Diretor:</span>
                    <span>{institution.rector}</span>
                  </div>
                )}
                {institution.description && (
                  <p className="description">{institution.description}</p>
                )}
              </div>

              <div className="card-footer">
                <button onClick={() => handleViewProjects(institution.id)} className="btn-view">
                  📊 Ver Projetos ({institution.projects?.length || 0})
                </button>
                <button onClick={() => handleEdit(institution)} className="btn-edit">
                  ✏️ Editar
                </button>
                <button onClick={() => handleDelete(institution.id)} className="btn-delete">
                  🗑️ Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Institutions;
