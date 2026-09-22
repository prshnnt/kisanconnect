import { useState, useEffect } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Divider,
  Stack,
  Chip,
  Card,
  CardContent,
} from '@mui/material'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone'
import LockIcon from '@mui/icons-material/Lock'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import SmsIcon from '@mui/icons-material/Sms'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import GavelIcon from '@mui/icons-material/Gavel'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, loginWithOtp } = useAuth()
  const [activeTab, setActiveTab] = useState(0) // 0: Password, 1: OTP

  const [mobileNumber, setMobileNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [debugOtp, setDebugOtp] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  const handleSendOtp = async () => {
    setErrorMessage('')
    setInfoMessage('')
    if (!mobileNumber || mobileNumber.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number')
      return
    }
    setSubmitting(true)
    try {
      const res = await authApi.requestLoginOtp(mobileNumber)
      setOtpSent(true)
      setCountdown(60)
      if (res.debug_otp) {
        setDebugOtp(res.debug_otp)
        setInfoMessage(`OTP sent to +91 ${mobileNumber}. (Debug OTP: ${res.debug_otp})`)
      } else {
        setInfoMessage(`OTP sent to +91 ${mobileNumber}.`)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send OTP')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setInfoMessage('')
    if (!mobileNumber || mobileNumber.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number')
      return
    }
    if (!password) {
      setErrorMessage('Please enter your password')
      return
    }
    setSubmitting(true)
    try {
      await login(mobileNumber, password)
      setInfoMessage('Login successful! Redirecting...')
      navigate('/dashboard')
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOtpLogin = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setInfoMessage('')
    if (!otpSent) {
      await handleSendOtp()
      return
    }
    if (!otp || otp.length < 4) {
      setErrorMessage('Please enter the OTP sent to your mobile')
      return
    }
    setSubmitting(true)
    try {
      await loginWithOtp(mobileNumber, otp)
      setInfoMessage('OTP verified! Redirecting...')
      navigate('/dashboard')
    } catch (err) {
      setErrorMessage(err.message || 'Invalid OTP. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f4f6f8',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        {/* Header */}
        <Box textAlign="center" mb={3}>
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} mb={1}>
            <AgricultureIcon sx={{ fontSize: 44, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={800} color="primary.dark" letterSpacing={0.5}>
              KisanConnect
            </Typography>
          </Stack>
          <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
            Unified eNAM Digital Mandi Platform
          </Typography>
          <Typography variant="caption" color="primary.main" fontWeight={600}>
            Connecting Farmers, Traders, FPOs & Service Providers
          </Typography>
        </Box>

        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, bgcolor: '#ffffff' }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          {infoMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {infoMessage}
            </Alert>
          )}

          <Tabs
            value={activeTab}
            onChange={(_, val) => {
              setActiveTab(val)
              setErrorMessage('')
              setInfoMessage('')
            }}
            variant="fullWidth"
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<LockIcon fontSize="small" />} iconPosition="start" label="Password Login" />
            <Tab icon={<SmsIcon fontSize="small" />} iconPosition="start" label="Mobile OTP Login" />
          </Tabs>

          {activeTab === 0 ? (
            <form onSubmit={handlePasswordLogin}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIphoneIcon color="action" />
                        <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 600 }}>
                          +91
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  sx={{ py: 1.4, fontSize: '1rem', fontWeight: 700, borderRadius: 2 }}
                >
                  {submitting ? 'Authenticating...' : 'Sign In'}
                </Button>
              </Stack>
            </form>
          ) : (
            <form onSubmit={handleOtpLogin}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  disabled={otpSent}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIphoneIcon color="action" />
                        <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 600 }}>
                          +91
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                />

                {!otpSent ? (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSendOtp}
                    disabled={submitting || !mobileNumber}
                    sx={{ py: 1.4, fontSize: '1rem', fontWeight: 700, borderRadius: 2 }}
                  >
                    {submitting ? 'Sending OTP...' : 'Send OTP via SMS'}
                  </Button>
                ) : (
                  <>
                    <TextField
                      fullWidth
                      label="Enter OTP"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <VerifiedUserIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    {debugOtp && (
                      <Chip
                        label={`Demo OTP: ${debugOtp}`}
                        color="secondary"
                        variant="outlined"
                        onClick={() => setOtp(debugOtp)}
                        sx={{ alignSelf: 'center', cursor: 'pointer', fontWeight: 700 }}
                      />
                    )}

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting || !otp}
                      sx={{ py: 1.4, fontSize: '1rem', fontWeight: 700, borderRadius: 2 }}
                    >
                      {submitting ? 'Verifying...' : 'Verify OTP & Sign In'}
                    </Button>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Button
                        size="small"
                        disabled={countdown > 0 || submitting}
                        onClick={handleSendOtp}
                      >
                        {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                      </Button>
                      <Button
                        size="small"
                        color="inherit"
                        onClick={() => {
                          setOtpSent(false)
                          setOtp('')
                        }}
                      >
                        Change Number
                      </Button>
                    </Stack>
                  </>
                )}
              </Stack>
            </form>
          )}

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Stack direction="row" justifyContent="center" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account yet?
            </Typography>
            <Typography
              component={RouterLink}
              to="/register"
              variant="body2"
              fontWeight={700}
              color="primary.main"
              sx={{ textDecoration: 'none' }}
            >
              Register Here
            </Typography>
          </Stack>
        </Paper>

        {/* Feature Cards Footbar */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={3}>
          <Card sx={{ flex: 1, bgcolor: '#ffffff', borderRadius: 2 }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <StorefrontIcon color="primary" />
                <Typography variant="caption" fontWeight={600}>
                  Direct Mandi Access
                </Typography>
              </Stack>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, bgcolor: '#ffffff', borderRadius: 2 }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <GavelIcon color="secondary" />
                <Typography variant="caption" fontWeight={600}>
                  Live eNAM Bidding
                </Typography>
              </Stack>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, bgcolor: '#ffffff', borderRadius: 2 }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocalShippingIcon color="success" />
                <Typography variant="caption" fontWeight={600}>
                  Kisan Rath Transport
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  )
}

export default LoginPage
