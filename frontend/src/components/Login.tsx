import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LoginResponse } from '../types';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/researchers');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>📋 Campo Research Platform</h1>
          <p className="login-subtitle">Sistema de Gestão de Pesquisas de Campo</p>
        </div>
        
        <h2>Bem-vindo!</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">📧 Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">🔒 Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '0',
                  color: '#666',
                }}
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? '⏳ Entrando...' : '🚀 Entrar'}
          </button>
        </form>
        
        <div className="login-info">
          <div className="info-card">
            <strong>👤 Usuários de Teste:</strong>
            <ul>
              <li>
                <strong>João Silva:</strong><br/>
                Email: joao.silva@exemplo.com<br/>
                Senha: senha@123
              </li>
              <li>
                <strong>Ricardo David:</strong><br/>
                Email: rdavid@davitec.com.br<br/>
                Senha: senha@123
              </li>
              <li>
                <strong>Erlon Castro:</strong><br/>
                Email: erlon.castro@universidade.edu.br<br/>
                Senha: senha@123
              </li>
            </ul>
          </div>
          
          <div className="features-info">
            <strong>✨ Funcionalidades:</strong>
            <ul>
              <li>👥 Gestão de Pesquisadores</li>
              <li>📁 Organização por Subgrupos</li>
              <li>👔 Funções e Ocupações</li>
              <li>❓ Questões com Detecção de Similaridade</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
