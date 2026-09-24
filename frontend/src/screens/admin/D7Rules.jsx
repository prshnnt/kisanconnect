import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import { useLang } from '../../contexts/LanguageContext.jsx'

const MOCK_RULES = [
  { id: 1, kind: 'Commission', payer: 'seller', basis: 'percentage', rate: '2.5%', mandi: 'All', crop: 'All' },
  { id: 2, kind: 'Market fee', payer: 'buyer', basis: 'percentage', rate: '1%', mandi: 'Lucknow APMC', crop: 'All' },
  { id: 3, kind: 'Weighing', payer: 'seller', basis: 'per lot', rate: '₹150', mandi: 'All', crop: 'All' },
]

export default function D7Rules() {
  const { lang } = useLang()
  const [previewSale] = useState(100)

  const buyerPays = MOCK_RULES.filter(r => r.payer === 'buyer').reduce((s, r) => s + (r.rate.includes('%') ? previewSale * parseFloat(r.rate) / 100 : 0), 0)
  const sellerDeductions = MOCK_RULES.filter(r => r.payer === 'seller').reduce((s, r) => s + (r.rate.includes('%') ? previewSale * parseFloat(r.rate) / 100 : 0), 0)
  const farmerReceives = previewSale - sellerDeductions

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {lang === 'hi' ? 'नियम और मास्टर डेटा' : 'Rules & masters'} · sample
      </Typography>

      {/* Live preview */}
      <Card sx={{ mb: 3, bgcolor: '#F0F9FF', border: '1px solid #BAE6FD' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {lang === 'hi' ? 'लाइव प्रीव्यू: ₹100 की बिक्री पर' : 'Live preview: On a ₹100 sale'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#6B7280' }}>Buyer pays</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#B45309' }}>₹{(previewSale + buyerPays).toFixed(2)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#6B7280' }}>Farmer gets</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#15803D' }}>₹{farmerReceives.toFixed(2)}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Card}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F9FAFB' }}>
              {['Kind', 'Who pays', 'Basis', 'Rate', 'Mandi', 'Crop'].map(h => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_RULES.map(r => (
              <TableRow key={r.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                <TableCell sx={{ fontWeight: 600 }}>{r.kind}</TableCell>
                <TableCell>
                  <Chip
                    label={r.payer}
                    size="small"
                    sx={{
                      bgcolor: r.payer === 'buyer' ? '#DBEAFE' : '#FEF3C7',
                      color: r.payer === 'buyer' ? '#1D4ED8' : '#B45309',
                      fontWeight: 600,
                      fontSize: '0.7rem'
                    }}
                  />
                </TableCell>
                <TableCell>{r.basis}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{r.rate}</TableCell>
                <TableCell>{r.mandi}</TableCell>
                <TableCell>{r.crop}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
