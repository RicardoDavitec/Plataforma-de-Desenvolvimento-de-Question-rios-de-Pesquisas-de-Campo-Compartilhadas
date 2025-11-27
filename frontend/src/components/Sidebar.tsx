import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/researchers', label: 'Pesquisadores', icon: '👥' },
    { path: '/subgroups', label: 'Subgrupos', icon: '📁' },
    { path: '/roles', label: 'Funções', icon: '👔' },
    { path: '/questions', label: 'Questões', icon: '❓' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>📋 Campo Research</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }} className="logout-button">
          🚪 Sair
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
