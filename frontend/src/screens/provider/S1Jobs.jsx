import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ScaleIcon from '@mui/icons-material/Scale'
import ScienceIcon from '@mui/icons-material/Science'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import WarehouseIcon from '@mui/icons-material/Warehouse'
import { useLang } from '../../contexts/LanguageContext.jsx'
import TopBar from '../../components/TopBar.jsx'
import { formatINR } from '../../utils/format.js'

const SERVICE_ICONS = { weighing: ScaleIcon, testing: ScienceIcon, transport: LocalShippingIcon, storage: WarehouseIcon }
const SERVICE_COLORS = { weighing: '#3730A3', testing: '#15803D', transport: '#B45309', storage: '#1D4ED8' }

const MOCK_JOBS = [
  { id: 1, type: 'weighing', customer: 'Ramesh Kumar', qty: 25, date: 'Sep 22', price: 375, status: 'pending' },
  { id: 2, type: 'testing', customer: 'Green Mills Ltd', qty: 50, date: 'Sep 23', price: 500, status: 'pending' },
  { id: 3, type: 'transport', customer: 'Suresh Yadav', qty: 10, date: 'Sep 24', price: 1200, status: 'pending' },
]

export default function S1Jobs() {
  const { lang } = useLang()
  const [jobs, setJobs] = useState(MOCK_JOBS)
  const [counterJob, setCounterJob] = useState(null)
  const [counterPrice, setCounterPrice] = useState('')
  const [counterSent, setCounterSent] = useState(false)

  function respond(id, action) {
    setJobs(prev => prev.filter(j => j.id !== id))
  }

  function openCounter(job) {
    setCounterJob(job)
    setCounterPrice(String(job.price))
    setCounterSent(false)
  }

  function sendCounter() {
    setCounterSent(true)
  }

  function closeCounterFlow() {
    if (counterJob) respond(counterJob.id, 'counter')
    setCounterJob(null)
    setCounterSent(false)
  }

  return (
    <Box sx={{ bgcolor: '#FFFBF5', minHeight: '100vh' }}>
      <TopBar title={lang === 'hi' ? 'काम के अनुरोध' : 'Job requests'} />
      <Box sx={{ px: 2, py: 2 }}>
        {jobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" sx={{ color: '#6B7280' }}>
              {lang === 'hi' ? 'कोई नया अनुरोध नहीं' : 'No new requests'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {jobs.map(job => {
              const Icon = SERVICE_ICONS[job.type] || ScaleIcon
              const color = SERVICE_COLORS[job.type] || '#6B7280'
              return (
                <Card key={job.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon sx={{ color, fontSize: 24 }} />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{job.customer}</Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          {job.qty} qtl · {job.date} · {formatINR(job.price)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ flex: 1, height: 40, bgcolor: '#15803D' }}
                        onClick={() => respond(job.id, 'accept')}
                      >
                        {lang === 'hi' ? 'स्वीकार' : 'Accept'}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ flex: 1, height: 40 }}
                        onClick={() => openCounter(job)}
                      >
                        {lang === 'hi' ? 'काउंटर' : 'Counter'}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        sx={{ height: 40, borderColor: '#B91C1C', color: '#B91C1C' }}
                        onClick={() => respond(job.id, 'decline')}
                      >
                        {lang === 'hi' ? 'मना' : 'Decline'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )
            })}
          </Box>
        )}
      </Box>

      <Dialog open={!!counterJob && !counterSent} onClose={() => setCounterJob(null)} PaperProps={{ sx: { borderRadius: 3, mx: 2, maxWidth: 358 } }}>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {lang === 'hi' ? 'काउंटर मूल्य भेजें' : 'Send a counter price'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
            {counterJob?.customer} · {counterJob?.qty} qtl
          </Typography>
          <TextField
            label={lang === 'hi' ? 'आपका मूल्य (₹)' : 'Your price (₹)'}
            type="number"
            value={counterPrice}
            onChange={e => setCounterPrice(e.target.value)}
            fullWidth
            inputProps={{ inputMode: 'numeric' }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setCounterJob(null)} variant="outlined" fullWidth>
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
            {lang === 'hi' ? 'काउंटर भेज दिया गया!' : 'Counter sent!'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
            {counterJob?.customer} — {formatINR(Number(counterPrice))}
          </Typography>
          <Button variant="contained" color="primary" fullWidth onClick={closeCounterFlow}>
            {lang === 'hi' ? 'ठीक है' : 'Done'}
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
