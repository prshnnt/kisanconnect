import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Drawer from '@mui/material/Drawer'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useLang } from '../../contexts/LanguageContext.jsx'

const MOCK_PENDING = {
  farmers: [
    { id: 1, name: 'Ramesh Kumar', village: 'Barabanki, UP', docs: 2, joined: 'Sep 20' },
    { id: 2, name: 'Ganga FPO', village: 'Lucknow, UP', docs: 4, joined: 'Sep 21' },
  ],
  buyers: [
    { id: 3, name: 'Green Mills Ltd', city: 'Lucknow', licence: 'APMC-123', joined: 'Sep 19' },
  ],
  agents: [],
  providers: [
    { id: 4, name: 'Weighbridge No. 7', city: 'Kanpur', service: 'Weighing', joined: 'Sep 22' },
  ],
}

export default function D2Approvals() {
  const { lang } = useLang()
  const [tab, setTab] = useState(0)
  const [drawer, setDrawer] = useState(null)
  const [pending, setPending] = useState(MOCK_PENDING)
  const [toast, setToast] = useState(null)

  const tabs = ['farmers', 'buyers', 'agents', 'providers']
  const current = pending[tabs[tab]] || []

  function removeFromPending(item) {
    setPending(prev => ({
      ...prev,
      [tabs[tab]]: prev[tabs[tab]].filter(p => p.id !== item.id),
    }))
    setDrawer(null)
  }

  function handleApprove() {
    setToast({ type: 'success', name: drawer.name, action: lang === 'hi' ? 'मंजूर किया गया' : 'approved' })
    removeFromPending(drawer)
  }

  function handleReject() {
    setToast({ type: 'error', name: drawer.name, action: lang === 'hi' ? 'अस्वीकृत किया गया' : 'rejected' })
    removeFromPending(drawer)
  }

  function handleAskDocs() {
    setToast({ type: 'info', name: drawer.name, action: lang === 'hi' ? 'से अधिक दस्तावेज़ मांगे गए' : 'asked for more documents' })
    setDrawer(null)
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        {lang === 'hi' ? 'अनुमोदन' : 'Approvals'}
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: '1px solid #E5E7EB' }}>
        {['Farmers/FPOs', 'Buyers', 'Agents', 'Providers'].map(t => <Tab key={t} label={t} />)}
      </Tabs>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {current.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center', py: 4 }}>
            {lang === 'hi' ? 'कोई लंबित नहीं' : 'No pending approvals'}
          </Typography>
        ) : current.map(item => (
          <Card key={item.id} sx={{ cursor: 'pointer' }} onClick={() => setDrawer(item)}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Avatar sx={{ bgcolor: '#F5A524', color: '#1F2937', fontWeight: 700 }}>{item.name[0]}</Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.name}</Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>{item.village || item.city} · {item.docs || 0} docs · {item.joined}</Typography>
              </Box>
              <Chip label="Review" size="small" sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 600 }} />
            </CardContent>
          </Card>
        ))}
      </Box>

      <Drawer anchor="right" open={!!drawer} onClose={() => setDrawer(null)} PaperProps={{ sx: { width: 400, p: 3 } }}>
        {drawer && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{drawer.name}</Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>{drawer.village || drawer.city}</Typography>
            <Box sx={{ bgcolor: '#F3F4F6', borderRadius: 2, p: 2, mb: 3 }}>
              <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1 }}>Documents</Typography>
              {[...Array(drawer.docs || 1)].map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <VerifiedUserIcon sx={{ fontSize: 16, color: '#3730A3' }} />
                  <Typography variant="caption">Document {i + 1}.pdf</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="contained" color="success" fullWidth sx={{ bgcolor: '#15803D' }} onClick={handleApprove}>Approve</Button>
              <Button variant="outlined" color="error" fullWidth sx={{ borderColor: '#B91C1C', color: '#B91C1C' }} onClick={handleReject}>Reject</Button>
              <Button variant="outlined" fullWidth onClick={handleAskDocs}>Ask for more documents</Button>
            </Box>
          </Box>
        )}
      </Drawer>

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast && (
          <Alert severity={toast.type} onClose={() => setToast(null)} sx={{ width: '100%' }}>
            {toast.name} {toast.action}
          </Alert>
        )}
      </Snackbar>
    </Box>
  )
}
