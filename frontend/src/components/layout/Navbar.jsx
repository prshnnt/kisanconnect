import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Stack,
  Tooltip,
  Divider,
  Container,
} from '@mui/material'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import GavelIcon from '@mui/icons-material/Gavel'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import DashboardIcon from '@mui/icons-material/Dashboard'
import { useAuth } from '../../context/AuthContext'

export function Navbar({ onToggleSidebar }) {
  const { user, roles, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleOpenUserMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleCloseUserMenu()
    await logout()
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
    { label: 'My Lots', path: '/lots', icon: <StorefrontIcon fontSize="small" /> },
    { label: 'Live Bidding', path: '/auctions', icon: <GavelIcon fontSize="small" /> },
    { label: 'Trades & Bills', path: '/trades', icon: <ReceiptLongIcon fontSize="small" /> },
    { label: 'Kisan Rath Services', path: '/marketplace', icon: <LocalShippingIcon fontSize="small" /> },
    { label: 'Find Mandis', path: '/mandis', icon: <LocationOnIcon fontSize="small" /> },
  ]

  return (
    <AppBar position="sticky" elevation={2} sx={{ bgcolor: 'primary.dark' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Left: Brand logo & Sidebar toggle */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={onToggleSidebar} sx={{ mr: 1, display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <AgricultureIcon sx={{ fontSize: 32, color: 'secondary.light' }} />
            <Box onClick={() => navigate('/dashboard')} sx={{ cursor: 'pointer' }}>
              <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.5, color: '#ffffff', lineHeight: 1.1 }}>
                KisanConnect
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>
                eNAM Digital Mandi
              </Typography>
            </Box>
          </Stack>

          {/* Desktop Navigation Links */}
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.path)
              return (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  startIcon={item.icon}
                  sx={{
                    color: active ? '#ffffff' : 'rgba(255,255,255,0.85)',
                    bgcolor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                    fontWeight: active ? 600 : 400,
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.8,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.25)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              )
            })}
          </Stack>

          {/* Right: User Role Badges & Avatar Menu */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', sm: 'flex' } }}>
              {roles.map((role) => (
                <Chip
                  key={role}
                  label={role.toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: 'secondary.main',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: 20,
                  }}
                />
              ))}
            </Stack>

            <Tooltip title="Account Settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', color: '#ffffff', width: 36, height: 36 }}>
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <AccountCircleIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseUserMenu}
              PaperProps={{
                elevation: 4,
                sx: { minWidth: 200, mt: 1.5, borderRadius: 2 },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {user?.full_name || 'Kisan User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  +91 {user?.mobile}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
                <AccountCircleIcon fontSize="small" sx={{ mr: 1.5 }} /> My Profile & Bank
              </MenuItem>
              {roles.includes('commission_agent') && (
                <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/agent'); }}>
                  <StorefrontIcon fontSize="small" sx={{ mr: 1.5 }} /> Commission Portal
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Logout
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Navbar

