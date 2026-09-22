import { apiFetch } from './client'

export const tradeApi = {
  recordWeighment: (data) => apiFetch('/weighment/records', { method: 'POST', body: data }),
  getWeighments: (lotId) => apiFetch(`/weighment/records${lotId ? `?lot_id=${lotId}` : ''}`),
  getMyTrades: (side = 'buy', params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiFetch(`/trade/${side}/trades${q ? `?${q}` : ''}`)
  },
  confirmTrade: (id) => apiFetch(`/trade/trades/${id}/confirm`, { method: 'POST' }),
  attachWeighment: (tradeId, weighmentId) =>
    apiFetch(`/trade/trades/${tradeId}/weighment`, { method: 'POST', body: { weighment_id: weighmentId } }),
  generateAgreement: (tradeId) => apiFetch(`/trade/trades/${tradeId}/generate-agreement`, { method: 'POST' }),
  approveTrade: (tradeId) => apiFetch(`/trade/trades/${tradeId}/approve`, { method: 'POST' }),
  rejectTrade: (tradeId) => apiFetch(`/trade/trades/${tradeId}/reject`, { method: 'POST' }),
  acceptBid: (tradeId) => apiFetch(`/trade/trades/${tradeId}/accept-bid`, { method: 'POST' }),
  rejectBid: (tradeId) => apiFetch(`/trade/trades/${tradeId}/reject-bid`, { method: 'POST' }),
  generateBill: (tradeId, data) => apiFetch(`/trade/trades/${tradeId}/generate-bill`, { method: 'POST', body: data }),
  getMyBills: (side = 'buy', status) => apiFetch(`/trade/${side}/bills${status ? `?status=${status}` : ''}`),
  payBill: (billId, data, idempotencyKey) => {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    return apiFetch(`/trade/bills/${billId}/payments`, { method: 'POST', body: data, headers })
  },
  getBillBreakdown: (billId) => apiFetch(`/trade/bills/${billId}/breakdown`),
  createGateExit: (data) => apiFetch('/gate-exits', { method: 'POST', body: data }),
  getGateExits: (approval) => apiFetch(`/gate-exits${approval ? `?approval=${approval}` : ''}`),
  approveGateExit: (id) => apiFetch(`/gate-exits/${id}/approve`, { method: 'POST' }),
  rejectGateExit: (id) => apiFetch(`/gate-exits/${id}/reject`, { method: 'POST' }),
  getSettlements: (status) => apiFetch(`/settlements${status ? `?status=${status}` : ''}`),
  releaseSettlement: (id, reference) => apiFetch(`/settlements/${id}/release`, { method: 'POST', body: { reference } }),
}
