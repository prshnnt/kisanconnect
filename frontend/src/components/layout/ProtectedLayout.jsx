import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Box, CircularProgress, Container, Typography } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function ProtectedLayout({ allowedRoles }) {
  const { isAuthenticated, loading, roles } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        bgcolor="#f8fafc"
      >
        <CircularProgress color="primary" size={48} thickness={4} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading KisanConnect Portal...
        </Typography>
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.some((r) => roles.includes(r))) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="80vh">
        <Typography variant="h5" color="error" fontWeight={700}>
          Access Restricted
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Your profile role does not have permission to view this section.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        <Outlet />
      </Container>
      <Box component="footer" sx={{ py: 2, px: 3, mt: 'auto', bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <Container maxWidth="xl">
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            © 2026 KisanConnect Digital Mandi Platform. Integrated with eNAM Standards.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default ProtectedLayout
