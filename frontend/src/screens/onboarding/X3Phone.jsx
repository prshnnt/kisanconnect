import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import PhoneIcon from '@mui/icons-material/Phone'
import MicIcon from '@mui/icons-material/Mic'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../contexts/LanguageContext.jsx'
import TopBar from '../../components/TopBar.jsx'

export default function X3Phone() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  function sendOTP() {
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError(lang === 'hi' ? '10 अंकों का सही नंबर डालें' : 'Please enter a valid 10-digit number')
      return
    }
    setError('')
    navigate('/otp', { state: { phone } })
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFFBF5', display: 'flex', flexDirection: 'column' }}>
      <TopBar />

      <Box sx={{ flex: 1, maxWidth: 390, mx: 'auto', width: '100%', px: 3, py: 4, pb: 10 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ width: 56, height: 56, bgcolor: '#FEF3C7', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <PhoneIcon sx={{ fontSize: 28, color: '#F5A524' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {lang === 'hi' ? 'मोबाइल नंबर डालें' : 'Enter your mobile number'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            {lang === 'hi' ? 'आपके नंबर पर OTP भेजा जाएगा' : 'We\'ll send an OTP to your number'}
          </Typography>
        </Box>

        <TextField
          label={lang === 'hi' ? 'मोबाइल नंबर' : 'Mobile number'}
          value={phone}
          onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError('') }}
          error={!!error}
          helperText={error}
          inputProps={{ inputMode: 'numeric', maxLength: 10 }}
          InputProps={{
            startAdornment: <InputAdornment position="start">+91</InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <MicIcon sx={{ color: '#3730A3', cursor: 'pointer' }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      </Box>

      <Box sx={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, p: 2, bgcolor: '#FFFBF5', borderTop: '1px solid #F3E8D0' }}>
        <Button variant="contained" color="primary" fullWidth size="large" onClick={sendOTP}>
          {lang === 'hi' ? 'OTP भेजें' : 'Send OTP'}
        </Button>
      </Box>
    </Box>
  )
}
