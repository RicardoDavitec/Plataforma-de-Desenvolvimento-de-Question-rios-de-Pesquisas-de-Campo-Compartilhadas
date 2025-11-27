import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Subgroup } from '../types';
import './Subgroups.css';

const Subgroups: React.FC = () => {
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSubgroups();
  }, []);

  const loadSubgroups = async () => {
    try {
      const response = await api.get<Subgroup[]>('/subgroups');
      setSubgroups(response.data);
    } catch (err: any) {
      setError('Erro ao carregar subgrupos');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.patch(`/subgroups/${editingId}`, formData);
        setSuccess('Subgrupo atualizado com sucesso!');
      } else {
        await api.post('/subgroups', formData);
        setSuccess('Subgrupo criado com sucesso!');
      }
      
      resetForm();
      loadSubgroups();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar subgrupo');
    }
  };

  const handleEdit = (subgroup: Subgroup) => {
    setFormData({
      name: subgroup.name,
      description: subgroup.description || '',
    });
    setEditingId(subgroup.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este subgrupo?')) return;

    try {
      await api.delete(`/subgroups/${id}`);
      setSuccess('Subgrupo excluído com sucesso!');
      loadSubgroups();
    } catch (err: any) {
      setError('Erro ao excluir subgrupo');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
    setEditingId(null);
  };

  return (
    <div className="page-content">
      <h1>Gestão de Subgrupos</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-card">
        <h2>{editingId ? 'Editar Subgrupo' : 'Novo Subgrupo'}</h2>
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
              rows={4}
            />
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
        <h2>Subgrupos Cadastrados</h2>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {subgroups.map((subgroup) => (
              <tr key={subgroup.id}>
                <td>{subgroup.name}</td>
                <td>{subgroup.description || '-'}</td>
                <td className="actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(subgroup)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(subgroup.id)}
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

export default Subgroups;
