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
  Divider,
} from '@mui/material'
import PaymentsIcon from '@mui/icons-material/Payments'
import ReceiptIcon from '@mui/icons-material/Receipt'
import { tradeApi } from '../../api/trade'

export function BillsPage() {
  const [side, setSide] = useState('buy')
  const [loading, setLoading] = useState(true)
  const [bills, setBills] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Breakdown Dialog
  const [openBreakdown, setOpenBreakdown] = useState(false)
  const [breakdown, setBreakdown] = useState(null)

  // Payment Dialog
  const [openPay, setOpenPay] = useState(false)
  const [payBillId, setPayBillId] = useState(null)
  const [paymentMode, setPaymentMode] = useState('online')
  const [txnRef, setTxnRef] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchBills = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const res = await tradeApi.getMyBills(side)
      setBills(res.items || [])
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch sale bills')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBills()
  }, [side])

  const handleViewBreakdown = async (billId) => {
    setOpenBreakdown(true)
    try {
      const bd = await tradeApi.getBillBreakdown(billId)
      setBreakdown(bd)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load breakdown')
    }
  }

  const handlePay = async () => {
    setSubmitting(true)
    try {
      const key = `pay-${payBillId}-${Date.now()}`
      await tradeApi.payBill(
        payBillId,
        {
          mode: paymentMode,
          reference: txnRef || `TXN-${Date.now()}`,
        },
        key
      )
      setSuccessMessage('Payment processed successfully!')
      setOpenPay(false)
      fetchBills()
    } catch (err) {
      setErrorMessage(err.message || 'Payment failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
          <PaymentsIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.dark">
              eNAM Sale Bills & Payments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Buyer pays full bill; Seller nets proceeds after APMC commission and hamali deductions.
            </Typography>
          </Box>
        </Stack>

        <Tabs value={side} onChange={(_, v) => setSide(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<PaymentsIcon />} iconPosition="start" label="Buyer Payables" value="buy" />
          <Tab icon={<PaymentsIcon />} iconPosition="start" label="Seller Receivables" value="sell" />
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
        ) : bills.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={6}>
            No sale bills found for this view.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Bill Number</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trade ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total (Buyer Pays)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Seller Net</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Payment Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bills.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell fontWeight={700}>{row.number || `BIL-${row.id}`}</TableCell>
                    <TableCell>{row.trade_id}</TableCell>
                    <TableCell fontWeight={700} color="primary.dark">
                      ₹{row.total}
                    </TableCell>
                    <TableCell fontWeight={600} color="secondary.dark">
                      ₹{row.seller_net}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.payment_status?.toUpperCase()}
                        color={row.payment_status === 'paid' ? 'success' : 'warning'}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ReceiptIcon />}
                          onClick={() => handleViewBreakdown(row.id)}
                        >
                          Breakdown
                        </Button>
                        {side === 'buy' && row.payment_status !== 'paid' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => {
                              setPayBillId(row.id)
                              setOpenPay(true)
                            }}
                          >
                            Pay Bill
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

      {/* Bill Breakdown Dialog */}
      <Dialog open={openBreakdown} onClose={() => setOpenBreakdown(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>eNAM Sale Bill Breakdown</DialogTitle>
        <DialogContent dividers>
          {breakdown ? (
            <Stack spacing={2}>
              <Box p={2} bgcolor="#f8fafc" borderRadius={2}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Buyer Total: ₹{breakdown.buyer_pays}
                </Typography>
                <Typography variant="subtitle2" color="secondary.dark" fontWeight={700}>
                  Seller Net Payout: ₹{breakdown.seller_receives}
                </Typography>
              </Box>

              <Typography variant="subtitle2" fontWeight={700}>
                Deductions & Fee Ledger:
              </Typography>
              {breakdown.charges.map((c, i) => (
                <Stack key={i} direction="row" justifyContent="space-between" fontSize="0.875rem">
                  <Typography color="text.secondary">
                    {c.kind.toUpperCase()} ({c.side})
                  </Typography>
                  <Typography fontWeight={600}>₹{c.amount}</Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <CircularProgress size={24} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBreakdown(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={openPay} onClose={() => setOpenPay(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Online eNAM Payment</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              fullWidth
              size="small"
              label="Payment Mode"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="Transaction Reference / UPI ID"
              placeholder="e.g. UPI/12345678"
              value={txnRef}
              onChange={(e) => setTxnRef(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPay(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handlePay} disabled={submitting}>
            {submitting ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BillsPage
