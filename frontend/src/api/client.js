const API_BASE = '/api/v1'

export const getAccessToken = () => localStorage.getItem('access_token')
export const getRefreshToken = () => localStorage.getItem('refresh_token')

export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem('access_token', accessToken)
  if (refreshToken) localStorage.setItem('refresh_token', refreshToken)
}

export const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`
  const headers = {
    ...options.headers,
  }

  const token = getAccessToken()
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }

  let response = await fetch(url, { ...options, headers })

  // Handle 401 token refresh retry
  if (response.status === 401 && getRefreshToken() && !options._retry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    options._retry = true
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: getRefreshToken() }),
      })
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        setTokens(refreshData.access_token, refreshData.refresh_token)
        headers['Authorization'] = `Bearer ${refreshData.access_token}`
        response = await fetch(url, { ...options, headers })
      } else {
        clearTokens()
        window.dispatchEvent(new Event('auth:logout'))
      }
    } catch {
      clearTokens()
      window.dispatchEvent(new Event('auth:logout'))
    }
  }

  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
    } catch {
      errorData = { message: response.statusText || 'An unexpected error occurred' }
    }
    const err = new Error(errorData.error?.message || errorData.detail || errorData.message || 'API Error')
    err.status = response.status
    err.code = errorData.error?.code || 'ERROR'
    err.details = errorData.error?.details || errorData
    throw err
  }

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return await response.json()
  }
  return await response.blob()
}
