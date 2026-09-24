import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../contexts/LanguageContext.jsx'
import TopBar from '../../components/TopBar.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { formatINR } from '../../utils/format.js'

const MOCK_LOTS = [
  { id: 1, crop: 'Wheat 🌾', cropHi: 'गेहूं 🌾', qty: 25, status: 'live', bestOffer: 2410, offers: 3 },
  { id: 2, crop: 'Potato 🥔', cropHi: 'आलू 🥔', qty: 10, status: 'offers', bestOffer: 1180, offers: 2 },
  { id: 3, crop: 'Rice 🍚', cropHi: 'चावल 🍚', qty: 50, status: 'sold', bestOffer: 3200, offers: 0 },
  { id: 4, crop: 'Maize 🌽', cropHi: 'मक्का 🌽', qty: 15, status: 'draft', bestOffer: null, offers: 0 },
]

const STATUS_LABELS = { draft: 'Draft', live: 'Live', offers: 'Offers', sold: 'Sold' }
const STATUS_LABELS_HI = { draft: 'ड्राफ्ट', live: 'सक्रिय', offers: 'ऑफर', sold: 'बिक गया' }

export default function F11MyLots() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)

  const filtered = tab === 0 ? MOCK_LOTS : tab === 1
    ? MOCK_LOTS.filter(l => l.status === 'live' || l.status === 'offers')
    : MOCK_LOTS.filter(l => l.status === 'sold')

  return (
    <Box sx={{ bgcolor: '#FFFBF5', minHeight: '100vh' }}>
      <TopBar title={lang === 'hi' ? 'मेरी लॉट' : 'My lots'} />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid #F3E8D0', bgcolor: '#FFFFFF' }}>
        <Tab label={lang === 'hi' ? 'सभी' : 'All'} />
        <Tab label={lang === 'hi' ? 'सक्रिय' : 'Active'} />
        <Tab label={lang === 'hi' ? 'बिक गए' : 'Sold'} />
      </Tabs>

      <Box sx={{ p: 2 }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={AgricultureIcon}
            title={lang === 'hi' ? 'कोई लॉट नहीं' : 'No lots yet'}
            description={lang === 'hi' ? 'अपनी पहली लॉट बनाएं' : 'Create your first lot'}
            action={lang === 'hi' ? 'लॉट बनाएं' : 'Create lot'}
            onAction={() => navigate('/farmer/sell')}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filtered.map(lot => (
              <Card key={lot.id} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/farmer/lot/${lot.id}/offers`)}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {lang === 'hi' ? lot.cropHi : lot.crop}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>{lot.qty} qtl · sample</Typography>
                    </Box>
                    <StatusPill
                      status={lot.status}
                      label={lang === 'hi' ? STATUS_LABELS_HI[lot.status] : STATUS_LABELS[lot.status]}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {lot.bestOffer ? (
                      <Box>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          {lang === 'hi' ? 'सबसे अच्छा ऑफर' : 'Best offer'}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#15803D' }}>
                          {formatINR(lot.bestOffer)}/qtl
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        {lang === 'hi' ? 'अभी तक कोई ऑफर नहीं' : 'No offers yet'}
                      </Typography>
                    )}
                    {lot.offers > 0 && (
                      <Chip
                        label={`${lot.offers} ${lang === 'hi' ? 'ऑफर' : 'offers'}`}
                        size="small"
                        sx={{ bgcolor: '#DBEAFE', color: '#1D4ED8', fontWeight: 600 }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, px: 2 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={() => navigate('/farmer/sell')}
        >
          {lang === 'hi' ? '+ नई लॉट बनाएं' : '+ Create new lot'}
        </Button>
      </Box>
    </Box>
  )
}
