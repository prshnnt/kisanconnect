import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../contexts/LanguageContext.jsx'
import TopBar from '../../components/TopBar.jsx'
import { formatINR } from '../../utils/format.js'

const MOCK_DEMANDS = [
  { id: 1, crop: 'Wheat', qty: 50, filled: 32, price: '₹2,380–₹2,460/qtl', dueDate: 'Sep 30' },
  { id: 2, crop: 'Rice', qty: 100, filled: 0, price: '₹3,100–₹3,300/qtl', dueDate: 'Oct 15' },
]

export default function B1Home() {
  const { lang } = useLang()
  const navigate = useNavigate()

  return (
    <Box sx={{ bgcolor: '#FFFBF5' }}>
      <TopBar title="KisanConnect" />

      <Box sx={{ px: 2, py: 2 }}>
        {/* Licence expiry warning */}
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {lang === 'hi' ? 'आपका ट्रेड लाइसेंस 12 दिनों में समाप्त होगा' : 'Your trade licence expires in 12 days'}
          <Button size="small" sx={{ ml: 1 }} onClick={() => navigate('/buyer/trust')}>{lang === 'hi' ? 'नवीनीकरण करें' : 'Renew'}</Button>
        </Alert>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {lang === 'hi' ? 'नमस्ते, खरीदार!' : 'Hello, Buyer!'}
        </Typography>

        {/* Volume needed */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
          {lang === 'hi' ? 'अभी भी चाहिए' : 'Volume you still need'}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
          {MOCK_DEMANDS.map(d => (
            <Card key={d.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{d.crop}</Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    {lang === 'hi' ? 'तक' : 'by'} {d.dueDate}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    {d.filled} / {d.qty} qtl {lang === 'hi' ? 'मिले' : 'sourced'}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: d.filled > 0 ? '#15803D' : '#B45309' }}>
                    {Math.round(d.filled / d.qty * 100)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(d.filled / d.qty) * 100}
                  sx={{ height: 8, borderRadius: 4, mb: 1, '& .MuiLinearProgress-bar': { bgcolor: d.filled > 0 ? '#15803D' : '#B45309' } }}
                />
                <Typography variant="caption" sx={{ color: '#6B7280' }}>{d.price}</Typography>
              </CardContent>
            </Card>
          ))}
          <Button variant="outlined" size="small" onClick={() => navigate('/buyer/demand')} sx={{ borderColor: '#3730A3', color: '#3730A3' }}>
            {lang === 'hi' ? '+ नई मांग दर्ज करें' : '+ Post new demand'}
          </Button>
        </Box>

        {/* New supply near me */}
        <Card sx={{ mb: 2, cursor: 'pointer', bgcolor: '#F0FDF4', border: '1px solid #86EFAC' }} onClick={() => navigate('/buyer/find')}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#15803D' }}>
              🌾 {lang === 'hi' ? 'पास में नई फसल' : 'New supply near you'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#166534' }}>
              {lang === 'hi' ? '14 नई लॉट उपलब्ध' : '14 new lots available'} · sample
            </Typography>
          </CardContent>
        </Card>

        {/* Payments due */}
        <Card sx={{ mb: 2, cursor: 'pointer' }} onClick={() => navigate('/buyer/deals')}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {lang === 'hi' ? 'भुगतान बकाया' : 'Payments due'}
            </Typography>
            <Typography sx={{ fontWeight: 700, color: '#B91C1C', fontSize: '1.25rem' }}>
              {formatINR(42500)}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              {lang === 'hi' ? '2 सौदे' : '2 deals'} · sample
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
