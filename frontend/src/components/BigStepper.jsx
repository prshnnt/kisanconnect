import React from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlineOutlined'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined'

const QUICK_PICKS = [5, 10, 25, 50]

export default function BigStepper({ value, onChange, unit = 'qtl', min = 1, max = 1000 }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        <IconButton
          onClick={() => onChange(Math.max(min, value - 1))}
          sx={{ bgcolor: '#F3F4F6', '&:hover': { bgcolor: '#E5E7EB' } }}
          size="large"
        >
          <RemoveCircleOutlineIcon sx={{ fontSize: 36, color: '#1F2937' }} />
        </IconButton>

        <Box>
          <Typography sx={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>{unit}</Typography>
        </Box>

        <IconButton
          onClick={() => onChange(Math.min(max, value + 1))}
          sx={{ bgcolor: '#F3F4F6', '&:hover': { bgcolor: '#E5E7EB' } }}
          size="large"
        >
          <AddCircleOutlineIcon sx={{ fontSize: 36, color: '#1F2937' }} />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
        {QUICK_PICKS.map(q => (
          <Chip
            key={q}
            label={`${q} ${unit}`}
            onClick={() => onChange(q)}
            variant={value === q ? 'filled' : 'outlined'}
            color={value === q ? 'primary' : 'default'}
            sx={{ fontWeight: 600 }}
          />
        ))}
      </Box>
    </Box>
  )
}
