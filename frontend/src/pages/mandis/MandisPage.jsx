import { useEffect, useState } from 'react'
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { mandisApi } from '../../api/mandis'
import { lookupsApi } from '../../api/lookups'

export function MandisPage() {
  const [tab, setTab] = useState(0) // 0: Nearby Search with Captcha, 1: Browse by State
  const [loading, setLoading] = useState(false)
  const [mandis, setMandis] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  // Captcha State
  const [captchaId, setCaptchaId] = useState('')
  const [captchaImg, setCaptchaImg] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')

  // Nearby Search State
  const [lat, setLat] = useState('28.6139')
  const [lng, setLng] = useState('77.2090')
  const [radiusKm, setRadiusKm] = useState('50')

  // State Lookup
  const [states, setStates] = useState([])
  const [selectedStateId, setSelectedStateId] = useState('')
  const [queryText, setQueryText] = useState('')

  const fetchCaptcha = async () => {
    try {
      const res = await mandisApi.getCaptcha()
      setCaptchaId(res.captcha_id)
      setCaptchaImg(res.image_base64)
      setCaptchaInput('')
    } catch (err) {
      console.error('Failed to load CAPTCHA:', err)
    }
  }

  useEffect(() => {
    fetchCaptcha()
    lookupsApi.getStates().then((res) => setStates(res || []))
  }, [])

  const handleNearbySearch = async () => {
    setErrorMessage('')
    if (!captchaInput) {
      setErrorMessage('Please enter the security CAPTCHA text')
      return
    }
    setLoading(true)
    try {
      const res = await mandisApi.getNearby({
        lat: Number(lat),
        lng: Number(lng),
        radius_km: Number(radiusKm),
        captcha_id: captchaId,
        captcha_text: captchaInput,
      })
      setMandis(res || [])
      fetchCaptcha() // CAPTCHA is single-use
    } catch (err) {
      setErrorMessage(err.message || 'Captcha invalid or search failed')
      fetchCaptcha()
    } finally {
      setLoading(false)
    }
  }

  const handleStateSearch = async () => {
    if (!selectedStateId) return
    setLoading(true)
    setErrorMessage('')
    try {
      const res = await mandisApi.getByState(selectedStateId, queryText)
      setMandis(res || [])
    } catch (err) {
      setErrorMessage(err.message || 'State mandis search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4))
          setLng(pos.coords.longitude.toFixed(4))
        },
        () => {
          setErrorMessage('Failed to fetch GPS coordinates. Using defaults.')
        }
      )
    }
  }

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
          <LocationOnIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.dark">
              APMC Mandis Directory & GPS Locator
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Find nearest Agricultural Produce Market Committees (APMCs) with secure server CAPTCHA.
            </Typography>
          </Box>
        </Stack>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<MyLocationIcon />} iconPosition="start" label="Nearby Mandis Locator (GPS)" />
          <Tab icon={<SearchIcon />} iconPosition="start" label="Browse by State / District" />
        </Tabs>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {tab === 0 ? (
          <Box mb={4} p={3} bgcolor="#f8fafc" borderRadius={3} border="1px solid #e2e8f0">
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              Enter GPS Location & CAPTCHA Verification
            </Typography>

            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Latitude"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Longitude"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<MyLocationIcon />}
                  onClick={handleUseCurrentLocation}
                  sx={{ height: 40 }}
                >
                  Use My Location
                </Button>
              </Grid>
            </Grid>

            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2} mb={2}>
              {captchaImg ? (
                <Box
                  component="img"
                  src={`data:image/png;base64,${captchaImg}`}
                  alt="Captcha"
                  sx={{ height: 48, borderRadius: 1.5, border: '1px solid #ccc' }}
                />
              ) : (
                <Typography variant="caption">Loading Captcha...</Typography>
              )}
              <IconButton onClick={fetchCaptcha} color="primary">
                <RefreshIcon />
              </IconButton>
              <TextField
                size="small"
                placeholder="Enter 6-character Captcha"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
              />
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SearchIcon />}
                onClick={handleNearbySearch}
                disabled={loading}
                sx={{ fontWeight: 700 }}
              >
                {loading ? 'Searching...' : 'Find Nearby Mandis'}
              </Button>
            </Stack>
          </Box>
        ) : (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Select State</InputLabel>
              <Select value={selectedStateId} label="Select State" onChange={(e) => setSelectedStateId(e.target.value)}>
                {states.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Search Mandi Name..."
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              sx={{ flexGrow: 1 }}
            />

            <Button variant="contained" startIcon={<SearchIcon />} onClick={handleStateSearch} disabled={loading}>
              Search State Mandis
            </Button>
          </Stack>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress color="primary" />
          </Box>
        ) : mandis.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={6}>
            No Mandis found for this search criteria.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {mandis.map((m) => (
              <Grid item xs={12} sm={6} md={4} key={m.id}>
                <Card elevation={2} sx={{ borderRadius: 2.5, borderLeft: '4px solid #2e7d32' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} color="primary.dark">
                      {m.name}
                    </Typography>
                    {m.distance_km !== undefined && (
                      <Chip
                        label={`${m.distance_km} KM Away`}
                        color="secondary"
                        size="small"
                        sx={{ mt: 1, fontWeight: 700 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  )
}

export default MandisPage
