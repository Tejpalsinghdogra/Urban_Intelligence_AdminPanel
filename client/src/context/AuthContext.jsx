import React, { createContext, useContext, useState, useEffect } from 'react';

export const DEPARTMENTS = {
  'national-highways': {
    id: 'national-highways',
    name: 'National Highways (NH) - NHAI',
    shortName: 'National Highways (NH)',
    agency: 'National Highways Authority of India (NHAI)',
    code: 'NHAI-NH',
    roadType: 'National Highways (NH)',
    color: '#2563eb',
    icon: 'Milestone',
    path: '/admin/department/national-highways',
    officer: 'Er. A. K. Verma',
    designation: 'Project Director (National Highway Corridors)',
    division: 'MoRTH & NHAI Regional Highway Operations',
    credentials: {
      username: 'nhai',
      password: 'nh123'
    },
    allowedCategories: ['National Highway Defect', 'Crater / Pothole', 'Freight Corridor Rutting', 'Road Defect']
  },
  'state-highways': {
    id: 'state-highways',
    name: 'State Highways (SH) - State PWD',
    shortName: 'State Highways (SH)',
    agency: 'Public Works Department (State PWD)',
    code: 'PWD-SH',
    roadType: 'State Highways (SH)',
    color: '#7c3aed',
    icon: 'Compass',
    path: '/admin/department/state-highways',
    officer: 'Er. S. P. Chawla',
    designation: 'Superintending Engineer (State Highways Circle)',
    division: 'State Infrastructure & Inter-District Highways',
    credentials: {
      username: 'pwdsh',
      password: 'sh123'
    },
    allowedCategories: ['State Highway Pavement', 'Edge Erosion', 'Asphalt Cracks', 'Road Defect']
  },
  'major-district-roads': {
    id: 'major-district-roads',
    name: 'Major District Roads (MDR) - District PWD',
    shortName: 'Major District Roads (MDR)',
    agency: 'District PWD & Infrastructure Board',
    code: 'PWD-MDR',
    roadType: 'Major District Roads (MDR)',
    color: '#0284c7',
    icon: 'Truck',
    path: '/admin/department/major-district-roads',
    officer: 'Er. Manjit Singh',
    designation: 'Executive Engineer (MDR Division)',
    division: 'District Connectivity & Arterial Corridors',
    credentials: {
      username: 'pwdmdr',
      password: 'mdr123'
    },
    allowedCategories: ['MDR Pavement Defects', 'Market Corridor Potholes', 'Structural Cracking']
  },
  'other-district-roads': {
    id: 'other-district-roads',
    name: 'Other District Roads (ODR) - Zilla Parishad',
    shortName: 'Other District Roads (ODR)',
    agency: 'Zilla Parishad & Rural Infrastructure Development',
    code: 'ZP-ODR',
    roadType: 'Other District Roads (ODR)',
    color: '#0d9488',
    icon: 'Layers',
    path: '/admin/department/other-district-roads',
    officer: 'Er. Neha Gupta',
    designation: 'Assistant Executive Engineer (ODR Wing)',
    division: 'Sub-Divisional & Rural-Urban Connectors',
    credentials: {
      username: 'zpodr',
      password: 'odr123'
    },
    allowedCategories: ['Secondary District Road Defect', 'Sub-division Potholes', 'Surface Erosion']
  },
  'village-rural-roads': {
    id: 'village-rural-roads',
    name: 'Village / Rural Roads - PMGSY',
    shortName: 'Village / Rural Roads',
    agency: 'Panchayati Raj & PMGSY (Pradhan Mantri Gram Sadak Yojana)',
    code: 'PMGSY-VR',
    roadType: 'Village / Rural Roads',
    color: '#16a34a',
    icon: 'Trees',
    path: '/admin/department/village-rural-roads',
    officer: 'Er. Rajesh Dogra',
    designation: 'Nodal Technical Officer (PMGSY)',
    division: 'Rural Road Connectivity & Panchayat Infrastructure',
    credentials: {
      username: 'pmgsy',
      password: 'rural123'
    },
    allowedCategories: ['Rural Pavement Failure', 'All-weather Road Defects', 'Panchayat Corridor Potholes']
  },
  'city-municipal-roads': {
    id: 'city-municipal-roads',
    name: 'City / Municipal Roads - Municipal Corp',
    shortName: 'City / Municipal Roads',
    agency: 'Municipal Corporation (MC / Urban Local Bodies)',
    code: 'MC-CMR',
    roadType: 'City / Municipal Roads',
    color: '#ea580c',
    icon: 'Building2',
    path: '/admin/department/city-municipal-roads',
    officer: 'Er. R. Sharma',
    designation: 'Chief Municipal Engineer (Roads & B&R)',
    division: 'Urban Roads, Pavements & Stormwater Repair',
    credentials: {
      username: 'municipal',
      password: 'city123'
    },
    allowedCategories: ['Urban Potholes', 'Drainage Subsidence', 'Crosswalk & Intersection Defects']
  },
  'expressways': {
    id: 'expressways',
    name: 'Expressways - Expressway Authority',
    shortName: 'Expressways',
    agency: 'Expressway Development Authority / NHAI (NEAD)',
    code: 'EDA-EXP',
    roadType: 'Expressways',
    color: '#dc2626',
    icon: 'Zap',
    path: '/admin/department/expressways',
    officer: 'Er. Vikram Malhotra',
    designation: 'General Manager (Technical - Expressway Corridor)',
    division: 'High-Speed Access Controlled Highway Maintenance',
    credentials: {
      username: 'expressway',
      password: 'exp123'
    },
    allowedCategories: ['High-Speed Lane Hazards', 'Expressway Pavement Fissures', 'Rapid Emergency Repairs']
  },
  'ring-roads-bypasses': {
    id: 'ring-roads-bypasses',
    name: 'Ring roads / bypasses - Urban Dev Authority',
    shortName: 'Ring roads / bypasses',
    agency: 'Urban Development Authority (UDA / Ring Road Division)',
    code: 'UDA-RRB',
    roadType: 'Ring roads / bypasses',
    color: '#d97706',
    icon: 'RotateCw',
    path: '/admin/department/ring-roads-bypasses',
    officer: 'Er. Hardeep Sandhu',
    designation: 'Divisional Engineer (Circumferential & Bypass Network)',
    division: 'Heavy Transit Diversion & Ring Road Infrastructure',
    credentials: {
      username: 'ringroad',
      password: 'ring123'
    },
    allowedCategories: ['Bypass Pavement Subsidence', 'Circumferential Highway Defects', 'Heavy Vehicle Rutting']
  },
  'service-roads-nh': {
    id: 'service-roads-nh',
    name: 'Service roads along NH - NHAI Service Wing',
    shortName: 'Service roads along NH',
    agency: 'NHAI Service Corridor & Concessionaire Division',
    code: 'NHAI-SR',
    roadType: 'Service roads along NH',
    color: '#4f46e5',
    icon: 'Split',
    path: '/admin/department/service-roads-nh',
    officer: 'Er. Priya Nair',
    designation: 'Resident Engineer (Service Corridor & Access Ops)',
    division: 'National Highway Toll & Lateral Service Road Network',
    credentials: {
      username: 'serviceroad',
      password: 'service123'
    },
    allowedCategories: ['Lateral Service Lane Potholes', 'Toll Plaza Approach Defects', 'Slip Road Erosion']
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
