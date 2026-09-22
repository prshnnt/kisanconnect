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
import StoreIcon from '@mui/icons-material/Store'
import { marketplaceApi } from '../../api/marketplace'

export function ProviderCatalogsPage() {
  const [loading, setLoading] = useState(true)
  const [catalogs, setCatalogs] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Create Catalog Modal
  const [openCreate, setOpenCreate] = useState(false)
  const [providerServiceId, setProviderServiceId] = useState('')
  const [serviceType, setServiceType] = useState('logistics')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [unit, setUnit] = useState('QTL')
  const [submitting, setSubmitting] = useState(false)

  const fetchCatalogs = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const res = await marketplaceApi.getMyCatalogs()
      setCatalogs(res.items || [])
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch provider catalogs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCatalogs()
  }, [])

  const handleCreateCatalog = async () => {
    if (!name || !minPrice) {
      setErrorMessage('Name and Min Price are required')
      return
    }
    setSubmitting(true)
    try {
      await marketplaceApi.createCatalog({
        provider_service_id: Number(providerServiceId || 1),
        service_type: serviceType,
        name,
        description,
        min_price: minPrice,
        unit,
      })
      setSuccessMessage('Catalog created successfully!')
      setOpenCreate(false)
      fetchCatalogs()
    } catch (err) {
      setErrorMessage(err.message || 'Catalog creation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeactivate = async (id) => {
    try {
      await marketplaceApi.deactivateCatalog(id)
      setSuccessMessage('Catalog deactivated.')
      fetchCatalogs()
    } catch (err) {
      setErrorMessage(err.message || 'Deactivation failed')
    }
  }

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} mb={3}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <StoreIcon color="primary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary.dark">
                Service Provider Catalogs & Rate Cards
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure offered services, rate cards, and capacity for logistics or warehouse rentals.
              </Typography>
            </Box>
          </Stack>

          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
            Add Service Catalog
          </Button>
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

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress color="primary" />
          </Box>
        ) : catalogs.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={6}>
            No service catalogs created yet.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Service Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Min Rate</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {catalogs.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell fontWeight={700}>CAT-{row.id}</TableCell>
                    <TableCell fontWeight={600}>{row.name}</TableCell>
                    <TableCell>{row.service_type?.toUpperCase()}</TableCell>
                    <TableCell fontWeight={700} color="primary.dark">
                      ₹{row.min_price}
                    </TableCell>
                    <TableCell>{row.unit}</TableCell>
                    <TableCell>
                      <Button size="small" color="error" onClick={() => handleDeactivate(row.id)}>
                        Deactivate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Modal */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Service Catalog</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Service Type</InputLabel>
              <Select value={serviceType} label="Service Type" onChange={(e) => setServiceType(e.target.value)}>
                <MenuItem value="logistics">Kisan Rath Logistics</MenuItem>
                <MenuItem value="warehouse">Warehouse Storage</MenuItem>
                <MenuItem value="assaying">Assaying Laboratory</MenuItem>
                <MenuItem value="labour">Mandi Labor</MenuItem>
              </Select>
            </FormControl>

            <TextField fullWidth size="small" label="Catalog Title" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField fullWidth size="small" label="Min Base Rate (₹)" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            <TextField fullWidth size="small" label="Pricing Unit (e.g. QTL / KM / Day)" value={unit} onChange={(e) => setUnit(e.target.value)} />
            <TextField fullWidth size="small" multiline rows={2} label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCatalog} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Catalog'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProviderCatalogsPage
