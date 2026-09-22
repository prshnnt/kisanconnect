import { apiFetch } from './client'

export const lookupsApi = {
  getStates: () => apiFetch('/lookups/states'),
  getDistricts: (stateId) => apiFetch(`/lookups/districts${stateId ? `?state_id=${stateId}` : ''}`),
  getTehsils: (districtId) => apiFetch(`/lookups/tehsils${districtId ? `?district_id=${districtId}` : ''}`),
  getApmcs: (stateId, q) => {
    const params = new URLSearchParams()
    if (stateId) params.append('state_id', stateId)
    if (q) params.append('q', q)
    const str = params.toString()
    return apiFetch(`/lookups/apmcs${str ? `?${str}` : ''}`)
  },
  getCommodities: (q) => apiFetch(`/lookups/commodities${q ? `?q=${q}` : ''}`),
  getVarieties: (commodityId) => apiFetch(`/lookups/commodities/${commodityId}/varieties`),
  getBagTypes: () => apiFetch('/lookups/bag-types'),
  getCommissionAgents: (apmcId, q) => apiFetch(`/lookups/commission-agents?apmc_id=${apmcId}${q ? `&q=${q}` : ''}`),
  getEnumValues: (name) => apiFetch(`/lookups/enums/${name}`),
  presignUpload: (fileData) => apiFetch('/uploads/presign', { method: 'POST', body: fileData }),
}
