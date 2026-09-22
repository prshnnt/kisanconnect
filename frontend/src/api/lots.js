import { apiFetch } from './client'

export const lotsApi = {
  createLot: (data, activate = false) => apiFetch(`/lots?activate=${activate}`, { method: 'POST', body: data }),
  getMyLots: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiFetch(`/lots${query ? `?${query}` : ''}`)
  },
  getLot: (id) => apiFetch(`/lots/${id}`),
  patchLot: (id, data) => apiFetch(`/lots/${id}`, { method: 'PATCH', body: data }),
  activateLot: (id) => apiFetch(`/lots/${id}/activate`, { method: 'POST' }),
  cancelLot: (id) => apiFetch(`/lots/${id}/cancel`, { method: 'POST' }),
  exportLots: async (status) => {
    const query = status ? `?status=${status}` : ''
    const blob = await apiFetch(`/lots/export${query}`)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my_lots.xlsx'
    a.click()
  },
  // Advance supplies & demands
  createSupply: (data) => apiFetch('/advance-supplies', { method: 'POST', body: data }),
  getMySupplies: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiFetch(`/advance-supplies${q ? `?${q}` : ''}`)
  },
  getSupplyMarket: (commodityId) => apiFetch(`/advance-supplies/market${commodityId ? `?commodity_id=${commodityId}` : ''}`),
  deleteSupply: (id) => apiFetch(`/advance-supplies/${id}`, { method: 'DELETE' }),
  createDemand: (data) => apiFetch('/demands', { method: 'POST', body: data }),
  getDemandMarket: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiFetch(`/demands${q ? `?${q}` : ''}`)
  },
  getMyDemands: () => apiFetch('/demands/mine'),
  cancelDemand: (id) => apiFetch(`/demands/${id}`, { method: 'DELETE' }),
}
