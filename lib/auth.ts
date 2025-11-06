interface JWTPayload {
  user_id: number;
  rol_id: number | string;
  exp: number;
}

export function isAdmin(): boolean {
  try {
    // Primero verificamos el localStorage
    const userType = localStorage.getItem('user_type');
    if (userType?.toLowerCase() === 'administrador') {
      return true;
    }

    // Luego verificamos el token
    const token = localStorage.getItem('tokenkick');
    if (!token) return false;

    const payload = JSON.parse(atob(token.split('.')[1])) as JWTPayload;
    const isAdminRole = payload.rol_id === 1 || payload.rol_id === '1';
    
    if (isAdminRole) {
      // Asegurar que los indicadores de admin estén establecidos
      localStorage.setItem('user_type', 'administrador');
      if (typeof document !== 'undefined') {
        document.body.classList.add('is-admin');
      }
      return true;
    }
    
    // También verificamos la clase del body
    if (typeof document !== 'undefined' && document.body.classList.contains('is-admin')) {
      localStorage.setItem('user_type', 'administrador');
      return true;
    }
    
    return false;
  } catch (e) {
    // Si hay error al decodificar el token, verificamos otros indicadores
    const userType = localStorage.getItem('user_type');
    return userType?.toLowerCase() === 'administrador' || 
           (typeof document !== 'undefined' && document.body.classList.contains('is-admin'));
  }
}

export function ensureAdminPermissions(): boolean {
  // Si ya tenemos indicadores de admin, los mantenemos
  const userType = localStorage.getItem('user_type');
  if (userType?.toLowerCase() === 'administrador') {
    if (typeof document !== 'undefined') {
      document.body.classList.add('is-admin');
    }
    return true;
  }

  const hasPermissions = isAdmin();
  if (hasPermissions) {
    localStorage.setItem('user_type', 'administrador');
    if (typeof document !== 'undefined') {
      document.body.classList.add('is-admin');
    }
  }
  return hasPermissions;
}

export function refreshAdminStatus() {
  if (isAdmin()) {
    localStorage.setItem('user_type', 'administrador');
    if (typeof document !== 'undefined') {
      document.body.classList.add('is-admin');
    }
  } else {
    localStorage.removeItem('user_type');
    if (typeof document !== 'undefined') {
      document.body.classList.remove('is-admin');
    }
  }
}