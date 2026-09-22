import { apiFetch } from './client'

export const profileApi = {
  getProfile: () => apiFetch('/profile'),
  patchProfile: (data) => apiFetch('/profile', { method: 'PATCH', body: data }),
  putAddress: (kind, data) => apiFetch(`/profile/addresses/${kind}`, { method: 'PUT', body: data }),
  listAddresses: () => apiFetch('/profile/addresses'),
  requestMobileOtp: (mobile) => apiFetch('/profile/mobile/change/request-otp', { method: 'POST', body: { mobile } }),
  confirmMobileChange: (target, otp) => apiFetch('/profile/mobile/change/confirm', { method: 'POST', body: { target, otp } }),
  requestEmailOtp: (email) => apiFetch('/profile/email/request-otp', { method: 'POST', body: { email } }),
  verifyEmail: (target, otp) => apiFetch('/profile/email/verify', { method: 'POST', body: { target, otp } }),
  // Bank accounts
  listBankAccounts: () => apiFetch('/bank-accounts'),
  addBankAccount: (data) => apiFetch('/bank-accounts', { method: 'POST', body: data }),
  verifyBankAccount: (id) => apiFetch(`/bank-accounts/${id}/verify`, { method: 'POST' }),
  makePrimaryBank: (id) => apiFetch(`/bank-accounts/${id}/make-primary`, { method: 'POST' }),
  deleteBankAccount: (id) => apiFetch(`/bank-accounts/${id}`, { method: 'DELETE' }),
  // Preferences & Trade Licenses
  getSellerPrefs: () => apiFetch('/preferences/seller'),
  setSellerPrefs: (data) => apiFetch('/preferences/seller', { method: 'PUT', body: data }),
  getBuyerPrefs: () => apiFetch('/preferences/buyer'),
  setBuyerPrefs: (data) => apiFetch('/preferences/buyer', { method: 'PUT', body: data }),
  listTradeLicenses: () => apiFetch('/trade-licenses'),
  addTradeLicense: (data) => apiFetch('/trade-licenses', { method: 'POST', body: data }),
  editTradeLicense: (id, data) => apiFetch(`/trade-licenses/${id}`, { method: 'PATCH', body: data }),
  deleteTradeLicense: (id) => apiFetch(`/trade-licenses/${id}`, { method: 'DELETE' }),
}
