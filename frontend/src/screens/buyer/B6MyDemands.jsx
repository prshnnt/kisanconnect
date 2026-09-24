import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'
import ListAltIcon from '@mui/icons-material/ListAlt'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../contexts/LanguageContext.jsx'
import TopBar from '../../components/TopBar.jsx'

const MOCK_DEMANDS = [
  { id: 1, crop: 'Wheat', cropHi: 'गेहूं', qty: 50, filled: 32, price: '₹2,380–₹2,460/qtl', dueDate: 'Sep 30', status: 'open' },
  { id: 2, crop: 'Rice', cropHi: 'चावल', qty: 100, filled: 0, price: '₹3,100–₹3,300/qtl', dueDate: 'Oct 15', status: 'open' },
  { id: 3, crop: 'Mustard', cropHi: 'सरसों', qty: 30, filled: 30, price: '₹5,200–₹5,400/qtl', dueDate: 'Sep 10', status: 'closed' },
]

export default function B6MyDemands() {
  const { lang } = useLang()
  const navigate = useNavigate()

  return (
    <Box sx={{ bgcolor: '#FFFBF5', minHeight: '100vh', position: 'relative' }}>
      <TopBar title={lang === 'hi' ? 'मेरी मांगें' : 'My demands'} />

      <Box sx={{ px: 2, py: 2 }}>
        {MOCK_DEMANDS.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ListAltIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1 }} />
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
              {lang === 'hi' ? 'अभी तक कोई मांग नहीं' : 'No demands posted yet'}
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/buyer/demand')}>
              {lang === 'hi' ? 'नई मांग दर्ज करें' : 'Post a demand'}
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {MOCK_DEMANDS.map(d => (
            <Card key={d.id} sx={{ opacity: d.status === 'closed' ? 0.6 : 1 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {lang === 'hi' ? d.cropHi : d.crop}
                  </Typography>
                  <Typography variant="caption" sx={{ color: d.status === 'closed' ? '#15803D' : '#6B7280', fontWeight: 600 }}>
                    {d.status === 'closed'
                      ? (lang === 'hi' ? 'पूर्ण' : 'Fulfilled')
                      : `${lang === 'hi' ? 'तक' : 'by'} ${d.dueDate}`}
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
        </Box>
      </Box>

      <Fab
        color="primary"
        onClick={() => navigate('/buyer/demand')}
        sx={{ position: 'fixed', bottom: 86, left: 20, zIndex: 1100 }}
      >
        <AddIcon />
      </Fab>
    </Box>
  )
}
