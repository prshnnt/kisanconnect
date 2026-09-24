import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import WarningIcon from '@mui/icons-material/Warning'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import GavelIcon from '@mui/icons-material/Gavel'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import { useLang } from '../../contexts/LanguageContext.jsx'

const KPIS = [
  { label: 'Price realisation vs mandi avg', value: '+4.2%', color: '#15803D', icon: TrendingUpIcon },
  { label: 'Avg days to payment', value: '3.2 days', color: '#3730A3', icon: HourglassEmptyIcon },
  { label: 'Active lots', value: '142', color: '#1D4ED8', icon: AgricultureIcon },
  { label: 'Live auctions', value: '8', color: '#B45309', icon: GavelIcon },
  { label: 'Open disputes', value: '6', color: '#B91C1C', icon: WarningIcon },
  { label: 'Pending approvals', value: '23', color: '#B45309', icon: HourglassEmptyIcon },
]

const FUNNEL = [
  { label: 'Lots', value: 142, color: '#3730A3' },
  { label: 'Offers', value: 89, color: '#1D4ED8' },
  { label: 'Deals', value: 54, color: '#15803D' },
  { label: 'Paid', value: 41, color: '#F5A524' },
]

export default function D1Overview() {
  const { lang } = useLang()

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {lang === 'hi' ? 'अवलोकन' : 'Overview'} · sample
      </Typography>

      {/* KPI cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {KPIS.map(kpi => {
          const Icon = kpi.icon
          return (
            <Grid item xs={12} sm={6} md={4} key={kpi.label}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                      {kpi.label}
                    </Typography>
                    <Icon sx={{ fontSize: 18, color: kpi.color }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: kpi.color }}>
                    {kpi.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Funnel */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            {lang === 'hi' ? 'फ़नल: लॉट → ऑफर → सौदा → भुगतान' : 'Funnel: Lot → Offer → Deal → Paid'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            {FUNNEL.map((f, i) => (
              <Box key={f.label} sx={{ flex: 1, textAlign: 'center' }}>
                <Box sx={{
                  height: `${(f.value / FUNNEL[0].value) * 120}px`,
                  bgcolor: f.color,
                  borderRadius: '8px 8px 0 0',
                  opacity: 0.85,
                  mb: 1,
                  transition: 'height 0.3s',
                }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: f.color }}>{f.value}</Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>{f.label}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Price freshness */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            {lang === 'hi' ? 'कीमत डेटा की ताज़गी' : 'Price data freshness'}
          </Typography>
          {[
            { state: 'Uttar Pradesh', fresh: true, records: 1240 },
            { state: 'Maharashtra', fresh: true, records: 890 },
            { state: 'Punjab', fresh: false, records: 0 },
          ].map(s => (
            <Box key={s.state} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
              <Typography variant="body2">{s.state}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>{s.records} records</Typography>
                <Chip
                  label={s.fresh ? 'Fresh' : 'Stale'}
                  size="small"
                  sx={{ bgcolor: s.fresh ? '#D1FAE5' : '#FEE2E2', color: s.fresh ? '#15803D' : '#B91C1C', fontWeight: 600 }}
                />
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  )
}
