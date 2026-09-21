import { useState, useEffect } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Link,
  IconButton,
  InputAdornment,
  Alert,
  Divider,
  Chip,
  Stack,
} from '@mui/material'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'

function LoginPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0) // 0: Password, 1: OTP

  // Form states
  const [mobileNumber, setMobileNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // OTP flow states
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [infoMessage, setInfoMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  const handleSendOtp = () => {
    setErrorMessage('')
    if (!mobileNumber || mobileNumber.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number')
      return
    }
    setOtpSent(true)
    setCountdown(30)
    setInfoMessage(`OTP sent to +91 ${mobileNumber}. (Use demo OTP: 123456)`)
  }

  const handlePasswordLogin = (e) => {
    e.preventDefault()
    setErrorMessage('')
    if (!mobileNumber || mobileNumber.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number')
      return
    }
    if (!password) {
      setErrorMessage('Please enter your password')
      return
    }
    // Simulate successful login
    setInfoMessage('Login successful! Redirecting...')
    setTimeout(() => {
      navigate('/')
    }, 1000)
  }

  const handleOtpLogin = (e) => {
    e.preventDefault()
    setErrorMessage('')
    if (!otpSent) {
      handleSendOtp()
      return
    }
    if (otp !== '123456' && otp.length !== 6) {
      setErrorMessage('Invalid OTP. Please enter the 6-digit OTP (Demo: 123456)')
      return
    }
    setInfoMessage('OTP verified successfully! Redirecting...')
    setTimeout(() => {
      navigate('/')
    }, 1000)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* Top Brand Header */}
      <Box
        sx={{
          py: 2,
          px: { xs: 2, md: 5 },
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Box
          component={RouterLink}
          to="/login"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'none',
            gap: 1.2,
          }}
        >
          <AgricultureIcon sx={{ color: '#2e7d32', fontSize: 32 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: 0.5,
              color: '#1b5e20',
              fontSize: '1.25rem',
            }}
          >
            KisanConnect
          </Typography>
        </Box>
      </Box>

      {/* Main Container */}
      <Container
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 4, md: 6 },
        }}
      >
        <Paper
          elevation={2}
          sx={{
            width: '100%',
            maxWidth: 960,
            borderRadius: 4,
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
          }}
        >
          {/* Left / Main Form Column */}
          <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: '#1b5e20',
                  fontSize: { xs: '1.65rem', md: '1.9rem' },
                  letterSpacing: -0.5,
                  mb: 0.8,
                }}
              >
                Sign In
              </Typography>
              <Typography variant="body2" sx={{ color: '#4b5563' }}>
                Access your trading account, mandi rates, lots, and services
              </Typography>
            </Box>

            {/* Mode Switch Tabs */}
            <Tabs
              value={activeTab}
              onChange={(_, val) => {
                setActiveTab(val)
                setErrorMessage('')
                setInfoMessage('')
              }}
              variant="fullWidth"
              sx={{
                mb: 3,
                borderBottom: '1px solid #e5e7eb',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                },
                '& .Mui-selected': {
                  color: '#2e7d32',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#2e7d32',
                  height: 3,
                },
              }}
            >
              <Tab label="Login with Password" />
              <Tab label="Login with OTP" />
            </Tabs>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {errorMessage}
              </Alert>
            )}

            {infoMessage && (
              <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
                {infoMessage}
              </Alert>
            )}

            {/* TAB 0: PASSWORD LOGIN */}
            {activeTab === 0 && (
              <Box component="form" onSubmit={handlePasswordLogin}>
                <Box sx={{ mb: 2.5 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      color: '#1f2937',
                      mb: 0.6,
                    }}
                  >
                    Mobile Number *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter 10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIphoneOutlinedIcon sx={{ color: '#9ca3af', fontSize: 20, mr: 0.5 }} />
                          <Typography sx={{ color: '#4b5563', fontWeight: 600, fontSize: '0.9rem' }}>
                            +91
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      color: '#1f2937',
                      mb: 0.6,
                    }}
                  >
                    Password *
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{ color: '#2e7d32', '&.Mui-checked': { color: '#2e7d32' } }}
                      />
                    }
                    label={<Typography sx={{ fontSize: '0.88rem', color: '#4b5563' }}>Remember me</Typography>}
                  />

                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setActiveTab(1)
                    }}
                    sx={{
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: '#2e7d32',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  sx={{
                    py: 1.3,
                    backgroundColor: '#2e7d32',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderRadius: 2,
                    '&:hover': { backgroundColor: '#1b5e20' },
                  }}
                >
                  Sign In with Password
                </Button>
              </Box>
            )}

            {/* TAB 1: OTP LOGIN */}
            {activeTab === 1 && (
              <Box component="form" onSubmit={handleOtpLogin}>
                <Box sx={{ mb: 2.5 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      color: '#1f2937',
                      mb: 0.6,
                    }}
                  >
                    Mobile Number *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter 10-digit mobile number"
                    value={mobileNumber}
                    disabled={otpSent}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIphoneOutlinedIcon sx={{ color: '#9ca3af', fontSize: 20, mr: 0.5 }} />
                          <Typography sx={{ color: '#4b5563', fontWeight: 600, fontSize: '0.9rem' }}>
                            +91
                          </Typography>
                        </InputAdornment>
                      ),
                      endAdornment: otpSent ? (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            onClick={() => {
                              setOtpSent(false)
                              setOtp('')
                              setInfoMessage('')
                            }}
                            sx={{ textTransform: 'none', fontSize: '0.8rem', color: '#2e7d32' }}
                          >
                            Change
                          </Button>
                        </InputAdornment>
                      ) : null,
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>

                {otpSent && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                      <Typography
                        component="label"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.88rem',
                          color: '#1f2937',
                        }}
                      >
                        Enter 6-Digit OTP *
                      </Typography>
                      {countdown > 0 ? (
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          Resend in {countdown}s
                        </Typography>
                      ) : (
                        <Button
                          size="small"
                          onClick={handleSendOtp}
                          sx={{ textTransform: 'none', p: 0, minWidth: 0, color: '#2e7d32', fontWeight: 600 }}
                        >
                          Resend OTP
                        </Button>
                      )}
                    </Box>

                    <TextField
                      fullWidth
                      placeholder="Enter 6-digit OTP (123456)"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SmsOutlinedIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Box>
                )}

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  sx={{
                    py: 1.3,
                    backgroundColor: '#2e7d32',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderRadius: 2,
                    '&:hover': { backgroundColor: '#1b5e20' },
                  }}
                >
                  {otpSent ? 'Verify & Sign In' : 'Send OTP'}
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 3.5, borderColor: '#e5e7eb' }} />

            {/* Footer Registration Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#4b5563' }}>
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: '#2e7d32',
                    fontWeight: 700,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Register / Sign up
                </Link>
              </Typography>
            </Box>
          </Box>

          {/* Right Side Branding / Feature Column */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 4.5,
              backgroundColor: '#1b5e20',
              color: '#ffffff',
              background: 'linear-gradient(145deg, #1b5e20 0%, #2e7d32 100%)',
            }}
          >
            <Box>

              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, letterSpacing: -0.3 }}>
                Empowering India's Agricultural Value Chain
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, mb: 4 }}>
                One unified portal for Farmers, FPOs, Traders, Commission Agents, and Service Providers.
              </Typography>

              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <StorefrontOutlinedIcon sx={{ color: '#a5d6a7', fontSize: 26 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      Mandi Trading & Auctions
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                      Transparent online bidding and price discovery
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LocalShippingOutlinedIcon sx={{ color: '#a5d6a7', fontSize: 26 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      Logistics & Weighment
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                      End-to-end transport and certified weighing scales
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <VerifiedUserOutlinedIcon sx={{ color: '#a5d6a7', fontSize: 26 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      Quality Assaying & Certification
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                      Chemical & physical testing standards
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)', pt: 4 }}>
              © {new Date().getFullYear()} KisanConnect. National Agricultural Ecosystem.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default LoginPage
