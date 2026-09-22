import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Divider,
} from '@mui/material'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import StorefrontIcon from '@mui/icons-material/Storefront'
import GavelIcon from '@mui/icons-material/Gavel'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AddIcon from '@mui/icons-material/Add'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import VerifiedIcon from '@mui/icons-material/Verified'
import { useAuth } from '../../context/AuthContext'
import { auctionsApi } from '../../api/auctions'
import { lotsApi } from '../../api/lots'
import { tradeApi } from '../../api/trade'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, roles } = useAuth()
  const [loading, setLoading] = useState(true)
  const [pendingAuctions, setPendingAuctions] = useState([])
  const [myLots, setMyLots] = useState([])
  const [recentTrades, setRecentTrades] = useState([])

  useEffect(() => {
    let isMounted = true
    async function fetchDashboardData() {
      try {
        const [auctionRes, lotRes, tradeRes] = await Promise.allSettled([
          auctionsApi.getPending('live', { size: 5 }),
          roles.includes('seller') ? lotsApi.getMyLots({ size: 5 }) : Promise.resolve({ items: [] }),
          tradeApi.getMyTrades('buy', { size: 5 }),
        ])

        if (!isMounted) return

        if (auctionRes.status === 'fulfilled') {
          setPendingAuctions(auctionRes.value.items || [])
        }
        if (lotRes.status === 'fulfilled') {
          setMyLots(lotRes.value.items || [])
        }
        if (tradeRes.status === 'fulfilled') {
          setRecentTrades(tradeRes.value.items || [])
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchDashboardData()
    return () => {
      isMounted = false
    }
  }, [roles])

  return (
    <Box>
      {/* Welcome Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <Typography variant="h5" fontWeight={800}>
                Welcome back, {user?.full_name || 'Farmer'}!
              </Typography>
              <VerifiedIcon color="secondary" fontSize="small" />
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              KisanConnect eNAM Digital Mandi | Live price feed, race-safe bidding, and instant settlement.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            {roles.includes('seller') && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/lots')}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              >
                Create Lot
              </Button>
            )}
            <Button
              variant="outlined"
              sx={{ color: '#ffffff', borderColor: '#ffffff', fontWeight: 600, borderRadius: 2 }}
              onClick={() => navigate('/auctions')}
              startIcon={<GavelIcon />}
            >
              Live Bidding
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Overview Stat Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '6px solid #2e7d32' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    LIVE AUCTIONS
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="primary.dark">
                    {pendingAuctions.length}
                  </Typography>
                </Box>
                <GavelIcon sx={{ fontSize: 40, color: 'primary.light', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '6px solid #f57c00' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    MY ACTIVE LOTS
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="secondary.dark">
                    {myLots.length}
                  </Typography>
                </Box>
                <StorefrontIcon sx={{ fontSize: 40, color: 'secondary.light', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '6px solid #0288d1' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    ACTIVE TRADES
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="info.dark">
                    {recentTrades.length}
                  </Typography>
                </Box>
                <ReceiptLongIcon sx={{ fontSize: 40, color: 'info.light', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '6px solid #7b1fa2' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    MANDIS CONNECTED
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ color: '#7b1fa2' }}>
                    100+
                  </Typography>
                </Box>
                <LocationOnIcon sx={{ fontSize: 40, color: '#ab47bc', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Grid Content */}
      <Grid container spacing={3}>
        {/* Live Bidding Ticker Table */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb= {2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <GavelIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Live eNAM Auctions
                </Typography>
                <Chip label="ACTIVE" color="success" size="small" sx={{ fontWeight: 700 }} />
              </Stack>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/auctions')}
              >
                View All Bidding
              </Button>
            </Stack>

            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress color="primary" size={32} />
              </Box>
            ) : pendingAuctions.length === 0 ? (
              <Box py={4} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  No active auctions in session. Check back during Mandi bidding hours!
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Lot Code</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Reserve Price</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Highest Bid (H1)</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingAuctions.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell fontWeight={600}>{row.lot_number || `LOT-${row.lot_id}`}</TableCell>
                        <TableCell>{row.quantity_qtl} QTL</TableCell>
                        <TableCell>₹{row.reserve_price}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="secondary.dark">
                            ₹{row.h1_price || row.reserve_price}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="contained"
                            color="secondary"
                            onClick={() => navigate(`/auctions/${row.id}`)}
                            sx={{ fontWeight: 700, borderRadius: 1.5 }}
                          >
                            Bid Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Quick Action Navigation Grid */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Quick Services
            </Typography>

            <Stack spacing={2}>
              <Paper
                onClick={() => navigate('/lots')}
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: '#f1f8e9',
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: '1px solid #c8e6c9',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <StorefrontIcon color="primary" sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Produce Entry & Lots
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Register agricultural lots for auction listing
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper
                onClick={() => navigate('/marketplace')}
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: '#fff3e0',
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: '1px solid #ffe0b2',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <LocalShippingIcon color="secondary" sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Kisan Rath Logistics
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Book trucks, cold storage, and quality assaying labs
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper
                onClick={() => navigate('/mandis')}
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: '#e1f5fe',
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: '1px solid #b3e5fc',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <LocationOnIcon color="info" sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Mandi Directory Search
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Find APMC Mandis by GPS coordinates and state
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage
