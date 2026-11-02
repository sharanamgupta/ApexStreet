import { getStoredToken } from './auth.js';

async function request(path) {
  const response = await fetch(`/api/reports${path}`, { headers: { Authorization: `Bearer ${getStoredToken()}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || `Unable to load Reports (${response.status}).`);
  return data;
}

export const reportsApi = {
  get: (filters) => {
    const params = new URLSearchParams({ dateRange: filters.dateRange, area: filters.area, reportType: filters.reportType, search: filters.search || '' });
    return request(`?${params.toString()}`);
  },
};
