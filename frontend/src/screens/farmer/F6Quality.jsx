import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardActionArea from "@mui/material/CardActionArea"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Chip from "@mui/material/Chip"
import InputAdornment from "@mui/material/InputAdornment"
import CameraAltIcon from "@mui/icons-material/CameraAlt"
import ScienceIcon from "@mui/icons-material/Science"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { useNavigate, useLocation } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"

const GRADES = [
  {
    id: "A",
    emoji: "⭐⭐⭐",
    hi: "ग्रेड A — सबसे अच्छा",
    en: "Grade A — Best",
    descHi: "साफ, अच्छी नमी, बिना कटे",
    descEn: "Clean, good moisture, no damage",
  },
  {
    id: "B",
    emoji: "⭐⭐",
    hi: "ग्रेड B — अच्छा",
    en: "Grade B — Good",
    descHi: "थोड़ी अशुद्धि, सामान्य नमी",
    descEn: "Some impurity, average moisture",
  },
  {
    id: "C",
    emoji: "⭐",
    hi: "ग्रेड C — सामान्य",
    en: "Grade C — Average",
    descHi: "मिश्रित, अधिक नमी हो सकती है",
    descEn: "Mixed, may have excess moisture",
  },
]

export default function F6Quality() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [grade, setGrade] = useState(null)
  const [moisture, setMoisture] = useState("")
  const [photos, setPhotos] = useState([])
  const [labVerified] = useState(false)

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "गुणवत्ता पासपोर्ट" : "Quality Passport"} />

      <Box sx={{ px: 2, py: 2, pb: 12 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {lang === "hi"
            ? "अपनी फसल की गुणवत्ता बताएं"
            : "Describe your crop quality"}
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
          {lang === "hi"
            ? "यह खरीदारों को आपकी फसल समझने में मदद करेगा"
            : "This helps buyers understand your produce"}
        </Typography>

        {/* Grade tiles */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
          {GRADES.map((g) => (
            <Card
              key={g.id}
              sx={{
                border: `2px solid ${grade === g.id ? "#F5A524" : "#E5E7EB"}`,
                cursor: "pointer",
              }}
              onClick={() => setGrade(g.id)}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  py: 1.5,
                  "&:last-child": { pb: 1.5 },
                }}
              >
                <Typography
                  sx={{ fontSize: "1.5rem", minWidth: 56, textAlign: "center" }}
                >
                  {g.emoji}
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {lang === "hi" ? g.hi : g.en}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    {lang === "hi" ? g.descHi : g.descEn}
                  </Typography>
                </Box>
                {grade === g.id && (
                  <CheckCircleIcon sx={{ color: "#F5A524" }} />
                )}
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Moisture */}
        <TextField
          label={lang === "hi" ? "नमी % (वैकल्पिक)" : "Moisture % (optional)"}
          value={moisture}
          onChange={(e) => setMoisture(e.target.value.replace(/[^\d.]/g, ""))}
          inputProps={{ inputMode: "decimal" }}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
          sx={{ mb: 2 }}
        />

        {/* Photos */}
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {lang === "hi"
            ? `फ़ोटो जोड़ें (${photos.length}/3)`
            : `Add photos (${photos.length}/3)`}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
          {photos.map((p, i) => (
            <Box
              key={i}
              sx={{
                width: 80,
                height: 80,
                bgcolor: "#F3F4F6",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Typography variant="caption">📷</Typography>
            </Box>
          ))}
          {photos.length < 3 && (
            <Box
              sx={{
                width: 80,
                height: 80,
                border: "2px dashed #E5E7EB",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                bgcolor: "#F9FAFB",
              }}
              onClick={() => setPhotos([...photos, null])}
            >
              <CameraAltIcon sx={{ color: "#9CA3AF", fontSize: 24 }} />
              <Typography
                variant="caption"
                sx={{ color: "#9CA3AF", fontSize: "0.65rem", mt: 0.25 }}
              >
                {lang === "hi" ? "फ़ोटो" : "Photo"}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Verification badge */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            bgcolor: labVerified ? "#D1FAE5" : "#F3F4F6",
            borderRadius: 2,
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {labVerified
                ? lang === "hi"
                  ? "✓ लैब सत्यापित"
                  : "✓ Lab verified"
                : lang === "hi"
                  ? "स्व-घोषित"
                  : "Self-declared"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#6B7280" }}>
              {lang === "hi"
                ? "लैब टेस्ट से ज़्यादा कीमत मिलती है"
                : "Lab testing gets you better prices"}
            </Typography>
          </Box>
          {!labVerified && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ScienceIcon />}
              sx={{ borderColor: "#3730A3", color: "#3730A3" }}
              onClick={() => navigate("/farmer/services/test")}
            >
              {lang === "hi" ? "टेस्ट करवाएं" : "Get tested"}
            </Button>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          position: "fixed",
          bottom: 70,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 390,
          p: 2,
          bgcolor: "#FFFBF5",
          borderTop: "1px solid #F3E8D0",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.06)",
          zIndex: 1100,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={!grade}
          onClick={() =>
            navigate("/farmer/sell/location", {
              state: { ...location.state, grade, moisture },
            })
          }
        >
          {lang === "hi" ? "आगे बढ़ें" : "Continue"}
        </Button>
      </Box>
    </Box>
  )
}
