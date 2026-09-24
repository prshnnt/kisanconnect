import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Button from '@mui/material/Button'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import StoreIcon from '@mui/icons-material/Store'
import PeopleIcon from '@mui/icons-material/People'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../contexts/LanguageContext.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import TopBar from '../../components/TopBar.jsx'

const ROLES = [
  {
    id: 'farmer',
    icon: AgricultureIcon,
    hi: 'किसान / FPO',
    en: 'Farmer / FPO',
    descHi: 'मैं अपनी फसल बेचना चाहता हूँ',
    descEn: 'I want to sell my produce',
    hasFPO: true,
  },
  {
    id: 'buyer',
    icon: StoreIcon,
    hi: 'खरीदार',
    en: 'Buyer',
    descHi: 'मैं फसल खरीदना चाहता हूँ',
    descEn: 'I want to buy produce',
    hasFPO: true,
  },
  {
    id: 'agent',
    icon: PeopleIcon,
    hi: 'कमीशन एजेंट',
    en: 'Commission Agent',
    descHi: 'मैं मंडी में किसानों के लिए बेचता हूँ',
    descEn: 'I sell for farmers at a mandi',
    hasFPO: false,
  },
  {
    id: 'provider',
    icon: LocalShippingIcon,
    hi: 'सेवा प्रदाता',
    en: 'Service Provider',
    descHi: 'मैं भंडारण, परिवहन, जाँच या तौल सेवाएं देता हूँ',
    descEn: 'I offer storage, transport, testing or weighing',
    hasFPO: false,
  },
]

export default function X2UserType() {
  const { lang } = useLang()
  const { setRole } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [isFPO, setIsFPO] = useState(false)

  function proceed() {
    if (!selected) return
    setRole(selected)
    navigate('/phone')
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFFBF5', display: 'flex', flexDirection: 'column' }}>
      <TopBar title={lang === 'hi' ? 'KisanConnect' : 'KisanConnect'} />

      <Box sx={{ flex: 1, maxWidth: 390, mx: 'auto', width: '100%', px: 2, py: 3, pb: 10 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          {lang === 'hi' ? 'आप कौन हैं?' : 'I am a...'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
          {lang === 'hi' ? 'अपनी भूमिका चुनें' : 'Choose your role'}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {ROLES.map(role => {
            const Icon = role.icon
            const isSelected = selected === role.id
            return (
              <Card
                key={role.id}
                sx={{
                  border: `2px solid ${isSelected ? '#F5A524' : '#E5E7EB'}`,
                  boxShadow: isSelected ? '0 4px 16px rgba(245,165,36,0.2)' : undefined,
                  transition: 'all 0.15s',
                }}
              >
                <CardActionArea
                  onClick={() => setSelected(role.id)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, textAlign: 'left' }}
                >
                  <Box sx={{
                    width: 56, height: 56, borderRadius: 2, flexShrink: 0,
                    bgcolor: isSelected ? '#FEF3C7' : '#F3F4F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon sx={{ fontSize: 28, color: isSelected ? '#F5A524' : '#6B7280' }} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 }}>
                      {lang === 'hi' ? role.hi : role.en}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280', lineHeight: 1.5 }}>
                      {lang === 'hi' ? role.descHi : role.descEn}
                    </Typography>
                    {isSelected && role.hasFPO && (
                      <FormControlLabel
                        control={<Switch size="small" checked={isFPO} onChange={e => setIsFPO(e.target.checked)} />}
                        label={
                          <Typography variant="caption">
                            {lang === 'hi' ? 'अकेले / मेरा FPO या कंपनी' : 'Just me / My FPO or company'}
                          </Typography>
                        }
                        sx={{ mt: 0.5, display: 'flex' }}
                        onClick={e => e.stopPropagation()}
                      />
                    )}
                  </Box>
                  <VolumeUpIcon sx={{ color: '#3730A3', fontSize: 20, flexShrink: 0 }} />
                </CardActionArea>
              </Card>
            )
          })}
        </Box>

        <Typography
          variant="caption"
          sx={{ display: 'block', textAlign: 'center', mt: 3, color: '#3730A3', cursor: 'pointer' }}
          onClick={() => navigate('/login?staff=1')}
        >
          {lang === 'hi' ? 'स्टाफ लॉगिन' : 'Staff login'}
        </Typography>
      </Box>

      <Box sx={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, p: 2, bgcolor: '#FFFBF5', borderTop: '1px solid #F3E8D0' }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={proceed}
          disabled={!selected}
          sx={{ height: 56 }}
        >
          {lang === 'hi' ? 'आगे बढ़ें' : 'Continue'}
        </Button>
      </Box>
    </Box>
  )
}
