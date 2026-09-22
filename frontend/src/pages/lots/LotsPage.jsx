import { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DownloadIcon from '@mui/icons-material/Download'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CancelIcon from '@mui/icons-material/Cancel'
import RefreshIcon from '@mui/icons-material/Refresh'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { lotsApi } from '../../api/lots'
import { lookupsApi } from '../../api/lookups'

export function LotsPage() {
  const [loading, setLoading] = useState(true)
  const [lots, setLots] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Create Modal State
  const [openCreate, setOpenCreate] = useState(false)
  const [commodities, setCommodities] = useState([])
  const [varieties, setVarieties] = useState([])
  const [bagTypes, setBagTypes] = useState([])

  const [commodityId, setCommodityId] = useState('')
  const [varietyId, setVarietyId] = useState('')
  const [bagTypeId, setBagTypeId] = useState('')
  const [bags, setBags] = useState('')
  const [quantityQtl, setQuantityQtl] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [lotType, setLotType] = useState('farmer')
  const [saleType, setSaleType] = useState('auction')
  const [submitting, setSubmitting] = useState(false)

  const fetchLots = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const res = await lotsApi.getMyLots(statusFilter ? { status: statusFilter } : {})
      setLots(res.items || [])
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch produce lots')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLots()
  }, [statusFilter])

  const handleOpenCreateModal = async () => {
    setOpenCreate(true)
    try {
      const [commRes, bagRes] = await Promise.all([
        lookupsApi.getCommodities(),
        lookupsApi.getBagTypes(),
      ])
      setCommodities(commRes || [])
      setBagTypes(bagRes || [])
    } catch (err) {
      console.error('Failed lookups:', err)
    }
  }

  const handleCommodityChange = async (cid) => {
    setCommodityId(cid)
    setVarietyId('')
    if (cid) {
      try {
        const varRes = await lookupsApi.getVarieties(cid)
        setVarieties(varRes || [])
      } catch {
        setVarieties([])
      }
    }
  }

  const handleCreateLot = async (activate = false) => {
    setErrorMessage('')
    setSuccessMessage('')
    if (!commodityId || !quantityQtl) {
      setErrorMessage('Commodity and Quantity are required')
      return
    }
    setSubmitting(true)
    try {
      await lotsApi.createLot(
        {
          commodity_id: Number(commodityId),
          variety_id: varietyId ? Number(varietyId) : null,
          bag_type_id: bagTypeId ? Number(bagTypeId) : null,
          bags: bags ? Number(bags) : null,
          quantity_qtl: quantityQtl,
          min_price: minPrice ? minPrice : null,
          lot_type: lotType,
          sale_type: saleType,
        },
        activate
      )
      setSuccessMessage(`Lot created successfully! ${activate ? 'Activated for auction.' : ''}`)
      setOpenCreate(false)
      fetchLots()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create lot')
    } finally {
      setSubmitting(false)
    }
  }

  const handleActivate = async (id) => {
    try {
      await lotsApi.activateLot(id)
      setSuccessMessage(`Lot #${id} is now ACTIVE for auction.`)
      fetchLots()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to activate lot')
    }
  }

  const handleCancel = async (id) => {
    try {
      await lotsApi.cancelLot(id)
      setSuccessMessage(`Lot #${id} cancelled.`)
      fetchLots()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to cancel lot')
    }
  }

  const handleExport = async () => {
    try {
      await lotsApi.exportLots(statusFilter || undefined)
    } catch (err) {
      setErrorMessage(err.message || 'Export failed')
    }
  }

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} mb={3}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <StorefrontIcon color="primary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary.dark">
                My Produce Lots
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Register agricultural produce lots for electronic Mandi auction listing.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{ borderRadius: 2 }}
            >
              Export Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateModal}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              New Produce Lot
            </Button>
          </Stack>
        </Stack>

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

        {/* Filter bar */}
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select value={statusFilter} label="Status Filter" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="auctioned">Auctioned</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={fetchLots}>
            <RefreshIcon />
          </IconButton>
        </Stack>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress color="primary" />
          </Box>
        ) : lots.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="body1" color="text.secondary">
              No produce lots registered yet. Click "New Produce Lot" to list your harvest!
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Lot Code</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Sale Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Quantity (QTL)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Bags</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Min Price / QTL</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lots.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell fontWeight={700}>{row.number || `LOT-${row.id}`}</TableCell>
                    <TableCell>{row.lot_type?.toUpperCase()}</TableCell>
                    <TableCell>{row.sale_type?.toUpperCase()}</TableCell>
                    <TableCell fontWeight={600}>{row.quantity_qtl} QTL</TableCell>
                    <TableCell>{row.bags || '-'}</TableCell>
                    <TableCell>₹{row.min_price || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status?.toUpperCase()}
                        color={
                          row.status === 'active'
                            ? 'success'
                            : row.status === 'draft'
                            ? 'warning'
                            : row.status === 'auctioned'
                            ? 'info'
                            : 'default'
                        }
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {row.status === 'draft' && (
                          <Tooltip title="Activate Lot for Bidding">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<PlayArrowIcon />}
                              onClick={() => handleActivate(row.id)}
                            >
                              Activate
                            </Button>
                          </Tooltip>
                        )}
                        {row.status !== 'cancelled' && row.status !== 'auctioned' && (
                          <Tooltip title="Cancel Lot">
                            <IconButton color="error" size="small" onClick={() => handleCancel(row.id)}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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

      {/* Create Lot Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.dark' }}>
          Create New Produce Lot
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} mt={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Commodity *</InputLabel>
              <Select
                value={commodityId}
                label="Select Commodity *"
                onChange={(e) => handleCommodityChange(e.target.value)}
              >
                {commodities.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {varieties.length > 0 && (
              <FormControl fullWidth size="small">
                <InputLabel>Select Variety</InputLabel>
                <Select value={varietyId} label="Select Variety" onChange={(e) => setVarietyId(e.target.value)}>
                  {varieties.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="Quantity (Quintals) *"
                type="number"
                placeholder="e.g. 50.5"
                value={quantityQtl}
                onChange={(e) => setQuantityQtl(e.target.value)}
              />
              <TextField
                fullWidth
                size="small"
                label="Number of Bags"
                type="number"
                placeholder="e.g. 100"
                value={bags}
                onChange={(e) => setBags(e.target.value)}
              />
            </Stack>

            <FormControl fullWidth size="small">
              <InputLabel>Bag Packaging Type</InputLabel>
              <Select value={bagTypeId} label="Bag Packaging Type" onChange={(e) => setBagTypeId(e.target.value)}>
                {bagTypes.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Minimum Reserve Price (₹ / QTL)"
              type="number"
              placeholder="e.g. 2200.00"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Lot Type</InputLabel>
                <Select value={lotType} label="Lot Type" onChange={(e) => setLotType(e.target.value)}>
                  <MenuItem value="farmer">Farmer Lot</MenuItem>
                  <MenuItem value="trader">Trader Bulk Lot</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Sale Type</InputLabel>
                <Select value={saleType} label="Sale Type" onChange={(e) => setSaleType(e.target.value)}>
                  <MenuItem value="auction">eNAM Auction</MenuItem>
                  <MenuItem value="direct">Direct Sale</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenCreate(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleCreateLot(false)}
            disabled={submitting}
          >
            Save as Draft
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleCreateLot(true)}
            disabled={submitting}
            sx={{ fontWeight: 700 }}
          >
            {submitting ? 'Saving...' : 'Save & Activate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default LotsPage
