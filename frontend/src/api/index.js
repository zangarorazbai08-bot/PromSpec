const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (path, options = {}) => {
  const isFormData = options.body instanceof FormData;
  
  // Read token from localStorage
  const token = localStorage.getItem('pss_token');
  
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers,
    ...options
  });
  const ct = response.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    const err = new Error(data?.message || 'Сұрау орындалмады');
    err.status = response.status;
    throw err;
  }
  return data;
};

export const authApi = {
  register: async (p) => {
    const data = await request('/auth/register', { method: 'POST', body: JSON.stringify(p) });
    if (data.token) {
      localStorage.setItem('pss_token', data.token);
    }
    return data;
  },
  login: async (p) => {
    const data = await request('/auth/login', { method: 'POST', body: JSON.stringify(p) });
    if (data.token) {
      localStorage.setItem('pss_token', data.token);
    }
    return data;
  },
  logout: async () => {
    localStorage.removeItem('pss_token');
    return request('/auth/logout', { method: 'POST' });
  },
  me: () => request('/auth/me')
};

export const dashboardApi = {
  stats: () => request('/dashboard/stats')
};

export const materialsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v !== '' && v !== null && v !== undefined)));
    return request(`/materials${q.toString() ? '?' + q : ''}`);
  },
  create: (p) => request('/materials', { method: 'POST', body: JSON.stringify(p) }),
  update: (id, p) => request(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(p) })
};

export const inventoryApi = {
  list: () => request('/inventory'),
  addTransaction: (p) => request('/inventory', { method: 'POST', body: JSON.stringify(p) }),
  scan: (image) => request('/inventory/scan', { method: 'POST', body: JSON.stringify({ image }) }),
  addScannedProduct: (p) => request('/inventory/add-scanned', { method: 'POST', body: JSON.stringify(p) })
};

export const requestsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v !== '' && v !== null)));
    return request(`/requests${q.toString() ? '?' + q : ''}`);
  },
  getById: (id) => request(`/requests/${id}`),
  create: (p) => request('/requests', { method: 'POST', body: JSON.stringify(p) }),
  updateStatus: (id, status) => request(`/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  issue: (id) => request(`/requests/${id}/issue`, { method: 'POST' }),
  confirm: (id) => request(`/requests/${id}/confirm`, { method: 'POST' })
};

export const projectsApi = {
  list: () => request('/projects'),
  create: (p) => request('/projects', { method: 'POST', body: JSON.stringify(p) })
};

export const usersApi = {
  list: () => request('/users'),
  approve: (id) => request(`/users/${id}/approve`, { method: 'PATCH' })
};

