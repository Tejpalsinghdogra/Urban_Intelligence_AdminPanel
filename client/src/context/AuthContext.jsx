import React, { createContext, useContext, useState, useEffect } from 'react';

export const DEPARTMENTS = {
  'road-safety': {
    id: 'road-safety',
    name: 'Road Safety Department',
    code: 'RSD-01',
    color: '#dc2626',
    icon: 'Hammer',
    path: '/admin/potholes',
    officer: 'Er. R. Sharma',
    designation: 'Executive Engineer (Pavement & Road Maintenance)',
    division: 'Municipal Infrastructure & Public Works',
    credentials: {
      username: 'roadsafety',
      password: 'safe123'
    },
    allowedCategories: ['Potholes', 'Road Defect', 'Cracks']
  },
  'traffic-police': {
    id: 'traffic-police',
    name: 'Traffic Police',
    code: 'TPC-02',
    color: '#2563eb',
    icon: 'Car',
    path: '/admin/traffic',
    officer: 'ACP Harpreet Singh',
    designation: 'Assistant Commissioner of Police (Traffic)',
    division: 'Urban Mobility & Traffic Enforcement Division',
    credentials: {
      username: 'traffic',
      password: 'traffic123'
    },
    allowedCategories: ['Vehicles', 'Congestion', 'Traffic Light Status']
  },
  'police': {
    id: 'police',
    name: 'Police (Public Safety)',
    code: 'PCC-03',
    color: '#16a34a',
    icon: 'Shield',
    path: '/admin/pedestrians',
    officer: 'Inspector Gurpreet Kaur',
    designation: 'SHO & Crowd Surveillance Wing Head',
    division: 'Transit Perimeter Safety & Public Order',
    credentials: {
      username: 'police',
      password: 'police123'
    },
    allowedCategories: ['Pedestrian Density', 'Public Safety', 'Crowd Surveillance']
  }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [activeDepartment, setActiveDepartment] = useState(() => {
    try {
      const stored = localStorage.getItem('urbansight_active_dept');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (activeDepartment) {
      localStorage.setItem('urbansight_active_dept', JSON.stringify(activeDepartment));
    } else {
      localStorage.removeItem('urbansight_active_dept');
    }
  }, [activeDepartment]);

  const loginDepartment = (deptId, username, password) => {
    const dept = DEPARTMENTS[deptId];
    if (!dept) {
      return { success: false, error: 'Invalid department selected.' };
    }

    const trimmedUser = (username || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    if (
      (trimmedUser === dept.credentials.username && trimmedPass === dept.credentials.password) ||
      (trimmedUser === dept.id && trimmedPass === 'admin') ||
      trimmedPass === 'demo'
    ) {
      const sessionData = {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        color: dept.color,
        officer: dept.officer,
        designation: dept.designation,
        division: dept.division,
        path: dept.path,
        loggedInAt: new Date().toISOString()
      };
      setActiveDepartment(sessionData);
      return { success: true, department: sessionData };
    }

    return { success: false, error: 'Incorrect credentials for ' + dept.name };
  };

  const instantDemoLogin = (deptId) => {
    const dept = DEPARTMENTS[deptId];
    if (!dept) return { success: false, error: 'Department not found' };

    const sessionData = {
      id: dept.id,
      name: dept.name,
      code: dept.code,
      color: dept.color,
      officer: dept.officer,
      designation: dept.designation,
      division: dept.division,
      path: dept.path,
      loggedInAt: new Date().toISOString()
    };
    setActiveDepartment(sessionData);
    return { success: true, department: sessionData };
  };

  const logoutDepartment = () => {
    setActiveDepartment(null);
  };

  const isDepartmentAuthenticated = (deptId) => {
    if (!deptId) return Boolean(activeDepartment);
    return activeDepartment?.id === deptId;
  };

  return (
    <AuthContext.Provider
      value={{
        activeDepartment,
        loginDepartment,
        instantDemoLogin,
        logoutDepartment,
        isDepartmentAuthenticated,
        departments: DEPARTMENTS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
