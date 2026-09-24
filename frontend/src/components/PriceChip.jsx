import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'
import { formatINR } from '../utils/format.js'

export default function PriceChip({ price, pctChange, unit = '/qtl', size = 'medium' }) {
  const isUp = pctChange > 0
  const isDown = pctChange < 0
  const color = isUp ? '#15803D' : isDown ? '#B91C1C' : '#6B7280'
  const Icon = isUp ? TrendingUpIcon : isDown ? TrendingDownIcon : TrendingFlatIcon

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      <Typography
        variant={size === 'large' ? 'h3' : 'h6'}
        sx={{ fontWeight: 700, color: '#1F2937', fontVariantNumeric: 'tabular-nums' }}
      >
        {formatINR(price)}{unit}
      </Typography>
      {pctChange !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center', color }}>
          <Icon sx={{ fontSize: size === 'large' ? 24 : 18 }} />
          <Typography variant="caption" sx={{ color, fontWeight: 600 }}>
            {Math.abs(pctChange).toFixed(1)}%
          </Typography>
        </Box>
      )}
    </Box>
  )
}
