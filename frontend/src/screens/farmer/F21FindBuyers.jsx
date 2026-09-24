import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import LinearProgress from "@mui/material/LinearProgress"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"
import VerifiedBadge from "../../components/VerifiedBadge.jsx"
import { formatINR } from "../../utils/format.js"

const MOCK_LOTS = [
  { id: 1, label: "Wheat 25 qtl – Grade A", labelHi: "गेहूं 25 qtl – ग्रेड A" },
  { id: 2, label: "Potato 10 qtl – Grade B", labelHi: "आलू 10 qtl – ग्रेड B" },
]

const MOCK_MATCHES = [
  {
    id: 1,
    buyer: "Green Mills Ltd",
    verified: true,
    crop: "Wheat",
    qty: 25,
    priceRange: "₹2,380–₹2,480/qtl",
    km: 24,
    score: 92,
    why: "Grade A wheat, within 25km, pickup available",
    whyHi: "ग्रेड A गेहूं, 25km के भीतर, पिकअप उपलब्ध",
    deliverBy: "Sep 30",
  },
  {
    id: 2,
    buyer: "National Foods",
    verified: true,
    crop: "Wheat",
    qty: 20,
    priceRange: "₹2,350–₹2,430/qtl",
    km: 45,
    score: 78,
    why: "Wheat buyer, slightly farther",
    whyHi: "गेहूं खरीदार, थोड़ा दूर",
    deliverBy: "Oct 5",
  },
  {
    id: 3,
    buyer: "Bharat Grains",
    verified: false,
    crop: "Wheat",
    qty: 30,
    priceRange: "₹2,280–₹2,380/qtl",
    km: 67,
    score: 61,
    why: "Good volume match, farther distance",
    whyHi: "अच्छा मात्रा मिलान, अधिक दूरी",
    deliverBy: "Oct 10",
  },
]

export default function F21FindBuyers() {
  const { lang } = useLang()
  const [selectedLot, setSelectedLot] = useState(1)
  const [offered, setOffered] = useState([])

  function sendOffer(matchId) {
    setOffered((prev) => [...prev, matchId])
  }

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "खरीदार खोजें" : "Find buyers"} />

      <Box sx={{ px: 2, py: 2 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>
            {lang === "hi" ? "मेरी लॉट चुनें" : "Select my lot"}
          </InputLabel>
          <Select
            value={selectedLot}
            onChange={(e) => setSelectedLot(e.target.value)}
            label={lang === "hi" ? "मेरी लॉट चुनें" : "Select my lot"}
          >
            {MOCK_LOTS.map((l) => (
              <MenuItem key={l.id} value={l.id}>
                {lang === "hi" ? l.labelHi : l.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="body2" sx={{ color: "#6B7280", mb: 2 }}>
          {MOCK_MATCHES.length}{" "}
          {lang === "hi" ? "मिलते-जुलते खरीदार मिले" : "matching buyers found"} ·
          sample
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {MOCK_MATCHES.map((m, i) => (
            <Card key={m.id}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.25,
                      }}
                    >
                      <Typography
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          bgcolor: "#F3F4F6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: "#6B7280",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {m.buyer}
                      </Typography>
                      {m.verified && <VerifiedBadge />}
                    </Box>
                    <Typography variant="caption" sx={{ color: "#6B7280" }}>
                      {m.km} km away · {m.qty} qtl needed ·{" "}
                      {lang === "hi" ? "तक" : "by"} {m.deliverBy}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: "#3730A3" }}
                    >
                      {m.score}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#6B7280" }}>
                      match
                    </Typography>
                  </Box>
                </Box>

                {/* Match score bar */}
                <LinearProgress
                  variant="determinate"
                  value={m.score}
                  sx={{
                    mb: 1,
                    height: 4,
                    borderRadius: 2,
                    "& .MuiLinearProgress-bar": {
                      bgcolor:
                        m.score > 80
                          ? "#15803D"
                          : m.score > 60
                            ? "#F5A524"
                            : "#B45309",
                    },
                  }}
                />

                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {m.priceRange}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#6B7280", display: "block", mb: 1.5 }}
                >
                  {lang === "hi" ? m.whyHi : m.why}
                </Typography>

                <Button
                  variant={offered.includes(m.id) ? "contained" : "outlined"}
                  size="small"
                  fullWidth
                  disabled={offered.includes(m.id)}
                  sx={
                    offered.includes(m.id)
                      ? { height: 40, bgcolor: "#15803D" }
                      : { borderColor: "#3730A3", color: "#3730A3", height: 40 }
                  }
                  onClick={() => sendOffer(m.id)}
                >
                  {offered.includes(m.id)
                    ? lang === "hi"
                      ? "✓ भेज दिया गया"
                      : "✓ Sent"
                    : lang === "hi"
                      ? "अपनी लॉट ऑफर करें"
                      : "Offer my lot"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
