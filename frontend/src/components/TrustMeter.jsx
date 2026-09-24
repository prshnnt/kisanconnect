import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const LABELS_HI = ['बहुत कम', 'कम', 'ठीक', 'अच्छा', 'बहुत अच्छा']
const LABELS_EN = ['Very Low', 'Low', 'Fair', 'Good', 'Excellent']

export default function TrustMeter({ score, lang = 'en' }) {
  // score: 1-5
  const filled = Math.round(Math.max(0, Math.min(5, score || 0)))
  const labels = lang === 'hi' ? LABELS_HI : LABELS_EN
  const label = labels[filled - 1] || labels[2]

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Box
          key={i}
          sx={{
            width: 18,
            height: 8,
            borderRadius: 4,
            bgcolor: i <= filled ? '#3730A3' : '#E5E7EB',
          }}
        />
      ))}
      <Typography variant="caption" sx={{ color: '#6B7280', ml: 0.5 }}>{label}</Typography>
    </Box>
  )
}
