import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth'
import { getAccessToken, clearTokens } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null)
      setLoading(false)
      return null
    }
    try {
      const userData = await authApi.getMe()
      setUser(userData)
      return userData
    } catch {
      clearTokens()
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()

    const handleLogoutEvent = () => {
      setUser(null)
    }
    window.addEventListener('auth:logout', handleLogoutEvent)
    return () => window.removeEventListener('auth:logout', handleLogoutEvent)
  }, [refreshUser])

  const login = async (mobile, password) => {
    await authApi.login({ mobile, password })
    return await refreshUser()
  }

  const loginWithOtp = async (mobile, otp) => {
    await authApi.login({ mobile, otp })
    return await refreshUser()
  }

  const register = async (data) => {
    await authApi.register(data)
    return await refreshUser()
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    await authApi.logout(refreshToken)
    setUser(null)
  }

  const value = {
    user,
    roles: user?.roles || [],
    isAuthenticated: !!user,
    loading,
    login,
    loginWithOtp,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider
