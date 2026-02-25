const API_URL = 'http://localhost:5000/api/auth';

let accessToken = null;
let refreshPromise = null;

export async function register(email, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  return data;
}

export async function login(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  accessToken = data.accessToken;
  return data;
}

export async function logout() {
  const token = accessToken;
  accessToken = null;
  localStorage.removeItem('user');

  if (token) {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
    } catch (e) {
      console.error('Logout error:', e);
    }
  }
}

export function getAccessToken() {
  return accessToken;
}

export function getStoredUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      const data = await response.json();
      accessToken = data.accessToken;
      return data;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function getCurrentUser() {
  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${API_URL}/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        accessToken = null;
        return null;
      }
      
      const retryResponse = await fetch(`${API_URL}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!retryResponse.ok) {
        accessToken = null;
        return null;
      }

      const data = await retryResponse.json();
      return data.user;
    }
    return null;
  }

  const data = await response.json();
  return data.user;
}
