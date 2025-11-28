import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { ResearchProject, Institution } from '../types/hierarchical';
import '../styles/Institutions.css';

const ResearchProjects: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const institutionId = searchParams.get('institutionId');

  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [researchers, setResearchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    area: '',
    startDate: '',
    endDate: '',
    status: 'active',
    budget: '',
    fundingAgency: '',
    objectives: '',
    expectedResults: '',
    institutionId: institutionId || '',
    responsibleResearcherId: '',
  });

  useEffect(() => {
    loadData();
  }, [institutionId]);

  const loadData = async () => {
    try {
      const [projectsRes, institutionsRes, researchersRes] = await Promise.all([
        api.get(`/research-projects${institutionId ? `?institutionId=${institutionId}` : ''}`),
        api.get('/institutions'),
        api.get('/researchers'),
      ]);
      setProjects(projectsRes.data);
      setInstitutions(institutionsRes.data);
      setResearchers(researchersRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      };
      
      if (editingId) {
        await api.patch(`/research-projects/${editingId}`, payload);
      } else {
        await api.post('/research-projects', payload);
      }
      loadData();
      resetForm();
      alert('Projeto salvo com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar projeto:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Erro desconhecido';
      console.error('Detalhes do erro:', error.response?.data);
      alert(`Erro ao salvar projeto: ${errorMsg}`);
    }
  };

  const handleEdit = (project: ResearchProject) => {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      description: project.description || '',
      area: project.area || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      status: project.status,
      budget: project.budget?.toString() || '',
      fundingAgency: project.fundingAgency || '',
      objectives: project.objectives || '',
      expectedResults: project.expectedResults || '',
      institutionId: project.institutionId,
      responsibleResearcherId: project.responsibleResearcherId,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        await api.delete(`/research-projects/${id}`);
        loadData();
      } catch (error) {
        console.error('Erro ao excluir projeto:', error);
        alert('Erro ao excluir projeto');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      area: '',
      startDate: '',
      endDate: '',
      status: 'active',
      budget: '',
      fundingAgency: '',
      objectives: '',
      expectedResults: '',
      institutionId: institutionId || '',
      responsibleResearcherId: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleViewSubgroups = (projectId: string) => {
    navigate(`/subgroups?projectId=${projectId}`);
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="institutions-container">
      <div className="header">
        <h1>📊 Projetos de Pesquisa</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {institutionId && (
            <button className="btn-add" onClick={() => navigate('/institutions')}>
              ← Voltar para Instituições
            </button>
          )}
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancelar' : '+ Novo Projeto'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editingId ? 'Editar Projeto' : 'Novo Projeto de Pesquisa'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome do Projeto *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Instituição *</label>
                <select
                  value={formData.institutionId}
                  onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })}
                  required
                >
                  <option value="">Selecione...</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Pesquisador Responsável *</label>
                <select
                  value={formData.responsibleResearcherId}
                  onChange={(e) => setFormData({ ...formData, responsibleResearcherId: e.target.value })}
                  required
                >
                  <option value="">Selecione...</option>
                  {researchers.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Área</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Data Início</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Data Fim</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Ativo</option>
                  <option value="completed">Concluído</option>
                  <option value="suspended">Suspenso</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div className="form-group">
                <label>Orçamento (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Agência Financiadora</label>
                <input
                  type="text"
                  value={formData.fundingAgency}
                  onChange={(e) => setFormData({ ...formData, fundingAgency: e.target.value })}
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

              <div className="form-group full-width">
                <label>Objetivos</label>
                <textarea
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-group full-width">
                <label>Resultados Esperados</label>
                <textarea
                  value={formData.expectedResults}
                  onChange={(e) => setFormData({ ...formData, expectedResults: e.target.value })}
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
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>📊 Nenhum projeto cadastrado</p>
            <button onClick={() => setShowForm(true)}>Cadastrar primeiro projeto</button>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="institution-card">
              <div className="card-header">
                <div>
                  <h3>{project.name}</h3>
                  {project.codeUUID && (
                    <span className="acronym" title="Código UUID">
                      {project.codeUUID.substring(0, 8)}...
                    </span>
                  )}
                </div>
                <span className={`badge ${project.status === 'active' ? 'active' : 'inactive'}`}>
                  {project.status === 'active' ? 'Ativo' : project.status === 'completed' ? 'Concluído' : 'Inativo'}
                </span>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">Código UUID:</span>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{project.codeUUID}</span>
                </div>
                <div className="info-row">
                  <span className="label">Instituição:</span>
                  <span>{project.institution?.name}</span>
                </div>
                {project.area && (
                  <div className="info-row">
                    <span className="label">Área:</span>
                    <span>{project.area}</span>
                  </div>
                )}
                {project.responsibleResearcher && (
                  <div className="info-row">
                    <span className="label">Responsável:</span>
                    <span>{project.responsibleResearcher.name}</span>
                  </div>
                )}
                {project.budget && (
                  <div className="info-row">
                    <span className="label">Orçamento:</span>
                    <span>R$ {parseFloat(project.budget.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {project.description && (
                  <p className="description">{project.description}</p>
                )}
              </div>

              <div className="card-footer">
                <button onClick={() => handleViewSubgroups(project.id)} className="btn-view">
                  👥 Ver Subgrupos ({project.subgroups?.length || 0})
                </button>
                <button onClick={() => handleEdit(project)} className="btn-edit">
                  ✏️ Editar
                </button>
                <button onClick={() => handleDelete(project.id)} className="btn-delete">
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

export default ResearchProjects;
