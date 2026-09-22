import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import GavelIcon from '@mui/icons-material/Gavel'
import TimerIcon from '@mui/icons-material/Timer'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { auctionsApi } from '../../api/auctions'
import { useAuth } from '../../context/AuthContext'

export function AuctionDetailPage() {
  const { auctionId } = useParams()
  const navigate = useNavigate()
  const { roles } = useAuth()

  const [loading, setLoading] = useState(true)
  const [auction, setAuction] = useState(null)
  const [bids, setBids] = useState([])
  const [bidAmount, setBidAmount] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchAuctionDetail = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const aData = await auctionsApi.getAuction(auctionId)
      setAuction(aData)
      const bidList = await auctionsApi.getMyBids(auctionId)
      setBids(bidList || [])
      if (aData) {
        const nextMin = Number(aData.h1_price || aData.reserve_price) + 50
        setBidAmount(String(nextMin))
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch auction detail')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuctionDetail()
  }, [auctionId])

  const handlePlaceBid = async () => {
    setErrorMessage('')
    setSuccessMessage('')
    if (!bidAmount || isNaN(bidAmount)) {
      setErrorMessage('Please enter a valid bid amount')
      return
    }
    setSubmitting(true)
    try {
      const key = `bid-${auctionId}-${Date.now()}`
      const res = await auctionsApi.placeBid(auctionId, { amount: bidAmount }, key)
      setSuccessMessage(`Bid of ₹${res.h1_price} placed successfully! Rank: ${res.rank || 'H1'}`)
      fetchAuctionDetail()
    } catch (err) {
      setErrorMessage(err.message || 'Bid submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeclareWinner = async () => {
    try {
      await auctionsApi.declare(auctionId, true)
      setSuccessMessage('Auction declared and trade agreement initiated!')
      fetchAuctionDetail()
    } catch (err) {
      setErrorMessage(err.message || 'Declaration failed')
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress color="primary" />
      </Box>
    )
  }

  if (!auction) {
    return (
      <Box py={6} textAlign="center">
        <Typography variant="h6" color="error">
          Auction session not found.
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/auctions')} sx={{ mt: 2 }}>
          Back to Auctions
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/auctions')} sx={{ mb: 2 }}>
        Back to Live Bidding Hall
      </Button>

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

      <Grid container spacing={3}>
        {/* Left: Auction Info & Bid Action */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <GavelIcon color="primary" sx={{ fontSize: 36 }} />
                <Box>
                  <Typography variant="h5" fontWeight={800} color="primary.dark">
                    Auction Room #{auction.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Lot ID: {auction.lot_id}
                  </Typography>
                </Box>
              </Stack>

              <Chip
                label={auction.status?.toUpperCase()}
                color={auction.status === 'live' ? 'success' : auction.status === 'declared' ? 'info' : 'default'}
                sx={{ fontWeight: 800, fontSize: '0.85rem' }}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2} mb={3}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  RESERVE MIN PRICE
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  ₹{auction.reserve_price} / QTL
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  CURRENT H1 BID
                </Typography>
                <Typography variant="h5" fontWeight={800} color="secondary.dark">
                  ₹{auction.h1_price || auction.reserve_price} / QTL
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  SESSION ENDS AT
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {new Date(auction.ends_at).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  TOTAL BIDS PLACED
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {auction.bid_count || bids.length}
                </Typography>
              </Grid>
            </Grid>

            {auction.status === 'live' && (
              <Box p={3} bgcolor="#fff8e1" borderRadius={3} border="1px solid #ffe0b2">
                <Typography variant="subtitle1" fontWeight={700} color="secondary.dark" mb={1.5}>
                  Place Live eNAM Bid
                </Typography>
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    label="Your Bid Price (₹ / QTL)"
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={handlePlaceBid}
                    disabled={submitting}
                    sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Bid'}
                  </Button>
                </Stack>
              </Box>
            )}

            {roles.includes('admin') && auction.status === 'live' && (
              <Box mt={3}>
                <Button
                  variant="outlined"
                  color="info"
                  startIcon={<EmojiEventsIcon />}
                  onClick={handleDeclareWinner}
                >
                  Declare Winning Bidder (Admin)
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right: My Bidding History */}
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              My Bid Submissions
            </Typography>

            {bids.length === 0 ? (
              <Typography variant="body2" color="text.secondary" py={4} textAlign="center">
                You have not placed any bids on this auction yet.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Bid Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bids.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell fontWeight={700}>₹{b.amount}</TableCell>
                        <TableCell>
                          <Chip
                            label={b.is_win ? 'WINNING' : 'PLACED'}
                            color={b.is_win ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(b.created_at).toLocaleTimeString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AuctionDetailPage
