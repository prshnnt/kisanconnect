import React, { useState, useEffect, useRef } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import OutlinedInput from "@mui/material/OutlinedInput"
import { useNavigate, useLocation } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"

export default function X4OTP() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const phone = location.state?.phone || ""
  const [digits, setDigits] = useState(["", "", "", "", "", ""])
  const [timer, setTimer] = useState(30)
  const refs = useRef([])

  useEffect(() => {
    const interval = setInterval(
      () => setTimer((t) => Math.max(0, t - 1)),
      1000,
    )
    return () => clearInterval(interval)
  }, [])

  function handleDigit(i, val) {
    const d = val.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[i] = d
    setDigits(next)
    if (d && i < 5) refs.current[i + 1]?.focus()
    if (!d && i > 0) refs.current[i - 1]?.focus()
  }

  function verify() {
    const code = digits.join("")
    if (code.length === 6) navigate("/about")
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
          pb: 10,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {lang === "hi" ? "OTP डालें" : "Enter OTP"}
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mb: 1 }}>
          {lang === "hi" ? `+91 ${phone} पर भेजा गया` : `Sent to +91 ${phone}`}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#3730A3", cursor: "pointer", mb: 4 }}
          onClick={() => navigate("/phone")}
        >
          {lang === "hi" ? "नंबर बदलें" : "Change number"}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mb: 4, justifyContent: "center" }}>
          {digits.map((d, i) => (
            <OutlinedInput
              key={i}
              inputRef={(el) => (refs.current[i] = el)}
              value={d}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !d && i > 0) {
                  refs.current[i - 1]?.focus()
                }
              }}
              inputProps={{
                inputMode: "numeric",
                maxLength: 1,
                style: {
                  textAlign: "center",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  width: 40,
                  padding: "8px 0",
                },
              }}
              sx={{
                width: 52,
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          ))}
        </Box>

        {timer > 0 ? (
          <Typography
            variant="body2"
            sx={{ color: "#6B7280", textAlign: "center" }}
          >
            {lang === "hi" ? `${timer} सेकंड में दोबारा भेजें` : `Resend in ${timer}s`}
          </Typography>
        ) : (
          <Typography
            variant="body2"
            sx={{ color: "#3730A3", textAlign: "center", cursor: "pointer" }}
            onClick={() => setTimer(30)}
          >
            {lang === "hi" ? "OTP दोबारा भेजें" : "Resend OTP"}
          </Typography>
        )}
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
          onClick={verify}
          disabled={digits.join("").length !== 6}
        >
          {lang === "hi" ? "पुष्टि करें" : "Verify"}
        </Button>
      </Box>
    </Box>
  )
}
