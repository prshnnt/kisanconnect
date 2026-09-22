import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Stack,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material'
import GavelIcon from '@mui/icons-material/Gavel'
import TimerIcon from '@mui/icons-material/Timer'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import RefreshIcon from '@mui/icons-material/Refresh'
import { auctionsApi } from '../../api/auctions'
import { useAuth } from '../../context/AuthContext'

export function LiveAuctionsPage() {
  const navigate = useNavigate()
  const { roles } = useAuth()
  const [tab, setTab] = useState('live') // 'live' | 'closed'
  const [loading, setLoading] = useState(true)
  const [auctions, setAuctions] = useState([])
  const [summary, setSummary] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Bulk Create Modal State
  const [openBulk, setOpenBulk] = useState(false)
  const [eligibleLots, setEligibleLots] = useState([])
  const [selectedLotIds, setSelectedLotIds] = useState([])
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [submitting, setSubmitting] = useState(false)

  // Bidding Input State for Quick Bid
  const [biddingId, setBiddingId] = useState(null)
  const [bidAmount, setBidAmount] = useState('')

  const fetchAuctions = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const res = await auctionsApi.getPending(tab)
      setAuctions(res.items || [])
      setSummary(res.summary || null)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch pending auctions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuctions()
  }, [tab])

  const handleOpenBulk = async () => {
    setOpenBulk(true)
    try {
      const res = await auctionsApi.getEligibleLots()
      setEligibleLots(res.items || [])
    } catch (err) {
      console.error('Failed eligible lots:', err)
    }
  }

  const handleCreateBulkAuctions = async () => {
    if (selectedLotIds.length === 0) {
      setErrorMessage('Select at least one eligible lot')
      return
    }
    setSubmitting(true)
    try {
      await auctionsApi.createBulk({
        lot_ids: selectedLotIds,
        duration_minutes: Number(durationMinutes),
      })
      setSuccessMessage('Auctions created successfully!')
      setOpenBulk(false)
      fetchAuctions()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to bulk create auctions')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePlaceBid = async (auctionId) => {
    if (!bidAmount || isNaN(bidAmount)) {
      setErrorMessage('Enter a valid bid amount')
      return
    }
    setSubmitting(true)
    try {
      const key = `bid-${auctionId}-${Date.now()}`
      const res = await auctionsApi.placeBid(auctionId, { amount: bidAmount }, key)
      setSuccessMessage(`Bid of ₹${res.h1_price} placed successfully! Status: ${res.rank || 'H1'}`)
      setBiddingId(null)
      setBidAmount('')
      fetchAuctions()
    } catch (err) {
      setErrorMessage(err.message || 'Bid submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} mb={3}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <GavelIcon color="primary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary.dark">
                Electronic Mandi Bidding Hall (eNAM)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Race-safe live bidding engine with row locking and real-time H1 updates.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            {(roles.includes('seller') || roles.includes('admin')) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenBulk}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              >
                Schedule Bulk Auctions
              </Button>
            )}
            <IconButton onClick={fetchAuctions} color="primary">
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<GavelIcon />} iconPosition="start" label="Live Auctions In Session" value="live" />
          <Tab icon={<TimerIcon />} iconPosition="start" label="Closed Bidding Sweeps" value="closed" />
        </Tabs>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {summary && (
          <Box mb={3} p={2} bgcolor="#f8fafc" borderRadius={2} border="1px solid #e2e8f0">
            <Stack direction="row" spacing={4}>
              <Typography variant="body2">
                <strong>Total Bidding Session Count:</strong> {summary.count || auctions.length}
              </Typography>
            </Stack>
          </Box>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress color="primary" />
          </Box>
        ) : auctions.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="body1" color="text.secondary">
              No auctions currently in session for this tab.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {auctions.map((row) => (
              <Grid item xs={12} sm={6} md={4} key={row.id}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    borderTop: '4px solid #f57c00',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-3px)' },
                  }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" fontWeight={700} color="primary.dark">
                        {row.lot_number || `AUC-${row.id}`}
                      </Typography>
                      <Chip
                        label={row.status?.toUpperCase()}
                        color={row.status === 'live' ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      Quantity: <strong>{row.quantity_qtl} QTL</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reserve Min Price: <strong>₹{row.reserve_price} / QTL</strong>
                    </Typography>

                    <Box sx={{ my: 1.5, p: 1.5, bgcolor: '#fff3e0', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        CURRENT HIGHEST BID (H1)
                      </Typography>
                      <Typography variant="h5" fontWeight={800} color="secondary.dark">
                        ₹{row.h1_price || row.reserve_price}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Bids Placed: {row.bid_count || 0}
                      </Typography>
                    </Box>

                    {row.bid_ending_in_sec !== undefined && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <TimerIcon fontSize="small" color="action" />
                        <Typography variant="caption" fontWeight={600} color="error.main">
                          Closes in {Math.floor(row.bid_ending_in_sec / 60)}m {row.bid_ending_in_sec % 60}s
                        </Typography>
                      </Stack>
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => navigate(`/auctions/${row.id}`)}
                    >
                      Auction Room
                    </Button>

                    {tab === 'live' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                          setBiddingId(row.id)
                          setBidAmount(String(Number(row.h1_price || row.reserve_price) + 50))
                        }}
                        sx={{ fontWeight: 700, borderRadius: 1.5 }}
                      >
                        Quick Bid
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Quick Bid Input Dialog */}
      <Dialog open={Boolean(biddingId)} onClose={() => setBiddingId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Place eNAM Auction Bid</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter your bid price per Quintal. Bids are race-safe and processed with DB row locks.
          </Typography>
          <TextField
            fullWidth
            label="Bid Amount (₹ / QTL)"
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBiddingId(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handlePlaceBid(biddingId)}
            disabled={submitting}
            sx={{ fontWeight: 700 }}
          >
            {submitting ? 'Submitting Bid...' : 'Confirm Bid'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Auction Schedule Modal */}
      <Dialog open={openBulk} onClose={() => setOpenBulk(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Schedule Bulk Mandi Auctions</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <Typography variant="body2" color="text.secondary">
              Select active farmer lots with reserve prices to put up for bidding:
            </Typography>

            {eligibleLots.length === 0 ? (
              <Alert severity="info">No active lots currently available for auction schedule.</Alert>
            ) : (
              eligibleLots.map((lot) => (
                <Card
                  key={lot.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    bgcolor: selectedLotIds.includes(lot.id) ? '#e8f5e9' : 'inherit',
                  }}
                  onClick={() => {
                    setSelectedLotIds((prev) =>
                      prev.includes(lot.id) ? prev.filter((x) => x !== lot.id) : [...prev, lot.id]
                    )
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {lot.number || `LOT-${lot.id}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {lot.quantity_qtl} QTL | Min Price: ₹{lot.min_price}
                      </Typography>
                    </Box>
                    <Chip
                      label={selectedLotIds.includes(lot.id) ? 'SELECTED' : 'SELECT'}
                      color={selectedLotIds.includes(lot.id) ? 'success' : 'default'}
                      size="small"
                    />
                  </Stack>
                </Card>
              ))
            )}

            <TextField
              fullWidth
              size="small"
              label="Auction Duration (Minutes)"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulk(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateBulkAuctions}
            disabled={submitting || selectedLotIds.length === 0}
            sx={{ fontWeight: 700 }}
          >
            {submitting ? 'Creating...' : 'Start Auctions'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default LiveAuctionsPage
