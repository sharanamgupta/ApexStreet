import { getStoredToken } from './auth.js';

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getStoredToken()}`, ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Unable to load Monitor Lights data.');
  return data;
}

export const monitorLightsApi = {
  list: ({ search, area, status }) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (area && area !== 'All areas') params.set('area', area);
    if (status && status !== 'All statuses') params.set('status', status);
    return request(`/api/monitor-lights?${params.toString()}`);
  },
  summary: () => request('/api/monitor-lights/summary'),
  technicians: () => request('/api/technicians'),
  assign: (lightId, body) => request(`/api/monitor-lights/${encodeURIComponent(lightId)}/assign`, { method: 'POST', body: JSON.stringify(body) }),
  updateMaintenance: (lightId, body) => request(`/api/monitor-lights/${encodeURIComponent(lightId)}/maintenance`, { method: 'PATCH', body: JSON.stringify(body) }),
  resolve: (lightId) => request(`/api/monitor-lights/${encodeURIComponent(lightId)}/resolve`, { method: 'POST' }),
  history: (lightId) => request(`/api/monitor-lights/${encodeURIComponent(lightId)}/maintenance`),
  messages: (lightId) => request(`/api/monitor-lights/${encodeURIComponent(lightId)}/messages`),
  sendMessage: (lightId, body) => request(`/api/monitor-lights/${encodeURIComponent(lightId)}/messages`, { method: 'POST', body: JSON.stringify(body) }),
};
