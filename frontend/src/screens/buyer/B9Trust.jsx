import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import DescriptionIcon from '@mui/icons-material/Description'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useLang } from '../../contexts/LanguageContext.jsx'
import TopBar from '../../components/TopBar.jsx'
import VerifiedBadge from '../../components/VerifiedBadge.jsx'
import TrustMeter from '../../components/TrustMeter.jsx'

const LICENCES = [
  { id: 1, name: 'APMC Trade Licence', nameHi: 'APMC व्यापार लाइसेंस', status: 'expiring', expires: '12 days' },
  { id: 2, name: 'GST Registration', nameHi: 'GST पंजीकरण', status: 'valid', expires: '9 months' },
  { id: 3, name: 'Warehouse Receipt Licence', nameHi: 'गोदाम रसीद लाइसेंस', status: 'valid', expires: '6 months' },
]

export default function B9Trust() {
  const { lang } = useLang()
  const [licences, setLicences] = useState(LICENCES)
  const [renewed, setRenewed] = useState(false)
  const [addDocOpen, setAddDocOpen] = useState(false)
  const [newDocName, setNewDocName] = useState('')

  function renewExpiring() {
    setLicences(prev => prev.map(l => l.status === 'expiring' ? { ...l, status: 'valid', expires: '12 months' } : l))
    setRenewed(true)
  }

  function addDocument() {
    if (!newDocName) return
    setLicences(prev => [...prev, { id: Date.now(), name: newDocName, nameHi: newDocName, status: 'valid', expires: '12 months' }])
    setNewDocName('')
    setAddDocOpen(false)
  }

  return (
    <Box sx={{ bgcolor: '#FFFBF5', minHeight: '100vh' }}>
      <TopBar title={lang === 'hi' ? 'भरोसा और सत्यापन' : 'Trust & verification'} />

      <Box sx={{ px: 2, py: 2 }}>
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <VerifiedBadge size="large" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {lang === 'hi' ? 'सत्यापित खरीदार' : 'Verified buyer'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
              {lang === 'hi' ? 'व्यापार लाइसेंस दस्तावेज़ सत्यापित' : 'Trade licence documents verified'}
            </Typography>
            <TrustMeter score={4} lang={lang} />
            <Typography variant="caption" sx={{ color: '#6B7280', mt: 1, display: 'block' }}>
              {lang === 'hi' ? 'समय पर भुगतान स्कोर · 47 सौदे' : 'Pays-on-time score · based on 47 deals'}
            </Typography>
          </CardContent>
        </Card>

        {!renewed && (
          <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2, borderRadius: 2 }}>
            {lang === 'hi'
              ? 'आपका APMC व्यापार लाइसेंस 12 दिनों में समाप्त होगा। नवीनीकरण करें ताकि आप ऑफर देना जारी रख सकें।'
              : 'Your APMC trade licence expires in 12 days. Renew it to keep making offers.'}
          </Alert>
        )}
        {renewed && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {lang === 'hi' ? 'लाइसेंस सफलतापूर्वक नवीनीकृत हो गया।' : 'Licence renewed successfully.'}
          </Alert>
        )}

        <Typography variant="body1" sx={{ fontWeight: 700, mb: 1 }}>
          {lang === 'hi' ? 'लाइसेंस और दस्तावेज़' : 'Licences & documents'}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          {licences.map(lic => (
            <Card key={lic.id} sx={{ cursor: 'pointer' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <DescriptionIcon sx={{ color: '#6B7280' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {lang === 'hi' ? lic.nameHi : lic.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {lic.status === 'valid'
                      ? <CheckCircleIcon sx={{ fontSize: 14, color: '#15803D' }} />
                      : <WarningAmberIcon sx={{ fontSize: 14, color: '#B45309' }} />}
                    <Typography variant="caption" sx={{ color: lic.status === 'valid' ? '#15803D' : '#B45309' }}>
                      {lang === 'hi'
                        ? `${lic.expires} में समाप्त`
                        : `Expires in ${lic.expires}`}
                    </Typography>
                  </Box>
                </Box>
                <ChevronRightIcon sx={{ color: '#9CA3AF' }} />
              </CardContent>
            </Card>
          ))}
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ height: 56, mb: 1.5 }}
          disabled={renewed}
          onClick={renewExpiring}
        >
          {renewed
            ? (lang === 'hi' ? '✓ नवीनीकृत' : '✓ Renewed')
            : (lang === 'hi' ? 'लाइसेंस नवीनीकृत करें' : 'Renew licence')}
        </Button>
        <Button variant="outlined" fullWidth sx={{ height: 56 }} onClick={() => setAddDocOpen(true)}>
          {lang === 'hi' ? 'नया दस्तावेज़ जोड़ें' : 'Add new document'}
        </Button>
      </Box>

      <Dialog open={addDocOpen} onClose={() => setAddDocOpen(false)} PaperProps={{ sx: { borderRadius: 3, mx: 2, maxWidth: 358 } }}>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            {lang === 'hi' ? 'नया दस्तावेज़ जोड़ें' : 'Add new document'}
          </Typography>
          <TextField
            label={lang === 'hi' ? 'दस्तावेज़ का नाम' : 'Document name'}
            value={newDocName}
            onChange={e => setNewDocName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setAddDocOpen(false)} variant="outlined" fullWidth>
            {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
          </Button>
          <Button onClick={addDocument} variant="contained" color="primary" fullWidth disabled={!newDocName}>
            {lang === 'hi' ? 'जोड़ें' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
