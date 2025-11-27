import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Researcher, Subgroup } from '../types';
import { Role } from '../types/role';
import './Researchers.css';

const Researchers: React.FC = () => {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    subgroupId: '',
    phone: '',
    institution: '',
    roleId: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadResearchers();
    loadSubgroups();
    loadRoles();
  }, []);

  const loadResearchers = async () => {
    try {
      const response = await api.get<Researcher[]>('/researchers');
      setResearchers(response.data);
    } catch (err: any) {
      setError('Erro ao carregar pesquisadores');
    }
  };

  const loadSubgroups = async () => {
    try {
      const response = await api.get<Subgroup[]>('/subgroups');
      setSubgroups(response.data);
    } catch (err: any) {
      setError('Erro ao carregar subgrupos');
    }
  };

  const loadRoles = async () => {
    try {
      const response = await api.get<Role[]>('/roles');
      setRoles(response.data);
    } catch (err: any) {
      setError('Erro ao carregar funções');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.patch(`/researchers/${editingId}`, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          institution: formData.institution,
        });
        setSuccess('Pesquisador atualizado com sucesso!');
      } else {
        await api.post('/researchers', formData);
        setSuccess('Pesquisador criado com sucesso!');
      }
      
      resetForm();
      loadResearchers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar pesquisador');
    }
  };

  const handleEdit = (researcher: Researcher) => {
    setFormData({
      name: researcher.name,
      email: researcher.email,
      password: '',
      subgroupId: researcher.subgroupId,
      phone: researcher.phone || '',
      institution: researcher.institution || '',
      roleId: (researcher as any).roleId || '',
    });
    setEditingId(researcher.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este pesquisador?')) return;

    try {
      await api.delete(`/researchers/${id}`);
      setSuccess('Pesquisador excluído com sucesso!');
      loadResearchers();
    } catch (err: any) {
      setError('Erro ao excluir pesquisador');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      subgroupId: '',
      phone: '',
      institution: '',
      roleId: '',
    });
    setEditingId(null);
  };

  return (
    <div className="page-content">
      <h1>Gestão de Pesquisadores</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-card">
        <h2>{editingId ? 'Editar Pesquisador' : 'Novo Pesquisador'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nome *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {!editingId && (
            <div className="form-group">
              <label>Senha *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingId}
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Subgrupo *</label>
              <select
                value={formData.subgroupId}
                onChange={(e) => setFormData({ ...formData, subgroupId: e.target.value })}
                required
                disabled={!!editingId}
              >
                <option value="">Selecione um subgrupo</option>
                {subgroups.map((subgroup) => (
                  <option key={subgroup.id} value={subgroup.id}>
                    {subgroup.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Instituição</label>
            <input
              type="text"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Função/Ocupação</label>
            <select
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
            >
              <option value="">Selecione uma função</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Atualizar' : 'Cadastrar'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-card">
        <h2>Pesquisadores Cadastrados</h2>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Instituição</th>
              <th>Função</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {researchers.map((researcher) => {
              const researcherRole = roles.find(r => r.id === (researcher as any).roleId);
              return (
                <tr key={researcher.id}>
                  <td>{researcher.name}</td>
                  <td>{researcher.email}</td>
                  <td>{researcher.phone || '-'}</td>
                  <td>{researcher.institution || '-'}</td>
                  <td>
                    <span className="badge badge-role">
                      {researcherRole?.name || researcher.role === 'admin' ? 'Administrador' : 
                       researcher.role === 'viewer' ? 'Visualizador' : 'Pesquisador'}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${researcher.isActive ? 'active' : 'inactive'}`}>
                      {researcher.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(researcher)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(researcher.id)}
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Researchers;
