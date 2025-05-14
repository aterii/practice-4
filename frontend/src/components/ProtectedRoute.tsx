import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  // Если еще загружаем данные аутентификации, показываем пустой экран
  if (loading) {
    return null;
  }

  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Если пользователь аутентифицирован, рендерим дочерние маршруты
  return <Outlet />;
};

export default ProtectedRoute; 