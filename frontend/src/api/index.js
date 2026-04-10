const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === false) {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const request = async (path, options = {}) => {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: isFormData
      ? { ...(options.headers || {}) }
      : {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
    ...options
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(data?.message || 'Сұрау орындалмады');
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
};

export const authApi = {
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  logout: () =>
    request('/auth/logout', {
      method: 'POST'
    }),
  forgotPassword: (payload) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  resetPassword: (payload) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  me: () => request('/auth/me')
};

export const userApi = {
  getProfile: () => request('/users/profile'),
  updateProfile: (payload) =>
    request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    })
};

export const propertyApi = {
  list: (params) => request(`/properties${buildQuery(params)}`),
  mine: () => request('/properties/mine'),
  getById: (id) => request(`/properties/${id}`),
  create: (payload) =>
    request('/properties', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  update: (id, payload) =>
    request(`/properties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  remove: (id) =>
    request(`/properties/${id}`, {
      method: 'DELETE'
    })
};

export const uploadApi = {
  uploadPropertyImages: (formData) =>
    request('/uploads/properties', {
      method: 'POST',
      body: formData
    })
};

export const bookingApi = {
  create: (payload) =>
    request('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  listMine: () => request('/bookings/me'),
  listHost: () => request('/bookings/host'),
  updateManagedStatus: (id, payload) =>
    request(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  cancel: (id) =>
    request(`/bookings/${id}/cancel`, {
      method: 'PATCH'
    })
};

export const favoriteApi = {
  list: () => request('/favorites'),
  add: (propertyId) =>
    request(`/favorites/${propertyId}`, {
      method: 'POST'
    }),
  remove: (propertyId) =>
    request(`/favorites/${propertyId}`, {
      method: 'DELETE'
    })
};

export const reviewApi = {
  list: (propertyId) => request(`/reviews/property/${propertyId}`),
  upsert: (propertyId, payload) =>
    request(`/reviews/property/${propertyId}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};

export const adminApi = {
  summary: () => request('/admin/summary'),
  users: () => request('/admin/users'),
  properties: (params) => request(`/admin/properties${buildQuery(params)}`),
  bookings: (params) => request(`/admin/bookings${buildQuery(params)}`),
  updateBookingStatus: (id, payload) =>
    request(`/admin/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    })
};

export const chatApi = {
  conversations: () => request('/chat/conversations'),
  messages: (bookingId) => request(`/chat/bookings/${bookingId}`),
  send: (bookingId, payload) =>
    request(`/chat/bookings/${bookingId}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};

export const assistantApi = {
  chat: (payload) =>
    request('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
