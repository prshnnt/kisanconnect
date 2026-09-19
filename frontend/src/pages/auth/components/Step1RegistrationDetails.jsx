import {
  Box,
  Typography,
  Divider,
  Grid,
  FormControl,
  Select,
  MenuItem,
  TextField,
  FormHelperText,
} from '@mui/material'
import { INDIAN_STATES, STATE_APMCS } from '../../../data/mockLocations'

const REGISTRATION_TYPES = [
  'Buyer',
  'Seller',
  'Commission Agent',
  'Service Provider',
]

function Step1RegistrationDetails({ formData, updateFormData, userType, errors = {} }) {
  const availableApmcs = formData.state ? STATE_APMCS[formData.state] || [] : []

  return (
    <Box sx={{ width: '100%' }}>
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
        Registration Details
      </Typography>
      <Divider sx={{ mb: 3, borderColor: '#e5e7eb' }} />

      {/* If Institutional User, show Organization / Institution Name */}
      {userType === 'institutional' && (
        <Box sx={{ mb: 3 }}>
          <Typography
            component="label"
            sx={{
              display: 'block',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: '#1f2937',
              mb: 0.8,
            }}
          >
            Institution / Firm Name *
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter registered organization or company name"
            value={formData.institutionName || ''}
            onChange={(e) => updateFormData({ institutionName: e.target.value })}
            error={Boolean(errors.institutionName)}
            helperText={errors.institutionName}
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#ffffff',
              },
            }}
          />
        </Box>
      )}

      {/* Registration Type Dropdown */}
      <Box sx={{ mb: 3.5 }}>
        <Typography
          component="label"
          sx={{
            display: 'block',
            fontWeight: 600,
            fontSize: '0.9rem',
            color: '#1f2937',
            mb: 0.8,
          }}
        >
          Registration Type*
        </Typography>
        <FormControl fullWidth error={Boolean(errors.registrationType)}>
          <Select
            displayEmpty
            value={formData.registrationType || ''}
            onChange={(e) => updateFormData({ registrationType: e.target.value })}
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <Typography sx={{ color: '#9ca3af', fontSize: '0.95rem' }}>
                    Select Registration Type
                  </Typography>
                )
              }
              return selected
            }}
            sx={{
              borderRadius: 2,
              backgroundColor: '#ffffff',
              '& .MuiSelect-select': {
                py: 1.5,
              },
            }}
          >
            <MenuItem value="" disabled>
              <em>Select Registration Type</em>
            </MenuItem>
            {REGISTRATION_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
          {errors.registrationType && (
            <FormHelperText>{errors.registrationType}</FormHelperText>
          )}
        </FormControl>
      </Box>

      {/* State and APMC Row */}
      <Grid container spacing={3}>
        {/* Registered State */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography
            component="label"
            sx={{
              display: 'block',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: '#1f2937',
              mb: 0.8,
            }}
          >
            Registered State *
          </Typography>
          <FormControl fullWidth error={Boolean(errors.state)}>
            <Select
              displayEmpty
              value={formData.state || ''}
              onChange={(e) => {
                updateFormData({
                  state: e.target.value,
                  apmc: '', // Reset APMC when state changes
                })
              }}
              renderValue={(selected) => {
                if (!selected) {
                  return (
                    <Typography sx={{ color: '#9ca3af', fontSize: '0.95rem' }}>
                      Select State
                    </Typography>
                  )
                }
                return selected
              }}
              sx={{
                borderRadius: 2,
                backgroundColor: '#ffffff',
                '& .MuiSelect-select': {
                  py: 1.5,
                },
              }}
            >
              <MenuItem value="" disabled>
                <em>Select State</em>
              </MenuItem>
              {INDIAN_STATES.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Select>
            {errors.state && <FormHelperText>{errors.state}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* Registered APMC */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography
            component="label"
            sx={{
              display: 'block',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: '#1f2937',
              mb: 0.8,
            }}
          >
            Registered APMC *
          </Typography>
          <FormControl fullWidth error={Boolean(errors.apmc)} disabled={!formData.state}>
            <Select
              displayEmpty
              value={formData.apmc || ''}
              onChange={(e) => updateFormData({ apmc: e.target.value })}
              renderValue={(selected) => {
                if (!selected) {
                  return (
                    <Typography sx={{ color: '#9ca3af', fontSize: '0.95rem' }}>
                      Select APMC
                    </Typography>
                  )
                }
                return selected
              }}
              sx={{
                borderRadius: 2,
                backgroundColor: '#ffffff',
                '& .MuiSelect-select': {
                  py: 1.5,
                },
              }}
            >
              <MenuItem value="" disabled>
                <em>{formData.state ? 'Select APMC' : 'Please select state first'}</em>
              </MenuItem>
              {availableApmcs.map((apmc) => (
                <MenuItem key={apmc} value={apmc}>
                  {apmc}
                </MenuItem>
              ))}
            </Select>
            {errors.apmc && <FormHelperText>{errors.apmc}</FormHelperText>}
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Step1RegistrationDetails
