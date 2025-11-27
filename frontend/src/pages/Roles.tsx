import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Role } from '../types/role';
import './Roles.css';

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadRoles();
  }, []);

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
        await api.patch(`/roles/${editingId}`, formData);
        setSuccess('Função atualizada com sucesso!');
      } else {
        await api.post('/roles', formData);
        setSuccess('Função criada com sucesso!');
      }
      
      resetForm();
      loadRoles();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar função');
    }
  };

  const handleEdit = (role: Role) => {
    setFormData({
      name: role.name,
      description: role.description || '',
      isActive: role.isActive,
    });
    setEditingId(role.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir esta função?')) return;

    try {
      await api.delete(`/roles/${id}`);
      setSuccess('Função excluída com sucesso!');
      loadRoles();
    } catch (err: any) {
      setError('Erro ao excluir função');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true,
    });
    setEditingId(null);
  };

  return (
    <div className="page-content">
      <h1>Gestão de Funções/Ocupações</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-card">
        <h2>{editingId ? 'Editar Função' : 'Nova Função'}</h2>
        <form onSubmit={handleSubmit}>
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
            <label>Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span>Função ativa</span>
            </label>
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
        <h2>Funções Cadastradas</h2>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td><strong>{role.name}</strong></td>
                <td>{role.description || '-'}</td>
                <td>
                  <span className={`status ${role.isActive ? 'active' : 'inactive'}`}>
                    {role.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(role)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(role.id)}
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Roles;
