import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import InputAdornment from '@mui/material/InputAdornment'
import Avatar from '@mui/material/Avatar'
import SearchIcon from '@mui/icons-material/Search'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { useLang } from '../../contexts/LanguageContext.jsx'
import TopBar from '../../components/TopBar.jsx'
import { formatINR } from '../../utils/format.js'

const MOCK_FARMERS = [
  { id: 1, name: 'Ramesh Kumar', village: 'Barabanki', lots: 3, balance: 12400, owesMe: true },
  { id: 2, name: 'Suresh Yadav', village: 'Lucknow', lots: 1, balance: -3200, owesMe: false },
  { id: 3, name: 'Mohan Singh', village: 'Sitapur', lots: 5, balance: 8900, owesMe: true },
]

export default function A2Farmers() {
  const { lang } = useLang()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [invited, setInvited] = useState(false)

  const filtered = MOCK_FARMERS.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.village.toLowerCase().includes(search.toLowerCase()))

  function sendInvite() {
    setInvited(true)
  }

  function closeAddFlow() {
    setAddOpen(false)
    setInvited(false)
    setPhone('')
  }

  return (
    <Box sx={{ bgcolor: '#FFFBF5', minHeight: '100vh' }}>
      <TopBar title={lang === 'hi' ? 'किसान' : 'Farmers'} />
      <Box sx={{ px: 2, py: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            placeholder={lang === 'hi' ? 'किसान खोजें...' : 'Search farmers...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF' }} /></InputAdornment> }}
            sx={{ flex: 1 }}
          />
          <Button variant="contained" color="primary" onClick={() => setAddOpen(true)} sx={{ height: 56, minWidth: 56, px: 0 }}>
            <PersonAddIcon />
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map(f => (
            <Card key={f.id} sx={{ cursor: 'pointer' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Avatar sx={{ bgcolor: '#F5A524', color: '#1F2937', fontWeight: 700 }}>{f.name[0]}</Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{f.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>{f.village} · {f.lots} lots</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: f.owesMe ? '#15803D' : '#1D4ED8' }}>
                    {f.owesMe ? '+' : '−'}{formatINR(Math.abs(f.balance))}
                  </Typography>
                  <Typography variant="caption" sx={{ color: f.owesMe ? '#15803D' : '#1D4ED8' }}>
                    {f.owesMe
                      ? (lang === 'hi' ? 'वे देते हैं' : 'They owe me')
                      : (lang === 'hi' ? 'मैं देता हूँ' : 'I owe them')
                    }
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      <Dialog open={addOpen && !invited} onClose={() => setAddOpen(false)} PaperProps={{ sx: { borderRadius: 3, mx: 2, maxWidth: 358 } }}>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            {lang === 'hi' ? 'किसान जोड़ें' : 'Add farmer'}
          </Typography>
          <TextField
            label={lang === 'hi' ? 'मोबाइल नंबर' : 'Mobile number'}
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            inputProps={{ inputMode: 'numeric' }}
            InputProps={{ startAdornment: <InputAdornment position="start">+91</InputAdornment> }}
            fullWidth
          />
          <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mt: 1 }}>
            {lang === 'hi' ? 'किसान को SMS से आमंत्रण मिलेगा' : 'Farmer will receive an SMS invite'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setAddOpen(false)} variant="outlined" fullWidth>{lang === 'hi' ? 'रद्द' : 'Cancel'}</Button>
          <Button onClick={sendInvite} variant="contained" color="primary" fullWidth disabled={phone.length !== 10}>{lang === 'hi' ? 'SMS भेजें' : 'Send SMS'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={invited} PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {lang === 'hi' ? '✓ आमंत्रण भेजा गया' : '✓ Invite sent'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
            +91 {phone}
          </Typography>
          <Button variant="contained" color="primary" fullWidth onClick={closeAddFlow}>
            {lang === 'hi' ? 'ठीक है' : 'Done'}
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
