import { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import StoreIcon from '@mui/icons-material/Store'
import ScienceIcon from '@mui/icons-material/Science'
import EngineeringIcon from '@mui/icons-material/Engineering'
import SearchIcon from '@mui/icons-material/Search'
import { marketplaceApi } from '../../api/marketplace'

export function ServicesBrowsePage() {
  const [serviceType, setServiceType] = useState('logistics') // logistics, warehouse, assaying, labour
  const [loading, setLoading] = useState(true)
  const [catalogs, setCatalogs] = useState([])
  const [searchText, setSearchText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Booking Modal
  const [openBook, setOpenBook] = useState(false)
  const [selectedCatalog, setSelectedCatalog] = useState(null)
  const [units, setUnits] = useState(1)
  const [offeredPrice, setOfferedPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchServices = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const res = await marketplaceApi.browseServices({
        service_type: serviceType,
        q: searchText || undefined,
      })
      setCatalogs(res.items || [])
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch service catalogs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [serviceType])

  const handleBook = async () => {
    if (!selectedCatalog) return
    setSubmitting(true)
    try {
      await marketplaceApi.createBooking({
        catalog_id: selectedCatalog.id,
        quantity_units: Number(units),
        offered_price: offeredPrice ? offeredPrice : selectedCatalog.min_price,
        seeker_notes: notes,
      })
      setSuccessMessage('Service booking request submitted to provider!')
      setOpenBook(false)
    } catch (err) {
      setErrorMessage(err.message || 'Booking request failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} mb={3}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <LocalShippingIcon color="primary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary.dark">
                Kisan Rath & Agriculture Services Marketplace
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Book verified logistics trucks, CA cold storage warehouses, assaying labs, and labor services.
              </Typography>
            </Box>
          </Stack>
        </Stack>

        {/* Category Tabs */}
        <Grid container spacing={2} mb={3}>
          {[
            { type: 'logistics', title: 'Kisan Rath Logistics', icon: <LocalShippingIcon /> },
            { type: 'warehouse', title: 'Cold Storage / Silos', icon: <StoreIcon /> },
            { type: 'assaying', title: 'Assaying & Testing Labs', icon: <ScienceIcon /> },
            { type: 'labour', title: 'Mandi Labor (Hamali)', icon: <EngineeringIcon /> },
          ].map((item) => (
            <Grid item xs={6} sm={3} key={item.type}>
              <Paper
                onClick={() => setServiceType(item.type)}
                elevation={serviceType === item.type ? 3 : 0}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderRadius: 2,
                  bgcolor: serviceType === item.type ? 'primary.light' : '#f8fafc',
                  color: serviceType === item.type ? '#ffffff' : 'text.primary',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                }}
              >
                <Box mb={0.5}>{item.icon}</Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {item.title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Search Bar */}
        <Stack direction="row" spacing={2} mb={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search catalog services..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchServices()}
          />
          <Button variant="contained" startIcon={<SearchIcon />} onClick={fetchServices}>
            Search
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
          <Typography variant="body1" color="text.secondary" textAlign="center" py={6}>
            No service catalogs available under this category.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {catalogs.map((c) => (
              <Grid item xs={12} sm={6} md={4} key={c.id}>
                <Card elevation={2} sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700} color="primary.dark" mb={1}>
                      {c.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {c.description || 'Verified agricultural service provider.'}
                    </Typography>
                    <Box p={1.5} bgcolor="#f8fafc" borderRadius={2}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        BASE RATE
                      </Typography>
                      <Typography variant="h6" fontWeight={800} color="secondary.dark">
                        ₹{c.min_price} / {c.unit || 'unit'}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        setSelectedCatalog(c)
                        setOfferedPrice(c.min_price)
                        setOpenBook(true)
                      }}
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    >
                      Book Service
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Booking Modal */}
      <Dialog open={openBook} onClose={() => setOpenBook(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Request Service Booking</DialogTitle>
        <DialogContent dividers>
          {selectedCatalog && (
            <Stack spacing={2} mt={1}>
              <Typography variant="subtitle2" fontWeight={700}>
                {selectedCatalog.name}
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Quantity / Units"
                type="number"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
              />
              <TextField
                fullWidth
                size="small"
                label="Offered Price Rate (₹)"
                type="number"
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(e.target.value)}
              />
              <TextField
                fullWidth
                size="small"
                multiline
                rows={3}
                label="Pickup / Special Instructions"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBook(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleBook} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Confirm Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ServicesBrowsePage
