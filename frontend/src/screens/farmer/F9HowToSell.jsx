import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardActionArea from "@mui/material/CardActionArea"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import LocalOfferIcon from "@mui/icons-material/LocalOffer"
import GavelIcon from "@mui/icons-material/Gavel"
import StarIcon from "@mui/icons-material/Star"
import { useNavigate, useLocation } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"

const OFFER_DURATIONS = ["1 day", "3 days", "7 days"]
const BID_TIMES = ["2 hours", "4 hours", "8 hours", "24 hours"]

export default function F9HowToSell() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState("offers")
  const [offerDays, setOfferDays] = useState("3 days")
  const [bidDuration, setBidDuration] = useState("4 hours")

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "कैसे बेचना है?" : "How to sell?"} />

      <Box sx={{ px: 2, py: 2, pb: 12 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {lang === "hi" ? "बेचने का तरीका चुनें" : "Choose how to sell"}
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
          {lang === "hi" ? "दोनों तरीके सुरक्षित हैं" : "Both methods are secure"}
        </Typography>

        {/* Offers card */}
        <Card
          sx={{
            mb: 2,
            border: `2px solid ${mode === "offers" ? "#F5A524" : "#E5E7EB"}`,
            cursor: "pointer",
            position: "relative",
          }}
          onClick={() => setMode("offers")}
        >
          {mode === "offers" && (
            <Box sx={{ position: "absolute", top: 8, right: 8 }}>
              <Chip
                label={lang === "hi" ? "✓ अनुशंसित" : "✓ Recommended"}
                size="small"
                sx={{ bgcolor: "#F5A524", color: "#1F2937", fontWeight: 700 }}
              />
            </Box>
          )}
          <CardContent sx={{ pt: mode === "offers" ? 5 : 2 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: mode === "offers" ? "#FEF3C7" : "#F3F4F6",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LocalOfferIcon
                  sx={{
                    color: mode === "offers" ? "#F5A524" : "#6B7280",
                    fontSize: 24,
                  }}
                />
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {lang === "hi"
                    ? "खरीदारों से ऑफर मांगें"
                    : "Ask buyers for offers"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  {lang === "hi"
                    ? "खरीदार आपको ऑफर देंगे"
                    : "Buyers will send you offers"}
                </Typography>
              </Box>
            </Box>
            {mode === "offers" && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#6B7280", display: "block", mb: 1 }}
                >
                  {lang === "hi"
                    ? "कितने दिन खुला रखना है?"
                    : "Keep open for how many days?"}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {OFFER_DURATIONS.map((d) => (
                    <Chip
                      key={d}
                      label={d}
                      onClick={(e) => {
                        e.stopPropagation()
                        setOfferDays(d)
                      }}
                      variant={offerDays === d ? "filled" : "outlined"}
                      color={offerDays === d ? "primary" : "default"}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Bidding card */}
        <Card
          sx={{
            border: `2px solid ${mode === "bid" ? "#F5A524" : "#E5E7EB"}`,
            cursor: "pointer",
          }}
          onClick={() => setMode("bid")}
        >
          <CardContent>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: mode === "bid" ? "#FEF3C7" : "#F3F4F6",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <GavelIcon
                  sx={{
                    color: mode === "bid" ? "#F5A524" : "#6B7280",
                    fontSize: 24,
                  }}
                />
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {lang === "hi" ? "ओपन बिडिंग" : "Open bidding"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  {lang === "hi"
                    ? "खरीदार आपस में बोली लगाएंगे"
                    : "Buyers compete in real-time"}
                </Typography>
              </Box>
            </Box>
            {mode === "bid" && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#6B7280", display: "block", mb: 1 }}
                >
                  {lang === "hi" ? "बिडिंग का समय" : "Bidding duration"}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {BID_TIMES.map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      onClick={(e) => {
                        e.stopPropagation()
                        setBidDuration(t)
                      }}
                      variant={bidDuration === t ? "filled" : "outlined"}
                      color={bidDuration === t ? "primary" : "default"}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
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
          onClick={() =>
            navigate("/farmer/sell/review", {
              state: { ...location.state, mode },
            })
          }
        >
          {lang === "hi" ? "आगे बढ़ें" : "Continue"}
        </Button>
      </Box>
    </Box>
  )
}
