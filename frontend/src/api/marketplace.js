import { apiFetch } from './client'

export const marketplaceApi = {
  registerService: (data) => apiFetch('/service-profiles', { method: 'PUT', body: data }),
  getMyServices: () => apiFetch('/service-profiles/me'),
  createCatalog: (data) => apiFetch('/catalogs', { method: 'POST', body: data }),
  getMyCatalogs: (serviceType) => apiFetch(`/catalogs/mine${serviceType ? `?service_type=${serviceType}` : ''}`),
  editCatalog: (id, data) => apiFetch(`/catalogs/${id}`, { method: 'PATCH', body: data }),
  deactivateCatalog: (id) => apiFetch(`/catalogs/${id}`, { method: 'DELETE' }),
  browseServices: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiFetch(`/services${q ? `?${q}` : ''}`)
  },
  getServiceDetail: (id) => apiFetch(`/services/${id}`),
  createBooking: (data) => apiFetch('/bookings', { method: 'POST', body: data }),
  getMyBookings: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiFetch(`/bookings/mine${q ? `?${q}` : ''}`)
  },
  getReceivedBookings: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiFetch(`/bookings/received${q ? `?${q}` : ''}`)
  },
  getBookingDetail: (id) => apiFetch(`/bookings/${id}`),
  negotiateBooking: (id, data) => apiFetch(`/bookings/${id}/negotiation`, { method: 'POST', body: data }),
  acceptBooking: (id) => apiFetch(`/bookings/${id}/accept`, { method: 'POST' }),
  rejectBooking: (id) => apiFetch(`/bookings/${id}/reject`, { method: 'POST' }),
  startBooking: (id, actionData) => apiFetch(`/bookings/${id}/start`, { method: 'POST', body: actionData }),
  completeBooking: (id, actionData) => apiFetch(`/bookings/${id}/complete`, { method: 'POST', body: actionData }),
  cancelBooking: (id, actionData) => apiFetch(`/bookings/${id}/cancel`, { method: 'POST', body: actionData }),
}
