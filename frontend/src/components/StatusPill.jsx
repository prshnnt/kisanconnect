import React from 'react'
import Chip from '@mui/material/Chip'

const STATUS_COLORS = {
  draft:    { bg: '#F3F4F6', color: '#6B7280' },
  live:     { bg: '#DCFCE7', color: '#15803D' },
  offers:   { bg: '#DBEAFE', color: '#1D4ED8' },
  sold:     { bg: '#D1FAE5', color: '#15803D' },
  waiting:  { bg: '#FEF3C7', color: '#B45309' },
  paid:     { bg: '#D1FAE5', color: '#15803D' },
  ready:    { bg: '#DBEAFE', color: '#1D4ED8' },
  accepted: { bg: '#D1FAE5', color: '#15803D' },
  rejected: { bg: '#FEE2E2', color: '#B91C1C' },
  progress: { bg: '#DBEAFE', color: '#1D4ED8' },
  done:     { bg: '#D1FAE5', color: '#15803D' },
  problem:  { bg: '#FEE2E2', color: '#B91C1C' },
  pending:  { bg: '#FEF3C7', color: '#B45309' },
}

export default function StatusPill({ status, label }) {
  const key = (status || '').toLowerCase().replace(/\s/g, '')
  const colors = STATUS_COLORS[key] || STATUS_COLORS.pending
  return (
    <Chip
      label={label || status}
      size="small"
      sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 600, fontSize: '0.75rem' }}
    />
  )
}
