import { apiFetch } from './client'

export const agentsApi = {
  getMyProfile: () => apiFetch('/agents/me'),
  editProfile: (data) => apiFetch('/agents/me', { method: 'PATCH', body: data }),
  getAssignedLots: (status) => apiFetch(`/agents/me/lots${status ? `?status=${status}` : ''}`),
  getEarnings: () => apiFetch('/agents/me/earnings'),
  addChargeRule: (data) => apiFetch('/charge-rules', { method: 'POST', body: data }),
  listChargeRules: (apmcId) => apiFetch(`/charge-rules${apmcId ? `?apmc_id=${apmcId}` : ''}`),
  deactivateChargeRule: (id) => apiFetch(`/charge-rules/${id}`, { method: 'DELETE' }),
}
