import { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import { marketplaceApi } from '../../api/marketplace'
import { useAuth } from '../../context/AuthContext'

export function BookingsPage() {
  const { roles } = useAuth()
  const [tab, setTab] = useState(0) // 0: Seeker Bookings, 1: Provider Requests Received
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const fetchBookings = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      if (tab === 0) {
        const res = await marketplaceApi.getMyBookings()
        setBookings(res.items || [])
      } else {
        const res = await marketplaceApi.getReceivedBookings()
        setBookings(res.items || [])
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [tab])

  const handleAction = async (actionFn, id, note) => {
    try {
      await actionFn(id, { note: note || 'Action performed' })
      setSuccessMessage('Booking status updated!')
      fetchBookings()
    } catch (err) {
      setErrorMessage(err.message || 'Action failed')
    }
  }

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
          <LocalShippingIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.dark">
              Service Booking Console
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage status progression for Kisan Rath transport, storage, and assaying bookings.
            </Typography>
          </Box>
        </Stack>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<LocalShippingIcon />} iconPosition="start" label="My Requested Bookings" />
          {roles.includes('service_provider') && (
            <Tab icon={<LocalShippingIcon />} iconPosition="start" label="Service Requests Received" />
          )}
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

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress color="primary" />
          </Box>
        ) : bookings.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={6}>
            No service bookings found.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Booking ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Service Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Agreed Price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell fontWeight={700}>BKG-{row.id}</TableCell>
                    <TableCell>{row.service_type?.toUpperCase()}</TableCell>
                    <TableCell>{row.quantity_units} Units</TableCell>
                    <TableCell fontWeight={700} color="primary.dark">
                      ₹{row.agreed_price || row.offered_price}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status?.toUpperCase()}
                        color={
                          row.status === 'completed'
                            ? 'success'
                            : row.status === 'in_progress'
                            ? 'info'
                            : row.status === 'pending'
                            ? 'warning'
                            : 'default'
                        }
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {tab === 1 && row.status === 'pending' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleAction(marketplaceApi.acceptBooking, row.id)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleAction(marketplaceApi.rejectBooking, row.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {tab === 1 && row.status === 'accepted' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="info"
                            onClick={() => handleAction(marketplaceApi.startBooking, row.id)}
                          >
                            Start Service
                          </Button>
                        )}
                        {tab === 1 && row.status === 'in_progress' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleAction(marketplaceApi.completeBooking, row.id)}
                          >
                            Complete
                          </Button>
                        )}
                        {row.status !== 'completed' && row.status !== 'cancelled' && (
                          <Button
                            size="small"
                            color="inherit"
                            onClick={() => handleAction(marketplaceApi.cancelBooking, row.id, 'User cancelled')}
                          >
                            Cancel
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  )
}

export default BookingsPage
