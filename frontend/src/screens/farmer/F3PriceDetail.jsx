import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import WarehouseIcon from "@mui/icons-material/Warehouse"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { useParams, useNavigate } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"
import { formatINR } from "../../utils/format.js"

// Generate 30 days of mock price data
function genPrices() {
  const data = []
  let price = 2200
  for (let i = 29; i >= 0; i--) {
    price += Math.round((Math.random() - 0.45) * 80)
    price = Math.max(1900, Math.min(2600, price))
    const d = new Date()
    d.setDate(d.getDate() - i)
    data.push({
      date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      price,
      min: price - 100,
      max: price + 120,
    })
  }
  return data
}
const PRICE_DATA = genPrices()

const SIGNAL_CONFIG = {
  SELL: {
    color: "#15803D",
    bg: "#D1FAE5",
    label: "SELL NOW",
    labelHi: "अभी बेचें",
    border: "#86EFAC",
  },
  HOLD: {
    color: "#B45309",
    bg: "#FEF3C7",
    label: "WAIT A FEW DAYS",
    labelHi: "कुछ दिन रुकें",
    border: "#FCD34D",
  },
  STORE: {
    color: "#1D4ED8",
    bg: "#DBEAFE",
    label: "STORE AND WAIT",
    labelHi: "भंडारण करें",
    border: "#93C5FD",
  },
}

export default function F3PriceDetail() {
  const { lang } = useLang()
  const { mandiId } = useParams()
  const navigate = useNavigate()
  const [hoveredDay, setHoveredDay] = useState(null)
  const [alertOn, setAlertOn] = useState(false)
  const signal = "SELL"
  const config = SIGNAL_CONFIG[signal]

  const chartW = 350
  const chartH = 120
  const prices = PRICE_DATA.map((d) => d.price)
  const minP = Math.min(...prices) - 50
  const maxP = Math.max(...prices) + 50

  function px(price) {
    return chartH - ((price - minP) / (maxP - minP)) * chartH
  }
  function py(i) {
    return (i / (PRICE_DATA.length - 1)) * chartW
  }

  const polyPoints = PRICE_DATA.map((d, i) => `${py(i)},${px(d.price)}`).join(
    " ",
  )
  const bandTop = PRICE_DATA.map((d, i) => `${py(i)},${px(d.max)}`).join(" ")
  const bandBottom = PRICE_DATA.map((d, i) => `${py(i)},${px(d.min)}`)
    .reverse()
    .join(" ")

  return (
    <Box sx={{ bgcolor: "#FFFBF5" }}>
      <TopBar title={lang === "hi" ? "भाव विवरण" : "Price Detail"} />

      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {lang === "hi" ? "लखनऊ APMC · गेहूं" : "Lucknow APMC · Wheat"}
        </Typography>
        <Typography variant="caption" sx={{ color: "#6B7280" }}>
          {lang === "hi" ? "पिछले 30 दिन" : "Last 30 days"} · sample
        </Typography>

        {/* Chart */}
        <Box sx={{ mt: 2, mb: 1, overflowX: "auto" }}>
          <svg width={chartW} height={chartH + 20} style={{ display: "block" }}>
            <defs>
              <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {/* Band */}
            <polygon
              points={`${bandTop} ${bandBottom}`}
              fill="url(#bandGrad)"
            />
            {/* Main line */}
            <polyline
              points={polyPoints}
              fill="none"
              stroke="#3730A3"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Dotted last-year line */}
            <polyline
              points={PRICE_DATA.map(
                (d, i) => `${py(i)},${px(d.price * 0.95)}`,
              ).join(" ")}
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          </svg>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box
              sx={{ width: 12, height: 3, bgcolor: "#3730A3", borderRadius: 2 }}
            />
            <Typography variant="caption" sx={{ color: "#6B7280" }}>
              {lang === "hi" ? "इस साल" : "This year"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 3,
                bgcolor: "#9CA3AF",
                borderRadius: 2,
                borderTop: "2px dashed #9CA3AF",
              }}
            />
            <Typography variant="caption" sx={{ color: "#6B7280" }}>
              {lang === "hi" ? "पिछले साल" : "Last year"}
            </Typography>
          </Box>
        </Box>

        {/* Advice panel */}
        <Card
          sx={{
            border: `2px solid ${config.border}`,
            bgcolor: config.bg,
            mb: 2,
          }}
        >
          <CardContent>
            <Chip
              label={lang === "hi" ? config.labelHi : config.label}
              sx={{
                bgcolor: config.color,
                color: "#FFFFFF",
                fontWeight: 700,
                mb: 1.5,
                fontSize: "0.875rem",
              }}
            />
            <Typography
              variant="body2"
              sx={{ color: "#1F2937", mb: 1.5, lineHeight: 1.6 }}
            >
              {lang === "hi"
                ? "आपकी 3 नजदीकी मंडियों में इस सप्ताह 4% वृद्धि हुई और कम ट्रक आ रहे हैं।"
                : "Prices in your 3 nearest mandis rose 4% this week and fewer trucks are arriving."}
            </Typography>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  {lang === "hi"
                    ? "अपेक्षित मूल्य सीमा (7-14 दिन)"
                    : "Expected range (7-14 days)"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 700, color: "#1F2937" }}
                >
                  ₹2,380 – ₹2,520/qtl
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  {lang === "hi" ? "विश्वास" : "Confidence"}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    justifyContent: "flex-end",
                    mt: 0.25,
                  }}
                >
                  {[1, 2, 3].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: i <= 2 ? config.color : "#E5E7EB",
                      }}
                    />
                  ))}
                  <Typography
                    variant="caption"
                    sx={{ color: config.color, ml: 0.5, fontWeight: 600 }}
                  >
                    {lang === "hi" ? "मध्यम" : "Medium"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 14, color: "#6B7280" }} />
              <Typography
                variant="caption"
                sx={{ color: "#6B7280", fontStyle: "italic" }}
              >
                {lang === "hi"
                  ? "एक मार्गदर्शन है, वादा नहीं"
                  : "A guide, not a promise"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant={alertOn ? "contained" : "outlined"}
                startIcon={<NotificationsNoneIcon />}
                size="small"
                sx={
                  alertOn
                    ? { flex: 1, bgcolor: config.color }
                    : {
                        flex: 1,
                        borderColor: config.color,
                        color: config.color,
                      }
                }
                onClick={() => setAlertOn((v) => !v)}
              >
                {alertOn
                  ? lang === "hi"
                    ? "✓ अलर्ट चालू"
                    : "✓ Alert on"
                  : lang === "hi"
                    ? "भाव अलर्ट"
                    : "Price alert"}
              </Button>
              {signal === "STORE" && (
                <Button
                  variant="outlined"
                  startIcon={<WarehouseIcon />}
                  size="small"
                  sx={{ flex: 1 }}
                  onClick={() => navigate("/farmer/services/store")}
                >
                  {lang === "hi" ? "भंडारण खोजें" : "Find storage"}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
