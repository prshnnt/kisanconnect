import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../contexts/LanguageContext.jsx'
import TopBar from '../../components/TopBar.jsx'
import VerifiedBadge from '../../components/VerifiedBadge.jsx'
import TrustMeter from '../../components/TrustMeter.jsx'
import { formatINR } from '../../utils/format.js'

const MOCK_OFFERS = [
  { id: 1, buyer: 'Green Mills Ltd', verified: true, trust: 4, price: 2410, qty: 25, payment: 'On pickup', validTill: 'Fri', receive: 2315 },
  { id: 2, buyer: 'Sharma Traders', verified: true, trust: 3, price: 2390, qty: 20, payment: 'Within 3 days', validTill: 'Thu', receive: 2295 },
  { id: 3, buyer: 'Agro Foods Co', verified: false, trust: 2, price: 2350, qty: 25, payment: 'Within 7 days', validTill: 'Wed', receive: 2255 },
]

export default function F12Offers() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const [sort, setSort] = useState('money')
  const [selected, setSelected] = useState([])
  const [acceptOffer, setAcceptOffer] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [counterOffer, setCounterOffer] = useState(null)
  const [counterPrice, setCounterPrice] = useState('')
  const [counterSent, setCounterSent] = useState(false)
  const [declineOffer, setDeclineOffer] = useState(null)
  const [offers, setOffers] = useState(MOCK_OFFERS)

  const sorted = [...offers].sort((a, b) => sort === 'money' ? b.receive - a.receive : b.trust - a.trust)

  function confirmDecline() {
    setOffers(prev => prev.filter(o => o.id !== declineOffer.id))
    setDeclineOffer(null)
  }

  function sendCounter() {
    setCounterSent(true)
  }

  function toggleSelect(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev)
  }

  return (
    <Box sx={{ bgcolor: '#FFFBF5', minHeight: '100vh' }}>
      <TopBar title={lang === 'hi' ? 'ऑफर तुलना करें' : 'Compare offers'} />

      <Box sx={{ px: 2, py: 2, pb: 12 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            {offers.length} {lang === 'hi' ? 'ऑफर मिले' : 'offers received'} · sample
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{lang === 'hi' ? 'क्रम' : 'Sort'}</InputLabel>
            <Select value={sort} onChange={e => setSort(e.target.value)} label={lang === 'hi' ? 'क्रम' : 'Sort'}>
              <MenuItem value="money">{lang === 'hi' ? 'सबसे ज़्यादा पैसा' : 'Most money'}</MenuItem>
              <MenuItem value="trust">{lang === 'hi' ? 'विश्वसनीयता' : 'Trust'}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Card
          sx={{ mb: 2, cursor: 'pointer', bgcolor: '#F0FDF4', border: '1px solid #86EFAC' }}
          onClick={() => navigate('/farmer/find-buyers')}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#15803D' }}>
                🔍 {lang === 'hi' ? 'और खरीदार खोजें' : 'Find more buyers'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#166534' }}>
                {lang === 'hi' ? 'सक्रिय रूप से खरीदारों तक पहुंचें' : 'Reach out to buyers actively'}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {sorted.map(offer => (
            <Card key={offer.id} sx={{ border: `2px solid ${selected.includes(offer.id) ? '#F5A524' : '#E5E7EB'}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                  <Checkbox
                    checked={selected.includes(offer.id)}
                    onChange={() => toggleSelect(offer.id)}
                    size="small"
                    sx={{ p: 0, mt: 0.25 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{offer.buyer}</Typography>
                      {offer.verified && <VerifiedBadge />}
                    </Box>
                    <TrustMeter score={offer.trust} lang={lang} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1F2937', fontVariantNumeric: 'tabular-nums' }}>
                    {formatINR(offer.price)}/qtl
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                  <Chip label={offer.payment} size="small" sx={{ fontSize: '0.7rem' }} />
                  <Chip label={`${offer.qty} qtl`} size="small" sx={{ fontSize: '0.7rem' }} />
                  <Chip label={`${lang === 'hi' ? 'तक' : 'Till'} ${offer.validTill}`} size="small" sx={{ fontSize: '0.7rem' }} />
                </Box>

                <Box sx={{ bgcolor: '#D1FAE5', borderRadius: 2, p: 1.5, mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#166534' }}>
                    {lang === 'hi' ? 'आपको मिलेगा' : 'You will receive'}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#15803D', fontVariantNumeric: 'tabular-nums' }}>
                    {formatINR(offer.receive)}/qtl
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    sx={{ flex: 1, height: 40, fontSize: '0.8rem', bgcolor: '#15803D' }}
                    onClick={() => setAcceptOffer(offer)}
                  >
                    {lang === 'hi' ? 'स्वीकार करें' : 'Accept'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ flex: 1, height: 40, fontSize: '0.8rem' }}
                    onClick={() => { setCounterOffer(offer); setCounterPrice(String(offer.price + 20)); setCounterSent(false) }}
                  >
                    {lang === 'hi' ? 'काउंटर' : 'Counter'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ height: 40, fontSize: '0.8rem', borderColor: '#B91C1C', color: '#B91C1C' }}
                    onClick={() => setDeclineOffer(offer)}
                  >
                    {lang === 'hi' ? 'मना' : 'Decline'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Accept confirmation dialog */}
      <Dialog open={!!acceptOffer && !confirmed} PaperProps={{ sx: { borderRadius: 3, mx: 2, maxWidth: 358 } }}>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {lang === 'hi' ? 'ऑफर स्वीकार करें?' : 'Accept this offer?'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
            {acceptOffer?.buyer} — {formatINR(acceptOffer?.price)}/qtl
          </Typography>
          <Box sx={{ bgcolor: '#F3F4F6', borderRadius: 2, p: 2, mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 0.5 }}>
              {lang === 'hi' ? 'अगला कदम:' : 'What happens next:'}
            </Typography>
            {[
              lang === 'hi' ? '1. खरीदार को सूचना मिलेगी' : '1. Buyer gets notified',
              lang === 'hi' ? '2. वो पिकअप की व्यवस्था करेगा' : '2. They arrange pickup',
              lang === 'hi' ? '3. तौल और कागज तैयार होंगे' : '3. Weighing and paperwork done',
              lang === 'hi' ? '4. पैसा आपके बैंक में' : '4. Money in your bank',
            ].map((s, i) => (
              <Typography key={i} variant="caption" sx={{ display: 'block', color: '#1F2937', mb: 0.25 }}>{s}</Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setAcceptOffer(null)} variant="outlined" fullWidth>
            {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
          </Button>
          <Button
            onClick={() => { setConfirmed(true) }}
            variant="contained"
            color="success"
            fullWidth
            sx={{ bgcolor: '#15803D' }}
          >
            {lang === 'hi' ? 'हाँ, स्वीकार करें' : 'Yes, accept'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmed} PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: '#15803D', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {lang === 'hi' ? 'ऑफर स्वीकार हो गया!' : 'Offer accepted!'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
            {lang === 'hi' ? 'Deal Room में सब जानकारी देखें' : 'Track everything in Deal Room'}
          </Typography>
          <Button variant="contained" color="primary" fullWidth onClick={() => navigate('/farmer/deals')}>
            {lang === 'hi' ? 'Deal Room खोलें' : 'Open Deal Room'}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Counter offer dialog */}
      <Dialog open={!!counterOffer && !counterSent} onClose={() => setCounterOffer(null)} PaperProps={{ sx: { borderRadius: 3, mx: 2, maxWidth: 358 } }}>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {lang === 'hi' ? 'काउंटर ऑफर भेजें' : 'Send a counter offer'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
            {counterOffer?.buyer} {lang === 'hi' ? 'ने' : 'offered'} {formatINR(counterOffer?.price)}/qtl
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {lang === 'hi' ? 'आपका मूल्य (₹/qtl)' : 'Your price (₹/qtl)'}
          </Typography>
          <TextField
            type="number"
            value={counterPrice}
            onChange={e => setCounterPrice(e.target.value)}
            fullWidth
            inputProps={{ inputMode: 'numeric' }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setCounterOffer(null)} variant="outlined" fullWidth>
            {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
          </Button>
          <Button onClick={sendCounter} variant="contained" color="primary" fullWidth disabled={!counterPrice}>
            {lang === 'hi' ? 'भेजें' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={counterSent} PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: '#15803D', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {lang === 'hi' ? 'काउंटर ऑफर भेज दिया!' : 'Counter offer sent!'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
            {counterOffer?.buyer} — {formatINR(Number(counterPrice))}/qtl
          </Typography>
          <Button variant="contained" color="primary" fullWidth onClick={() => { setCounterSent(false); setCounterOffer(null) }}>
            {lang === 'hi' ? 'ठीक है' : 'Done'}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Decline confirmation dialog */}
      <Dialog open={!!declineOffer} onClose={() => setDeclineOffer(null)} PaperProps={{ sx: { borderRadius: 3, mx: 2, maxWidth: 358 } }}>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {lang === 'hi' ? 'यह ऑफर मना करें?' : 'Decline this offer?'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            {declineOffer?.buyer} — {formatINR(declineOffer?.price)}/qtl
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeclineOffer(null)} variant="outlined" fullWidth>
            {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
          </Button>
          <Button onClick={confirmDecline} variant="contained" color="error" fullWidth sx={{ bgcolor: '#B91C1C' }}>
            {lang === 'hi' ? 'हाँ, मना करें' : 'Yes, decline'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
