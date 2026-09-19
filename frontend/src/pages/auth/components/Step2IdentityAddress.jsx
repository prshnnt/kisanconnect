import {
  Box,
  Typography,
  Divider,
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormHelperText,
} from '@mui/material'
import { INDIAN_STATES, STATE_DISTRICTS } from '../../../data/mockLocations'

const GENDERS = ['Male', 'Female', 'Other']

function Step2IdentityAddress({ formData, updateFormData, errors = {} }) {
  const permDistricts = formData.permanentState ? STATE_DISTRICTS[formData.permanentState] || [] : []
  const selectedPermDistrictObj = permDistricts.find((d) => d.name === formData.permanentDistrict)
  const permTehsils = selectedPermDistrictObj ? selectedPermDistrictObj.tehsils : []

  const currDistricts = formData.currentState ? STATE_DISTRICTS[formData.currentState] || [] : []
  const selectedCurrDistrictObj = currDistricts.find((d) => d.name === formData.currentDistrict)
  const currTehsils = selectedCurrDistrictObj ? selectedCurrDistrictObj.tehsils : []

  const handleSameAsPermanentToggle = (e) => {
    const isChecked = e.target.checked
    if (isChecked) {
      updateFormData({
        sameAsPermanent: true,
        currentAddressLine1: formData.permanentAddressLine1 || '',
        currentAddressLine2: formData.permanentAddressLine2 || '',
        currentPincode: formData.permanentPincode || '',
        currentState: formData.permanentState || '',
        currentDistrict: formData.permanentDistrict || '',
        currentTehsil: formData.permanentTehsil || '',
        currentCity: formData.permanentCity || '',
      })
    } else {
      updateFormData({ sameAsPermanent: false })
    }
  }

  // Update permanent address field and sync if sameAsPermanent is checked
  const handlePermChange = (field, value) => {
    const updates = { [field]: value }
    if (formData.sameAsPermanent) {
      const currentMap = {
        permanentAddressLine1: 'currentAddressLine1',
        permanentAddressLine2: 'currentAddressLine2',
        permanentPincode: 'currentPincode',
        permanentState: 'currentState',
        permanentDistrict: 'currentDistrict',
        permanentTehsil: 'currentTehsil',
        permanentCity: 'currentCity',
      }
      if (currentMap[field]) {
        updates[currentMap[field]] = value
      }
    }
    updateFormData(updates)
  }

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
      {/* 1. IDENTITY VERIFICATION */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: '#111827',
          mb: 1.5,
          fontSize: '1.15rem',
        }}
      >
        Identity Verification
      </Typography>
      <Divider sx={{ mb: 3, borderColor: '#e5e7eb' }} />

      <Grid container spacing={2.5} sx={{ mb: 4.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('First Name', true)}
          <TextField
            fullWidth
            placeholder="Enter First Name"
            value={formData.firstName || ''}
            onChange={(e) => updateFormData({ firstName: e.target.value })}
            error={Boolean(errors.firstName)}
            helperText={errors.firstName}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('Middle Name')}
          <TextField
            fullWidth
            placeholder="Enter Middle Name"
            value={formData.middleName || ''}
            onChange={(e) => updateFormData({ middleName: e.target.value })}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('Last Name', true)}
          <TextField
            fullWidth
            placeholder="Enter Last Name"
            value={formData.lastName || ''}
            onChange={(e) => updateFormData({ lastName: e.target.value })}
            error={Boolean(errors.lastName)}
            helperText={errors.lastName}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('S/o, D/o, W/o')}
          <TextField
            fullWidth
            placeholder="Enter Name"
            value={formData.relationshipName || ''}
            onChange={(e) => updateFormData({ relationshipName: e.target.value })}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('Date of Birth')}
          <TextField
            fullWidth
            type="date"
            value={formData.dateOfBirth || ''}
            onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('Gender')}
          <FormControl fullWidth size="small">
            <Select
              displayEmpty
              value={formData.gender || ''}
              onChange={(e) => updateFormData({ gender: e.target.value })}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#9ca3af' }}>Select Gender</span>
                }
                return selected
              }}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="" disabled>
                <em>Select Gender</em>
              </MenuItem>
              {GENDERS.map((g) => (
                <MenuItem key={g} value={g}>
                  {g}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* 2. PERMANENT ADDRESS */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: '#111827',
          mb: 1.5,
          fontSize: '1.15rem',
        }}
      >
        Permanent Address
      </Typography>
      <Divider sx={{ mb: 3, borderColor: '#e5e7eb' }} />

      <Grid container spacing={2.5} sx={{ mb: 4.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('Address Line 1', true)}
          <TextField
            fullWidth
            placeholder="Enter Address Line 1"
            value={formData.permanentAddressLine1 || ''}
            onChange={(e) => handlePermChange('permanentAddressLine1', e.target.value)}
            error={Boolean(errors.permanentAddressLine1)}
            helperText={errors.permanentAddressLine1}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('Address Line 2')}
          <TextField
            fullWidth
            placeholder="Enter Address Line 2"
            value={formData.permanentAddressLine2 || ''}
            onChange={(e) => handlePermChange('permanentAddressLine2', e.target.value)}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          {renderLabel('Pincode')}
          <TextField
            fullWidth
            placeholder="Enter 6-digit Pincode"
            value={formData.permanentPincode || ''}
            onChange={(e) => handlePermChange('permanentPincode', e.target.value)}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('State', true)}
          <FormControl fullWidth size="small" error={Boolean(errors.permanentState)}>
            <Select
              displayEmpty
              value={formData.permanentState || ''}
              onChange={(e) => {
                handlePermChange('permanentState', e.target.value)
                handlePermChange('permanentDistrict', '')
                handlePermChange('permanentTehsil', '')
              }}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#9ca3af' }}>Select State</span>
                }
                return selected
              }}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="" disabled>
                <em>Select State</em>
              </MenuItem>
              {INDIAN_STATES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
            {errors.permanentState && (
              <FormHelperText>{errors.permanentState}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('District', true)}
          <FormControl fullWidth size="small" disabled={!formData.permanentState}>
            <Select
              displayEmpty
              value={formData.permanentDistrict || ''}
              onChange={(e) => {
                handlePermChange('permanentDistrict', e.target.value)
                handlePermChange('permanentTehsil', '')
              }}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#9ca3af' }}>Select District</span>
                }
                return selected
              }}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="" disabled>
                <em>Select District</em>
              </MenuItem>
              {permDistricts.map((d) => (
                <MenuItem key={d.name} value={d.name}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('Tehsil')}
          <FormControl fullWidth size="small" disabled={!formData.permanentDistrict}>
            <Select
              displayEmpty
              value={formData.permanentTehsil || ''}
              onChange={(e) => handlePermChange('permanentTehsil', e.target.value)}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#9ca3af' }}>Select Tehsil</span>
                }
                return selected
              }}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="" disabled>
                <em>Select Tehsil</em>
              </MenuItem>
              {permTehsils.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('City/Village')}
          <TextField
            fullWidth
            placeholder="Select City"
            value={formData.permanentCity || ''}
            onChange={(e) => handlePermChange('permanentCity', e.target.value)}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>
      </Grid>

      {/* 3. CURRENT ADDRESS */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#111827',
            fontSize: '1.15rem',
          }}
        >
          Current Address
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(formData.sameAsPermanent)}
              onChange={handleSameAsPermanentToggle}
              sx={{
                color: '#2e7d32',
                '&.Mui-checked': { color: '#2e7d32' },
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#374151' }}>
              Same as Permanent Address
            </Typography>
          }
        />
      </Box>
      <Divider sx={{ mb: 3, borderColor: '#e5e7eb' }} />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('Address Line 1', true)}
          <TextField
            fullWidth
            placeholder="Enter Address Line 1"
            value={formData.currentAddressLine1 || ''}
            onChange={(e) => updateFormData({ currentAddressLine1: e.target.value })}
            disabled={formData.sameAsPermanent}
            error={Boolean(errors.currentAddressLine1)}
            helperText={errors.currentAddressLine1}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('Address Line 2')}
          <TextField
            fullWidth
            placeholder="Enter Address Line 2"
            value={formData.currentAddressLine2 || ''}
            onChange={(e) => updateFormData({ currentAddressLine2: e.target.value })}
            disabled={formData.sameAsPermanent}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          {renderLabel('Pincode')}
          <TextField
            fullWidth
            placeholder="Enter 6-digit Pincode"
            value={formData.currentPincode || ''}
            onChange={(e) => updateFormData({ currentPincode: e.target.value })}
            disabled={formData.sameAsPermanent}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('State')}
          <FormControl fullWidth size="small" disabled={formData.sameAsPermanent}>
            <Select
              displayEmpty
              value={formData.currentState || ''}
              onChange={(e) => {
                updateFormData({
                  currentState: e.target.value,
                  currentDistrict: '',
                  currentTehsil: '',
                })
              }}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#9ca3af' }}>Select State</span>
                }
                return selected
              }}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="" disabled>
                <em>Select State</em>
              </MenuItem>
              {INDIAN_STATES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('District')}
          <FormControl
            fullWidth
            size="small"
            disabled={formData.sameAsPermanent || !formData.currentState}
          >
            <Select
              displayEmpty
              value={formData.currentDistrict || ''}
              onChange={(e) => {
                updateFormData({
                  currentDistrict: e.target.value,
                  currentTehsil: '',
                })
              }}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#9ca3af' }}>Select District</span>
                }
                return selected
              }}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="" disabled>
                <em>Select District</em>
              </MenuItem>
              {currDistricts.map((d) => (
                <MenuItem key={d.name} value={d.name}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('Tehsil')}
          <FormControl
            fullWidth
            size="small"
            disabled={formData.sameAsPermanent || !formData.currentDistrict}
          >
            <Select
              displayEmpty
              value={formData.currentTehsil || ''}
              onChange={(e) => updateFormData({ currentTehsil: e.target.value })}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#9ca3af' }}>Select Tehsil</span>
                }
                return selected
              }}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="" disabled>
                <em>Select Tehsil</em>
              </MenuItem>
              {currTehsils.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderLabel('City/Village')}
          <TextField
            fullWidth
            placeholder="Select City"
            value={formData.currentCity || ''}
            onChange={(e) => updateFormData({ currentCity: e.target.value })}
            disabled={formData.sameAsPermanent}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default Step2IdentityAddress
