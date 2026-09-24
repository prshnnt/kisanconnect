import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import LinearProgress from '@mui/material/LinearProgress'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../contexts/LanguageContext.jsx'
import TopBar from '../../components/TopBar.jsx'
import VerifiedBadge from '../../components/VerifiedBadge.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import { formatINR } from '../../utils/format.js'

const MOCK_LOTS = [
  { id: 1, seller: 'Ramesh Kumar (Farmer)', verified: true, trust: 4, crop: 'Wheat', qty: 25, grade: 'A', price: 2380, km: 24 },
  { id: 2, seller: 'Ganga FPO', verified: true, trust: 5, crop: 'Wheat', qty: 100, grade: 'A', price: 2350, km: 45 },
  { id: 3, seller: 'Suresh Farmer', verified: false, trust: 3, crop: 'Wheat', qty: 15, grade: 'B', price: 2280, km: 67 },
]

export default function B2FindSupply() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const [crop, setCrop] = useState('Wheat')
  const [grade, setGrade] = useState('')
  const [radius, setRadius] = useState(100)

  return (
    <Box sx={{ bgcolor: '#FFFBF5' }}>
      <TopBar title={lang === 'hi' ? 'आपूर्ति खोजें' : 'Find supply'} />

      <Box sx={{ px: 2, py: 2 }}>
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>{lang === 'hi' ? 'फसल' : 'Crop'}</InputLabel>
            <Select value={crop} onChange={e => setCrop(e.target.value)} label={lang === 'hi' ? 'फसल' : 'Crop'}>
              {['Wheat', 'Potato', 'Rice', 'Maize'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 90 }}>
            <InputLabel>{lang === 'hi' ? 'ग्रेड' : 'Grade'}</InputLabel>
            <Select value={grade} onChange={e => setGrade(e.target.value)} label={lang === 'hi' ? 'ग्रेड' : 'Grade'}>
              <MenuItem value="">All</MenuItem>
              {['A', 'B', 'C'].map(g => <MenuItem key={g} value={g}>Grade {g}</MenuItem>)}
            </Select>
          </FormControl>
          {[25, 50, 100].map(r => (
            <Chip
              key={r}
              label={`${r} km`}
              onClick={() => setRadius(r)}
              color={radius === r ? 'primary' : 'default'}
              variant={radius === r ? 'filled' : 'outlined'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Box>

        <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
          {MOCK_LOTS.length} {lang === 'hi' ? 'लॉट मिलीं' : 'lots found'} · sample
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {MOCK_LOTS.map(lot => (
            <Card key={lot.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{lot.seller}</Typography>
                      {lot.verified && <VerifiedBadge />}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      {lot.crop} · Grade {lot.grade} · {lot.qty} qtl · {lot.km} km
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', fontVariantNumeric: 'tabular-nums' }}>
                    {formatINR(lot.price)}/qtl
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  fullWidth
                  sx={{ height: 40 }}
                  onClick={() => navigate('/buyer/offer', { state: { lot } })}
                >
                  {lang === 'hi' ? 'ऑफर करें' : 'Make an offer'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
