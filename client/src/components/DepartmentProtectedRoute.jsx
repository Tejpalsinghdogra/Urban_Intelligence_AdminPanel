import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, DEPARTMENTS } from '../context/AuthContext';
import DepartmentTopbar from './DepartmentTopbar';

export default function DepartmentProtectedRoute({ requiredDept, children }) {
  const { isDepartmentAuthenticated, activeDepartment } = useAuth();
  const location = useLocation();

  const isAuth = isDepartmentAuthenticated(requiredDept);

  if (!isAuth) {
    const targetDept = requiredDept || 'road-safety';
    const redirectUrl = `/department/login?dept=${targetDept}&redirect=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectUrl} replace />;
  }

  const deptConfig = DEPARTMENTS[requiredDept] || activeDepartment;

  return (
    <>
      <DepartmentTopbar department={deptConfig} />
      {children}
    </>
  );
}
