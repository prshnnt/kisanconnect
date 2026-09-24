import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import { useLang } from '../../contexts/LanguageContext.jsx'
import TopBar from '../../components/TopBar.jsx'
import { formatINR } from '../../utils/format.js'

const MOCK_SERVICES = [
  { id: 1, type: 'Weighing', typeHi: 'तौल', location: 'Lucknow', priceMin: 300, priceMax: 500, active: true },
  { id: 2, type: 'Testing', typeHi: 'जाँच', location: 'Lucknow', priceMin: 400, priceMax: 700, active: true },
]

const SERVICE_TYPES = [
  { value: 'Weighing', hi: 'तौल' },
  { value: 'Testing', hi: 'जाँच' },
  { value: 'Transport', hi: 'परिवहन' },
  { value: 'Storage', hi: 'भंडारण' },
]

export default function S3Services() {
  const { lang } = useLang()
  const [services, setServices] = useState(MOCK_SERVICES)
  const [addOpen, setAddOpen] = useState(false)
  const [newType, setNewType] = useState('Weighing')
  const [newLocation, setNewLocation] = useState('')
  const [newMin, setNewMin] = useState('')
  const [newMax, setNewMax] = useState('')

  function toggleActive(id) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s))
  }

  function registerService() {
    if (!newLocation || !newMin || !newMax) return
    const typeInfo = SERVICE_TYPES.find(t => t.value === newType)
    setServices(prev => [...prev, {
      id: Date.now(), type: newType, typeHi: typeInfo.hi, location: newLocation,
      priceMin: Number(newMin), priceMax: Number(newMax), active: true,
    }])
    setNewLocation('')
    setNewMin('')
    setNewMax('')
    setAddOpen(false)
  }

  return (
    <Box sx={{ bgcolor: '#FFFBF5', minHeight: '100vh' }}>
      <TopBar title={lang === 'hi' ? 'मेरी सेवाएं' : 'My services'} />
      <Box sx={{ px: 2, py: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
          {services.map(s => (
            <Card key={s.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{lang === 'hi' ? s.typeHi : s.type}</Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      {s.location} · {formatINR(s.priceMin)}–{formatINR(s.priceMax)}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={<Switch checked={s.active} onChange={() => toggleActive(s.id)} size="small" />}
                    label={<Typography variant="caption">{s.active ? (lang === 'hi' ? 'सक्रिय' : 'Active') : (lang === 'hi' ? 'रुका' : 'Paused')}</Typography>}
                    labelPlacement="start"
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Button variant="contained" color="primary" fullWidth size="large" onClick={() => setAddOpen(true)}>
          {lang === 'hi' ? '+ नई सेवा जोड़ें' : '+ Register new service'}
        </Button>
      </Box>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} PaperProps={{ sx: { borderRadius: 3, mx: 2, maxWidth: 358 } }}>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            {lang === 'hi' ? 'नई सेवा जोड़ें' : 'Register new service'}
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{lang === 'hi' ? 'सेवा प्रकार' : 'Service type'}</InputLabel>
            <Select value={newType} onChange={e => setNewType(e.target.value)} label={lang === 'hi' ? 'सेवा प्रकार' : 'Service type'}>
              {SERVICE_TYPES.map(t => (
                <MenuItem key={t.value} value={t.value}>{lang === 'hi' ? t.hi : t.value}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={lang === 'hi' ? 'स्थान' : 'Location'}
            value={newLocation}
            onChange={e => setNewLocation(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              label={lang === 'hi' ? 'न्यूनतम मूल्य' : 'Min price'}
              type="number"
              value={newMin}
              onChange={e => setNewMin(e.target.value)}
              fullWidth
              inputProps={{ inputMode: 'numeric' }}
            />
            <TextField
              label={lang === 'hi' ? 'अधिकतम मूल्य' : 'Max price'}
              type="number"
              value={newMax}
              onChange={e => setNewMax(e.target.value)}
              fullWidth
              inputProps={{ inputMode: 'numeric' }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setAddOpen(false)} variant="outlined" fullWidth>
            {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
          </Button>
          <Button
            onClick={registerService}
            variant="contained"
            color="primary"
            fullWidth
            disabled={!newLocation || !newMin || !newMax}
          >
            {lang === 'hi' ? 'जोड़ें' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
