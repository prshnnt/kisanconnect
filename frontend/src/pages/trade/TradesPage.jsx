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
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import DescriptionIcon from '@mui/icons-material/Description'
import ScaleIcon from '@mui/icons-material/Scale'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import RefreshIcon from '@mui/icons-material/Refresh'
import { tradeApi } from '../../api/trade'
import { useAuth } from '../../context/AuthContext'

export function TradesPage() {
  const { roles } = useAuth()
  const [side, setSide] = useState('buy') // 'buy' | 'sell'
  const [loading, setLoading] = useState(true)
  const [trades, setTrades] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Weighment record dialog state
  const [openWeighment, setOpenWeighment] = useState(false)
  const [targetTradeId, setTargetTradeId] = useState(null)
  const [grossWeight, setGrossWeight] = useState('')
  const [tareWeight, setTareWeight] = useState('')
  const [bags, setBags] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Gate Exit dialog state
  const [openGateExit, setOpenGateExit] = useState(false)
  const [vehicleNumber, setVehicleNumber] = useState('')

  const fetchTrades = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const res = await tradeApi.getMyTrades(side)
      setTrades(res.items || [])
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch trade contracts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrades()
  }, [side])

  const handleAcceptBid = async (tradeId) => {
    try {
      await tradeApi.acceptBid(tradeId)
      setSuccessMessage(`Trade #${tradeId} bid accepted by seller!`)
      fetchTrades()
    } catch (err) {
      setErrorMessage(err.message || 'Acceptance failed')
    }
  }

  const handleRejectBid = async (tradeId) => {
    try {
      await tradeApi.rejectBid(tradeId)
      setSuccessMessage(`Trade #${tradeId} bid rejected. Lot returned to pool.`)
      fetchTrades()
    } catch (err) {
      setErrorMessage(err.message || 'Rejection failed')
    }
  }

  const handleGenerateAgreement = async (tradeId) => {
    try {
      await tradeApi.generateAgreement(tradeId)
      setSuccessMessage(`Sale agreement generated for Trade #${tradeId}!`)
      fetchTrades()
    } catch (err) {
      setErrorMessage(err.message || 'Agreement generation failed')
    }
  }

  const handleApproveAgreement = async (tradeId) => {
    try {
      await tradeApi.approveTrade(tradeId)
      setSuccessMessage(`Sale agreement approved for Trade #${tradeId}!`)
      fetchTrades()
    } catch (err) {
      setErrorMessage(err.message || 'Approval failed')
    }
  }

  const handleGenerateBill = async (tradeId) => {
    try {
      await tradeApi.generateBill(tradeId, {})
      setSuccessMessage(`eNAM Sale Bill generated for Trade #${tradeId}!`)
      fetchTrades()
    } catch (err) {
      setErrorMessage(err.message || 'Bill generation failed')
    }
  }

  const handleRecordWeighment = async () => {
    if (!grossWeight || !tareWeight) {
      setErrorMessage('Gross and Tare weights are required')
      return
    }
    setSubmitting(true)
    try {
      const wRecord = await tradeApi.recordWeighment({
        lot_id: targetTradeId, // fallback lot ID
        gross_weight_qtl: grossWeight,
        tare_weight_qtl: tareWeight,
        bags: bags ? Number(bags) : 0,
      })
      await tradeApi.attachWeighment(targetTradeId, wRecord.id)
      setSuccessMessage('Weighment slip recorded and attached!')
      setOpenWeighment(false)
      fetchTrades()
    } catch (err) {
      setErrorMessage(err.message || 'Weighment recording failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateGateExit = async () => {
    setSubmitting(true)
    try {
      await tradeApi.createGateExit({
        exit_type: 'sold',
        lot_id: targetTradeId,
        vehicle_number: vehicleNumber,
      })
      setSuccessMessage('Gate Exit Permit created for APMC clearance!')
      setOpenGateExit(false)
      fetchTrades()
    } catch (err) {
      setErrorMessage(err.message || 'Gate Exit permit failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} mb={3}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <ReceiptLongIcon color="primary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary.dark">
                eNAM Trade Agreements & Settlements
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track full trade lifecycle: Bid Acceptance ➔ Weighment ➔ Agreement ➔ Sale Bill ➔ Gate Exit.
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={fetchTrades} color="primary">
            <RefreshIcon />
          </IconButton>
        </Stack>

        <Tabs value={side} onChange={(_, v) => setSide(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<ReceiptLongIcon />} iconPosition="start" label="Buyer Trade Contracts" value="buy" />
          <Tab icon={<ReceiptLongIcon />} iconPosition="start" label="Seller Trade Sales" value="sell" />
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
        ) : trades.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="body1" color="text.secondary">
              No trade agreements found for this view.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Trade No</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Venue</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Quantity (QTL)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Rate / QTL</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total Value</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Lifecycle Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trades.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell fontWeight={700}>{row.number || `TRD-${row.id}`}</TableCell>
                    <TableCell>{row.venue?.toUpperCase()}</TableCell>
                    <TableCell fontWeight={600}>{row.quantity_qtl} QTL</TableCell>
                    <TableCell>₹{row.rate_per_qtl}</TableCell>
                    <TableCell fontWeight={700} color="primary.dark">
                      ₹{row.gross_amount}
                    </TableCell>
                    <TableCell>
                      <Chip label={row.status?.toUpperCase()} color="primary" size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {row.status === 'declared' && side === 'sell' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleAcceptBid(row.id)}
                            >
                              Accept Price
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleRejectBid(row.id)}
                            >
                              Decline
                            </Button>
                          </>
                        )}

                        {row.status === 'confirmed' && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ScaleIcon />}
                            onClick={() => {
                              setTargetTradeId(row.id)
                              setOpenWeighment(true)
                            }}
                          >
                            Weighment
                          </Button>
                        )}

                        {row.status === 'weighed' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="info"
                            startIcon={<DescriptionIcon />}
                            onClick={() => handleGenerateAgreement(row.id)}
                          >
                            Generate Agreement
                          </Button>
                        )}

                        {row.status === 'agreement_pending' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleApproveAgreement(row.id)}
                          >
                            Approve Agreement
                          </Button>
                        )}

                        {row.status === 'agreement_approved' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="secondary"
                            onClick={() => handleGenerateBill(row.id)}
                          >
                            Generate eNAM Bill
                          </Button>
                        )}

                        {row.status === 'billed' && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<LocalShippingIcon />}
                            onClick={() => {
                              setTargetTradeId(row.id)
                              setOpenGateExit(true)
                            }}
                          >
                            Gate Exit Pass
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

      {/* Weighment Dialog */}
      <Dialog open={openWeighment} onClose={() => setOpenWeighment(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Record Weighment Slip</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              fullWidth
              size="small"
              label="Gross Weight (QTL)"
              type="number"
              value={grossWeight}
              onChange={(e) => setGrossWeight(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="Tare Weight (QTL)"
              type="number"
              value={tareWeight}
              onChange={(e) => setTareWeight(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="Number of Bags"
              type="number"
              value={bags}
              onChange={(e) => setBags(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWeighment(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRecordWeighment} disabled={submitting}>
            {submitting ? 'Recording...' : 'Save Slip'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Gate Exit Dialog */}
      <Dialog open={openGateExit} onClose={() => setOpenGateExit(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Gate Exit Permit</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              fullWidth
              size="small"
              label="Vehicle Registration Number"
              placeholder="e.g. MH 12 AB 1234"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGateExit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateGateExit} disabled={submitting}>
            {submitting ? 'Generating...' : 'Issue Gate Pass'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TradesPage
