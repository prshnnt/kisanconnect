import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import PendingIcon from '@mui/icons-material/Pending'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import ScaleIcon from '@mui/icons-material/Scale'
import DescriptionIcon from '@mui/icons-material/Description'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined'
import { useParams, useNavigate } from 'react-router-dom'
import { useLang } from '../../contexts/LanguageContext.jsx'
import TopBar from '../../components/TopBar.jsx'
import VerifiedBadge from '../../components/VerifiedBadge.jsx'
import { formatINR } from '../../utils/format.js'

const STEPS = [
  { id: 'agreed', icon: CheckCircleIcon, hi: 'सौदा हुआ', en: 'Agreed', done: true, time: 'Sep 20, 10:30 am' },
  { id: 'pickup', icon: LocalShippingIcon, hi: 'पिकअप की व्यवस्था', en: 'Pickup arranged', done: false, current: true, action: 'arrangePickup' },
  { id: 'weighed', icon: ScaleIcon, hi: 'तौल हुई', en: 'Weighed', done: false },
  { id: 'paper', icon: DescriptionIcon, hi: 'कागज तैयार', en: 'Paper ready', done: false },
  { id: 'paid', icon: AccountBalanceWalletIcon, hi: 'खरीदार ने भुगतान किया', en: 'Buyer paid', done: false },
  { id: 'sent', icon: SwapHorizIcon, hi: 'पैसा बैंक में गया', en: 'Money sent to my bank', done: false },
  { id: 'delivered', icon: LocalShippingIcon, hi: 'डिलीवर हुई', en: 'Delivered', done: false },
]

const DEAL = { crop: 'Wheat', cropHi: 'गेहूं', qty: 25, buyer: 'Green Mills Ltd', price: 2410, verified: true }

export default function F15DealRoom() {
  const { lang } = useLang()
  const { dealId } = useParams()
  const navigate = useNavigate()
  const [pickupArranged, setPickupArranged] = useState(false)

  const steps = STEPS.map((s, i) => {
    if (s.id === 'pickup' && pickupArranged) return { ...s, done: true, current: false }
    if (s.id === 'weighed' && pickupArranged) return { ...s, current: true }
    return s
  })

  return (
    <Box sx={{ bgcolor: '#FFFBF5', minHeight: '100vh' }}>
      <TopBar title={lang === 'hi' ? 'Deal Room' : 'Deal Room'} />

      <Box sx={{ px: 2, py: 2, pb: 12 }}>
        {/* Header */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {lang === 'hi' ? DEAL.cropHi : DEAL.crop} · {DEAL.qty} qtl
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>{DEAL.buyer}</Typography>
              <VerifiedBadge />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2937', fontVariantNumeric: 'tabular-nums' }}>
              {formatINR(DEAL.price)}/qtl
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>sample</Typography>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Box sx={{ position: 'relative', pl: 4 }}>
          {steps.map((step, i) => {
            const Icon = step.done ? CheckCircleIcon : step.current ? PendingIcon : RadioButtonUncheckedIcon
            const iconColor = step.done ? '#15803D' : step.current ? '#F5A524' : '#D1D5DB'
            const StepIcon = step.icon

            return (
              <Box key={step.id} sx={{ display: 'flex', gap: 2, mb: i < STEPS.length - 1 ? 0 : 2, position: 'relative' }}>
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <Box sx={{
                    position: 'absolute',
                    left: -24,
                    top: 28,
                    bottom: -8,
                    width: 2,
                    bgcolor: step.done ? '#15803D' : '#E5E7EB',
                  }} />
                )}

                {/* Circle */}
                <Box sx={{ position: 'absolute', left: -32, top: 4, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon sx={{ fontSize: 20, color: iconColor }} />
                </Box>

                <Card sx={{ flex: 1, mb: 1.5, border: step.current ? '2px solid #F5A524' : '1px solid #E5E7EB', bgcolor: step.done ? '#F0FDF4' : '#FFFFFF' }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StepIcon sx={{ fontSize: 18, color: iconColor }} />
                        <Typography variant="body2" sx={{ fontWeight: step.current ? 700 : 600, color: step.done ? '#166534' : '#1F2937' }}>
                          {lang === 'hi' ? step.hi : step.en}
                        </Typography>
                      </Box>
                      {step.time && (
                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>{step.time}</Typography>
                      )}
                    </Box>

                    {step.current && (
                      <Box sx={{ mt: 1.5 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{ mr: 1, height: 36, fontSize: '0.8rem' }}
                          onClick={() => setPickupArranged(true)}
                        >
                          {lang === 'hi' ? 'पिकअप की व्यवस्था करें' : 'Arrange pickup'}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<ErrorOutlineIcon />}
                          sx={{ height: 36, fontSize: '0.75rem', borderColor: '#B91C1C', color: '#B91C1C' }}
                          onClick={() => navigate('/farmer/problem', { state: { dealId } })}
                        >
                          {lang === 'hi' ? 'समस्या' : 'Problem'}
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
