import { getStoredToken } from './auth.js';

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getStoredToken()}`, ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Unable to load Areas data.');
  return data;
}

export function toAreaView(area) {
  return {
    ...area,
    lights: area.totalLights,
    on: area.onLights,
    dim: area.dimLights,
    off: area.offLights,
    faults: area.faultLights,
    energy: area.energyUsage,
    savings: area.energyChange,
    brightness: area.averageBrightness,
    automation: area.automationEnabled ? 'Active' : 'Inactive',
  };
}

export const areasApi = {
  list: ({ search, type, automation }) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type && type !== 'All Areas') params.set('type', type);
    if (automation && automation !== 'All') params.set('automation', automation === 'Active');
    return request(`/api/areas?${params.toString()}`).then((items) => items.map(toAreaView));
  },
  summary: () => request('/api/areas/summary'),
  names: () => request('/api/areas').then((items) => items.map((area) => area.name).filter(Boolean)),
  get: (id) => request(`/api/areas/${id}`).then(toAreaView),
  create: (body) => request('/api/areas', { method: 'POST', body: JSON.stringify(body) }).then(toAreaView),
  update: (id, body) => request(`/api/areas/${id}`, { method: 'PUT', body: JSON.stringify(body) }).then(toAreaView),
  remove: (id) => request(`/api/areas/${id}`, { method: 'DELETE' }),
};
