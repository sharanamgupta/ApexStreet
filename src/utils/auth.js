export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to parse user from localStorage:', err);
    return null;
  }
}

export function getStoredToken() {
  return localStorage.getItem('token') || null;
}

export function isAuthenticated() {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user?.role) return false;

  // Do not treat an expired token left in localStorage as a live session.
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 <= Date.now()) return false;
  } catch {
    return false;
  }

  return true;
}

export function getUserRole() {
  const user = getStoredUser();
  if (!user || !user.role) return null;
  return String(user.role).toUpperCase();
}

export function isUserRole() {
  return getUserRole() === 'USER';
}

export function isOperatorOrAdmin() {
  const role = getUserRole();
  return role === 'OPERATOR' || role === 'ADMIN';
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
