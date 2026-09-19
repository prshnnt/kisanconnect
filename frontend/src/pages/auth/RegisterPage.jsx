import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LanguageIcon from '@mui/icons-material/Language'

import StepProgress from './components/StepProgress'
import UserTypeSelector from './components/UserTypeSelector'
import Step1RegistrationDetails from './components/Step1RegistrationDetails'
import Step2IdentityAddress from './components/Step2IdentityAddress'
import Step3ContactDetails from './components/Step3ContactDetails'
import Step4BankSecurity from './components/Step4BankSecurity'

function RegisterPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [userType, setUserType] = useState('individual')
  const [language, setLanguage] = useState('en')
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [referenceId, setReferenceId] = useState('')
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    // Step 1
    institutionName: '',
    registrationType: '',
    state: '',
    apmc: '',

    // Step 2
    firstName: '',
    middleName: '',
    lastName: '',
    relationshipName: '',
    dateOfBirth: '',
    gender: '',

    permanentAddressLine1: '',
    permanentAddressLine2: '',
    permanentPincode: '',
    permanentState: '',
    permanentDistrict: '',
    permanentTehsil: '',
    permanentCity: '',

    sameAsPermanent: false,
    currentAddressLine1: '',
    currentAddressLine2: '',
    currentPincode: '',
    currentState: '',
    currentDistrict: '',
    currentTehsil: '',
    currentCity: '',

    // Step 3
    mobileNumber: '',
    emailId: '',
    communicationConsent: false,

    // Step 4
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    accountHolderName: '',
    password: '',
    confirmPassword: '',
    declarationConsent: false,
  })

  const updateFormData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }))
    // Clear field-specific errors
    setErrors((prev) => {
      const copy = { ...prev }
      Object.keys(fields).forEach((key) => delete copy[key])
      return copy
    })
  }

  // Per-step validation
  const validateCurrentStep = () => {
    const errs = {}

    if (currentStep === 1) {
      if (userType === 'institutional' && !formData.institutionName?.trim()) {
        errs.institutionName = 'Institution name is required'
      }
      if (!formData.registrationType) {
        errs.registrationType = 'Please select a registration type'
      }
      if (!formData.state) {
        errs.state = 'Please select a registered state'
      }
      if (!formData.apmc) {
        errs.apmc = 'Please select a registered APMC'
      }
    } else if (currentStep === 2) {
      if (!formData.firstName?.trim()) errs.firstName = 'First name is required'
      if (!formData.lastName?.trim()) errs.lastName = 'Last name is required'
      if (!formData.permanentAddressLine1?.trim()) {
        errs.permanentAddressLine1 = 'Permanent address line 1 is required'
      }
      if (!formData.permanentState) errs.permanentState = 'Please select state'
      if (!formData.sameAsPermanent && !formData.currentAddressLine1?.trim()) {
        errs.currentAddressLine1 = 'Current address line 1 is required'
      }
    } else if (currentStep === 3) {
      if (!formData.mobileNumber || formData.mobileNumber.length < 10) {
        errs.mobileNumber = 'Please enter a valid 10-digit mobile number'
      }
      if (!formData.communicationConsent) {
        errs.communicationConsent = 'You must agree to communication updates'
      }
    } else if (currentStep === 4) {
      if (!formData.accountNumber) errs.accountNumber = 'Account number is required'
      if (formData.accountNumber !== formData.confirmAccountNumber) {
        errs.confirmAccountNumber = 'Account numbers do not match'
      }
      if (!formData.ifscCode || formData.ifscCode.length < 11) {
        errs.ifscCode = 'Enter a valid 11-character IFSC code'
      }
      if (!formData.accountHolderName?.trim()) {
        errs.accountHolderName = 'Account holder name is required'
      }
      if (!formData.password || formData.password.length < 8) {
        errs.password = 'Password must be at least 8 characters long'
      }
      if (formData.password !== formData.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match'
      }
      if (!formData.declarationConsent) {
        errs.declarationConsent = 'Please confirm the declaration before submitting'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {
        setCurrentStep((prev) => prev + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        // Complete registration
        setReferenceId(`KC-${Math.floor(100000 + Math.random() * 900000)}`)
        setSuccessDialogOpen(true)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* Top Navigation Bar */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 5 } }}>
          <Box
            component={RouterLink}
            to="/login"
            sx={{
              display: 'flex',
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="body2" sx={{ color: '#4b5563', display: { xs: 'none', sm: 'block' } }}>
              Already registered?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  color: '#2e7d32',
                  fontWeight: 700,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Sign In
              </Link>
            </Typography>

            {/* Language Selector */}
            <FormControl size="small">
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                startAdornment={<LanguageIcon sx={{ fontSize: 18, color: '#4b5563', mr: 0.5 }} />}
                sx={{
                  borderRadius: '20px',
                  backgroundColor: '#f3f4f6',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  '& .MuiSelect-select': { py: 0.7, pr: 3 },
                }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="hi">हिंदी (Hindi)</MenuItem>
                <MenuItem value="mr">मराठी (Marathi)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Registration Content Container */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 5 } }}>
        {/* Step Header: Title "Register" on left, Stepper indicator on right */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              color: '#1b5e20',
              fontSize: { xs: '1.75rem', md: '2.1rem' },
              letterSpacing: -0.5,
            }}
          >
            Register
          </Typography>

          <StepProgress currentStep={currentStep} totalSteps={4} />
        </Box>

        {/* User Type Selector (Visible on Step 1) */}
        {currentStep === 1 && (
          <UserTypeSelector userType={userType} onChange={setUserType} />
        )}

        {/* Step Component View */}
        <Box sx={{ mt: 3, mb: 6 }}>
          {currentStep === 1 && (
            <Step1RegistrationDetails
              formData={formData}
              updateFormData={updateFormData}
              userType={userType}
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <Step2IdentityAddress
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
            />
          )}

          {currentStep === 3 && (
            <Step3ContactDetails
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
            />
          )}

          {currentStep === 4 && (
            <Step4BankSecurity
              formData={formData}
              updateFormData={updateFormData}
              userType={userType}
              errors={errors}
            />
          )}
        </Box>

        {/* Bottom Actions Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: currentStep > 1 ? 'space-between' : 'flex-end',
            alignItems: 'center',
            pt: 3,
            pb: 4,
            borderTop: '1px solid #e5e7eb',
          }}
        >
          {currentStep > 1 && (
            <Button
              variant="outlined"
              onClick={handlePrevious}
              startIcon={<ArrowBackIcon />}
              sx={{
                px: 3.5,
                py: 1.1,
                borderColor: '#2e7d32',
                color: '#2e7d32',
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.95rem',
                '&:hover': {
                  borderColor: '#1b5e20',
                  backgroundColor: 'rgba(46, 125, 50, 0.05)',
                },
              }}
            >
              Previous
            </Button>
          )}

          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={currentStep < 4 ? <ArrowForwardIcon /> : undefined}
            sx={{
              px: 4.5,
              py: 1.2,
              backgroundColor: '#5b9a68',
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: '#2e7d32',
              },
            }}
          >
            {currentStep < 4 ? 'Next' : 'Submit Registration'}
          </Button>
        </Box>
      </Container>

      {/* Success Modal on Complete Registration */}
      <Dialog
        open={successDialogOpen}
        onClose={() => navigate('/login')}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2, textAlign: 'center' } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 64, mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1b5e20' }}>
            Registration Submitted Successfully!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: '#4b5563', mb: 2 }}>
            Thank you, <strong>{formData.firstName || 'User'}</strong>. Your application has been registered with{' '}
            <strong>{formData.apmc || 'APMC'}</strong> under KisanConnect / eNAM.
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', backgroundColor: '#f3f4f6', p: 2, borderRadius: 2 }}>
            <strong>Application Reference ID:</strong> {referenceId}
            <br />
            An acknowledgment has been prepared for your registered mobile number{' '}
            <strong>+91 {formData.mobileNumber}</strong>.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{
              backgroundColor: '#2e7d32',
              borderRadius: 2,
              px: 4,
              py: 1.2,
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#1b5e20' },
            }}
          >
            Proceed to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default RegisterPage
