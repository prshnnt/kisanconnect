import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import InputAdornment from "@mui/material/InputAdornment"
import IconButton from "@mui/material/IconButton"
import Alert from "@mui/material/Alert"
import VisibilityIcon from "@mui/icons-material/Visibility"
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"
import { useNavigate } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import { useAuth } from "../../contexts/AuthContext.jsx"
import TopBar from "../../components/TopBar.jsx"

export default function X8Login() {
  const { lang } = useLang()
  const { login, role } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(null)
  const [error, setError] = useState("")

  const isLocked = lockedUntil && new Date() < lockedUntil
  const minutesLeft = isLocked
    ? Math.ceil((lockedUntil - new Date()) / 60000)
    : 0

  function doLogin() {
    if (!phone || !password) {
      setError(lang === "hi" ? "नंबर और पासवर्ड डालें" : "Enter phone and password")
      return
    }
    const newAttempts = attempts + 1
    if (newAttempts >= 5) {
      const lockTime = new Date(Date.now() + 10 * 60 * 1000)
      setLockedUntil(lockTime)
      setAttempts(0)
      return
    }
    setAttempts(newAttempts)
    // Mock: accept any password
    login({ phone, name: "Sample User" }, role || "farmer")
    const paths = {
      farmer: "/farmer",
      buyer: "/buyer",
      agent: "/agent",
      provider: "/provider",
      admin: "/admin",
    }
    navigate(paths[role] || "/farmer")
  }

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
          py: 4,
          pb: 12,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {lang === "hi" ? "लॉग इन करें" : "Log in"}
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
          {lang === "hi"
            ? "KisanConnect में आपका स्वागत है"
            : "Welcome back to KisanConnect"}
        </Typography>

        {isLocked && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            {lang === "hi"
              ? `बहुत सारी गलत कोशिशें। ${minutesLeft} मिनट बाद फिर कोशिश करें।`
              : `Too many wrong attempts. Try again in ${minutesLeft} minute(s).`}
          </Alert>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 2 }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            label={lang === "hi" ? "मोबाइल नंबर" : "Mobile number"}
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            inputProps={{ inputMode: "numeric" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">+91</InputAdornment>
              ),
            }}
            disabled={isLocked}
          />

          <TextField
            label={lang === "hi" ? "पासवर्ड" : "Password"}
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLocked}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPwd(!showPwd)}
                    size="small"
                    disabled={isLocked}
                  >
                    {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{ color: "#3730A3", mt: 2, cursor: "pointer" }}
          onClick={() => navigate("/phone")}
        >
          {lang === "hi" ? "OTP से लॉग इन करें" : "Login with OTP instead"}
        </Typography>
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
          onClick={doLogin}
          disabled={isLocked}
        >
          {lang === "hi" ? "लॉग इन" : "Log in"}
        </Button>
        <Typography
          variant="body2"
          sx={{ textAlign: "center", mt: 1.5, color: "#6B7280" }}
        >
          {lang === "hi" ? "नए हैं? " : "New here? "}
          <Typography
            component="span"
            variant="body2"
            sx={{ color: "#3730A3", cursor: "pointer", fontWeight: 600 }}
            onClick={() => navigate("/")}
          >
            {lang === "hi" ? "अभी रजिस्टर करें" : "Register now"}
          </Typography>
        </Typography>
      </Box>
    </Box>
  )
}
