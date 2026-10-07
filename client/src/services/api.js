import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

export const analyzeMessage = (text, sourceType, sender) =>
  api.post('/analyze/message', { text, sourceType, sender }).then(r => r.data);

export const analyzeUrl = (url) =>
  api.post('/analyze/url', { url }).then(r => r.data);

export const saveScan = (result) =>
  api.post('/scans', result).then(r => r.data);

export const deleteScan = (id) =>
  api.delete(`/scans/${id}`).then(r => r.data);

export const deleteAllScans = () =>
  api.delete('/scans').then(r => r.data);

export const markFalsePositive = (id) =>
  api.patch(`/scans/${id}/false-positive`).then(r => r.data);

export const getScans = (params = {}) =>
  api.get('/scans', { params }).then(r => r.data);

export const getScanById = (id) =>
  api.get(`/scans/${id}`).then(r => r.data);

export const getAnalytics = () =>
  api.get('/analytics').then(r => r.data);

export const getDemoData = () =>
  api.get('/demo-data').then(r => r.data);

export const getExportCsvUrl = () => '/api/scans/export/csv';

export default api;
