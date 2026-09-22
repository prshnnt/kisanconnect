import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Divider,
  Stack,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
} from '@mui/material'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone'
import LockIcon from '@mui/icons-material/Lock'
import PersonIcon from '@mui/icons-material/Person'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/auth'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [step, setStep] = useState(1) // 1: Details & Send OTP, 2: Enter OTP & Register
  const [fullName, setFullName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('seller') // seller, buyer, service_provider, commission_agent

  const [otp, setOtp] = useState('')
  const [debugOtp, setDebugOtp] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setInfoMessage('')

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name')
      return
    }
    if (!mobileNumber || mobileNumber.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number')
      return
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long')
      return
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      const res = await authApi.requestRegisterOtp(mobileNumber)
      setStep(2)
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

  const handleCompleteRegistration = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setInfoMessage('')

    if (!otp) {
      setErrorMessage('Please enter the OTP sent to your mobile')
      return
    }

    setSubmitting(true)
    try {
      await register({
        mobile: mobileNumber,
        otp,
        password,
        full_name: fullName,
        roles: [role],
      })
      setInfoMessage('Registration successful! Welcome to KisanConnect.')
      navigate('/dashboard')
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your inputs.')
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
        <Box textAlign="center" mb={3}>
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} mb={1}>
            <AgricultureIcon sx={{ fontSize: 44, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={800} color="primary.dark" letterSpacing={0.5}>
              KisanConnect
            </Typography>
          </Stack>
          <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
            New User Registration
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

          {step === 1 ? (
            <form onSubmit={handleRequestOtp}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Full Name"
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Mobile Number"
                  placeholder="10-digit mobile number"
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

                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 0.5 }}>
                    Select Account Role
                  </FormLabel>
                  <RadioGroup row value={role} onChange={(e) => setRole(e.target.value)}>
                    <FormControlLabel value="seller" control={<Radio size="small" />} label="Farmer / Seller" />
                    <FormControlLabel value="buyer" control={<Radio size="small" />} label="Buyer / Trader" />
                    <FormControlLabel value="service_provider" control={<Radio size="small" />} label="Logistics Provider" />
                    <FormControlLabel value="commission_agent" control={<Radio size="small" />} label="Commission Agent" />
                  </RadioGroup>
                </FormControl>

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
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

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
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
                  {submitting ? 'Sending OTP...' : 'Continue & Verify Mobile'}
                </Button>
              </Stack>
            </form>
          ) : (
            <form onSubmit={handleCompleteRegistration}>
              <Stack spacing={2.5}>
                <Typography variant="body2" color="text.secondary">
                  Please enter the 6-digit OTP code sent to <strong>+91 {mobileNumber}</strong>.
                </Typography>

                <TextField
                  fullWidth
                  label="Enter OTP"
                  placeholder="Enter OTP"
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
                  {submitting ? 'Registering Account...' : 'Complete Registration'}
                </Button>

                <Button size="small" color="inherit" onClick={() => setStep(1)}>
                  Back to Edit Details
                </Button>
              </Stack>
            </form>
          )}

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Stack direction="row" justifyContent="center" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?
            </Typography>
            <Typography
              component={RouterLink}
              to="/login"
              variant="body2"
              fontWeight={700}
              color="primary.main"
              sx={{ textDecoration: 'none' }}
            >
              Sign In Here
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

export default RegisterPage
