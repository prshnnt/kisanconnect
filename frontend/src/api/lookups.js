import { apiFetch } from './client'

export const lookupsApi = {
  getStates: () => apiFetch('/lookups/states'),
  getDistricts: (stateId) => apiFetch(`/lookups/districts?state_id=${stateId}`),
  getTehsils: (districtId) => apiFetch(`/lookups/tehsils?district_id=${districtId}`),
  getApmcs: (stateId, q) => apiFetch(`/lookups/apmcs?state_id=${stateId}${q ? `&q=${q}` : ''}`),
  getCommodities: (q) => apiFetch(`/lookups/commodities${q ? `?q=${q}` : ''}`),
  getVarieties: (commodityId) => apiFetch(`/lookups/commodities/${commodityId}/varieties`),
  getBagTypes: () => apiFetch('/lookups/bag-types'),
  getCommissionAgents: (apmcId, q) => apiFetch(`/lookups/commission-agents?apmc_id=${apmcId}${q ? `&q=${q}` : ''}`),
  getEnumValues: (name) => apiFetch(`/lookups/enums/${name}`),
  presignUpload: (fileData) => apiFetch('/uploads/presign', { method: 'POST', body: fileData }),
}
