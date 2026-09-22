import { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import StorefrontIcon from '@mui/icons-material/Storefront'
import PaymentsIcon from '@mui/icons-material/Payments'
import { agentsApi } from '../../api/agents'

export function CommissionAgentPage() {
  const [loading, setLoading] = useState(true)
  const [agent, setAgent] = useState(null)
  const [earnings, setEarnings] = useState(null)
  const [lots, setLots] = useState([])
  const [rules, setRules] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  const loadAgentData = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const [agRes, earnRes, lotRes, ruleRes] = await Promise.allSettled([
        agentsApi.getMyProfile(),
        agentsApi.getEarnings(),
        agentsApi.getAssignedLots(),
        agentsApi.listChargeRules(),
      ])

      if (agRes.status === 'fulfilled') setAgent(agRes.value)
      if (earnRes.status === 'fulfilled') setEarnings(earnRes.value)
      if (lotRes.status === 'fulfilled') setLots(lotRes.value?.items || [])
      if (ruleRes.status === 'fulfilled') setRules(ruleRes.value || [])
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load agent console')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgentData()
  }, [])

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
          <SupportAgentIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.dark">
              Commission Agent Workspace
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage assigned farmer lots, statutory commission payouts, and APMC fee rules.
            </Typography>
          </Box>
        </Stack>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Stack spacing={4}>
            {/* Earnings Summary Grid */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '6px solid #f57c00' }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      PENDING COMMISSION PAYOUT
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="secondary.dark">
                      ₹{earnings?.pending || '0.00'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '6px solid #2e7d32' }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      DISBURSED EARNINGS
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="primary.dark">
                      ₹{earnings?.paid || '0.00'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '6px solid #0288d1' }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      TOTAL TRADES ROUTED
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="info.dark">
                      {earnings?.trades || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Assigned Lots Table */}
            <Box>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Farmer Produce Lots Assigned to Firm ({agent?.firm_name || 'Agent Firm'})
              </Typography>
              {lots.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No farmer produce lots currently assigned to this agent firm.
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Lot Code</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Min Price</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lots.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell fontWeight={700}>{row.number || `LOT-${row.id}`}</TableCell>
                          <TableCell>{row.quantity_qtl} QTL</TableCell>
                          <TableCell>₹{row.min_price}</TableCell>
                          <TableCell>
                            <Chip label={row.status?.toUpperCase()} size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>

            {/* APMC Charge Rules */}
            <Box>
              <Typography variant="h6" fontWeight={700} mb={2}>
                APMC Fee Schedule & Commission Rules
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Fee Kind</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Charged Side</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Basis</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rules.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell fontWeight={600}>{r.kind?.toUpperCase()}</TableCell>
                        <TableCell>{r.side?.toUpperCase()}</TableCell>
                        <TableCell>{r.basis?.toUpperCase()}</TableCell>
                        <TableCell fontWeight={700}>{r.rate} %</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Stack>
        )}
      </Paper>
    </Box>
  )
}

export default CommissionAgentPage
