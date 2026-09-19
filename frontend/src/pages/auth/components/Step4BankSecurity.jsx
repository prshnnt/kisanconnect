import { useState } from 'react'
import {
  Box,
  Typography,
  Divider,
  Grid,
  TextField,
  Paper,
  Chip,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

function Step4BankSecurity({ formData, updateFormData, userType, errors = {} }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
    <Box sx={{ width: '100%' }}>
      {/* 1. BANK DETAILS */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: '#111827',
          mb: 1.5,
          fontSize: '1.15rem',
        }}
      >
        Bank Account Details
      </Typography>
      <Divider sx={{ mb: 3, borderColor: '#e5e7eb' }} />

      <Grid container spacing={2.5} sx={{ mb: 4.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('Bank Account Number', true)}
          <TextField
            fullWidth
            placeholder="Enter Bank Account Number"
            value={formData.accountNumber || ''}
            onChange={(e) => updateFormData({ accountNumber: e.target.value.replace(/\D/g, '') })}
            error={Boolean(errors.accountNumber)}
            helperText={errors.accountNumber}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountBalanceOutlinedIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('Confirm Account Number', true)}
          <TextField
            fullWidth
            placeholder="Re-enter Bank Account Number"
            value={formData.confirmAccountNumber || ''}
            onChange={(e) => updateFormData({ confirmAccountNumber: e.target.value.replace(/\D/g, '') })}
            error={Boolean(errors.confirmAccountNumber)}
            helperText={errors.confirmAccountNumber}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('IFSC Code', true)}
          <TextField
            fullWidth
            placeholder="e.g. SBIN0001234"
            value={formData.ifscCode || ''}
            onChange={(e) => updateFormData({ ifscCode: e.target.value.toUpperCase() })}
            error={Boolean(errors.ifscCode)}
            helperText={errors.ifscCode}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('Bank & Branch Name')}
          <TextField
            fullWidth
            placeholder="e.g. State Bank of India, Main Branch"
            value={formData.bankName || ''}
            onChange={(e) => updateFormData({ bankName: e.target.value })}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('Account Holder Name', true)}
          <TextField
            fullWidth
            placeholder="As appears on bank records"
            value={formData.accountHolderName || ''}
            onChange={(e) => updateFormData({ accountHolderName: e.target.value })}
            error={Boolean(errors.accountHolderName)}
            helperText={errors.accountHolderName}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>
      </Grid>

      {/* 2. SECURITY CREDENTIALS */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: '#111827',
          mb: 1.5,
          fontSize: '1.15rem',
        }}
      >
        Security & Password
      </Typography>
      <Divider sx={{ mb: 3, borderColor: '#e5e7eb' }} />

      <Grid container spacing={2.5} sx={{ mb: 4.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('Create Password', true)}
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter at least 8 characters"
            value={formData.password || ''}
            onChange={(e) => updateFormData({ password: e.target.value })}
            error={Boolean(errors.password)}
            helperText={errors.password}
            size="small"
            InputProps={{
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
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('Confirm Password', true)}
          <TextField
            fullWidth
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter password"
            value={formData.confirmPassword || ''}
            onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>
      </Grid>

      {/* 3. APPLICATION SUMMARY CARD */}
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          mb: 3.5,
          borderRadius: 2,
          backgroundColor: '#f9fafb',
          borderColor: '#e5e7eb',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 22 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>
            Registration Summary
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
              User Type
            </Typography>
            <Chip
              label={userType === 'institutional' ? 'Institutional User' : 'Individual User'}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600, mt: 0.3 }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
              Role Type
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>
              {formData.registrationType || 'Not specified'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
              Full Name
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>
              {`${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'N/A'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
              APMC & State
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>
              {formData.apmc ? `${formData.apmc}, ${formData.state}` : 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Declaration Checkbox */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(formData.declarationConsent)}
              onChange={(e) => updateFormData({ declarationConsent: e.target.checked })}
              sx={{
                color: '#2e7d32',
                alignSelf: 'flex-start',
                mt: -0.5,
                '&.Mui-checked': { color: '#2e7d32' },
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: '0.9rem', color: '#1f2937', lineHeight: 1.5 }}>
              I hereby declare that the particulars given above are true and complete to the best of my
              knowledge, and I agree to abide by the eNAM platform terms, rules, and guidelines.
            </Typography>
          }
        />
        {errors.declarationConsent && (
          <FormHelperText error sx={{ ml: 4, mt: 0.5 }}>
            {errors.declarationConsent}
          </FormHelperText>
        )}
      </Box>
    </Box>
  )
}

export default Step4BankSecurity
