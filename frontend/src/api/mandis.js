import { apiFetch } from './client'

export const mandisApi = {
  getCaptcha: () => apiFetch('/captcha'),
  getNearby: (data) => apiFetch('/mandis/nearby', { method: 'POST', body: data }),
  getByState: (stateId, q) => apiFetch(`/mandis/by-state?state_id=${stateId}${q ? `&q=${q}` : ''}`),
}
