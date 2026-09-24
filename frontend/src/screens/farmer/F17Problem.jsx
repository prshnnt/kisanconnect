import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import ScaleIcon from '@mui/icons-material/Scale'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import MicIcon from '@mui/icons-material/Mic'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../contexts/LanguageContext.jsx'
import TopBar from '../../components/TopBar.jsx'

const PROBLEM_TYPES = [
  { id: 'weight', icon: ScaleIcon, hi: 'वजन गलत है', en: 'Weight is wrong' },
  { id: 'quality', icon: StarBorderIcon, hi: 'गुणवत्ता विवाद', en: 'Quality dispute' },
  { id: 'payment', icon: AccessTimeIcon, hi: 'भुगतान देर से', en: 'Payment is late' },
  { id: 'noshow', icon: DirectionsCarIcon, hi: 'खरीदार नहीं आया', en: 'Buyer did not come' },
  { id: 'other', icon: MoreHorizIcon, hi: 'कुछ और', en: 'Something else' },
]

export default function F17Problem() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const [problemType, setProblemType] = useState(null)
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState([])
  const [submitted, setSubmitted] = useState(false)

  return (
    <Box sx={{ bgcolor: '#FFFBF5', minHeight: '100vh' }}>
      <TopBar title={lang === 'hi' ? 'समस्या रिपोर्ट करें' : 'Report a problem'} />

      <Box sx={{ px: 2, py: 2, pb: 12 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {lang === 'hi' ? 'क्या समस्या है?' : 'What is the problem?'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
          {lang === 'hi' ? 'सौदा: गेहूं – Green Mills Ltd · sample' : 'Deal: Wheat – Green Mills Ltd · sample'}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3 }}>
          {PROBLEM_TYPES.map(pt => {
            const Icon = pt.icon
            const isSelected = problemType === pt.id
            return (
              <Card
                key={pt.id}
                sx={{ border: `2px solid ${isSelected ? '#B91C1C' : '#E5E7EB'}`, bgcolor: isSelected ? '#FEF2F2' : '#FFFFFF', cursor: 'pointer', ...(pt.id === 'other' ? { gridColumn: '1 / -1' } : {}) }}
                onClick={() => setProblemType(pt.id)}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Icon sx={{ color: isSelected ? '#B91C1C' : '#6B7280', fontSize: 24 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {lang === 'hi' ? pt.hi : pt.en}
                  </Typography>
                </CardContent>
              </Card>
            )
          })}
        </Box>

        {problemType && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              multiline
              rows={3}
              label={lang === 'hi' ? 'विवरण (वैकल्पिक)' : 'Description (optional)'}
              value={description}
              onChange={e => setDescription(e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end"><MicIcon sx={{ color: '#3730A3', cursor: 'pointer', alignSelf: 'flex-end', mb: 1 }} /></InputAdornment> }}
            />

            {/* Photos */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                {lang === 'hi' ? `फ़ोटो जोड़ें (${photos.length}/3)` : `Add photos (${photos.length}/3)`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {photos.map((_, i) => (
                  <Box key={i} sx={{ width: 72, height: 72, bgcolor: '#F3F4F6', borderRadius: 2 }} />
                ))}
                {photos.length < 3 && (
                  <Box
                    sx={{ width: 72, height: 72, border: '2px dashed #E5E7EB', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    onClick={() => setPhotos([...photos, null])}
                  >
                    <CameraAltIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                  </Box>
                )}
              </Box>
            </Box>

            {/* Voice note */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: '#F3F4F6', borderRadius: 2, cursor: 'pointer' }}>
              <Box sx={{ width: 44, height: 44, bgcolor: '#3730A3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MicIcon sx={{ color: '#FFFFFF', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {lang === 'hi' ? '30 सेकंड की आवाज़ रिकॉर्ड करें' : 'Record a 30-second voice note'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  {lang === 'hi' ? 'टैप करें और बोलें' : 'Tap and speak'}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, p: 2, bgcolor: '#FFFBF5', borderTop: '1px solid #F3E8D0', boxShadow: '0 -4px 12px rgba(0,0,0,0.06)', zIndex: 1100 }}>
        <Button
          variant="contained"
          color="error"
          fullWidth
          size="large"
          disabled={!problemType}
          onClick={() => setSubmitted(true)}
          sx={{ bgcolor: '#B91C1C' }}
        >
          {lang === 'hi' ? 'शिकायत दर्ज करें' : 'Submit complaint'}
        </Button>
      </Box>

      <Dialog open={submitted} PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: '#3730A3', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {lang === 'hi' ? 'शिकायत दर्ज हो गई' : 'Complaint registered'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
            {lang === 'hi' ? 'केस नंबर: #482' : 'Case #482'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
            {lang === 'hi' ? 'कल शाम तक जवाब मिलेगा' : 'We will reply by tomorrow evening'}
          </Typography>
          <Button variant="contained" color="primary" fullWidth onClick={() => navigate('/farmer/deals')}>
            {lang === 'hi' ? 'ठीक है' : 'OK'}
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
