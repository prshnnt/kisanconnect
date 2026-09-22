import { apiFetch, setTokens, clearTokens } from './client'

export const authApi = {
  requestRegisterOtp: (mobile) => apiFetch('/auth/register/request-otp', { method: 'POST', body: { mobile } }),
  register: async (data) => {
    const res = await apiFetch('/auth/register', { method: 'POST', body: data })
    setTokens(res.access_token, res.refresh_token)
    return res
  },
  requestLoginOtp: (mobile) => apiFetch('/auth/login/request-otp', { method: 'POST', body: { mobile } }),
  login: async (credentials) => {
    const res = await apiFetch('/auth/login', { method: 'POST', body: credentials })
    setTokens(res.access_token, res.refresh_token)
    return res
  },
  logout: async (refreshToken) => {
    try {
      if (refreshToken) {
        await apiFetch('/auth/logout', { method: 'POST', body: { refresh_token: refreshToken } })
      }
    } finally {
      clearTokens()
    }
  },
  getMe: () => apiFetch('/auth/me'),
  changePassword: (data) => apiFetch('/auth/password/change', { method: 'POST', body: data }),
  requestDeleteOtp: () => apiFetch('/auth/account/delete/request-otp', { method: 'POST' }),
  confirmDelete: (otp) => apiFetch('/auth/account/delete/confirm', { method: 'POST', body: { otp } }),
}
