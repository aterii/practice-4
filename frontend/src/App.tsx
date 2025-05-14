import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CarSelection from './pages/CarSelection';
import CarComparison from './pages/CarComparison';
import AHPComparisonPage from './pages/AHPComparisonPage';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Защищенные маршруты */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/car-selection" element={<CarSelection />} />
            <Route path="/car-comparison" element={<CarComparison />} />
            <Route path="/ahp-comparison" element={<AHPComparisonPage />} />
          </Route>
          
          {/* Редирект на профиль если путь по умолчанию */}
          <Route path="/" element={<Navigate replace to="/profile" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
