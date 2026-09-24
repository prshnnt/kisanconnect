import React, { useState } from 'react'
import Fab from '@mui/material/Fab'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'
import MicIcon from '@mui/icons-material/Mic'
import SendIcon from '@mui/icons-material/Send'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import { useLang } from '../contexts/LanguageContext.jsx'

const QUICK_QUESTIONS_HI = ['आज गेहूं का भाव?', 'पैसा कब मिलेगा?', 'बेचने का सही समय?']
const QUICK_QUESTIONS_EN = ['Wheat price today?', 'When will I get paid?', 'Best time to sell?']

const GREETING_HI = 'नमस्ते! मैं Balveer हूँ। आपकी मदद के लिए यहाँ हूँ।'
const GREETING_EN = 'Hello! I\'m Balveer. I\'m here to help you.'

export default function BalveerFAB({ bottomOffset = 80 }) {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'balveer', text: lang === 'hi' ? GREETING_HI : GREETING_EN }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)

  const quickQuestions = lang === 'hi' ? QUICK_QUESTIONS_HI : QUICK_QUESTIONS_EN

  function sendMessage(text) {
    if (!text.trim()) return
    setMessages(prev => [...prev, { from: 'user', text }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, {
        from: 'balveer',
        text: lang === 'hi'
          ? 'मैं यह जानकारी जल्द ही प्रदान करूँगा।'
          : 'I\'ll get that information for you shortly.'
      }])
    }, 1500)
  }

  return (
    <>
      {open && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: bottomOffset,
            right: 16,
            width: { xs: 'calc(100vw - 32px)', sm: 380 },
            maxWidth: 380,
            height: 520,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1300,
          }}
        >
          {/* Header */}
          <Box sx={{ bgcolor: '#3730A3', px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#F5A524', fontSize: '1rem' }}>B</Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 700 }}>Balveer</Typography>
              <Typography variant="caption" sx={{ color: '#C7D2FE' }}>
                {lang === 'hi' ? 'AI सहायक, व्यक्ति नहीं' : 'AI assistant, not a person'}
              </Typography>
            </Box>
            <IconButton size="small" aria-label="Read aloud">
              <VolumeUpIcon sx={{ color: '#FFFFFF', fontSize: 18 }} />
            </IconButton>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon sx={{ color: '#FFFFFF', fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#F9FAFB' }}>
            {messages.map((msg, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start', gap: 1 }}>
                {msg.from === 'balveer' && (
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#3730A3', fontSize: '0.75rem', alignSelf: 'flex-end' }}>B</Avatar>
                )}
                <Box
                  sx={{
                    maxWidth: '75%',
                    px: 1.5,
                    py: 1,
                    borderRadius: msg.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    bgcolor: msg.from === 'user' ? '#F5A524' : '#FFFFFF',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#1F2937', lineHeight: 1.5 }}>{msg.text}</Typography>
                </Box>
              </Box>
            ))}
            {typing && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#3730A3', fontSize: '0.75rem' }}>B</Avatar>
                <Box sx={{ px: 2, py: 1.5, bgcolor: '#FFFFFF', borderRadius: '16px 16px 16px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[0, 1, 2].map(d => (
                      <Box key={d} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#9CA3AF',
                        animation: 'bounce 1.2s infinite', animationDelay: `${d * 0.2}s`,
                        '@keyframes bounce': { '0%,80%,100%': { transform: 'scale(0)' }, '40%': { transform: 'scale(1)' } }
                      }} />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
            {messages.length === 1 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {quickQuestions.map(q => (
                  <Chip key={q} label={q} onClick={() => sendMessage(q)} variant="outlined" size="small"
                    sx={{ cursor: 'pointer', bgcolor: '#FFFFFF' }} />
                ))}
              </Box>
            )}
          </Box>

          {/* Footer */}
          <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              placeholder={lang === 'hi' ? 'यहाँ लिखें...' : 'Type here...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 3, fontSize: '0.875rem' } }}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" aria-label="Voice input">
                    <MicIcon sx={{ fontSize: 18, color: '#3730A3' }} />
                  </IconButton>
                )
              }}
            />
            <IconButton onClick={() => sendMessage(input)} sx={{ bgcolor: '#F5A524', '&:hover': { bgcolor: '#E09015' } }}>
              <SendIcon sx={{ fontSize: 18, color: '#1F2937' }} />
            </IconButton>
          </Box>
        </Paper>
      )}

      <Fab
        onClick={() => setOpen(!open)}
        sx={{
          position: 'fixed',
          bottom: bottomOffset,
          right: 16,
          bgcolor: '#3730A3',
          color: '#FFFFFF',
          '&:hover': { bgcolor: '#312E81' },
          width: 56,
          height: 56,
          zIndex: open ? 0 : 1300,
          display: open ? 'none' : 'flex',
        }}
        aria-label="Ask Balveer"
      >
        <ChatIcon />
      </Fab>
    </>
  )
}
