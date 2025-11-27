import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Researchers from './pages/Researchers';
import Subgroups from './pages/Subgroups';
import Roles from './pages/Roles';
import Questions from './pages/Questions';
import './App.css';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="app-layout">
                <Sidebar />
                <Routes>
                  <Route path="/" element={<Navigate to="/researchers" />} />
                  <Route path="/researchers" element={<Researchers />} />
                  <Route path="/subgroups" element={<Subgroups />} />
                  <Route path="/roles" element={<Roles />} />
                  <Route path="/questions" element={<Questions />} />
                </Routes>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
