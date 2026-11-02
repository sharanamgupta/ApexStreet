import { getStoredToken } from './auth.js';

export async function getActivityLogs(filters) {
  const params = new URLSearchParams({ dateRange: filters.dateRange, status: filters.status, module: filters.module, area: filters.area, search: filters.search || '' });
  const response = await fetch(`/api/activity-logs?${params.toString()}`, { headers: { Authorization: `Bearer ${getStoredToken()}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || `Unable to load Activity Logs (${response.status}).`);
  return data;
}
