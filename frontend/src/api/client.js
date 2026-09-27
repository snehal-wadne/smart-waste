import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Category APIs
export const fetchWasteCategories = async () => {
  const response = await api.get('/waste-categories');
  return response.data.data;
};

export const fetchHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Citizen Request APIs (Phase 2 & Phase 3)
export const createCollectionRequest = async (payload) => {
  const response = await api.post('/requests', payload);
  return response.data;
};

export const fetchRequestByTrackingCode = async (code) => {
  const cleanCode = encodeURIComponent(String(code).trim());
  const response = await api.get(`/requests/track/${cleanCode}`);
  return response.data;
};

export const fetchCitizenRequestsByPhone = async (phone) => {
  const cleanPhone = encodeURIComponent(String(phone).trim());
  const response = await api.get(`/requests/user/${cleanPhone}`);
  return response.data;
};

export const fetchRequestHistory = async (requestId) => {
  const cleanId = encodeURIComponent(String(requestId).trim());
  const response = await api.get(`/requests/${cleanId}/history`);
  return response.data;
};

// Admin APIs (Phase 4 & 5)
export const fetchAdminRequests = async (params = {}) => {
  const response = await api.get('/admin/requests', { params });
  return response.data;
};

export const updateAdminRequestStatus = async (id, payload) => {
  const response = await api.patch(`/admin/requests/${id}/status`, payload);
  return response.data;
};

export const fetchAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const fetchAdminAnalytics = async () => {
  const response = await api.get('/admin/analytics');
  return response.data;
};

export default api;
