import { getStoredToken } from './auth.js';

const API_BASE = '/api/automation';
const request = async (path, options = {}) => {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || `Automation request failed (${response.status})`);
  return data;
};

export const automationApi = {
  runNow: (areaId, weekType) => request(`/run-now?areaId=${encodeURIComponent(areaId)}&weekType=${encodeURIComponent(weekType)}`, { method: 'POST' }),
  summaries: () => request('/areas'),
  page: (areaId) => request(`/areas/${areaId}`),
  configuration: (areaId, body) => request(`/areas/${areaId}/configuration`, { method: 'PUT', body: JSON.stringify(body) }),
  createPhase: (areaId, body) => request(`/areas/${areaId}/phases`, { method: 'POST', body: JSON.stringify(body) }),
  updatePhase: (areaId, phaseId, body) => request(`/areas/${areaId}/phases/${phaseId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePhase: (areaId, phaseId) => request(`/areas/${areaId}/phases/${phaseId}`, { method: 'DELETE' }),
  override: (areaId, lightId, body) => request(`/areas/${areaId}/lights/${encodeURIComponent(lightId)}/override`, { method: 'PUT', body: JSON.stringify(body) }),
  groupCommand: (areaId, body) => request(`/areas/${areaId}/group-command`, { method: 'POST', body: JSON.stringify(body) }),
  returnToSchedule: (areaId) => request(`/areas/${areaId}/return-to-schedule`, { method: 'POST' }),
  clearOverride: (areaId, lightId) => request(`/areas/${areaId}/lights/${encodeURIComponent(lightId)}/override`, { method: 'DELETE' }),
  createEvent: (areaId, body) => request(`/areas/${areaId}/events`, { method: 'POST', body: JSON.stringify(body) }),
  updateEvent: (areaId, eventId, body) => request(`/areas/${areaId}/events/${eventId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteEvent: (areaId, eventId) => request(`/areas/${areaId}/events/${eventId}`, { method: 'DELETE' }),
};

const modeLabel = (mode) => ({ NORMAL: 'Scheduled', ENERGY_SAVING: 'Energy Saving', FESTIVAL: 'Scheduled', EMERGENCY: 'Manual' }[mode] || mode);
const seasonLabel = (season) => season ? season[0] + season.slice(1).toLowerCase() : 'Summer';
export const pageToZone = (page = {}) => {
  const phases = Array.isArray(page.phases) ? page.phases : [];
  const lights = Array.isArray(page.lights) ? page.lights : [];
  const events = Array.isArray(page.events) ? page.events : [];
  const weekday = phases.filter((p) => p?.weekType === 'WEEKDAY').map((p) => ({ id: p.id, start: p.startTime, end: p.endTime, action: p.action, brightness: p.brightness }));
  const weekend = phases.filter((p) => p?.weekType === 'WEEKEND').map((p) => ({ id: p.id, start: p.startTime, end: p.endTime, action: p.action, brightness: p.brightness }));
  return { id: String(page.areaId ?? ''), areaId: page.areaId, name: page.areaName || 'Unnamed area', type: page.areaType || 'Automation area', target: lights[0]?.brightness ?? 100, enabled: page.enabled !== false, mode: modeLabel(page.mode || 'NORMAL'), backendMode: page.mode || 'NORMAL', season: seasonLabel(page.season), backendSeason: page.season || 'SUMMER', faultBehavior: page.faultHoldEnabled !== false, weekday, weekend, events: events.map((e) => ({ id: e.id, name: e.name, date: e.eventDate, brightness: e.brightness })), lights: lights.map((l) => ({ id: l.id, databaseId: l.databaseId, area: l.area || page.areaName || '', status: l.status || 'OFF', mode: l.mode === 'MANUAL' ? 'Manual' : 'Auto', backendMode: l.mode || 'AUTO', brightness: l.brightness ?? 0, faultStatus: l.faultStatus === true || l.status === 'FAULT' ? 'Fault' : 'No Fault', override: l.mode === 'MANUAL' ? { expires: l.expiresAt ? `Until ${new Date(l.expiresAt).toLocaleString()}` : 'Until cleared' } : null, priority: l.mode === 'MANUAL' ? 'Manual' : 'Schedule' })) };
};
