import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import DashboardIcon from '@mui/icons-material/Dashboard'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import GavelIcon from '@mui/icons-material/Gavel'
import BarChartIcon from '@mui/icons-material/BarChart'
import SettingsIcon from '@mui/icons-material/Settings'
import PeopleIcon from '@mui/icons-material/People'
import MenuIcon from '@mui/icons-material/Menu'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../../contexts/LanguageContext.jsx'

const NAV_ITEMS = [
  { path: '/admin', icon: DashboardIcon, en: 'Overview', hi: 'अवलोकन' },
  { path: '/admin/approvals', icon: CheckCircleIcon, en: 'Approvals', hi: 'अनुमोदन' },
  { path: '/admin/liveops', icon: FlashOnIcon, en: 'Live ops', hi: 'लाइव ops' },
  { path: '/admin/money', icon: AccountBalanceWalletIcon, en: 'Money', hi: 'पैसा' },
  { path: '/admin/disputes', icon: GavelIcon, en: 'Disputes', hi: 'विवाद' },
  { path: '/admin/market', icon: BarChartIcon, en: 'Market data', hi: 'बाज़ार डेटा' },
  { path: '/admin/rules', icon: SettingsIcon, en: 'Rules & masters', hi: 'नियम' },
  { path: '/admin/people', icon: PeopleIcon, en: 'People', hi: 'लोग' },
]

const DRAWER_WIDTH = 220

export default function AdminShell() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width:900px)')

  const currentNav = NAV_ITEMS.findIndex(n => location.pathname === n.path || location.pathname.startsWith(n.path + '/'))

  const NavContent = (
    <Box sx={{ pt: 1 }}>
      <Box sx={{ px: 2, py: 2, borderBottom: '1px solid #F3E8D0' }}>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#F5A524' }}>KisanConnect</Typography>
        <Typography variant="caption" sx={{ color: '#6B7280' }}>Admin Console</Typography>
      </Box>
      <List dense>
        {NAV_ITEMS.map((item, i) => {
          const Icon = item.icon
          const isActive = currentNav === i
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => { navigate(item.path); setMobileOpen(false) }}
                sx={{ borderRadius: 2, mx: 1, mb: 0.25, '&.Mui-selected': { bgcolor: '#FEF3C7', color: '#F5A524' }, '&.Mui-selected:hover': { bgcolor: '#FEF3C7' } }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Icon sx={{ fontSize: 20, color: isActive ? '#F5A524' : '#6B7280' }} />
                </ListItemIcon>
                <ListItemText primary={lang === 'hi' ? item.hi : item.en} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 700 : 400 }} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FFFBF5' }}>
      {isMobile ? (
        <>
          <AppBar position="fixed" elevation={0} sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #F3E8D0', color: '#1F2937' }}>
            <Toolbar>
              <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}><MenuIcon /></IconButton>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {NAV_ITEMS[currentNav]?.[lang === 'hi' ? 'hi' : 'en'] || 'Admin'}
              </Typography>
            </Toolbar>
          </AppBar>
          <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: '#FFFFFF' } }}>
            {NavContent}
          </Drawer>
          <Box sx={{ flex: 1, mt: 8, p: 2 }}>
            <Outlet />
          </Box>
        </>
      ) : (
        <>
          <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0, bgcolor: '#FFFFFF', borderRight: '1px solid #F3E8D0', position: 'fixed', height: '100vh', overflowY: 'auto' }}>
            {NavContent}
          </Box>
          <Box sx={{ flex: 1, ml: `${DRAWER_WIDTH}px`, p: 3 }}>
            <Outlet />
          </Box>
        </>
      )}
    </Box>
  )
}
