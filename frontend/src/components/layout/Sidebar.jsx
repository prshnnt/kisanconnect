import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Chip,
  Stack,
} from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import DashboardIcon from '@mui/icons-material/Dashboard'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LocalFloristIcon from '@mui/icons-material/LocalFlorist'
import GavelIcon from '@mui/icons-material/Gavel'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import PaymentsIcon from '@mui/icons-material/Payments'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import { useAuth } from '../../context/AuthContext'

export function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { roles } = useAuth()

  const categories = [
    {
      title: 'Core Mandi',
      items: [
        { label: 'Dashboard Overview', path: '/dashboard', icon: <DashboardIcon /> },
        { label: 'My Lots (Produce)', path: '/lots', icon: <StorefrontIcon /> },
        { label: 'Advance Supplies & Demands', path: '/lots/supplies', icon: <LocalFloristIcon /> },
      ],
    },
    {
      title: 'Bidding & Trade',
      items: [
        { label: 'Live Bidding Hall', path: '/auctions', icon: <GavelIcon /> },
        { label: 'Trades & Agreements', path: '/trades', icon: <ReceiptLongIcon /> },
        { label: 'Sale Bills & Payments', path: '/trades/bills', icon: <PaymentsIcon /> },
      ],
    },
    {
      title: 'Services & Logistics',
      items: [
        { label: 'Kisan Rath & Storage', path: '/marketplace', icon: <LocalShippingIcon /> },
        { label: 'My Service Bookings', path: '/marketplace/bookings', icon: <LocalShippingIcon /> },
        { label: 'Find Mandis (Directory)', path: '/mandis', icon: <LocationOnIcon /> },
      ],
    },
    {
      title: 'Account & Settings',
      items: [
        { label: 'Profile & Bank Accounts', path: '/profile', icon: <AccountCircleIcon /> },
        ...(roles.includes('commission_agent')
          ? [{ label: 'Commission Agent Hub', path: '/agent', icon: <SupportAgentIcon /> }]
          : []),
      ],
    },
  ]

  const drawerContent = (
    <Box sx={{ width: 280, p: 2, height: '100%', bgcolor: '#ffffff' }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2, px: 1 }}>
        <AgricultureIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="primary.dark">
            KisanConnect
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Navigation Menu
          </Typography>
        </Box>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      {categories.map((cat) => (
        <Box key={cat.title} sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            sx={{ px: 2, textTransform: 'uppercase', letterSpacing: 1 }}
          >
            {cat.title}
          </Typography>
          <List disablePadding sx={{ mt: 0.5 }}>
            {cat.items.map((item) => {
              const selected = location.pathname === item.path
              return (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    selected={selected}
                    onClick={() => {
                      navigate(item.path)
                      if (onClose) onClose()
                    }}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        color: '#ffffff',
                        '& .MuiListItemIcon-root': { color: '#ffffff' },
                        '&:hover': { bgcolor: 'primary.main' },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: selected ? '#ffffff' : 'primary.main' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: selected ? 600 : 400 }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </Box>
      ))}

      <Box sx={{ mt: 'auto', p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Need Assistance?
        </Typography>
        <Typography variant="body2" fontWeight={600} color="primary.main">
          eNAM Helpline: 1800-270-0224
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      {drawerContent}
    </Drawer>
  )
}

export default Sidebar

