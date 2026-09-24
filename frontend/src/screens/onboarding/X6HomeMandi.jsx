import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActionArea from "@mui/material/CardActionArea"
import InputAdornment from "@mui/material/InputAdornment"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import MicIcon from "@mui/icons-material/Mic"
import SearchIcon from "@mui/icons-material/Search"
import { useNavigate } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"

const STATES = [
  "Uttar Pradesh",
  "Maharashtra",
  "Punjab",
  "Haryana",
  "Madhya Pradesh",
  "Rajasthan",
]
const MANDIS = {
  "Uttar Pradesh": [
    "Lucknow APMC",
    "Agra Mandi",
    "Kanpur Mandi",
    "Varanasi Mandi",
  ],
  Maharashtra: ["Nashik APMC", "Pune Mandi", "Nagpur Mandi"],
  Punjab: ["Amritsar APMC", "Ludhiana Mandi", "Patiala Mandi"],
  Haryana: ["Karnal APMC", "Rohtak Mandi", "Hisar Mandi"],
  "Madhya Pradesh": ["Indore APMC", "Bhopal Mandi", "Jabalpur Mandi"],
  Rajasthan: ["Jaipur APMC", "Jodhpur Mandi", "Kota Mandi"],
}

export default function X6HomeMandi() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const [useLocation, setUseLocation] = useState(false)
  const [state, setState] = useState("")
  const [mandi, setMandi] = useState("")
  const [search, setSearch] = useState("")

  const availableMandis = (MANDIS[state] || []).filter((m) =>
    m.toLowerCase().includes(search.toLowerCase()),
  )

  function proceed() {
    navigate("/welcome")
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
          py: 3,
          pb: 12,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {lang === "hi" ? "आपकी मंडी कौन सी है?" : "Your home mandi"}
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
          {lang === "hi"
            ? "यह जानकारी आपकी कीमत देखने के लिए जरूरी है"
            : "Required to show prices near you"}
        </Typography>

        <Card
          sx={{
            mb: 3,
            border: `2px solid ${useLocation ? "#F5A524" : "#E5E7EB"}`,
            cursor: "pointer",
          }}
          onClick={() => setUseLocation(true)}
        >
          <CardActionArea
            sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}
          >
            <LocationOnIcon
              sx={{ color: useLocation ? "#F5A524" : "#6B7280", fontSize: 28 }}
            />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {lang === "hi" ? "मेरी लोकेशन का उपयोग करें" : "Use my location"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                {lang === "hi" ? "पास की मंडी खोजें" : "Find nearest mandi"}
              </Typography>
            </Box>
          </CardActionArea>
        </Card>

        <Typography
          variant="body2"
          sx={{ color: "#9CA3AF", textAlign: "center", mb: 2 }}
        >
          {lang === "hi" ? "या राज्य और मंडी चुनें" : "Or select state and mandi"}
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>{lang === "hi" ? "राज्य" : "State"}</InputLabel>
          <Select
            value={state}
            onChange={(e) => {
              setState(e.target.value)
              setMandi("")
            }}
            label={lang === "hi" ? "राज्य" : "State"}
          >
            {STATES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {state && (
          <>
            <TextField
              placeholder={lang === "hi" ? "मंडी खोजें..." : "Search mandi..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#9CA3AF" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <MicIcon sx={{ color: "#3730A3", cursor: "pointer" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {availableMandis.map((m) => (
                <Card
                  key={m}
                  sx={{
                    border: `2px solid ${mandi === m ? "#F5A524" : "#E5E7EB"}`,
                    cursor: "pointer",
                  }}
                  onClick={() => setMandi(m)}
                >
                  <CardActionArea sx={{ p: 1.5 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: mandi === m ? 700 : 400 }}
                    >
                      {m}
                    </Typography>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          </>
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
          onClick={proceed}
          disabled={!useLocation && !mandi}
        >
          {lang === "hi" ? "जारी रखें" : "Continue"}
        </Button>
      </Box>
    </Box>
  )
}
