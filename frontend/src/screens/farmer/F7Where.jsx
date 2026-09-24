import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardActionArea from "@mui/material/CardActionArea"
import CardContent from "@mui/material/CardContent"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Switch from "@mui/material/Switch"
import FormControlLabel from "@mui/material/FormControlLabel"
import InputAdornment from "@mui/material/InputAdornment"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import PeopleIcon from "@mui/icons-material/People"
import MicIcon from "@mui/icons-material/Mic"
import SearchIcon from "@mui/icons-material/Search"
import { useNavigate, useLocation } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"
import VerifiedBadge from "../../components/VerifiedBadge.jsx"

const MOCK_AGENTS = [
  {
    id: 1,
    name: "Ramesh Kumar",
    mandi: "Lucknow APMC",
    commission: 2.5,
    verified: true,
  },
  {
    id: 2,
    name: "Suresh Trader",
    mandi: "Lucknow APMC",
    commission: 3.0,
    verified: true,
  },
  {
    id: 3,
    name: "Mohan Associates",
    mandi: "Agra Mandi",
    commission: 2.0,
    verified: false,
  },
]

export default function F7Where() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [useGPS, setUseGPS] = useState(false)
  const [village, setVillage] = useState("")
  const [pincode, setPincode] = useState("")
  const [useAgent, setUseAgent] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [agentSearch, setAgentSearch] = useState("")

  const filteredAgents = MOCK_AGENTS.filter((a) =>
    a.name.toLowerCase().includes(agentSearch.toLowerCase()),
  )

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "फसल कहाँ है?" : "Where is it?"} />

      <Box sx={{ px: 2, py: 2, pb: 12 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          {lang === "hi" ? "फसल की जगह बताएं" : "Tell us where your produce is"}
        </Typography>

        <Card
          sx={{
            mb: 2,
            border: `2px solid ${useGPS ? "#F5A524" : "#E5E7EB"}`,
            cursor: "pointer",
          }}
          onClick={() => setUseGPS(!useGPS)}
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
            <LocationOnIcon
              sx={{ color: useGPS ? "#F5A524" : "#6B7280", fontSize: 28 }}
            />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {lang === "hi" ? "मेरी लोकेशन का उपयोग करें" : "Use my location"}
            </Typography>
          </CardContent>
        </Card>

        {!useGPS && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <TextField
              label={lang === "hi" ? "गाँव/शहर" : "Village / Town"}
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <MicIcon sx={{ color: "#3730A3", cursor: "pointer" }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label={lang === "hi" ? "पिन कोड" : "Pincode"}
              value={pincode}
              onChange={(e) =>
                setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              inputProps={{ inputMode: "numeric" }}
            />
          </Box>
        )}

        <FormControlLabel
          control={
            <Switch
              checked={useAgent}
              onChange={(e) => setUseAgent(e.target.checked)}
            />
          }
          label={
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {lang === "hi" ? "एजेंट के ज़रिए बेचें?" : "Sell through an agent?"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                {lang === "hi"
                  ? "एजेंट मंडी में आपकी तरफ से बेचेगा"
                  : "Agent sells on your behalf at mandi"}
              </Typography>
            </Box>
          }
          sx={{ mb: 2, alignItems: "flex-start" }}
        />

        {useAgent && (
          <Box>
            <TextField
              placeholder={lang === "hi" ? "एजेंट खोजें..." : "Search agents..."}
              value={agentSearch}
              onChange={(e) => setAgentSearch(e.target.value)}
              sx={{ mb: 1.5 }}
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
              {filteredAgents.map((a) => (
                <Card
                  key={a.id}
                  sx={{
                    border: `2px solid ${
                      selectedAgent === a.id ? "#F5A524" : "#E5E7EB"
                    }`,
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedAgent(a.id)}
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
                    <PeopleIcon sx={{ color: "#6B7280", fontSize: 24 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {a.name}
                        </Typography>
                        {a.verified && <VerifiedBadge />}
                      </Box>
                      <Typography variant="caption" sx={{ color: "#6B7280" }}>
                        {a.mandi}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: "#B45309" }}
                    >
                      {a.commission}%
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}
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
          disabled={!useGPS && !village}
          onClick={() =>
            navigate("/farmer/sell/min-price", { state: { ...location.state } })
          }
        >
          {lang === "hi" ? "आगे बढ़ें" : "Continue"}
        </Button>
      </Box>
    </Box>
  )
}
