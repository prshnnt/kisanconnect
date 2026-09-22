import { apiFetch } from './client'

export const auctionsApi = {
  getEligibleLots: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiFetch(`/auctions/eligible-lots${q ? `?${q}` : ''}`)
  },
  createBulk: (data) => apiFetch('/auctions/bulk', { method: 'POST', body: data }),
  getPending: (tab = 'live', params = {}) => {
    const q = new URLSearchParams({ tab, ...params }).toString()
    return apiFetch(`/auctions/pending?${q}`)
  },
  getWinning: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiFetch(`/auctions/winning${q ? `?${q}` : ''}`)
  },
  getAuction: (id) => apiFetch(`/auctions/${id}`),
  placeBid: (id, data, idempotencyKey) => {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    return apiFetch(`/auctions/${id}/bids`, { method: 'POST', body: data, headers })
  },
  getMyBids: (id) => apiFetch(`/auctions/${id}/bids/mine`),
  declare: (id, force = false) => apiFetch(`/auctions/${id}/declare?force=${force}`, { method: 'POST' }),
  close: (id) => apiFetch(`/auctions/${id}/close`, { method: 'POST' }),
}
