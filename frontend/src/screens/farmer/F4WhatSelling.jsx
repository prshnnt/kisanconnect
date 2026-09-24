import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import SearchIcon from '@mui/icons-material/Search'
import MicIcon from '@mui/icons-material/Mic'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../contexts/LanguageContext.jsx'
import TopBar from '../../components/TopBar.jsx'

const CROPS = [
  { id: 'wheat', emoji: '🌾', hi: 'गेहूं', en: 'Wheat', varieties: ['Sharbati', 'Lokwan', '147', 'PBW343'] },
  { id: 'potato', emoji: '🥔', hi: 'आलू', en: 'Potato', varieties: ['Jyoti', 'Kufri', 'Chipsona'] },
  { id: 'rice', emoji: '🍚', hi: 'चावल', en: 'Rice', varieties: ['Basmati', 'Sona Masuri', 'IR64'] },
  { id: 'maize', emoji: '🌽', hi: 'मक्का', en: 'Maize', varieties: ['Hybrid', 'Desi'] },
  { id: 'mustard', emoji: '🌻', hi: 'सरसों', en: 'Mustard', varieties: ['Pusa Bold', 'RH30'] },
  { id: 'onion', emoji: '🧅', hi: 'प्याज', en: 'Onion', varieties: ['Red', 'White', 'Nashik'] },
  { id: 'tomato', emoji: '🍅', hi: 'टमाटर', en: 'Tomato', varieties: ['Hybrid', 'Desi'] },
  { id: 'soybean', emoji: '🫘', hi: 'सोयाबीन', en: 'Soybean', varieties: ['JS335', 'MACS1188'] },
]

export default function F4WhatSelling() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [variety, setVariety] = useState(null)

  const filtered = CROPS.filter(c =>
    (lang === 'hi' ? c.hi : c.en).toLowerCase().includes(search.toLowerCase()) ||
    c.id.includes(search.toLowerCase())
  )

  const selectedCrop = CROPS.find(c => c.id === selected)

  return (
    <Box sx={{ bgcolor: '#FFFBF5', minHeight: '100vh' }}>
      <TopBar title={lang === 'hi' ? 'क्या बेच रहे हैं?' : 'What are you selling?'} />

      <Box sx={{ px: 2, py: 2, pb: 12 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {lang === 'hi' ? 'अपनी फसल चुनें' : 'Choose your crop'}
        </Typography>

        <TextField
          placeholder={lang === 'hi' ? 'फसल खोजें...' : 'Search crop...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF' }} /></InputAdornment>,
            endAdornment: <InputAdornment position="end"><MicIcon sx={{ color: '#3730A3', cursor: 'pointer' }} /></InputAdornment>,
          }}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mb: 3 }}>
          {filtered.map(c => (
            <Card
              key={c.id}
              sx={{ border: `2px solid ${selected === c.id ? '#F5A524' : '#E5E7EB'}`, cursor: 'pointer', bgcolor: selected === c.id ? '#FEF3C7' : '#FFFFFF' }}
              onClick={() => { setSelected(c.id); setVariety(null) }}
            >
              <CardContent sx={{ p: 1, '&:last-child': { pb: 1 }, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.75rem' }}>{c.emoji}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                  {lang === 'hi' ? c.hi : c.en}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {selectedCrop && (
          <Box>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              {lang === 'hi' ? 'किस्म चुनें' : 'Choose variety'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedCrop.varieties.map(v => (
                <Chip
                  key={v}
                  label={v}
                  onClick={() => setVariety(v)}
                  variant={variety === v ? 'filled' : 'outlined'}
                  color={variety === v ? 'primary' : 'default'}
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, p: 2, bgcolor: '#FFFBF5', borderTop: '1px solid #F3E8D0', boxShadow: '0 -4px 12px rgba(0,0,0,0.06)', zIndex: 1100 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={!selected}
          onClick={() => navigate('/farmer/sell/quantity', { state: { crop: selected, variety } })}
        >
          {lang === 'hi' ? 'आगे बढ़ें' : 'Continue'}
        </Button>
      </Box>
    </Box>
  )
}
