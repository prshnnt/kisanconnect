import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Chip from '@mui/material/Chip'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../../contexts/LanguageContext.jsx'
import TopBar from '../../components/TopBar.jsx'
import BigStepper from '../../components/BigStepper.jsx'
import { qtlToBags } from '../../utils/format.js'

const BAG_TYPES = ['50 kg bags', '40 kg bags', '25 kg bags']

export default function F5HowMuch() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [qty, setQty] = useState(10)
  const [unit, setUnit] = useState('qtl')
  const [bagType, setBagType] = useState('50 kg bags')

  const bagKg = parseInt(bagType)
  const bags = qtlToBags(qty, bagKg)

  return (
    <Box sx={{ bgcolor: '#FFFBF5', minHeight: '100vh' }}>
      <TopBar title={lang === 'hi' ? 'कितना बेचना है?' : 'How much to sell?'} />

      <Box sx={{ px: 2, py: 4, pb: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          {lang === 'hi' ? 'मात्रा डालें' : 'Enter quantity'}
        </Typography>

        {/* Unit toggle */}
        <ToggleButtonGroup
          value={unit}
          exclusive
          onChange={(_, v) => v && setUnit(v)}
          sx={{ mb: 4 }}
        >
          <ToggleButton value="qtl" sx={{ px: 3, fontWeight: 600 }}>
            {lang === 'hi' ? 'क्विंटल' : 'Quintal (qtl)'}
          </ToggleButton>
          <ToggleButton value="bags" sx={{ px: 3, fontWeight: 600 }}>
            {lang === 'hi' ? 'बोरे' : 'Bags'}
          </ToggleButton>
        </ToggleButtonGroup>

        <BigStepper value={qty} onChange={setQty} unit={unit === 'qtl' ? 'qtl' : 'bags'} />

        {unit === 'bags' && (
          <Box sx={{ mt: 3, width: '100%' }}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              {lang === 'hi' ? 'बोरे का प्रकार:' : 'Bag type:'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {BAG_TYPES.map(bt => (
                <Chip
                  key={bt}
                  label={bt}
                  onClick={() => setBagType(bt)}
                  variant={bagType === bt ? 'filled' : 'outlined'}
                  color={bagType === bt ? 'primary' : 'default'}
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: '#F0FDF4', borderRadius: 2, width: '100%', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            {lang === 'hi' ? 'यह है लगभग' : 'That is about'}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#15803D' }}>
            {unit === 'qtl' ? `${bags} ${lang === 'hi' ? 'बोरे' : 'bags'}` : `${(qty * bagKg / 100).toFixed(1)} qtl`}
          </Typography>
          <Typography variant="caption" sx={{ color: '#6B7280' }}>
            {unit === 'qtl' ? `(${bagKg} kg each)` : '(100 kg = 1 qtl)'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, p: 2, bgcolor: '#FFFBF5', borderTop: '1px solid #F3E8D0', boxShadow: '0 -4px 12px rgba(0,0,0,0.06)', zIndex: 1100 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={() => navigate('/farmer/sell/quality', { state: { ...location.state, qty } })}
        >
          {lang === 'hi' ? 'आगे बढ़ें' : 'Continue'}
        </Button>
      </Box>
    </Box>
  )
}
