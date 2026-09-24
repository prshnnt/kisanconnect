import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import InputAdornment from "@mui/material/InputAdornment"
import IconButton from "@mui/material/IconButton"
import LinearProgress from "@mui/material/LinearProgress"
import MicIcon from "@mui/icons-material/Mic"
import VisibilityIcon from "@mui/icons-material/Visibility"
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"
import { useNavigate } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import { useAuth } from "../../contexts/AuthContext.jsx"
import TopBar from "../../components/TopBar.jsx"

function passwordStrength(pwd) {
  let s = 0
  if (pwd.length >= 8) s++
  if (/[A-Z]/.test(pwd)) s++
  if (/[a-z]/.test(pwd)) s++
  if (/\d/.test(pwd)) s++
  return s
}

export default function X5AboutYou() {
  const { lang } = useLang()
  const { role } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [orgName, setOrgName] = useState("")

  const strength = passwordStrength(password)
  const rules = [
    {
      text: lang === "hi" ? "8+ अक्षर" : "8+ characters",
      met: password.length >= 8,
    },
    {
      text: lang === "hi" ? "एक बड़ा अक्षर (A-Z)" : "One capital letter (A-Z)",
      met: /[A-Z]/.test(password),
    },
    {
      text: lang === "hi" ? "एक छोटा अक्षर (a-z)" : "One small letter (a-z)",
      met: /[a-z]/.test(password),
    },
    {
      text: lang === "hi" ? "एक संख्या (0-9)" : "One number (0-9)",
      met: /\d/.test(password),
    },
  ]

  const strengthColors = ["#E5E7EB", "#B91C1C", "#B45309", "#F5A524", "#15803D"]

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FFFBF5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopBar />
      <Box
        sx={{
          flex: 1,
          maxWidth: 390,
          mx: "auto",
          width: "100%",
          px: 3,
          py: 3,
          pb: 12,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          {lang === "hi" ? "अपने बारे में बताएं" : "About you"}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            label={lang === "hi" ? "आपका नाम" : "Your name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <MicIcon sx={{ color: "#3730A3", cursor: "pointer" }} />
                </InputAdornment>
              ),
            }}
          />

          {(role === "farmer" || role === "buyer") && (
            <TextField
              label={
                lang === "hi"
                  ? "संगठन का नाम (FPO/कंपनी)"
                  : "Organisation name (FPO/Company)"
              }
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <MicIcon sx={{ color: "#3730A3", cursor: "pointer" }} />
                  </InputAdornment>
                ),
              }}
            />
          )}

          {role === "agent" && (
            <TextField
              label={
                lang === "hi"
                  ? "फर्म का नाम और लाइसेंस नंबर"
                  : "Firm name & licence number"
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <MicIcon sx={{ color: "#3730A3", cursor: "pointer" }} />
                  </InputAdornment>
                ),
              }}
            />
          )}

          <Box>
            <TextField
              label={lang === "hi" ? "पासवर्ड" : "Password"}
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPwd(!showPwd)}
                      size="small"
                    >
                      {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {password.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <Box sx={{ display: "flex", gap: 0.5, mb: 1 }}>
                  {[1, 2, 3].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        bgcolor:
                          i <= strength ? strengthColors[strength] : "#E5E7EB",
                        transition: "background-color 0.3s",
                      }}
                    />
                  ))}
                </Box>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  {rules.map((r) => (
                    <Box
                      key={r.text}
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {r.met ? (
                        <CheckCircleIcon
                          sx={{ fontSize: 14, color: "#15803D" }}
                        />
                      ) : (
                        <RadioButtonUncheckedIcon
                          sx={{ fontSize: 14, color: "#9CA3AF" }}
                        />
                      )}
                      <Typography
                        variant="caption"
                        sx={{ color: r.met ? "#15803D" : "#9CA3AF" }}
                      >
                        {r.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 390,
          p: 2,
          bgcolor: "#FFFBF5",
          borderTop: "1px solid #F3E8D0",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={() => navigate("/home-mandi")}
          disabled={!name || strength < 4}
        >
          {lang === "hi" ? "आगे बढ़ें" : "Continue"}
        </Button>
      </Box>
    </Box>
  )
}
