import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Slider from '@mui/material/Slider'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../../contexts/LanguageContext.jsx'
import TopBar from '../../components/TopBar.jsx'
import { formatINR } from '../../utils/format.js'

const MARKET_PRICE = 2410
const DEDUCTIONS = [
  { labelHi: 'एजेंट कमीशन (2.5%)', labelEn: 'Agent commission (2.5%)', amount: 60 },
  { labelHi: 'लोडिंग/अनलोडिंग', labelEn: 'Loading / unloading', amount: 20 },
  { labelHi: 'तौल शुल्क', labelEn: 'Weighing fee', amount: 15 },
]
const TOTAL_DEDUCTIONS = DEDUCTIONS.reduce((s, d) => s + d.amount, 0)

export default function F8MinPrice() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [minPrice, setMinPrice] = useState(MARKET_PRICE - 100)
  const [showWhy, setShowWhy] = useState(false)

  const netReceive = minPrice - TOTAL_DEDUCTIONS

  return (
    <Box sx={{ bgcolor: '#FFFBF5', minHeight: '100vh' }}>
      <TopBar title={lang === 'hi' ? 'न्यूनतम कीमत' : 'Minimum price'} />

      <Box sx={{ px: 2, py: 2, pb: 12 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {lang === 'hi' ? 'आप कम से कम कितनी कीमत चाहते हैं?' : 'What is your minimum price?'}
        </Typography>

        <Card sx={{ mb: 3, bgcolor: '#F0F9FF', border: '1px solid #BAE6FD' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="caption" sx={{ color: '#0369A1' }}>
              {lang === 'hi' ? 'आज का बाज़ार भाव (संदर्भ)' : "Today's market price (reference)"}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0369A1' }}>
              {formatINR(MARKET_PRICE)}/qtl
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>sample</Typography>
          </CardContent>
        </Card>

        {/* Slider */}
        <Box sx={{ px: 1, mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              {formatINR(MARKET_PRICE - 300)}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              {formatINR(MARKET_PRICE + 200)}
            </Typography>
          </Box>
          <Slider
            value={minPrice}
            min={MARKET_PRICE - 300}
            max={MARKET_PRICE + 200}
            step={10}
            onChange={(_, v) => setMinPrice(v)}
            sx={{ color: '#F5A524', '& .MuiSlider-thumb': { width: 28, height: 28, boxShadow: '0 2px 8px rgba(245,165,36,0.5)' } }}
          />
        </Box>

        <Typography sx={{ fontSize: '2.5rem', fontWeight: 700, textAlign: 'center', mb: 0.5, fontVariantNumeric: 'tabular-nums' }}>
          {formatINR(minPrice)}/qtl
        </Typography>

        {/* Net receive */}
        <Card sx={{ mb: 2, bgcolor: '#D1FAE5', border: '1px solid #86EFAC' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
              {lang === 'hi' ? 'आपको मिलेगा लगभग' : 'You will receive about'}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#15803D', fontVariantNumeric: 'tabular-nums' }}>
              {formatINR(netReceive)}/qtl
            </Typography>
            <Button
              size="small"
              endIcon={showWhy ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setShowWhy(!showWhy)}
              sx={{ color: '#166534', p: 0, mt: 0.5, fontWeight: 600, '&:hover': { bgcolor: 'transparent' } }}
            >
              {lang === 'hi' ? 'कम क्यों है?' : 'Why less?'}
            </Button>
            <Collapse in={showWhy}>
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {DEDUCTIONS.map(d => (
                  <Box key={d.labelEn} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#166534' }}>
                      {lang === 'hi' ? d.labelHi : d.labelEn}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                      − {formatINR(d.amount)}
                    </Typography>
                  </Box>
                ))}
                <Box sx={{ borderTop: '1px solid #86EFAC', pt: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#15803D' }}>
                    {lang === 'hi' ? 'आपका न्यूनतम → आपको मिलेगा' : 'Your min → You receive'}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#15803D' }}>
                    {formatINR(minPrice)} → {formatINR(netReceive)}
                  </Typography>
                </Box>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, p: 2, bgcolor: '#FFFBF5', borderTop: '1px solid #F3E8D0', boxShadow: '0 -4px 12px rgba(0,0,0,0.06)', zIndex: 1100 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={() => navigate('/farmer/sell/how', { state: { ...location.state, minPrice } })}
        >
          {lang === 'hi' ? 'आगे बढ़ें' : 'Continue'}
        </Button>
      </Box>
    </Box>
  )
}
