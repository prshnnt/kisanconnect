import { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Stack,
  Grid,
  TextField,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import HomeIcon from '@mui/icons-material/Home'
import VerifiedIcon from '@mui/icons-material/Verified'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import StarIcon from '@mui/icons-material/Star'
import { profileApi } from '../../api/profile'
import { useAuth } from '../../context/AuthContext'

export function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [tab, setTab] = useState(0) // 0: Profile & Addresses, 1: Bank Accounts, 2: Trade Licenses
  const [loading, setLoading] = useState(true)

  // Profile Form
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Addresses State
  const [addresses, setAddresses] = useState([])

  // Bank Accounts State
  const [bankAccounts, setBankAccounts] = useState([])
  const [openAddBank, setOpenAddBank] = useState(false)
  const [accountName, setAccountName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifsc, setIfsc] = useState('')
  const [bankName, setBankName] = useState('')

  // Trade Licenses State
  const [licenses, setLicenses] = useState([])
  const [openAddLicense, setOpenAddLicense] = useState(false)
  const [licenseNumber, setLicenseNumber] = useState('')
  const [issuedBy, setIssuedBy] = useState('')
  const [expiresOn, setExpiresOn] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      if (user) {
        setFullName(user.full_name || '')
        setEmail(user.email || '')
      }
      const [addrRes, bankRes, licRes] = await Promise.allSettled([
        profileApi.listAddresses(),
        profileApi.listBankAccounts(),
        profileApi.listTradeLicenses(),
      ])
      if (addrRes.status === 'fulfilled') setAddresses(addrRes.value || [])
      if (bankRes.status === 'fulfilled') setBankAccounts(bankRes.value || [])
      if (licRes.status === 'fulfilled') setLicenses(licRes.value?.items || [])
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdateProfile = async () => {
    setSubmitting(true)
    try {
      await profileApi.patchProfile({ full_name: fullName })
      await refreshUser()
      setSuccessMessage('Profile updated successfully!')
    } catch (err) {
      setErrorMessage(err.message || 'Profile update failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddBank = async () => {
    if (!accountNumber || !ifsc) {
      setErrorMessage('Account Number and IFSC are required')
      return
    }
    setSubmitting(true)
    try {
      await profileApi.addBankAccount({
        account_name: accountName || fullName,
        account_number: accountNumber,
        ifsc,
        bank_name: bankName,
      })
      setSuccessMessage('Bank account added!')
      setOpenAddBank(false)
      loadData()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to add bank account')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMakePrimaryBank = async (id) => {
    try {
      await profileApi.makePrimaryBank(id)
      setSuccessMessage('Primary bank account updated!')
      loadData()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to set primary bank')
    }
  }

  const handleDeleteBank = async (id) => {
    try {
      await profileApi.deleteBankAccount(id)
      setSuccessMessage('Bank account removed.')
      loadData()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete bank account')
    }
  }

  const handleAddLicense = async () => {
    if (!licenseNumber) {
      setErrorMessage('License number is required')
      return
    }
    setSubmitting(true)
    try {
      await profileApi.addTradeLicense({
        number: licenseNumber,
        authority: issuedBy,
        expires_on: expiresOn || undefined,
      })
      setSuccessMessage('Trade license added!')
      setOpenAddLicense(false)
      loadData()
    } catch (err) {
      setErrorMessage(err.message || 'License creation failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
          <AccountCircleIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.dark">
              User Profile & Financial Accounts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage personal details, verified bank accounts for eNAM settlements, and APMC trade licenses.
            </Typography>
          </Box>
        </Stack>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<AccountCircleIcon />} iconPosition="start" label="Personal & Addresses" />
          <Tab icon={<AccountBalanceIcon />} iconPosition="start" label="Bank Accounts" />
          <Tab icon={<VerifiedIcon />} iconPosition="start" label="APMC Trade Licenses" />
        </Tabs>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress color="primary" />
          </Box>
        ) : tab === 0 ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Personal Information
              </Typography>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Mobile Number (Verified)"
                  value={user?.mobile || ''}
                  disabled
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  value={email}
                  disabled
                />
                <Button
                  variant="contained"
                  onClick={handleUpdateProfile}
                  disabled={submitting}
                  sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
                >
                  {submitting ? 'Saving...' : 'Update Details'}
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Registered Addresses
              </Typography>
              {addresses.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No addresses added yet. Add a farm or mandi delivery address.
                </Typography>
              ) : (
                addresses.map((a) => (
                  <Card key={a.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                      <HomeIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle2" fontWeight={700}>
                        {a.kind?.toUpperCase()} ADDRESS
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {a.line1}, {a.line2}
                    </Typography>
                  </Card>
                ))
              )}
            </Grid>
          </Grid>
        ) : tab === 1 ? (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={700}>
                Bank Accounts for Instant Settlement
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddBank(true)}>
                Add Bank Account
              </Button>
            </Stack>

            {bankAccounts.length === 0 ? (
              <Typography variant="body2" color="text.secondary" py={4} textAlign="center">
                No bank accounts registered. Add a bank account to receive eNAM trade proceeds!
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {bankAccounts.map((b) => (
                  <Grid item xs={12} sm={6} key={b.id}>
                    <Card
                      elevation={2}
                      sx={{
                        borderRadius: 3,
                        borderLeft: b.is_primary ? '6px solid #2e7d32' : '6px solid #ccc',
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {b.bank_name || 'Bank Account'}
                          </Typography>
                          {b.is_primary && (
                            <Chip label="PRIMARY" color="success" size="small" icon={<StarIcon />} />
                          )}
                        </Stack>

                        <Typography variant="h6" color="primary.dark" fontWeight={800} letterSpacing={1}>
                          {b.account_number}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          IFSC: {b.ifsc} | Account Name: {b.account_name}
                        </Typography>

                        <Stack direction="row" spacing={1} mt={2}>
                          {!b.is_primary && (
                            <Button size="small" variant="outlined" onClick={() => handleMakePrimaryBank(b.id)}>
                              Make Primary
                            </Button>
                          )}
                          <IconButton size="small" color="error" onClick={() => handleDeleteBank(b.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        ) : (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={700}>
                APMC Trade Licenses
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddLicense(true)}>
                Add Trade License
              </Button>
            </Stack>

            {licenses.length === 0 ? (
              <Typography variant="body2" color="text.secondary" py={4} textAlign="center">
                No APMC trade licenses added.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {licenses.map((l) => (
                  <Grid item xs={12} sm={6} key={l.id}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        License #{l.number}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Issued By: {l.authority || 'APMC Board'} | Expires: {l.expires_on || 'N/A'}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Paper>

      {/* Add Bank Modal */}
      <Dialog open={openAddBank} onClose={() => setOpenAddBank(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Bank Account</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField fullWidth size="small" label="Account Holder Name" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            <TextField fullWidth size="small" label="Bank Name" placeholder="e.g. State Bank of India" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            <TextField fullWidth size="small" label="Account Number" type="password" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            <TextField fullWidth size="small" label="IFSC Code" placeholder="e.g. SBIN0001234" value={ifsc} onChange={(e) => setIfsc(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddBank(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddBank} disabled={submitting}>
            {submitting ? 'Saving...' : 'Add Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add License Modal */}
      <Dialog open={openAddLicense} onClose={() => setOpenAddLicense(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add APMC Trade License</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField fullWidth size="small" label="License Number" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
            <TextField fullWidth size="small" label="Issuing Authority / APMC" value={issuedBy} onChange={(e) => setIssuedBy(e.target.value)} />
            <TextField fullWidth size="small" label="Expiry Date" type="date" InputLabelProps={{ shrink: true }} value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddLicense(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddLicense} disabled={submitting}>
            {submitting ? 'Saving...' : 'Add License'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProfilePage
