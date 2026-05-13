import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// --- V1 Analysis ---
export const analyzeMessage = async (message) => {
  const response = await apiClient.post('/analyze', { message });
  return response.data;
};

// --- V2 Analysis ---
export const analyzeMessageV2 = async (message, senderInfo, messageType) => {
  const response = await apiClient.post('/analyze/v2', {
    message,
    sender_info: senderInfo || null,
    message_type: messageType || 'sms',
  });
  return response.data;
};

// --- Screenshot OCR ---
export const analyzeScreenshot = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/analyze/screenshot', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
  return response.data;
};

// --- Dashboard ---
export const getDashboardStats = async () => {
  const response = await apiClient.get('/dashboard/stats');
  return response.data;
};

// --- Community Reports ---
export const createReport = async (data) => {
  const response = await apiClient.post('/reports', data);
  return response.data;
};

export const getReports = async (params = {}) => {
  const response = await apiClient.get('/reports', { params });
  return response.data;
};

export const getReport = async (id, sessionId) => {
  const response = await apiClient.get(`/reports/${id}`, { params: { session_id: sessionId } });
  return response.data;
};

export const voteOnReport = async (reportId, sessionId, voteType) => {
  const response = await apiClient.post(`/reports/${reportId}/vote`, {
    session_id: sessionId,
    vote_type: voteType,
  });
  return response.data;
};

export const getCommunityStats = async () => {
  const response = await apiClient.get('/community/stats');
  return response.data;
};

// --- Admin ---
export const getAdminDashboard = async (token) => {
  const response = await apiClient.get('/admin/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAdminReports = async (token, params = {}) => {
  const response = await apiClient.get('/admin/reports', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const moderateReport = async (token, reportId, data) => {
  const response = await apiClient.put(`/admin/reports/${reportId}/moderate`, {
    status: data.status,
    moderation_note: data.moderation_note || null,
    risk_score: data.risk_score ?? null,
    risk_level: data.risk_level || null,
    scam_category: data.scam_category || null,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default apiClient;
