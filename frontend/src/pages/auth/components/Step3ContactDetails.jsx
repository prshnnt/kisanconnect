import {
  Box,
  Typography,
  Divider,
  TextField,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  InputAdornment,
} from '@mui/material'
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'

function Step3ContactDetails({ formData, updateFormData, errors = {} }) {
  const renderLabel = (label, required = false) => (
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
      {label} {required && <span style={{ color: '#d32f2f' }}>*</span>}
    </Typography>
  )

  return (
    <Box sx={{ width: '100%', maxWidth: 720 }}>
      {/* Section Header */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: '#111827',
          mb: 1.5,
          fontSize: '1.15rem',
        }}
      >
        Contact Details
      </Typography>
      <Divider sx={{ mb: 3.5, borderColor: '#e5e7eb' }} />

      {/* Mobile Number */}
      <Box sx={{ mb: 3 }}>
        {renderLabel('Mobile Number', true)}
        <TextField
          fullWidth
          placeholder="Enter 10-digit mobile number"
          value={formData.mobileNumber || ''}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 10)
            updateFormData({ mobileNumber: val })
          }}
          error={Boolean(errors.mobileNumber)}
          helperText={errors.mobileNumber || 'A verification OTP can be sent to this number.'}
          size="medium"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIphoneOutlinedIcon sx={{ color: '#9ca3af', fontSize: 20, mr: 0.5 }} />
                <Typography sx={{ color: '#4b5563', fontWeight: 600, fontSize: '0.9rem', pr: 0.5 }}>
                  +91
                </Typography>
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 460,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
              backgroundColor: '#ffffff',
            },
          }}
        />
      </Box>

      {/* Email ID */}
      <Box sx={{ mb: 4 }}>
        {renderLabel('Email ID')}
        <TextField
          fullWidth
          type="email"
          placeholder="Enter your email address"
          value={formData.emailId || ''}
          onChange={(e) => updateFormData({ emailId: e.target.value })}
          error={Boolean(errors.emailId)}
          helperText={errors.emailId}
          size="medium"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlinedIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 460,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
              backgroundColor: '#ffffff',
            },
          }}
        />
      </Box>

      {/* Consent Checkbox */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(formData.communicationConsent)}
              onChange={(e) => updateFormData({ communicationConsent: e.target.checked })}
              sx={{
                color: '#2e7d32',
                alignSelf: 'flex-start',
                mt: -0.5,
                '&.Mui-checked': { color: '#2e7d32' },
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: '0.92rem', color: '#1f2937', lineHeight: 1.5 }}>
              I agree to receive process related communications related to my eNAM registration and
              updates on the provided Mobile Number and Email ID.
            </Typography>
          }
        />
        {errors.communicationConsent && (
          <FormHelperText error sx={{ ml: 4, mt: 0.5 }}>
            {errors.communicationConsent}
          </FormHelperText>
        )}
      </Box>
    </Box>
  )
}

export default Step3ContactDetails
