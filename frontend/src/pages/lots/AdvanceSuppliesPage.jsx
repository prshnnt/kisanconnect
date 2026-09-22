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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import LocalFloristIcon from '@mui/icons-material/LocalFlorist'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { lotsApi } from '../../api/lots'
import { lookupsApi } from '../../api/lookups'

export function AdvanceSuppliesPage() {
  const [tab, setTab] = useState(0) // 0: Farmer Advance Supplies, 1: Buyer Purchase Demands
  const [loading, setLoading] = useState(true)
  const [supplies, setSupplies] = useState([])
  const [demands, setDemands] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  // Create Modal
  const [openCreate, setOpenCreate] = useState(false)
  const [commodities, setCommodities] = useState([])
  const [commodityId, setCommodityId] = useState('')
  const [quantityQtl, setQuantityQtl] = useState('')
  const [price, setPrice] = useState('')
  const [availableFrom, setAvailableFrom] = useState('')
  const [availableTo, setAvailableTo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      if (tab === 0) {
        const res = await lotsApi.getMySupplies()
        setSupplies(res.items || [])
      } else {
        const res = await lotsApi.getDemandMarket()
        setDemands(res.items || [])
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch advance market listings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [tab])

  const handleOpenModal = async () => {
    setOpenCreate(true)
    try {
      const comms = await lookupsApi.getCommodities()
      setCommodities(comms || [])
    } catch {
      setCommodities([])
    }
  }

  const handleCreate = async () => {
    if (!commodityId || !quantityQtl || !availableFrom) {
      setErrorMessage('Please fill in required fields')
      return
    }
    setSubmitting(true)
    try {
      if (tab === 0) {
        await lotsApi.createSupply({
          commodity_id: Number(commodityId),
          quantity_qtl: quantityQtl,
          expected_price: price || null,
          available_from: availableFrom,
          available_to: availableTo || availableFrom,
        })
      } else {
        await lotsApi.createDemand({
          commodity_id: Number(commodityId),
          quantity_qtl: quantityQtl,
          min_price: price || null,
          deliver_by: availableFrom,
        })
      }
      setOpenCreate(false)
      fetchData()
    } catch (err) {
      setErrorMessage(err.message || 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} mb={3}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <LocalFloristIcon color="primary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary.dark">
                Advance Harvest & Purchase Market
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Post advance crop harvest projections or express bulk commodity purchase demands.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            {tab === 0 ? 'Post Advance Supply' : 'Post Buyer Demand'}
          </Button>
        </Stack>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<LocalFloristIcon />} iconPosition="start" label="Advance Crop Harvests" />
          <Tab icon={<ShoppingCartIcon />} iconPosition="start" label="Buyer Commodity Demands" />
        </Tabs>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress color="primary" />
          </Box>
        ) : tab === 0 ? (
          supplies.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={6}>
              No advance supply postings found.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Commodity ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Quantity (QTL)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Expected Price (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Available From</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Available To</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {supplies.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell fontWeight={700}>SUP-{row.id}</TableCell>
                      <TableCell>{row.commodity_id}</TableCell>
                      <TableCell fontWeight={600}>{row.quantity_qtl} QTL</TableCell>
                      <TableCell>₹{row.expected_price || 'Negotiable'}</TableCell>
                      <TableCell>{row.available_from}</TableCell>
                      <TableCell>{row.available_to}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        ) : demands.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={6}>
            No buyer purchase demands posted.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Commodity ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Target Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Target Price (₹)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Deliver By</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {demands.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell fontWeight={700}>DEM-{row.id}</TableCell>
                    <TableCell>{row.commodity_id}</TableCell>
                    <TableCell fontWeight={600}>{row.quantity_qtl} QTL</TableCell>
                    <TableCell>₹{row.min_price || 'Negotiable'}</TableCell>
                    <TableCell>{row.deliver_by}</TableCell>
                    <TableCell>{row.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Modal */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {tab === 0 ? 'Post Advance Crop Supply' : 'Post Buyer Commodity Demand'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Commodity</InputLabel>
              <Select value={commodityId} label="Commodity" onChange={(e) => setCommodityId(e.target.value)}>
                {commodities.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Quantity (QTL)"
              type="number"
              value={quantityQtl}
              onChange={(e) => setQuantityQtl(e.target.value)}
            />

            <TextField
              fullWidth
              size="small"
              label="Expected Price (₹ / QTL)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <TextField
              fullWidth
              size="small"
              label={tab === 0 ? 'Available From Date' : 'Delivery Target Date'}
              type="date"
              InputLabelProps={{ shrink: true }}
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
            />

            {tab === 0 && (
              <TextField
                fullWidth
                size="small"
                label="Available Until Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={availableTo}
                onChange={(e) => setAvailableTo(e.target.value)}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Entry'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdvanceSuppliesPage
