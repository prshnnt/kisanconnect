import React, { createContext, useContext, useState } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // role: 'farmer' | 'buyer' | 'agent' | 'provider' | 'admin'
  const [role, setRole] = useState(null)

  function login(userData, userRole) {
    setUser(userData)
    setRole(userRole)
  }

  function logout() {
    setUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, login, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
