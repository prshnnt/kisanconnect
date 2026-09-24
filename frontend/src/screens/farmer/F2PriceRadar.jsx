import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardActionArea from "@mui/material/CardActionArea"
import CardContent from "@mui/material/CardContent"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import Switch from "@mui/material/Switch"
import FormControlLabel from "@mui/material/FormControlLabel"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import TrendingDownIcon from "@mui/icons-material/TrendingDown"
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat"
import { useNavigate } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import { formatINR } from "../../utils/format.js"
import TopBar from "../../components/TopBar.jsx"

const CROPS = [
  { id: "wheat", emoji: "🌾", hi: "गेहूं", en: "Wheat" },
  { id: "potato", emoji: "🥔", hi: "आलू", en: "Potato" },
  { id: "rice", emoji: "🍚", hi: "चावल", en: "Rice" },
  { id: "maize", emoji: "🌽", hi: "मक्का", en: "Maize" },
  { id: "mustard", emoji: "🌻", hi: "सरसों", en: "Mustard" },
]

const DISTANCES = [25, 50, 100]

const MOCK_MANDIS = [
  {
    id: "lko",
    name: "Lucknow APMC",
    km: 24,
    price: 2410,
    min: 2280,
    max: 2490,
    pct: 2.1,
    asOf: "Today",
  },
  {
    id: "agr",
    name: "Agra Mandi",
    km: 67,
    price: 2390,
    min: 2250,
    max: 2460,
    pct: -0.5,
    asOf: "Today",
  },
  {
    id: "knp",
    name: "Kanpur Mandi",
    km: 89,
    price: 2350,
    min: 2200,
    max: 2420,
    pct: 0.8,
    asOf: "Yesterday",
  },
  {
    id: "var",
    name: "Varanasi Mandi",
    km: 97,
    price: 2280,
    min: 2100,
    max: 2380,
    pct: -1.2,
    asOf: "2 days ago",
  },
]

export default function F2PriceRadar() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const [selectedCrop, setSelectedCrop] = useState("wheat")
  const [selectedDist, setSelectedDist] = useState(100)
  const [afterTransport, setAfterTransport] = useState(true)

  const mandis = MOCK_MANDIS.filter((m) => m.km <= selectedDist)

  return (
    <Box sx={{ bgcolor: "#FFFBF5" }}>
      <TopBar title={lang === "hi" ? "भाव रडार" : "Price Radar"} />

      <Box sx={{ px: 2, py: 2 }}>
        {/* Crop picker */}
        <Typography
          variant="caption"
          sx={{
            color: "#6B7280",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {lang === "hi" ? "फसल चुनें" : "Select crop"}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            py: 1,
            mb: 2,
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {CROPS.map((c) => (
            <Card
              key={c.id}
              sx={{
                flexShrink: 0,
                border: `2px solid ${
                  selectedCrop === c.id ? "#F5A524" : "#E5E7EB"
                }`,
                cursor: "pointer",
              }}
              onClick={() => setSelectedCrop(c.id)}
            >
              <CardContent
                sx={{
                  p: 1,
                  "&:last-child": { pb: 1 },
                  textAlign: "center",
                  minWidth: 64,
                }}
              >
                <Typography sx={{ fontSize: "1.5rem" }}>{c.emoji}</Typography>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, display: "block" }}
                >
                  {lang === "hi" ? c.hi : c.en}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Distance chips */}
        <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "center" }}>
          <Typography variant="caption" sx={{ color: "#6B7280", mr: 0.5 }}>
            {lang === "hi" ? "दूरी:" : "Within:"}
          </Typography>
          {DISTANCES.map((d) => (
            <Chip
              key={d}
              label={`${d} km`}
              onClick={() => setSelectedDist(d)}
              variant={selectedDist === d ? "filled" : "outlined"}
              color={selectedDist === d ? "primary" : "default"}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Box>

        {/* Market/After transport switch */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            bgcolor: "#F3F4F6",
            borderRadius: 2,
            px: 2,
            py: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: afterTransport ? "#6B7280" : "#1F2937",
              fontWeight: afterTransport ? 400 : 600,
            }}
          >
            {lang === "hi" ? "मंडी भाव" : "Market price"}
          </Typography>
          <Switch
            checked={afterTransport}
            onChange={(e) => setAfterTransport(e.target.checked)}
            color="primary"
          />
          <Typography
            variant="body2"
            sx={{
              color: afterTransport ? "#1F2937" : "#6B7280",
              fontWeight: afterTransport ? 600 : 400,
            }}
          >
            {lang === "hi" ? "परिवहन के बाद" : "After transport"}
          </Typography>
        </Box>

        {/* Mandi list */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {mandis.map((m, i) => {
            const TrendIcon =
              m.pct > 0
                ? TrendingUpIcon
                : m.pct < 0
                  ? TrendingDownIcon
                  : TrendingFlatIcon
            const trendColor =
              m.pct > 0 ? "#15803D" : m.pct < 0 ? "#B91C1C" : "#6B7280"
            return (
              <Card
                key={m.id}
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/farmer/prices/${m.id}`)}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
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
                          {m.name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "#6B7280" }}>
                        {m.km} km away · {m.asOf}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {formatINR(m.price)}/qtl
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 0.25,
                        }}
                      >
                        <TrendIcon sx={{ fontSize: 14, color: trendColor }} />
                        <Typography
                          variant="caption"
                          sx={{ color: trendColor, fontWeight: 600 }}
                        >
                          {Math.abs(m.pct)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Price range bar */}
                  <Box sx={{ mt: 1.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                        {formatINR(m.min)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                        {formatINR(m.max)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        position: "relative",
                        height: 6,
                        bgcolor: "#E5E7EB",
                        borderRadius: 3,
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          left: `${((m.price - m.min) / (m.max - m.min)) * 80}%`,
                          top: -3,
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: "#3730A3",
                          border: "2px solid #FFFFFF",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                        }}
                      />
                      <Box
                        sx={{
                          width: "80%",
                          height: "100%",
                          bgcolor: "#DBEAFE",
                          borderRadius: 3,
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )
          })}
        </Box>

        {mandis.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" sx={{ color: "#6B7280" }}>
              {lang === "hi"
                ? "इस दूरी में कोई मंडी नहीं मिली"
                : "No mandis found in this range"}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}
